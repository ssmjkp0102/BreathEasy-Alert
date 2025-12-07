const STORAGE_KEYS = {
  HISTORY: 'breatheEasy_history',
  EXPOSURES: 'breatheEasy_exposures',
  METRICS: 'breatheEasy_metrics',
};

export const saveToHistory = (aqiData, alert, profileSnapshot = null) => {
  try {
    const history = getHistory();
    const entry = {
      timestamp: new Date().toISOString(),
      aqi: aqiData.aqi,
      location: aqiData.location,
      coordinates: aqiData.coordinates,
      alert: alert.alert,
      actions: alert.actions,
      // Store pollutant data for analysis
      pm25: aqiData.pm25,
      pm10: aqiData.pm10,
      o3: aqiData.o3,
      no2: aqiData.no2,
      // Store profile snapshot for weekly reports
      profileSnapshot: profileSnapshot || null,
    };

    history.unshift(entry);
    // Keep only last 100 entries (increased for weekly analysis)
    if (history.length > 100) {
      history.pop();
    }

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    updateMetrics(entry);
  } catch (error) {
    console.error('Error saving to history:', error);
  }
};

export const getHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
};

export const recordExposure = (aqi) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const exposures = getExposures();
    
    if (!exposures[today]) {
      exposures[today] = [];
    }
    
    exposures[today].push({
      timestamp: new Date().toISOString(),
      aqi,
    });

    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    Object.keys(exposures).forEach(date => {
      if (new Date(date) < thirtyDaysAgo) {
        delete exposures[date];
      }
    });

    localStorage.setItem(STORAGE_KEYS.EXPOSURES, JSON.stringify(exposures));
  } catch (error) {
    console.error('Error recording exposure:', error);
  }
};

export const getExposures = () => {
  try {
    const exposures = localStorage.getItem(STORAGE_KEYS.EXPOSURES);
    return exposures ? JSON.parse(exposures) : {};
  } catch (error) {
    console.error('Error reading exposures:', error);
    return {};
  }
};

export const getMetrics = () => {
  try {
    const metrics = localStorage.getItem(STORAGE_KEYS.METRICS);
    return metrics ? JSON.parse(metrics) : {
      totalChecks: 0,
      badExposuresAvoided: 0,
      averageAQI: 0,
      lastUpdated: null,
    };
  } catch (error) {
    console.error('Error reading metrics:', error);
    return {
      totalChecks: 0,
      badExposuresAvoided: 0,
      averageAQI: 0,
      lastUpdated: null,
    };
  }
};

const updateMetrics = (entry) => {
  try {
    const metrics = getMetrics();
    metrics.totalChecks += 1;
    
    if (entry.aqi > 100) {
      metrics.badExposuresAvoided += 1;
    }

    // Update average AQI
    const history = getHistory();
    if (history.length > 0) {
      const sum = history.reduce((acc, e) => acc + e.aqi, 0);
      metrics.averageAQI = Math.round(sum / history.length);
    }

    metrics.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
  } catch (error) {
    console.error('Error updating metrics:', error);
  }
};

