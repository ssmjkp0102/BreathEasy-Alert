import { GoogleGenerativeAI } from '@google/generative-ai';
import { getProfile } from './profile';

let genAI = null;

const initializeGemini = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

export const generateTrajectoryInterpretation = (trend) => {
  const profile = getProfile();
  
  if (trend.length < 3) {
    return 'Continue monitoring your exposure. Consistent tracking helps identify patterns.';
  }

  // Check for consecutive high exposure weeks
  const highExposureWeeks = trend.filter(w => w.averageAQI > 150).length;
  const consecutiveHigh = trend.slice(-3).every(w => w.averageAQI > 150);

  if (consecutiveHigh && highExposureWeeks >= 3) {
    let message = 'Three weeks in a row of high exposure can increase long-term heart and lung risk. ';
    if (profile?.healthConditions?.some(c => ['asthma', 'copd'].includes(c))) {
      message += 'As someone with a respiratory condition, this is particularly concerning. ';
    }
    message += 'Focus on reducing exposure next week by limiting outdoor time and using air purifiers.';
    return message;
  }

  const recent = trend[trend.length - 1];
  const previous = trend[trend.length - 2];
  const change = recent.averageAQI - previous.averageAQI;

  if (Math.abs(change) < 10) {
    return 'Your exposure levels have been relatively stable. Continue monitoring and maintaining good air quality practices.';
  }

  if (change > 0) {
    return `Your exposure has increased recently. Consider taking extra precautions and limiting outdoor activities during high AQI periods.`;
  }

  return 'Great progress! Your exposure has decreased. Keep up the good habits and continue monitoring.';
};

