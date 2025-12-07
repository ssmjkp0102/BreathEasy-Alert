const GOALS_STORAGE_KEY = 'breatheEasy_goals';

export const getDefaultGoals = () => ({
  weeklyExposureBand: null, // 'low', 'medium', 'high'
  maxBadAirDays: null, // number of days per week
  maxWeeklyExposureIndex: null, // target exposure index
  createdAt: null,
  lastUpdated: null,
});

export const getGoals = () => {
  try {
    const goals = localStorage.getItem(GOALS_STORAGE_KEY);
    return goals ? JSON.parse(goals) : getDefaultGoals();
  } catch (error) {
    console.error('Error reading goals:', error);
    return getDefaultGoals();
  }
};

export const saveGoals = (goalsData) => {
  try {
    const goals = {
      ...goalsData,
      lastUpdated: new Date().toISOString(),
      createdAt: goalsData.createdAt || new Date().toISOString(),
    };
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    return true;
  } catch (error) {
    console.error('Error saving goals:', error);
    return false;
  }
};

import { calculateWeeklyExposure } from './weeklyExposure';

export const checkGoalProgress = () => {
  const goals = getGoals();
  const weekly = calculateWeeklyExposure();

  const progress = {
    weeklyExposureBand: null,
    maxBadAirDays: null,
    maxWeeklyExposureIndex: null,
    allGoalsMet: false,
  };

  if (goals.weeklyExposureBand) {
    const currentBand = weekly.riskLevel;
    const targetBand = goals.weeklyExposureBand;
    const bandOrder = { low: 0, medium: 1, high: 2, very_high: 3 };
    progress.weeklyExposureBand = {
      target: targetBand,
      current: currentBand,
      met: bandOrder[currentBand] <= bandOrder[targetBand],
      progress: calculateBandProgress(currentBand, targetBand),
    };
  }

  if (goals.maxBadAirDays !== null) {
    progress.maxBadAirDays = {
      target: goals.maxBadAirDays,
      current: weekly.daysOver100,
      met: weekly.daysOver100 <= goals.maxBadAirDays,
      progress: Math.min(100, (goals.maxBadAirDays / Math.max(weekly.daysOver100, 1)) * 100),
    };
  }

  if (goals.maxWeeklyExposureIndex !== null) {
    progress.maxWeeklyExposureIndex = {
      target: goals.maxWeeklyExposureIndex,
      current: weekly.exposureIndex,
      met: weekly.exposureIndex <= goals.maxWeeklyExposureIndex,
      progress: Math.min(100, (goals.maxWeeklyExposureIndex / Math.max(weekly.exposureIndex, 1)) * 100),
    };
  }

  progress.allGoalsMet = Object.values(progress)
    .filter(p => p && typeof p === 'object' && 'met' in p)
    .every(p => p.met);

  return progress;
};

const calculateBandProgress = (current, target) => {
  const bands = { low: 0, medium: 1, high: 2, very_high: 3 };
  const currentLevel = bands[current] || 1;
  const targetLevel = bands[target] || 1;
  
  if (currentLevel <= targetLevel) return 100;
  const diff = currentLevel - targetLevel;
  return Math.max(0, 100 - (diff * 25)); // 25% penalty per band above target
};

