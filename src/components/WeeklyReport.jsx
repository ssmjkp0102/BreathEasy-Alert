import { useState, useEffect } from 'react';
import { FileText, RefreshCw, Loader2 } from 'lucide-react';
import { generateWeeklyReport } from '../services/weeklyReport';

export default function WeeklyReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReport = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const weeklyReport = await generateWeeklyReport(forceRefresh);
      setReport(weeklyReport);
    } catch (error) {
      console.error('Error loading weekly report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin mr-2" />
          <span className="text-gray-600 dark:text-gray-300">Generating weekly report...</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Health-Aware Weekly Report</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Generated {new Date(report.generatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => loadReport(true)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">This Week's Risk</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{report.riskExplanation}</p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Top 5 Personalized Actions</h4>
          <ul className="space-y-2">
            {report.actions.map((action, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">{index + 1}.</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">What Changed vs Last Week?</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{report.weekComparison}</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Long-Term Trend</h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{report.trendInterpretation}</p>
        </div>
      </div>
    </div>
  );
}

