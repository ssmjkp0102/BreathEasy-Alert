import { useState } from 'react';
import { Target, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { getGoals, saveGoals, checkGoalProgress } from '../services/goals';
import { generateGoalCoaching } from '../services/goalCoaching';

export default function GoalTracker() {
  const [goals, setGoals] = useState(getGoals());
  const [editing, setEditing] = useState(false);
  const [coaching, setCoaching] = useState(null);
  const progress = checkGoalProgress();

  const handleSave = () => {
    if (saveGoals(goals)) {
      setEditing(false);
      // Generate coaching based on new goals
      generateGoalCoaching(goals, progress).then(setCoaching);
    }
  };

  const handleGoalChange = (field, value) => {
    setGoals({ ...goals, [field]: value === '' ? null : value });
  };

  if (editing) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Set Your Goals</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Weekly Exposure Band
            </label>
            <select
              value={goals.weeklyExposureBand || ''}
              onChange={(e) => handleGoalChange('weeklyExposureBand', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No goal</option>
              <option value="low">Low (AQI ≤ 50)</option>
              <option value="medium">Medium (AQI ≤ 100)</option>
              <option value="high">High (AQI ≤ 150)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Bad Air Days Per Week
            </label>
            <input
              type="number"
              min="0"
              max="7"
              value={goals.maxBadAirDays || ''}
              onChange={(e) => handleGoalChange('maxBadAirDays', parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2"
            />
            <p className="text-xs text-gray-500 mt-1">Days with AQI &gt; 100</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Weekly Exposure Index
            </label>
            <input
              type="number"
              min="0"
              value={goals.maxWeeklyExposureIndex || ''}
              onChange={(e) => handleGoalChange('maxWeeklyExposureIndex', parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 100"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Save Goals
            </button>
            <button
              onClick={() => {
                setGoals(getGoals());
                setEditing(false);
              }}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasGoals = goals.weeklyExposureBand || goals.maxBadAirDays !== null || goals.maxWeeklyExposureIndex !== null;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Goal-Based Coaching</h3>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {hasGoals ? 'Edit' : 'Set Goals'}
        </button>
      </div>

      {!hasGoals ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Set goals to get personalized coaching</p>
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl transition-colors"
          >
            Set Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {progress.weeklyExposureBand && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Exposure Band Goal</span>
                {progress.weeklyExposureBand.met ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Target: {progress.weeklyExposureBand.target} | Current: {progress.weeklyExposureBand.current}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress.weeklyExposureBand.progress}%` }}
                />
              </div>
            </div>
          )}

          {progress.maxBadAirDays && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Bad Air Days Goal</span>
                {progress.maxBadAirDays.met ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Target: ≤{progress.maxBadAirDays.target} days | Current: {progress.maxBadAirDays.current} days
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, progress.maxBadAirDays.progress)}%` }}
                />
              </div>
            </div>
          )}

          {progress.allGoalsMet && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-300">
              <div className="flex items-center gap-2 text-green-800 font-semibold">
                <CheckCircle className="w-5 h-5" />
                All goals met this week! 🎉
              </div>
            </div>
          )}

          {coaching && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mt-4">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-semibold text-gray-800 mb-1">Coaching Tip</div>
                  <p className="text-sm text-gray-700">{coaching}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

