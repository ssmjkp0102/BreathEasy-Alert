import { saveToHistory } from './storage';
import { saveProfile } from './profile';
import { saveGoals } from './goals';
import { saveRoutine } from './routine';
import { saveTriggers } from './triggerAlerts';

// Generate sample AQI data for the past 4 weeks (28 days)
const generateSampleHistory = () => {
  const history = [];
  const now = new Date();
  
  // Generate data for past 28 days (4 weeks), 2-3 checks per day
  for (let day = 27; day >= 0; day--) {
    const baseDate = new Date(now);
    baseDate.setDate(baseDate.getDate() - day);
    const weekNumber = Math.floor(day / 7); // 0-3 for 4 weeks
    
    // Morning check (lower AQI) - vary by week to show trends
    const baseMorningAQI = 40 + (weekNumber * 10) + Math.random() * 20; // Increases slightly each week
    const morningAQI = Math.min(120, baseMorningAQI); // Cap at 120
    const morningDate = new Date(baseDate);
    morningDate.setHours(8 + Math.random() * 2, 0, 0, 0);
    history.push({
      timestamp: morningDate.toISOString(),
      aqi: Math.round(morningAQI),
      location: 'Sample Location - Downtown',
      coordinates: { latitude: 37.7749, longitude: -122.4194 },
      alert: `Air quality is ${morningAQI < 50 ? 'good' : 'moderate'} this morning.`,
      actions: ['Monitor throughout the day', 'Good time for outdoor activities'],
      pm25: Math.round(morningAQI * 0.3),
      pm10: Math.round(morningAQI * 0.4),
      o3: Math.round(morningAQI * 0.2),
      no2: Math.round(morningAQI * 0.25),
      profileSnapshot: {
        ageGroup: 'adult',
        healthConditions: ['asthma'],
        sensitivity: 'high',
        outdoorTime: 'moderate',
      },
    });

    // Afternoon check (higher AQI) - vary by week
    const baseAfternoonAQI = 70 + (weekNumber * 15) + Math.random() * 50; // Increases each week
    const afternoonAQI = Math.min(180, baseAfternoonAQI); // Cap at 180
    const afternoonDate = new Date(baseDate);
    afternoonDate.setHours(14 + Math.random() * 2, 0, 0, 0);
    history.push({
      timestamp: afternoonDate.toISOString(),
      aqi: Math.round(afternoonAQI),
      location: 'Sample Location - Downtown',
      coordinates: { latitude: 37.7749, longitude: -122.4194 },
      alert: `Air quality is ${afternoonAQI > 100 ? 'unhealthy for sensitive groups' : 'moderate'} this afternoon.`,
      actions: afternoonAQI > 100 
        ? ['Limit outdoor activities', 'Use air purifier if available', 'Keep windows closed']
        : ['Monitor air quality', 'Take precautions if sensitive'],
      pm25: Math.round(afternoonAQI * 0.3),
      pm10: Math.round(afternoonAQI * 0.4),
      o3: Math.round(afternoonAQI * 0.2),
      no2: Math.round(afternoonAQI * 0.25),
      profileSnapshot: {
        ageGroup: 'adult',
        healthConditions: ['asthma'],
        sensitivity: 'high',
        outdoorTime: 'moderate',
      },
    });

    // Evening check (variable) - vary by week
    if (Math.random() > 0.5) {
      const baseEveningAQI = 50 + (weekNumber * 12) + Math.random() * 40;
      const eveningAQI = Math.min(140, baseEveningAQI);
      const eveningDate = new Date(baseDate);
      eveningDate.setHours(18 + Math.random() * 2, 0, 0, 0);
      history.push({
        timestamp: eveningDate.toISOString(),
        aqi: Math.round(eveningAQI),
        location: 'Sample Location - Downtown',
        coordinates: { latitude: 37.7749, longitude: -122.4194 },
        alert: `Air quality is ${eveningAQI > 100 ? 'unhealthy for sensitive groups' : 'moderate'} this evening.`,
        actions: eveningAQI > 100 
          ? ['Avoid outdoor exercise', 'Use air purifier']
          : ['Air quality is acceptable'],
        pm25: Math.round(eveningAQI * 0.3),
        pm10: Math.round(eveningAQI * 0.4),
        o3: Math.round(eveningAQI * 0.2),
        no2: Math.round(eveningAQI * 0.25),
        profileSnapshot: {
          ageGroup: 'adult',
          healthConditions: ['asthma'],
          sensitivity: 'high',
          outdoorTime: 'moderate',
        },
      });
    }
  }

  return history;
};

export const loadSampleData = () => {
  try {
    // Save sample history
    const sampleHistory = generateSampleHistory();
    // Clear existing history first
    localStorage.removeItem('breatheEasy_history');
    localStorage.setItem('breatheEasy_history', JSON.stringify(sampleHistory));

    // Save sample profile
    saveProfile({
      ageGroup: 'adult',
      healthConditions: ['asthma'],
      sensitivity: 'high',
      outdoorTime: 'moderate',
      activityLevel: 'moderate',
    });

    // Save sample goals
    saveGoals({
      weeklyExposureBand: 'medium',
      maxBadAirDays: 2,
      maxWeeklyExposureIndex: 100,
    });

    // Save sample routine
    saveRoutine({
      morningActivity: 'run',
      eveningActivity: 'walk',
      commuteWindow: 'both',
      bestHours: [6, 7, 8],
    });

    // Save sample triggers
    saveTriggers({
      useProfileBased: true,
      customThreshold: null,
      enabled: true,
    });

    // Update metrics
    const totalChecks = sampleHistory.length;
    const badExposuresAvoided = sampleHistory.filter(e => e.aqi > 100).length;
    const averageAQI = Math.round(
      sampleHistory.reduce((sum, e) => sum + e.aqi, 0) / totalChecks
    );

    localStorage.setItem('breatheEasy_metrics', JSON.stringify({
      totalChecks,
      badExposuresAvoided,
      averageAQI,
      lastUpdated: new Date().toISOString(),
    }));

    // Generate sample exposures
    const exposures = {};
    sampleHistory.forEach(entry => {
      const date = new Date(entry.timestamp).toISOString().split('T')[0];
      if (!exposures[date]) {
        exposures[date] = [];
      }
      exposures[date].push({
        timestamp: entry.timestamp,
        aqi: entry.aqi,
      });
    });
    localStorage.setItem('breatheEasy_exposures', JSON.stringify(exposures));

    return {
      success: true,
      message: `Loaded ${totalChecks} sample data points for visualization`,
      historyCount: totalChecks,
    };
  } catch (error) {
    console.error('Error loading sample data:', error);
    return {
      success: false,
      message: 'Failed to load sample data',
    };
  }
};

export const clearSampleData = () => {
  try {
    localStorage.removeItem('breatheEasy_history');
    localStorage.removeItem('breatheEasy_profile');
    localStorage.removeItem('breatheEasy_goals');
    localStorage.removeItem('breatheEasy_routine');
    localStorage.removeItem('breatheEasy_triggerAlerts');
    localStorage.removeItem('breatheEasy_metrics');
    localStorage.removeItem('breatheEasy_exposures');
    localStorage.removeItem('breatheEasy_weeklyReport');
    return { success: true, message: 'Sample data cleared' };
  } catch (error) {
    console.error('Error clearing sample data:', error);
    return { success: false, message: 'Failed to clear sample data' };
  }
};

