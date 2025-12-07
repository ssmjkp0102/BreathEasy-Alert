import { useState, useEffect } from 'react';
import { Loader2, RefreshCw, MapPin } from 'lucide-react';
import { getCurrentLocation } from '../services/geolocation';
import { fetchAirQuality } from '../services/openaq';
import { generatePersonalizedAlert } from '../services/gemini';
import { saveToHistory, recordExposure, getHistory } from '../services/storage';
import { getProfile, hasProfile } from '../services/profile';
import AQIDisplay from './AQIDisplay';
import AlertCard from './AlertCard';
import ShareableCard from './ShareableCard';
import AirQualityMap from './AirQualityMap';
import Metrics from './Metrics';
import ProfileSetup from './ProfileSetup';
import ProfileView from './ProfileView';
import WeeklyExposureCard from './WeeklyExposureCard';
import WeeklyReport from './WeeklyReport';
import GoalTracker from './GoalTracker';
import PollutantInsights from './PollutantInsights';
import RiskTrajectory from './RiskTrajectory';
import RoutineSuggestions from './RoutineSuggestions';
import TriggerAlerts from './TriggerAlerts';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [alert, setAlert] = useState(null);
  const [history, setHistory] = useState([]);
  const [showProfileSetup, setShowProfileSetup] = useState(!hasProfile());
  const [userProfile, setUserProfile] = useState(getProfile());
  const { theme } = useTheme();
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAirQuality = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user location
      const location = await getCurrentLocation();
      setUserLocation(location);

      // Fetch air quality data
      const data = await fetchAirQuality(location.latitude, location.longitude);
      
      if (!data || !data.aqi) {
        setError('Unable to fetch air quality data for your location. The app will use estimated values. Please try again later.');
        setLoading(false);
        return;
      }

      setAqiData(data);
      recordExposure(data.aqi);

      // Get current profile
      const profile = getProfile();

      // Generate personalized alert with profile data
      const personalizedAlert = await generatePersonalizedAlert(data, location, profile);
      setAlert(personalizedAlert);

      // Save to history with profile snapshot
      saveToHistory(data, personalizedAlert, profile);

      // Update history state
      setHistory(getHistory());

      setLoading(false);
    } catch (err) {
      console.error('Error loading air quality:', err);
      setError(err.message || 'Failed to load air quality data. Please check your location permissions.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showProfileSetup) {
      // Only load air quality if we don't have existing data
      const existingHistory = getHistory();
      if (existingHistory.length === 0 && !aqiData) {
        loadAirQuality();
      } else {
        // We have data, just update state
        setHistory(existingHistory);
        if (existingHistory.length > 0 && !aqiData) {
          const latest = existingHistory[0];
          setAqiData({
            aqi: latest.aqi,
            location: latest.location,
            pm25: latest.pm25,
            pm10: latest.pm10,
            o3: latest.o3,
            no2: latest.no2,
            coordinates: latest.coordinates,
          });
          if (latest.coordinates) {
            setUserLocation(latest.coordinates);
          }
        }
      }
    }
  }, [showProfileSetup]);

  const handleProfileComplete = (profile) => {
    setUserProfile(profile);
    setShowProfileSetup(false);
    // Load air quality after profile is set
    loadAirQuality();
  };

  const handleProfileUpdate = (updatedProfile) => {
    setUserProfile(updatedProfile);
    // Reload alerts with new profile
    if (aqiData && userLocation) {
      generatePersonalizedAlert(aqiData, userLocation, updatedProfile).then(setAlert);
    }
  };

  const handleSampleDataLoaded = () => {
    console.log('handleSampleDataLoaded called');
    
    // Prevent any API calls while updating with sample data
    setLoading(false);
    setError(null);
    
    // Small delay to ensure localStorage is updated
    setTimeout(() => {
      // Refresh all data without reloading
      const sampleHistory = getHistory();
      const profile = getProfile();
      
      console.log('Sample history length:', sampleHistory.length);
      console.log('Profile:', profile);
      
      // Update state synchronously
      setHistory([...sampleHistory]); // Create new array to trigger re-render
      setUserProfile(profile ? { ...profile } : null);
      setRefreshKey(prev => prev + 1);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('sampleDataLoaded'));
      
      // If we have sample data, show the latest reading
      if (sampleHistory.length > 0) {
        const latest = sampleHistory[0];
        const newAqiData = {
          aqi: latest.aqi,
          location: latest.location,
          pm25: latest.pm25,
          pm10: latest.pm10,
          o3: latest.o3,
          no2: latest.no2,
          coordinates: latest.coordinates,
          lastUpdated: latest.timestamp,
        };
        
        console.log('Setting AQI data:', newAqiData);
        setAqiData(newAqiData);
        
        // Set location if not already set
        if (!userLocation && latest.coordinates) {
          setUserLocation(latest.coordinates);
        }
        
        // Generate alert for the current data
        if (latest.alert && latest.actions) {
          setAlert({
            alert: latest.alert,
            actions: latest.actions,
            timeEstimate: 'Check back in 2-3 hours',
          });
        } else {
          // Generate new alert asynchronously without blocking
          generatePersonalizedAlert(
            newAqiData,
            latest.coordinates || userLocation || { latitude: 37.7749, longitude: -122.4194 },
            profile
          ).then(setAlert).catch(() => {
            // Fallback alert if AI fails
            setAlert({
              alert: `Air quality is ${latest.aqi < 50 ? 'good' : latest.aqi < 100 ? 'moderate' : 'unhealthy'}.`,
              actions: ['Monitor air quality', 'Take precautions if sensitive'],
              timeEstimate: 'Check back in 2-3 hours',
            });
          });
        }
      } else {
        // No data, clear everything
        setAqiData(null);
        setAlert(null);
      }
    }, 300);
  };

  // Show profile setup if needed
  if (showProfileSetup) {
    return (
      <ProfileSetup
        onComplete={handleProfileComplete}
        onSkip={() => {
          setShowProfileSetup(false);
          loadAirQuality();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading air quality data...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please allow location access</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Location Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={loadAirQuality}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">BreatheEasy Alert</h1>
          <p className="text-gray-600 dark:text-gray-300">Real-time hyperlocal air quality warnings</p>
        </div>

        {/* Top Controls */}
        <div className="flex justify-end items-center mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={loadAirQuality}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-xl shadow-md transition-colors border border-gray-200 dark:border-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Profile View */}
        {userProfile && (
          <ProfileView onUpdate={handleProfileUpdate} />
        )}

        {/* Metrics */}
        <Metrics />

        {/* Weekly Exposure Score */}
        <WeeklyExposureCard />

        {/* Weekly Report */}
        <WeeklyReport />

        {/* Goal Tracker */}
        <GoalTracker />

        {/* Trigger-Based Alerts */}
        {aqiData && (
          <TriggerAlerts currentAQI={aqiData.aqi} />
        )}

        {/* Routine Suggestions */}
        <RoutineSuggestions />

        {/* AQI Display */}
        {aqiData && (
          <AQIDisplay aqi={aqiData.aqi} location={aqiData.location} aqiData={aqiData} />
        )}

        {/* Alert Card */}
        {alert && (
          <AlertCard
            alert={alert.alert}
            actions={alert.actions}
            timeEstimate={alert.timeEstimate}
            aqi={aqiData?.aqi}
            isPersonalized={!!userProfile}
          />
        )}

        {/* Shareable Card */}
        {aqiData && alert && (
          <ShareableCard aqiData={aqiData} alert={alert} />
        )}

        {/* Pollutant Insights */}
        <PollutantInsights />

        {/* Risk Trajectory */}
        <RiskTrajectory key={refreshKey} onDataLoaded={handleSampleDataLoaded} />

        {/* Map */}
        {userLocation && (
          <AirQualityMap
            userLocation={userLocation}
            aqiData={aqiData}
            history={history}
          />
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Data provided by OpenAQ • Powered by Google Gemini AI</p>
          <p className="mt-2">Stay safe and breathe easy! 🌬️</p>
        </div>
      </div>
    </div>
  );
}

