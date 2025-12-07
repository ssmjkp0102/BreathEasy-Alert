import { useState } from 'react';
import { Clock, Calendar, Download } from 'lucide-react';
import { getRoutine, saveRoutine, analyzeBestHours, downloadCalendar } from '../services/routine';

export default function RoutineSuggestions() {
  const [routine, setRoutine] = useState(getRoutine());
  const [editing, setEditing] = useState(false);
  const bestHours = analyzeBestHours();

  const handleSave = () => {
    if (saveRoutine(routine)) {
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Routine</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Morning Activity</label>
            <select
              value={routine.morningActivity || ''}
              onChange={(e) => setRoutine({ ...routine, morningActivity: e.target.value || null })}
              className="w-full p-3 border border-gray-300 rounded-xl"
            >
              <option value="">None</option>
              <option value="run">Running</option>
              <option value="walk">Walking</option>
              <option value="commute">Commute</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Evening Activity</label>
            <select
              value={routine.eveningActivity || ''}
              onChange={(e) => setRoutine({ ...routine, eveningActivity: e.target.value || null })}
              className="w-full p-3 border border-gray-300 rounded-xl"
            >
              <option value="">None</option>
              <option value="run">Running</option>
              <option value="walk">Walking</option>
              <option value="commute">Commute</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Commute Window</label>
            <select
              value={routine.commuteWindow || ''}
              onChange={(e) => setRoutine({ ...routine, commuteWindow: e.target.value || null })}
              className="w-full p-3 border border-gray-300 rounded-xl"
            >
              <option value="">None</option>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
              <option value="both">Both</option>
            </select>
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
                setRoutine(getRoutine());
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
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Smart Routine Suggestions</h3>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {routine.morningActivity || routine.eveningActivity ? 'Edit' : 'Set Routine'}
        </button>
      </div>

      {bestHours.bestHours.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="font-semibold text-gray-800 mb-2">Best Hours of the Day</div>
            <div className="flex flex-wrap gap-2">
              {bestHours.bestHours.map((hour, index) => (
                <div
                  key={index}
                  className="bg-white px-3 py-2 rounded-lg border border-green-300 font-semibold text-green-700"
                >
                  {hour}:00
                </div>
              ))}
            </div>
          </div>

          {bestHours.recommendations.length > 0 && (
            <div className="space-y-2">
              {bestHours.recommendations.map((rec, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => downloadCalendar('Clean Air Time', bestHours.bestHours[0], 2)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl text-sm"
            >
              <Download className="w-4 h-4" />
              Download .ics
            </button>
            <button
              onClick={() => {
                const text = `Best clean air times: ${bestHours.bestHours.map(h => `${h}:00`).join(', ')}`;
                navigator.clipboard.writeText(text);
                alert('Copied to clipboard!');
              }}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-xl text-sm"
            >
              <Calendar className="w-4 h-4" />
              Copy Times
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-gray-600">
          <p>Set your routine and check air quality more to get personalized time suggestions</p>
        </div>
      )}
    </div>
  );
}

