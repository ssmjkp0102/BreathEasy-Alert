import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateWeeklyExposure } from './weeklyExposure';
import { getProfile } from './profile';

let genAI = null;

const initializeGemini = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

export const generateGoalCoaching = async (goals, progress) => {
  const weekly = calculateWeeklyExposure();
  const profile = getProfile();

  if (!genAI) {
    genAI = initializeGemini();
  }

  if (!genAI) {
    return generateFallbackCoaching(goals, progress, weekly);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate a brief, actionable coaching tip to help the user meet their air quality goals.

USER PROFILE:
- Age: ${profile?.ageGroup || 'Not specified'}
- Health: ${profile?.healthConditions?.filter(c => c !== 'none').join(', ') || 'None'}
- Sensitivity: ${profile?.sensitivity || 'moderate'}

CURRENT WEEK:
- Average AQI: ${weekly.averageAQI}
- Exposure Index: ${weekly.exposureIndex}
- Bad Air Days: ${weekly.daysOver100}

GOALS:
${goals.weeklyExposureBand ? `- Target exposure band: ${goals.weeklyExposureBand}` : ''}
${goals.maxBadAirDays !== null ? `- Max bad air days: ${goals.maxBadAirDays}` : ''}
${goals.maxWeeklyExposureIndex !== null ? `- Max exposure index: ${goals.maxWeeklyExposureIndex}` : ''}

PROGRESS:
${progress.weeklyExposureBand ? `- Exposure band: ${progress.weeklyExposureBand.met ? 'MET' : 'NOT MET'} (current: ${progress.weeklyExposureBand.current})` : ''}
${progress.maxBadAirDays ? `- Bad air days: ${progress.maxBadAirDays.met ? 'MET' : 'NOT MET'} (${progress.maxBadAirDays.current}/${progress.maxBadAirDays.target})` : ''}

Generate ONE concise, specific coaching tip (1-2 sentences) to help them hit their goals. Be actionable and personalized. Examples:
- "To hit your goal, avoid outdoor running on very high AQI evenings this week."
- "You're close! Reschedule 2 outdoor activities to indoor alternatives to meet your bad air days goal."

Just return the tip text, no JSON or formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating coaching:', error);
    return generateFallbackCoaching(goals, progress, weekly);
  }
};

const generateFallbackCoaching = (goals, progress, weekly) => {
  if (progress.allGoalsMet) {
    return 'Great job meeting your goals! Keep monitoring and maintaining these healthy habits.';
  }

  if (progress.maxBadAirDays && !progress.maxBadAirDays.met) {
    const daysOver = progress.maxBadAirDays.current - progress.maxBadAirDays.target;
    return `You're ${daysOver} day${daysOver > 1 ? 's' : ''} over your goal. Try rescheduling outdoor activities to indoor alternatives on high AQI days.`;
  }

  if (progress.weeklyExposureBand && !progress.weeklyExposureBand.met) {
    return `To hit your goal, avoid outdoor activities during peak pollution hours and use air purifiers indoors.`;
  }

  return 'Monitor air quality before planning outdoor activities and adjust your schedule based on AQI levels.';
};

