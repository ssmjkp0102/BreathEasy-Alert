import { useState } from 'react';
import { Bell, Info } from 'lucide-react';
import { getTriggers, saveTriggers, calculateProfileThreshold, getThresholdExplanation } from '../services/triggerAlerts';

export default function TriggerAlerts({ currentAQI }) {
  const [triggers, setTriggers] = useState(getTriggers());
  const [editing, setEditing] = useState(false);

  const profileThreshold = calculateProfileThreshold();
  const effectiveThreshold = triggers.useProfileBased
    ? profileThreshold
    : (triggers.customThreshold || 100);

  const isTriggered = currentAQI && currentAQI > effectiveThreshold;

  const handleSave = () => {
    if (saveTriggers(triggers)) {
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Trigger-Based Alerts</h3>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={triggers.useProfileBased}
                onChange={(e) => setTriggers({ ...triggers, useProfileBased: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium text-gray-700">Use profile-based threshold</span>
            </label>
            {triggers.useProfileBased && (
              <p className="text-xs text-gray-500 ml-7">
                Recommended: {profileThreshold} AQI (based on your profile)
              </p>
            )}
          </div>

          {!triggers.useProfileBased && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom AQI Threshold
              </label>
              <input
                type="number"
                min="50"
                max="200"
                value={triggers.customThreshold || ''}
                onChange={(e) => setTriggers({ ...triggers, customThreshold: parseInt(e.target.value) || null })}
                className="w-full p-3 border border-gray-300 rounded-xl"
                placeholder="e.g., 80"
              />
              <p className="text-xs text-gray-500 mt-1">Alert when AQI exceeds this value</p>
            </div>
          )}

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={triggers.enabled}
                onChange={(e) => setTriggers({ ...triggers, enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium text-gray-700">Enable trigger alerts</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl"
            >
              Save
            </button>
            <button
              onClick={() => {
                setTriggers(getTriggers());
                setEditing(false);
              }}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl shadow-xl p-6 mb-6 ${
      isTriggered ? 'bg-red-50 border-2 border-red-300' : 'bg-white'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isTriggered ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            <Bell className={`w-5 h-5 ${isTriggered ? 'text-red-600' : 'text-blue-600'}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Trigger-Based Alerts</h3>
            {isTriggered && (
              <p className="text-sm text-red-600 font-semibold">⚠️ Alert Triggered!</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Configure
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Current Threshold</div>
          <div className="text-2xl font-bold text-gray-800">{effectiveThreshold} AQI</div>
          {triggers.useProfileBased && (
            <p className="text-xs text-gray-500 mt-1">Based on your profile</p>
          )}
        </div>

        {currentAQI && (
          <div className={`rounded-xl p-4 border-2 ${
            isTriggered
              ? 'bg-red-100 border-red-300'
              : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Current AQI</div>
                <div className={`text-2xl font-bold ${
                  isTriggered ? 'text-red-800' : 'text-green-800'
                }`}>
                  {currentAQI}
                </div>
              </div>
              {isTriggered ? (
                <div className="text-red-600 font-semibold">⚠️ Above Threshold</div>
              ) : (
                <div className="text-green-600 font-semibold">✓ Below Threshold</div>
              )}
            </div>
          </div>
        )}

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-800 mb-1">Why This Threshold?</div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {getThresholdExplanation()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

