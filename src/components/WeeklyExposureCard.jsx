import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { calculateWeeklyExposure, calculateTimeInBadAir } from '../services/weeklyExposure';

export default function WeeklyExposureCard() {
  const weekly = calculateWeeklyExposure();
  const badAir = calculateTimeInBadAir();

  const riskColors = {
    low: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    very_high: 'bg-red-100 text-red-800 border-red-300',
  };

  const riskIcons = {
    low: CheckCircle,
    medium: AlertCircle,
    high: AlertCircle,
    very_high: AlertCircle,
  };

  const Icon = riskIcons[weekly.riskLevel] || AlertCircle;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Weekly Exposure Score</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${riskColors[weekly.riskLevel] || riskColors.medium}`}>
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {weekly.riskLevel.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="text-sm text-gray-600 mb-1">Personal Exposure Index</div>
          <div className="text-2xl font-bold text-gray-800">{weekly.exposureIndex}</div>
          <div className="text-xs text-gray-500 mt-1">Weighted AQI × time</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="text-sm text-gray-600 mb-1">Average AQI</div>
          <div className="text-2xl font-bold text-gray-800">{weekly.averageAQI}</div>
          <div className="text-xs text-gray-500 mt-1">Last 7 days</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="text-sm text-gray-600 mb-1">Bad Air Days</div>
          <div className="text-2xl font-bold text-gray-800">{weekly.daysOver100}</div>
          <div className="text-xs text-gray-500 mt-1">Days with AQI &gt; 100</div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
          <div>
            <div className="font-semibold text-gray-800 mb-1">Risk Assessment</div>
            <p className="text-sm text-gray-700">{weekly.riskExplanation}</p>
          </div>
        </div>
      </div>

      {badAir.minutesOver100 > 0 && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Time in Unhealthy Air</div>
              <div className="text-xl font-bold text-gray-800">
                ~{badAir.hoursOver100} hours
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {badAir.minutesOver150 > 0 && `${badAir.hoursOver150} hours at AQI > 150`}
              </div>
            </div>
            {badAir.changePercent !== 0 && (
              <div className={`flex items-center gap-1 ${badAir.isImproving ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`w-5 h-5 ${badAir.isImproving ? 'rotate-180' : ''}`} />
                <div className="text-sm font-semibold">
                  {badAir.isImproving ? '↓' : '↑'} {Math.abs(badAir.changePercent)}%
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {badAir.isImproving 
              ? 'Great improvement from last week!'
              : 'Consider reducing outdoor time during high AQI periods.'}
          </p>
        </div>
      )}
    </div>
  );
}

