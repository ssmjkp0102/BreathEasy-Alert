import { TrendingUp, Shield, Activity } from 'lucide-react';
import { getMetrics } from '../services/storage';

export default function Metrics() {
  const metrics = getMetrics();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Your Impact</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{metrics.totalChecks}</p>
              <p className="text-xs text-gray-600">Total Checks</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{metrics.badExposuresAvoided}</p>
              <p className="text-xs text-gray-600">Bad Exposures Avoided</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-800">{metrics.averageAQI || 'N/A'}</p>
              <p className="text-xs text-gray-600">Average AQI</p>
            </div>
          </div>
        </div>
      </div>

      {metrics.badExposuresAvoided > 0 && (
        <div className="mt-4 p-4 bg-green-100 rounded-xl border border-green-300">
          <p className="text-sm text-green-800 font-semibold">
            🎉 You've avoided {metrics.badExposuresAvoided} bad air quality exposure{metrics.badExposuresAvoided !== 1 ? 's' : ''} today!
          </p>
        </div>
      )}
    </div>
  );
}

