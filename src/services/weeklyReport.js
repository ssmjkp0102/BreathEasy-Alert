import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateWeeklyExposure, getLongTermTrend } from './weeklyExposure';
import { getProfile } from './profile';

const WEEKLY_REPORT_CACHE_KEY = 'breatheEasy_weeklyReport';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

let genAI = null;

const initializeGemini = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const generateWeeklyReport = async (forceRefresh = false) => {
  // Check cache
  if (!forceRefresh) {
    const cached = getCachedReport();
    if (cached && isCacheValid(cached)) {
      return cached;
    }
  }

  const weekly = calculateWeeklyExposure();
  const profile = getProfile();
  const trend = getLongTermTrend();
  const previousWeek = trend.length > 1 ? trend[trend.length - 2] : null;

  if (!genAI) {
    genAI = initializeGemini();
  }

  if (!genAI) {
    return generateFallbackReport(weekly, profile, previousWeek);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate a personalized weekly air quality health report.

USER PROFILE:
- Age Group: ${profile?.ageGroup || 'Not specified'}
- Health Conditions: ${profile?.healthConditions?.filter(c => c !== 'none').join(', ') || 'None'}
- Sensitivity: ${profile?.sensitivity || 'moderate'}
- Outdoor Time: ${profile?.outdoorTime || 'moderate'}

LAST 7 DAYS DATA:
- Average AQI: ${weekly.averageAQI}
- Exposure Index: ${weekly.exposureIndex}
- Days with AQI > 100: ${weekly.daysOver100}
- Days with AQI > 150: ${weekly.daysOver150}
- Total checks: ${weekly.totalChecks}

${previousWeek ? `PREVIOUS WEEK (for comparison):
- Average AQI: ${previousWeek.averageAQI}
- Exposure Index: ${previousWeek.exposureIndex}` : 'No previous week data available'}

Generate a concise weekly report with:
1. A 2-3 sentence health risk explanation based on their average AQI (${weekly.averageAQI}) and profile
2. Top 5 personalized action items specific to their health conditions and exposure level
3. A "What changed vs last week?" section comparing this week to previous week (better/worse, key days, biggest spike)
4. Plain language interpretation of the trend

Format as JSON:
{
  "riskExplanation": "2-3 sentence explanation",
  "actions": ["action 1", "action 2", "action 3", "action 4", "action 5"],
  "weekComparison": "What changed vs last week explanation",
  "trendInterpretation": "Long-term risk interpretation"
}

Be specific, health-focused, and personalized. Use WHO/EPA language. Keep total under 300 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const report = {
          ...parsed,
          weekly,
          profile,
          generatedAt: new Date().toISOString(),
        };
        cacheReport(report);
        return report;
      }
    } catch (e) {
      console.error('Failed to parse Gemini response:', e);
    }

    return generateFallbackReport(weekly, profile, previousWeek);
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return generateFallbackReport(weekly, profile, previousWeek);
  }
};

const generateFallbackReport = (weekly, profile, previousWeek) => {
  const category = getAQICategory(weekly.averageAQI);
  const hasRespiratory = profile?.healthConditions?.some(c => ['asthma', 'copd'].includes(c));

  let riskExplanation = `This week your average AQI was ${weekly.averageAQI} (${category}). `;
  if (hasRespiratory) {
    riskExplanation += `As someone with a respiratory condition, you should monitor symptoms closely. `;
  }
  riskExplanation += weekly.riskExplanation;

  const actions = [];
  if (weekly.averageAQI > 100) {
    actions.push('Limit outdoor activities during peak pollution hours');
    actions.push('Use air purifiers indoors');
  }
  if (weekly.averageAQI > 150) {
    actions.push('Wear N95 masks when going outside');
    actions.push('Avoid strenuous outdoor exercise');
  }
  if (hasRespiratory) {
    actions.push('Keep rescue medication nearby');
  }
  actions.push('Monitor air quality before planning outdoor activities');
  actions.push('Consider rescheduling outdoor plans when AQI is high');

  let weekComparison = 'No previous week data available for comparison.';
  if (previousWeek) {
    const aqiChange = weekly.averageAQI - previousWeek.averageAQI;
    if (Math.abs(aqiChange) < 10) {
      weekComparison = 'Air quality remained relatively stable compared to last week.';
    } else if (aqiChange > 0) {
      weekComparison = `Air quality worsened this week (${aqiChange} points higher on average). The biggest concern was ${weekly.daysOver100} days with unhealthy air.`;
    } else {
      weekComparison = `Air quality improved this week (${Math.abs(aqiChange)} points lower on average). Great progress!`;
    }
  }

  const trendInterpretation = weekly.riskLevel === 'very_high' 
    ? 'Three weeks in a row of high exposure can increase long-term heart and lung risk. Focus on reducing exposure next week.'
    : 'Your exposure levels are manageable, but continue monitoring and taking precautions.';

  const report = {
    riskExplanation,
    actions: actions.slice(0, 5),
    weekComparison,
    trendInterpretation,
    weekly,
    profile,
    generatedAt: new Date().toISOString(),
  };

  cacheReport(report);
  return report;
};

const getAQICategory = (aqi) => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

const getCachedReport = () => {
  try {
    const cached = localStorage.getItem(WEEKLY_REPORT_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
};

const cacheReport = (report) => {
  try {
    localStorage.setItem(WEEKLY_REPORT_CACHE_KEY, JSON.stringify(report));
  } catch (error) {
    console.error('Error caching report:', error);
  }
};

const isCacheValid = (cached) => {
  if (!cached.generatedAt) return false;
  const cacheTime = new Date(cached.generatedAt).getTime();
  const now = new Date().getTime();
  return (now - cacheTime) < CACHE_DURATION;
};

