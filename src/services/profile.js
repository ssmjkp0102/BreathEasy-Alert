const PROFILE_STORAGE_KEY = 'breatheEasy_profile';

export const getDefaultProfile = () => ({
  age: null,
  ageGroup: null, // 'child', 'adult', 'senior'
  healthConditions: [], // ['asthma', 'copd', 'heart_disease', 'pregnancy', 'none']
  sensitivity: 'moderate', // 'low', 'moderate', 'high', 'very_high'
  activityLevel: 'moderate', // 'low', 'moderate', 'high'
  outdoorTime: 'moderate', // 'low', 'moderate', 'high'
  location: null, // 'urban', 'suburban', 'rural'
  createdAt: null,
  lastUpdated: null,
});

export const getProfile = () => {
  try {
    const profile = localStorage.getItem(PROFILE_STORAGE_KEY);
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Error reading profile:', error);
    return null;
  }
};

export const saveProfile = (profileData) => {
  try {
    const profile = {
      ...profileData,
      lastUpdated: new Date().toISOString(),
      createdAt: profileData.createdAt || new Date().toISOString(),
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
};

export const hasProfile = () => {
  return getProfile() !== null;
};

export const updateProfile = (updates) => {
  const currentProfile = getProfile();
  if (!currentProfile) {
    return saveProfile({ ...getDefaultProfile(), ...updates });
  }
  return saveProfile({ ...currentProfile, ...updates });
};

export const getProfileSummary = (profile) => {
  if (!profile) return 'No profile set';
  
  const parts = [];
  if (profile.ageGroup) parts.push(profile.ageGroup);
  if (profile.healthConditions && profile.healthConditions.length > 0 && !profile.healthConditions.includes('none')) {
    parts.push(profile.healthConditions.join(', '));
  }
  if (profile.sensitivity) parts.push(`${profile.sensitivity} sensitivity`);
  
  return parts.length > 0 ? parts.join(' • ') : 'Standard profile';
};

