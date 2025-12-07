import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getLongTermTrend } from '../services/weeklyExposure';
import { generateTrajectoryInterpretation } from '../services/trajectoryAnalysis';
import SampleDataButton from './SampleDataButton';

export default function RiskTrajectory({ onDataLoaded }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [trend, setTrend] = useState(() => getLongTermTrend());

  // Update trend when refreshKey changes
  useEffect(() => {
    const currentTrend = getLongTermTrend();
    setTrend(currentTrend);
  }, [refreshKey]);

  // Listen for custom event when sample data is loaded
  useEffect(() => {
    const handleDataLoaded = () => {
      console.log('RiskTrajectory: sampleDataLoaded event received');
      // Small delay to ensure localStorage is updated
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 100);
    };
    window.addEventListener('sampleDataLoaded', handleDataLoaded);
    return () => window.removeEventListener('sampleDataLoaded', handleDataLoaded);
  }, []);

  // Also poll for changes periodically and when refreshKey changes
  useEffect(() => {
    const updateTrend = () => {
      const currentTrend = getLongTermTrend();
      if (currentTrend.length !== trend.length || JSON.stringify(currentTrend) !== JSON.stringify(trend)) {
        console.log('RiskTrajectory: Trend changed, updating');
        setTrend(currentTrend);
      }
    };

    // Update immediately
    updateTrend();

    // Poll for changes
    const interval = setInterval(updateTrend, 500);

    return () => clearInterval(interval);
  }, [refreshKey, trend.length]);

  // Show demo visualization when no data
  if (trend.length < 2) {
    // Generate demo data for visualization
    const demoWeeks = [
      { week: 1, averageAQI: 65, exposureIndex: 78 },
      { week: 2, averageAQI: 72, exposureIndex: 85 },
      { week: 3, averageAQI: 88, exposureIndex: 95 },
      { week: 4, averageAQI: 95, exposureIndex: 105 },
    ];
    const demoMaxAQI = 120;
    const demoDirection = 'worsening';
    const DemoIcon = TrendingUp;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Risk Trajectory</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-red-600">
              <DemoIcon className="w-5 h-5" />
              <span className="text-sm font-semibold">Getting Riskier</span>
            </div>
            {onDataLoaded && (
              <SampleDataButton onDataLoaded={onDataLoaded} />
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Demo bar chart */}
          <div className="flex items-end gap-2 h-32">
            {demoWeeks.map((week, index) => {
              const height = (week.averageAQI / demoMaxAQI) * 100;
              const color = week.averageAQI <= 50 ? 'bg-green-500' :
                           week.averageAQI <= 100 ? 'bg-yellow-500' :
                           week.averageAQI <= 150 ? 'bg-orange-500' :
                           'bg-red-500';
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full ${color} rounded-t transition-all opacity-60`}
                    style={{ height: `${height}%` }}
                    title={`Week ${week.week}: AQI ${week.averageAQI} (Demo)`}
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">W{week.week}</div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-500">{week.averageAQI}</div>
                </div>
              );
            })}
          </div>

          {/* Demo week details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 opacity-60">
            {demoWeeks.map((week, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">Week {week.week}</div>
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">AQI {week.averageAQI}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">Exp: {week.exposureIndex}</div>
              </div>
            ))}
          </div>

          {/* Demo interpretation */}
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800 opacity-60">
            <div className="font-semibold text-gray-700 dark:text-gray-400 mb-1">Long-Term Risk Interpretation (Demo)</div>
            <p className="text-sm text-gray-600 dark:text-gray-500 leading-relaxed">
              This is a demo visualization. Load sample data to see your actual risk trajectory based on real air quality readings.
            </p>
          </div>

          {/* Call to action */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Load sample data to see your personalized risk trajectory
            </p>
            {onDataLoaded && (
              <SampleDataButton onDataLoaded={onDataLoaded} />
            )}
          </div>
        </div>
      </div>
    );
  }

  const getTrendDirection = () => {
    if (trend.length < 2) return 'stable';
    const recent = trend[trend.length - 1];
    const previous = trend[trend.length - 2];
    const change = recent.averageAQI - previous.averageAQI;
    
    if (Math.abs(change) < 10) return 'stable';
    return change > 0 ? 'worsening' : 'improving';
  };

  const direction = getTrendDirection();
  const trendIcons = {
    improving: TrendingDown,
    worsening: TrendingUp,
    stable: Minus,
  };
  const trendColors = {
    improving: 'text-green-600',
    worsening: 'text-red-600',
    stable: 'text-gray-600',
  };
  const trendLabels = {
    improving: 'Getting Safer',
    worsening: 'Getting Riskier',
    stable: 'Stable',
  };

  const Icon = trendIcons[direction];
  const maxAQI = Math.max(...trend.map(t => t.averageAQI), 200);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">4-Week Risk Trajectory</h3>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 ${trendColors[direction]}`}>
            <Icon className="w-5 h-5" />
            <span className="text-sm font-semibold">{trendLabels[direction]}</span>
          </div>
          {onDataLoaded && (
            <SampleDataButton onDataLoaded={onDataLoaded} />
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Simple bar chart */}
        <div className="flex items-end gap-2 h-32">
          {trend.map((week, index) => {
            const height = (week.averageAQI / maxAQI) * 100;
            const color = week.averageAQI <= 50 ? 'bg-green-500' :
                         week.averageAQI <= 100 ? 'bg-yellow-500' :
                         week.averageAQI <= 150 ? 'bg-orange-500' :
                         'bg-red-500';
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-full ${color} rounded-t transition-all hover:opacity-80`}
                  style={{ height: `${height}%` }}
                  title={`Week ${week.week}: AQI ${week.averageAQI}`}
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">W{week.week}</div>
                <div className="text-xs font-semibold text-gray-800 dark:text-white">{week.averageAQI}</div>
              </div>
            );
          })}
        </div>

        {/* Week details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {trend.map((week, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400">Week {week.week}</div>
              <div className="text-sm font-semibold text-gray-800 dark:text-white">AQI {week.averageAQI}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Exp: {week.exposureIndex}</div>
            </div>
          ))}
        </div>

        {/* Interpretation */}
        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <div className="font-semibold text-gray-800 dark:text-white mb-1">Long-Term Risk Interpretation</div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {generateTrajectoryInterpretation(trend)}
          </p>
        </div>
      </div>
    </div>
  );
}

