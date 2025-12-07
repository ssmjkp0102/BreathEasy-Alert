import { useState } from 'react';
import { User, Save, X } from 'lucide-react';
import { saveProfile, getDefaultProfile } from '../services/profile';

export default function ProfileSetup({ onComplete, onSkip }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(getDefaultProfile());
  const [errors, setErrors] = useState({});

  const healthConditions = [
    { id: 'asthma', label: 'Asthma', description: 'Respiratory condition' },
    { id: 'copd', label: 'COPD', description: 'Chronic obstructive pulmonary disease' },
    { id: 'heart_disease', label: 'Heart Disease', description: 'Cardiovascular conditions' },
    { id: 'pregnancy', label: 'Pregnancy', description: 'Expecting mother' },
    { id: 'none', label: 'None', description: 'No specific health conditions' },
  ];

  const validateStep = (stepNum) => {
    const newErrors = {};
    
    if (stepNum === 1) {
      if (!profile.ageGroup) {
        newErrors.ageGroup = 'Please select your age group';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleSave();
      }
    }
  };

  const handleSave = () => {
    if (saveProfile(profile)) {
      onComplete(profile);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Build Your Profile</h2>
              <p className="text-sm text-gray-600">Help us personalize your air quality alerts</p>
            </div>
          </div>
          {onSkip && (
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of 3</span>
            <span className="text-sm text-gray-500">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Age Group */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What's your age group?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'child', label: 'Child', age: 'Under 18', icon: '👶' },
                { id: 'adult', label: 'Adult', age: '18-64 years', icon: '👤' },
                { id: 'senior', label: 'Senior', age: '65+ years', icon: '👴' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setProfile({ ...profile, ageGroup: option.id })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    profile.ageGroup === option.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{option.icon}</div>
                  <div className="font-semibold text-gray-800">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.age}</div>
                </button>
              ))}
            </div>
            {errors.ageGroup && (
              <p className="text-red-600 text-sm mt-2">{errors.ageGroup}</p>
            )}
          </div>
        )}

        {/* Step 2: Health Conditions */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Do you have any health conditions?</h3>
            <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
            <div className="space-y-3">
              {healthConditions.map((condition) => (
                <label
                  key={condition.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    profile.healthConditions?.includes(condition.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={profile.healthConditions?.includes(condition.id) || false}
                    onChange={(e) => {
                      const current = profile.healthConditions || [];
                      if (e.target.checked) {
                        if (condition.id === 'none') {
                          setProfile({ ...profile, healthConditions: ['none'] });
                        } else {
                          setProfile({
                            ...profile,
                            healthConditions: current.filter(c => c !== 'none').concat(condition.id),
                          });
                        }
                      } else {
                        setProfile({
                          ...profile,
                          healthConditions: current.filter(c => c !== condition.id),
                        });
                      }
                    }}
                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{condition.label}</div>
                    <div className="text-sm text-gray-600">{condition.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Sensitivity & Activity */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">How sensitive are you to air pollution?</h3>
              <div className="space-y-3">
                {[
                  { id: 'low', label: 'Low', desc: 'Rarely affected' },
                  { id: 'moderate', label: 'Moderate', desc: 'Sometimes affected' },
                  { id: 'high', label: 'High', desc: 'Often affected' },
                  { id: 'very_high', label: 'Very High', desc: 'Always affected' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setProfile({ ...profile, sensitivity: option.id })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      profile.sensitivity === option.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">How much time do you spend outdoors daily?</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'low', label: 'Low', desc: '< 1 hour' },
                  { id: 'moderate', label: 'Moderate', desc: '1-3 hours' },
                  { id: 'high', label: 'High', desc: '> 3 hours' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setProfile({ ...profile, outdoorTime: option.id })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      profile.outdoorTime === option.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-800 text-sm">{option.label}</div>
                    <div className="text-xs text-gray-600">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition-colors"
          >
            {step === 3 ? (
              <>
                <Save className="w-4 h-4" />
                Save Profile
              </>
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

