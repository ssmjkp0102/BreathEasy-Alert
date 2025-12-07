import { AlertCircle, Info } from 'lucide-react';
import { getDominantPollutant } from '../services/weeklyExposure';

export default function PollutantInsights() {
  const pollutantData = getDominantPollutant();

  const pollutantColors = {
    'PM2.5': 'bg-red-100 text-red-800 border-red-300',
    'PM10': 'bg-orange-100 text-orange-800 border-orange-300',
    'NO2': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'O3': 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const pollutantAdvice = {
    'PM2.5': 'Close windows, use air purifiers with HEPA filters, and avoid outdoor exercise during high PM2.5 periods.',
    'PM10': 'Avoid dusty areas, construction sites, and keep windows closed during high PM10 periods.',
    'NO2': 'Avoid main roads and traffic-heavy areas, especially during rush hours. Use alternative routes when possible.',
    'O3': 'Limit outdoor activities during afternoon hours when ozone is typically highest. Exercise in the morning instead.',
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-orange-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Pollutant-Specific Insights</h3>
      </div>

      <div className="space-y-4">
        <div className={`rounded-xl p-4 border-2 ${pollutantColors[pollutantData.dominant] || pollutantColors['PM2.5']}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Dominant Pollutant This Week</span>
            <span className="text-2xl font-bold">{pollutantData.dominant}</span>
          </div>
          <p className="text-sm mt-2 opacity-90">{pollutantData.pollutants.find(p => p.name === pollutantData.dominant)?.description}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-start gap-2 mb-2">
            <Info className="w-5 h-5 text-gray-600 mt-0.5" />
            <div>
              <div className="font-semibold text-gray-800 mb-1">Health Impact</div>
              <p className="text-sm text-gray-700 leading-relaxed">{pollutantData.healthImpact}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="font-semibold text-gray-800 mb-1">Personalized Advice</div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {pollutantAdvice[pollutantData.dominant] || pollutantAdvice['PM2.5']}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {pollutantData.pollutants.map((pollutant) => (
            <div
              key={pollutant.name}
              className={`p-3 rounded-lg border text-center ${
                pollutant.name === pollutantData.dominant
                  ? pollutantColors[pollutant.name] || 'bg-gray-100'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="text-xs font-medium">{pollutant.name}</div>
              <div className="text-sm mt-1">{pollutant.count} readings</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

