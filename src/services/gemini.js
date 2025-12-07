import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

const initializeGemini = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Gemini API key not found. AI features will be limited.');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const generatePersonalizedAlert = async (aqiData, userLocation, userProfile = null) => {
  try {
    if (!genAI) {
      genAI = initializeGemini();
    }

    if (!genAI) {
      // Fallback alert without AI
      return generateFallbackAlert(aqiData, userProfile);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build profile context
    let profileContext = '';
    if (userProfile) {
      profileContext = `\n\nUSER PROFILE (CRITICAL - personalize recommendations based on this):
- Age Group: ${userProfile.ageGroup || 'Not specified'}
- Health Conditions: ${userProfile.healthConditions?.filter(c => c !== 'none').join(', ') || 'None'}
- Sensitivity Level: ${userProfile.sensitivity || 'moderate'}
- Daily Outdoor Time: ${userProfile.outdoorTime || 'moderate'}

IMPORTANT: Tailor ALL recommendations specifically to this user's profile. For example:
- If they have asthma/COPD: emphasize indoor air quality, medication readiness, avoid triggers
- If they're a child/senior: more conservative recommendations, shorter exposure times
- If sensitivity is high/very_high: stricter precautions, lower AQI thresholds
- If outdoor time is high: specific timing recommendations, alternative indoor activities`;
    }

    const prompt = `You are an air quality health advisor. Generate a HIGHLY PERSONALIZED, actionable alert for someone experiencing air quality index (AQI) of ${aqiData.aqi} (${getAQICategory(aqiData.aqi).level}).

Location: ${aqiData.location || 'Current location'}
PM2.5: ${aqiData.pm25 ? `${aqiData.pm25.toFixed(1)} µg/m³` : 'N/A'}
PM10: ${aqiData.pm10 ? `${aqiData.pm10.toFixed(1)} µg/m³` : 'N/A'}${profileContext}

Generate:
1. A brief, personalized alert message (1-2 sentences) explaining the current air quality risk SPECIFICALLY for this user
2. Specific, personalized action items (4-6 bullet points) tailored to their profile. Examples:
   - For asthma/COPD: "Keep rescue inhaler nearby", "Use HEPA air purifier", "Avoid outdoor activities"
   - For children: "Keep kids indoors", "Postpone outdoor play", "Use child-safe masks if needed"
   - For high sensitivity: "Stay indoors immediately", "Use N95 mask for any outdoor exposure"
   - For high outdoor time: "Reschedule outdoor activities to [specific time]", "Find indoor alternatives"
3. A time estimate for when conditions might improve (if applicable)

Format as JSON:
{
  "alert": "personalized alert message here",
  "actions": ["personalized action 1", "personalized action 2", "personalized action 3"],
  "timeEstimate": "estimated time or duration"
}

Be SPECIFIC, PRACTICAL, and HIGHLY PERSONALIZED to the user's profile. If no profile provided, use general recommendations. Keep it under 200 words total.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from the response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          alert: parsed.alert || generateFallbackAlert(aqiData).alert,
          actions: parsed.actions || [],
          timeEstimate: parsed.timeEstimate || 'Check back in 2-3 hours',
        };
      }
    } catch (e) {
      console.error('Failed to parse Gemini response as JSON:', e);
    }

    // Fallback: use the text directly
    return {
      alert: text.split('\n')[0] || generateFallbackAlert(aqiData).alert,
      actions: text.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•')).slice(0, 5),
      timeEstimate: 'Check back in 2-3 hours',
    };
  } catch (error) {
    console.error('Error generating AI alert:', error);
    return generateFallbackAlert(aqiData);
  }
};

const generateFallbackAlert = (aqiData, userProfile = null) => {
  const category = getAQICategory(aqiData.aqi);
  const actions = [];
  let alertMessage = `Air quality is ${category.level.toLowerCase()}. ${category.description}.`;

  // Personalized recommendations based on profile
  if (userProfile) {
    const hasRespiratoryCondition = userProfile.healthConditions?.some(c => 
      ['asthma', 'copd'].includes(c)
    );
    const isHighSensitivity = ['high', 'very_high'].includes(userProfile.sensitivity);
    const isChild = userProfile.ageGroup === 'child';
    const isSenior = userProfile.ageGroup === 'senior';
    const highOutdoorTime = userProfile.outdoorTime === 'high';

    // Adjust alert message
    if (hasRespiratoryCondition) {
      alertMessage = `⚠️ ${category.level} air quality detected. As someone with a respiratory condition, you're at higher risk. ${category.description}.`;
    } else if (isChild || isSenior) {
      alertMessage = `⚠️ ${category.level} air quality detected. ${isChild ? 'Children' : 'Seniors'} are more vulnerable. ${category.description}.`;
    } else if (isHighSensitivity) {
      alertMessage = `⚠️ ${category.level} air quality detected. Given your high sensitivity, take extra precautions. ${category.description}.`;
    }

    // Personalized actions
    if (hasRespiratoryCondition) {
      actions.push('Keep rescue inhaler or medication nearby');
      actions.push('Use HEPA air purifier if available');
      if (aqiData.aqi > 100) {
        actions.push('Avoid outdoor activities completely');
        actions.push('Keep windows and doors closed');
      }
    }

    if (isChild) {
      actions.push('Keep children indoors');
      actions.push('Postpone outdoor play and sports');
      if (aqiData.aqi > 150) {
        actions.push('Use child-safe masks if outdoor exposure is necessary');
      }
    }

    if (isSenior) {
      actions.push('Limit outdoor time');
      actions.push('Avoid strenuous outdoor activities');
      if (aqiData.aqi > 100) {
        actions.push('Stay indoors as much as possible');
      }
    }

    if (isHighSensitivity) {
      if (aqiData.aqi > 50) {
        actions.push('Consider staying indoors');
      }
      if (aqiData.aqi > 100) {
        actions.push('Use N95 mask for any outdoor exposure');
        actions.push('Keep windows closed');
      }
    }

    if (highOutdoorTime && aqiData.aqi > 100) {
      actions.push('Reschedule outdoor activities to later when air quality improves');
      actions.push('Find indoor alternatives for your usual outdoor routine');
    }
  }

  // General recommendations if no profile or additional actions needed
  if (actions.length === 0 || !userProfile) {
    if (aqiData.aqi > 100) {
      actions.push('Close windows and doors');
      actions.push('Use air purifier if available');
    }
    if (aqiData.aqi > 150) {
      actions.push('Wear N95 mask if going outside');
      actions.push('Avoid outdoor exercise');
    }
    if (aqiData.aqi > 200) {
      actions.push('Stay indoors as much as possible');
      actions.push('Postpone non-essential outdoor activities');
    }
  }

  if (actions.length === 0) {
    actions.push('Monitor air quality regularly');
    actions.push('Take precautions if sensitive to air pollution');
  }

  return {
    alert: alertMessage,
    actions: actions,
    timeEstimate: 'Check back in 2-3 hours',
  };
};

const getAQICategory = (aqi) => {
  if (aqi <= 50) return { level: 'Good' };
  if (aqi <= 100) return { level: 'Moderate' };
  if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups' };
  if (aqi <= 200) return { level: 'Unhealthy' };
  if (aqi <= 300) return { level: 'Very Unhealthy' };
  return { level: 'Hazardous' };
};

