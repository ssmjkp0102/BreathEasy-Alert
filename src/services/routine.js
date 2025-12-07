import { getHistory } from './storage';

const ROUTINE_STORAGE_KEY = 'breatheEasy_routine';

export const getRoutine = () => {
  try {
    const routine = localStorage.getItem(ROUTINE_STORAGE_KEY);
    return routine ? JSON.parse(routine) : {
      morningActivity: null, // 'run', 'walk', 'commute', 'none'
      eveningActivity: null,
      commuteWindow: null, // 'morning', 'evening', 'both'
      bestHours: [],
    };
  } catch (error) {
    return {
      morningActivity: null,
      eveningActivity: null,
      commuteWindow: null,
      bestHours: [],
    };
  }
};

export const saveRoutine = (routineData) => {
  try {
    localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(routineData));
    return true;
  } catch (error) {
    console.error('Error saving routine:', error);
    return false;
  }
};

// Analyze historical data to suggest best hours
export const analyzeBestHours = () => {
  const history = getHistory();
  const routine = getRoutine();

  // Group by hour of day
  const hourlyAQI = {};
  
  history.forEach(entry => {
    const date = new Date(entry.timestamp);
    const hour = date.getHours();
    if (!hourlyAQI[hour]) {
      hourlyAQI[hour] = { sum: 0, count: 0 };
    }
    hourlyAQI[hour].sum += entry.aqi || 0;
    hourlyAQI[hour].count += 1;
  });

  // Calculate averages
  const hourlyAverages = Object.keys(hourlyAQI).map(hour => ({
    hour: parseInt(hour),
    averageAQI: hourlyAQI[hour].sum / hourlyAQI[hour].count,
    count: hourlyAQI[hour].count,
  })).sort((a, b) => a.averageAQI - b.averageAQI);

  // Get best 3 hours
  const bestHours = hourlyAverages.slice(0, 3).map(h => h.hour);

  return {
    bestHours,
    hourlyAverages: hourlyAverages.slice(0, 8), // Top 8 hours
    recommendations: generateHourRecommendations(bestHours, routine),
  };
};

const generateHourRecommendations = (bestHours, routine) => {
  const recommendations = [];

  if (routine.morningActivity === 'run' || routine.morningActivity === 'walk') {
    const morningHours = bestHours.filter(h => h >= 6 && h <= 10);
    if (morningHours.length > 0) {
      recommendations.push(`Best time for ${routine.morningActivity}: ${morningHours[0]}:00-${morningHours[0] + 1}:00`);
    }
  }

  if (routine.eveningActivity === 'run' || routine.eveningActivity === 'walk') {
    const eveningHours = bestHours.filter(h => h >= 17 && h <= 21);
    if (eveningHours.length > 0) {
      recommendations.push(`Best time for ${routine.eveningActivity}: ${eveningHours[0]}:00-${eveningHours[0] + 1}:00`);
    }
  }

  if (routine.commuteWindow) {
    const commuteHours = bestHours.filter(h => 
      (routine.commuteWindow === 'morning' && h >= 7 && h <= 9) ||
      (routine.commuteWindow === 'evening' && h >= 17 && h <= 19) ||
      (routine.commuteWindow === 'both' && ((h >= 7 && h <= 9) || (h >= 17 && h <= 19)))
    );
    if (commuteHours.length > 0) {
      recommendations.push(`Best commute window: ${commuteHours[0]}:00`);
    }
  }

  if (recommendations.length === 0) {
    recommendations.push(`Best hours for outdoor activities: ${bestHours.map(h => `${h}:00`).join(', ')}`);
  }

  return recommendations;
};

// Generate ICS calendar file
export const generateCalendarEvent = (title, startHour, duration = 1) => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(startHour, 0, 0, 0);
  
  // If time has passed today, schedule for tomorrow
  if (start < now) {
    start.setDate(start.getDate() + 1);
  }

  const end = new Date(start);
  end.setHours(start.getHours() + duration);

  const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BreatheEasy//Clean Air Time//EN
BEGIN:VEVENT
DTSTART:${formatICSDate(start)}
DTEND:${formatICSDate(end)}
SUMMARY:${title}
DESCRIPTION:Best time for outdoor activities based on air quality analysis
LOCATION:Your Location
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};

export const downloadCalendar = (title, startHour, duration = 1) => {
  const icsContent = generateCalendarEvent(title, startHour, duration);
  const blob = new Blob([icsContent], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clean-air-time-${Date.now()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
};

