import { useState } from 'react';
import { User, Edit2, Check, X } from 'lucide-react';
import { getProfile, updateProfile, getProfileSummary } from '../services/profile';
import ProfileSetup from './ProfileSetup';

export default function ProfileView({ onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const profile = getProfile();

  if (!profile) {
    return null;
  }

  if (isEditing) {
    return (
      <ProfileSetup
        onComplete={(updatedProfile) => {
          setIsEditing(false);
          if (onUpdate) onUpdate(updatedProfile);
        }}
        onSkip={() => setIsEditing(false)}
      />
    );
  }

  const healthConditionLabels = {
    asthma: 'Asthma',
    copd: 'COPD',
    heart_disease: 'Heart Disease',
    pregnancy: 'Pregnancy',
    none: 'None',
  };

  const sensitivityLabels = {
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
    very_high: 'Very High',
  };

  const outdoorTimeLabels = {
    low: 'Low (< 1 hour)',
    moderate: 'Moderate (1-3 hours)',
    high: 'High (> 3 hours)',
  };

  const ageGroupLabels = {
    child: 'Child (Under 18)',
    adult: 'Adult (18-64)',
    senior: 'Senior (65+)',
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Your Profile</h3>
            <p className="text-xs text-gray-500">{getProfileSummary(profile)}</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Age Group:</span>
          <span className="ml-2 font-semibold text-gray-800">
            {ageGroupLabels[profile.ageGroup] || 'Not set'}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Sensitivity:</span>
          <span className="ml-2 font-semibold text-gray-800">
            {sensitivityLabels[profile.sensitivity] || 'Moderate'}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Outdoor Time:</span>
          <span className="ml-2 font-semibold text-gray-800">
            {outdoorTimeLabels[profile.outdoorTime] || 'Moderate'}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Health Conditions:</span>
          <span className="ml-2 font-semibold text-gray-800">
            {profile.healthConditions?.filter(c => c !== 'none').map(c => healthConditionLabels[c]).join(', ') || 'None'}
          </span>
        </div>
      </div>

      {profile.lastUpdated && (
        <p className="text-xs text-gray-400 mt-4">
          Last updated: {new Date(profile.lastUpdated).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

