const OPENAQ_BASE_URL = 'https://api.openaq.org/v2';

export const fetchAirQuality = async (latitude, longitude) => {
  try {
    // Method 1: Try latest measurements endpoint (more reliable)
    try {
      const measurementsResponse = await fetch(
        `${OPENAQ_BASE_URL}/latest?coordinates=${latitude},${longitude}&radius=50000&limit=10`
      );
      
      if (measurementsResponse.ok) {
        const measurementsData = await measurementsResponse.json();
        
        if (measurementsData.results && measurementsData.results.length > 0) {
          // Find the closest location with PM2.5 or PM10 data
          for (const result of measurementsData.results) {
            if (result.measurements) {
              const pm25 = result.measurements.find(m => m.parameter === 'pm25');
              const pm10 = result.measurements.find(m => m.parameter === 'pm10');
              
              if (pm25 || pm10) {
                return processMeasurementsData(result, latitude, longitude);
              }
            }
          }
        }
      }
    } catch (e) {
      console.log('Latest measurements endpoint failed, trying locations...');
    }

    // Method 2: Try locations endpoint
    const response = await fetch(
      `${OPENAQ_BASE_URL}/locations?coordinates=${latitude},${longitude}&radius=50000&limit=10&order_by=lastUpdated&sort=desc`
    );

    if (response.ok) {
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Find location with valid parameters
        for (const location of data.results) {
          const processed = processOpenAQData(location);
          if (processed && processed.aqi > 0) {
            return processed;
          }
        }
      }
    }

    // Method 3: Try with larger radius
    const largeRadiusResponse = await fetch(
      `${OPENAQ_BASE_URL}/locations?coordinates=${latitude},${longitude}&radius=100000&limit=5&order_by=lastUpdated&sort=desc`
    );

    if (largeRadiusResponse.ok) {
      const largeData = await largeRadiusResponse.json();
      if (largeData.results && largeData.results.length > 0) {
        for (const location of largeData.results) {
          const processed = processOpenAQData(location);
          if (processed && processed.aqi > 0) {
            return processed;
          }
        }
      }
    }

    // Fallback: Return estimated data based on location
    return generateFallbackData(latitude, longitude);
  } catch (error) {
    console.error('Error fetching air quality:', error);
    // Return fallback data instead of null
    return generateFallbackData(latitude, longitude);
  }
};

const processMeasurementsData = (result, userLat, userLon) => {
  const pm25 = result.measurements?.find(m => m.parameter === 'pm25');
  const pm10 = result.measurements?.find(m => m.parameter === 'pm10');
  const o3 = result.measurements?.find(m => m.parameter === 'o3');
  const no2 = result.measurements?.find(m => m.parameter === 'no2');

  const aqi = calculateAQI(pm25?.value || pm10?.value || 0);

  return {
    aqi,
    pm25: pm25?.value || null,
    pm10: pm10?.value || null,
    o3: o3?.value || null,
    no2: no2?.value || null,
    location: result.location?.name || result.location || 'Nearby Location',
    lastUpdated: pm25?.lastUpdated || pm10?.lastUpdated || new Date().toISOString(),
    coordinates: {
      latitude: result.location?.coordinates?.latitude || result.coordinates?.latitude || userLat,
      longitude: result.location?.coordinates?.longitude || result.coordinates?.longitude || userLon,
    },
  };
};

const processOpenAQData = (location) => {
  if (!location || !location.parameters) {
    return null;
  }

  // Find PM2.5 and PM10 values
  const pm25 = location.parameters.find(p => p.parameter === 'pm25');
  const pm10 = location.parameters.find(p => p.parameter === 'pm10');
  const o3 = location.parameters.find(p => p.parameter === 'o3');
  const no2 = location.parameters.find(p => p.parameter === 'no2');

  // Calculate AQI from PM2.5 (US EPA standard)
  const aqi = calculateAQI(pm25?.lastValue || pm10?.lastValue || 0);

  return {
    aqi,
    pm25: pm25?.lastValue || null,
    pm10: pm10?.lastValue || null,
    o3: o3?.lastValue || null,
    no2: no2?.lastValue || null,
    location: location.name || 'Unknown Location',
    lastUpdated: location.lastUpdated || new Date().toISOString(),
    coordinates: {
      latitude: location.coordinates?.latitude || null,
      longitude: location.coordinates?.longitude || null,
    },
  };
};

// Calculate AQI from PM2.5 concentration (US EPA AQI formula)
const calculateAQI = (concentration) => {
  if (!concentration) return 0;

  // PM2.5 AQI breakpoints (µg/m³)
  const breakpoints = [
    { low: 0, high: 12.0, aqiLow: 0, aqiHigh: 50 },
    { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
    { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
    { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
    { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
    { low: 250.5, high: 500.4, aqiLow: 301, aqiHigh: 500 },
  ];

  for (const bp of breakpoints) {
    if (concentration >= bp.low && concentration <= bp.high) {
      return Math.round(
        ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (concentration - bp.low) + bp.aqiLow
      );
    }
  }

  return concentration > 500.4 ? 500 : 0;
};

// Generate fallback data when API doesn't have nearby stations
const generateFallbackData = (latitude, longitude) => {
  // Use a moderate AQI estimate (around 50-70) as a safe default
  // This allows the app to still function and provide basic alerts
  const estimatedAQI = 60; // Moderate air quality
  
  return {
    aqi: estimatedAQI,
    pm25: 15, // Moderate PM2.5 level
    pm10: null,
    o3: null,
    no2: null,
    location: 'Estimated (No nearby station)',
    lastUpdated: new Date().toISOString(),
    coordinates: {
      latitude,
      longitude,
    },
    isEstimated: true, // Flag to indicate this is estimated data
  };
};

export const getAQICategory = (aqi) => {
  if (aqi <= 50) return { level: 'Good', color: 'aqi-good', description: 'Air quality is satisfactory' };
  if (aqi <= 100) return { level: 'Moderate', color: 'aqi-moderate', description: 'Acceptable for most people' };
  if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'aqi-unhealthy-sensitive', description: 'Sensitive groups may experience effects' };
  if (aqi <= 200) return { level: 'Unhealthy', color: 'aqi-unhealthy', description: 'Everyone may begin to experience effects' };
  if (aqi <= 300) return { level: 'Very Unhealthy', color: 'aqi-very-unhealthy', description: 'Health alert: everyone may experience serious effects' };
  return { level: 'Hazardous', color: 'aqi-hazardous', description: 'Health warning: emergency conditions' };
};

