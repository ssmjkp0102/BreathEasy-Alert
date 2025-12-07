import { getHistory, getExposures } from './storage';
import { getProfile } from './profile';

// EPA AQI Categories
const AQI_CATEGORIES = {
  GOOD: { min: 0, max: 50, label: 'Good' },
  MODERATE: { min: 51, max: 100, label: 'Moderate' },
  UNHEALTHY_SENSITIVE: { min: 101, max: 150, label: 'Unhealthy for Sensitive Groups' },
  UNHEALTHY: { min: 151, max: 200, label: 'Unhealthy' },
  VERY_UNHEALTHY: { min: 201, max: 300, label: 'Very Unhealthy' },
  HAZARDOUS: { min: 301, max: 500, label: 'Hazardous' },
};

// Get minutes spent outdoors based on profile
const getOutdoorMinutes = (profile) => {
  const outdoorTimeMap = {
    low: 30,      // < 1 hour = 30 min average
    moderate: 120, // 1-3 hours = 2 hours average
    high: 240,    // > 3 hours = 4 hours average
  };
  return outdoorTimeMap[profile?.outdoorTime] || 120;
};

// Calculate Personal Exposure Index (weighted sum of AQI × time)
export const calculateWeeklyExposure = () => {
  const history = getHistory();
  const profile = getProfile();
  const outdoorMinutesPerCheck = getOutdoorMinutes(profile);
  
  // Get last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentChecks = history.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= sevenDaysAgo;
  });

  if (recentChecks.length === 0) {
    return {
      exposureIndex: 0,
      averageAQI: 0,
      totalMinutes: 0,
      minutesByCategory: {},
      daysOver100: 0,
      daysOver150: 0,
      riskLevel: 'low',
      riskExplanation: 'No data available for the past week.',
    };
  }

  // Calculate weighted exposure index
  let totalExposure = 0;
  let totalMinutes = 0;
  let aqiSum = 0;
  const minutesByCategory = {};
  const daysOver100 = new Set();
  const daysOver150 = new Set();

  recentChecks.forEach(entry => {
    const minutes = outdoorMinutesPerCheck;
    const aqi = entry.aqi || 0;
    
    // Weighted exposure: AQI × minutes
    totalExposure += aqi * minutes;
    totalMinutes += minutes;
    aqiSum += aqi;

    // Track by category
    const category = getAQICategory(aqi);
    minutesByCategory[category] = (minutesByCategory[category] || 0) + minutes;

    // Track bad air days
    const date = new Date(entry.timestamp).toDateString();
    if (aqi > 100) daysOver100.add(date);
    if (aqi > 150) daysOver150.add(date);
  });

  const exposureIndex = totalExposure / (totalMinutes || 1);
  const averageAQI = aqiSum / recentChecks.length;

  // Determine risk level
  const riskLevel = getRiskLevel(exposureIndex, averageAQI);
  const riskExplanation = getRiskExplanation(riskLevel, averageAQI, profile);

  return {
    exposureIndex: Math.round(exposureIndex),
    averageAQI: Math.round(averageAQI),
    totalMinutes: Math.round(totalMinutes),
    minutesByCategory,
    daysOver100: daysOver100.size,
    daysOver150: daysOver150.size,
    totalChecks: recentChecks.length,
    riskLevel,
    riskExplanation,
    checks: recentChecks,
  };
};

// Calculate time in bad air (AQI > 100 and > 150)
export const calculateTimeInBadAir = () => {
  const weekly = calculateWeeklyExposure();
  const profile = getProfile();
  const outdoorMinutesPerCheck = getOutdoorMinutes(profile);

  let minutesOver100 = 0;
  let minutesOver150 = 0;

  weekly.checks.forEach(entry => {
    const aqi = entry.aqi || 0;
    const minutes = outdoorMinutesPerCheck;
    
    if (aqi > 100) minutesOver100 += minutes;
    if (aqi > 150) minutesOver150 += minutes;
  });

  // Get previous week for comparison
  const history = getHistory();
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const previousWeekChecks = history.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= fourteenDaysAgo && entryDate < sevenDaysAgo;
  });

  let prevMinutesOver100 = 0;
  previousWeekChecks.forEach(entry => {
    const aqi = entry.aqi || 0;
    if (aqi > 100) prevMinutesOver100 += outdoorMinutesPerCheck;
  });

  const changePercent = prevMinutesOver100 > 0 
    ? Math.round(((minutesOver100 - prevMinutesOver100) / prevMinutesOver100) * 100)
    : 0;

  return {
    minutesOver100: Math.round(minutesOver100),
    minutesOver150: Math.round(minutesOver150),
    hoursOver100: (minutesOver100 / 60).toFixed(1),
    hoursOver150: (minutesOver150 / 60).toFixed(1),
    changePercent,
    isImproving: changePercent < 0,
  };
};

const getAQICategory = (aqi) => {
  if (aqi <= 50) return 'GOOD';
  if (aqi <= 100) return 'MODERATE';
  if (aqi <= 150) return 'UNHEALTHY_SENSITIVE';
  if (aqi <= 200) return 'UNHEALTHY';
  if (aqi <= 300) return 'VERY_UNHEALTHY';
  return 'HAZARDOUS';
};

const getRiskLevel = (exposureIndex, averageAQI) => {
  // WHO/EPA guidelines: 
  // Good: < 50, Moderate: 51-100, Unhealthy for Sensitive: 101-150
  if (averageAQI <= 50) return 'low';
  if (averageAQI <= 100) return 'medium';
  if (averageAQI <= 150) return 'high';
  return 'very_high';
};

const getRiskExplanation = (riskLevel, averageAQI, profile) => {
  const explanations = {
    low: 'Your exposure is within safe limits. Continue monitoring and maintain good air quality practices.',
    medium: 'Your exposure is moderate. Sensitive individuals may experience minor symptoms. Consider reducing outdoor time during peak pollution hours.',
    high: 'Your exposure is elevated. Sensitive groups should limit outdoor activities. Consider using air purifiers and masks when outside.',
    very_high: 'Your exposure is very high. Everyone should limit outdoor activities. Use N95 masks and air purifiers. Monitor symptoms closely.',
  };

  let explanation = explanations[riskLevel] || explanations.medium;

  // Add profile-specific context
  if (profile) {
    const hasRespiratory = profile.healthConditions?.some(c => ['asthma', 'copd'].includes(c));
    if (hasRespiratory && riskLevel !== 'low') {
      explanation += ' As someone with a respiratory condition, you may be at higher risk.';
    }
    if (profile.ageGroup === 'child' || profile.ageGroup === 'senior') {
      explanation += ` ${profile.ageGroup === 'child' ? 'Children' : 'Seniors'} are more vulnerable to air pollution.`;
    }
  }

  return explanation;
};

// Get 4-week trend data
export const getLongTermTrend = () => {
  const history = getHistory();
  const profile = getProfile();
  const outdoorMinutesPerCheck = getOutdoorMinutes(profile);

  const weeks = [];
  const now = new Date();

  for (let i = 3; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - (i * 7));
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 7);

    const weekChecks = history.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= weekStart && entryDate < weekEnd;
    });

    if (weekChecks.length > 0) {
      const avgAQI = weekChecks.reduce((sum, e) => sum + (e.aqi || 0), 0) / weekChecks.length;
      let exposure = 0;
      weekChecks.forEach(e => {
        exposure += (e.aqi || 0) * outdoorMinutesPerCheck;
      });
      const exposureIndex = exposure / (weekChecks.length * outdoorMinutesPerCheck);

      weeks.push({
        week: i + 1,
        averageAQI: Math.round(avgAQI),
        exposureIndex: Math.round(exposureIndex),
        checks: weekChecks.length,
        dateRange: {
          start: weekStart.toISOString(),
          end: weekEnd.toISOString(),
        },
      });
    }
  }

  return weeks;
};

// Get dominant pollutant for the week
export const getDominantPollutant = () => {
  const weekly = calculateWeeklyExposure();
  const checks = weekly.checks;

  let pm25Count = 0;
  let pm10Count = 0;
  let no2Count = 0;
  let o3Count = 0;

  checks.forEach(check => {
    // This would need to be stored in history - for now estimate from AQI
    // In real implementation, store actual pollutant values
    if (check.pm25) pm25Count++;
    if (check.pm10) pm10Count++;
    if (check.no2) no2Count++;
    if (check.o3) o3Count++;
  });

  const pollutants = [
    { name: 'PM2.5', count: pm25Count, description: 'Fine particulate matter from combustion' },
    { name: 'PM10', count: pm10Count, description: 'Coarse particles from dust and construction' },
    { name: 'NO2', count: no2Count, description: 'Nitrogen dioxide from traffic' },
    { name: 'O3', count: o3Count, description: 'Ozone from sunlight and pollutants' },
  ];

  const dominant = pollutants.reduce((max, p) => p.count > max.count ? p : max, pollutants[0]);

  return {
    dominant: dominant.name,
    pollutants,
    healthImpact: getPollutantHealthImpact(dominant.name),
  };
};

const getPollutantHealthImpact = (pollutant) => {
  const impacts = {
    'PM2.5': 'PM2.5 can penetrate deep into lungs and bloodstream, causing heart and lung problems, especially in people with asthma or heart disease.',
    'PM10': 'PM10 can irritate eyes, nose, and throat, and worsen respiratory conditions like asthma.',
    'NO2': 'NO2 from traffic can worsen asthma and increase susceptibility to respiratory infections. Avoid main roads during high traffic times.',
    'O3': 'Ozone can cause coughing, throat irritation, and worsen asthma. Limit outdoor activities during peak ozone hours (afternoon).',
  };
  return impacts[pollutant] || 'Monitor air quality and take precautions when levels are high.';
};

