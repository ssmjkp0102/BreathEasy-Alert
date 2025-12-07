import { getProfile } from './profile';

const TRIGGER_STORAGE_KEY = 'breatheEasy_triggerAlerts';

export const getDefaultTriggers = () => ({
  customThreshold: null, // Custom AQI threshold
  useProfileBased: true, // Auto-calculate based on profile
  enabled: true,
  lastTriggered: null,
});

export const getTriggers = () => {
  try {
    const triggers = localStorage.getItem(TRIGGER_STORAGE_KEY);
    return triggers ? JSON.parse(triggers) : getDefaultTriggers();
  } catch (error) {
    return getDefaultTriggers();
  }
};

export const saveTriggers = (triggers) => {
  try {
    localStorage.setItem(TRIGGER_STORAGE_KEY, JSON.stringify(triggers));
    return true;
  } catch (error) {
    console.error('Error saving triggers:', error);
    return false;
  }
};

// Calculate recommended threshold based on profile
export const calculateProfileThreshold = () => {
  const profile = getProfile();
  if (!profile) return 100; // Default

  let baseThreshold = 100;

  // Adjust based on health conditions
  if (profile.healthConditions?.some(c => ['asthma', 'copd'].includes(c))) {
    baseThreshold = 80; // Lower for respiratory conditions
  }

  // Adjust based on sensitivity
  const sensitivityAdjustments = {
    low: 20,
    moderate: 0,
    high: -20,
    very_high: -40,
  };
  baseThreshold += sensitivityAdjustments[profile.sensitivity] || 0;

  // Adjust based on age
  if (profile.ageGroup === 'child' || profile.ageGroup === 'senior') {
    baseThreshold -= 10;
  }

  return Math.max(50, Math.min(150, baseThreshold)); // Clamp between 50-150
};

export const checkTrigger = (currentAQI) => {
  const triggers = getTriggers();
  if (!triggers.enabled) return null;

  const threshold = triggers.useProfileBased
    ? calculateProfileThreshold()
    : (triggers.customThreshold || 100);

  if (currentAQI > threshold) {
    return {
      triggered: true,
      threshold,
      currentAQI,
      explanation: generateThresholdExplanation(threshold, triggers.useProfileBased),
    };
  }

  return null;
};

const generateThresholdExplanation = (threshold, isProfileBased) => {
  if (isProfileBased) {
    const profile = getProfile();
    let explanation = `Your personalized threshold is ${threshold} AQI based on your profile. `;
    
    if (profile?.healthConditions?.some(c => ['asthma', 'copd'].includes(c))) {
      explanation += 'As someone with a respiratory condition, you should take precautions at lower AQI levels. ';
    }
    if (profile?.sensitivity === 'high' || profile?.sensitivity === 'very_high') {
      explanation += 'Your high sensitivity means you may experience symptoms at lower pollution levels. ';
    }
    explanation += 'This threshold aligns with WHO/EPA guidelines for your specific health profile.';
    
    return explanation;
  }

  return `You've set a custom threshold of ${threshold} AQI. When air quality exceeds this level, you'll receive alerts.`;
};

export const getThresholdExplanation = () => {
  const triggers = getTriggers();
  const threshold = triggers.useProfileBased
    ? calculateProfileThreshold()
    : (triggers.customThreshold || 100);

  return generateThresholdExplanation(threshold, triggers.useProfileBased);
};

