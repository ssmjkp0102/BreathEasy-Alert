import { AlertTriangle, Clock } from 'lucide-react';

export default function AlertCard({ alert, actions, timeEstimate, aqi, isPersonalized }) {
  if (!alert) return null;

  const isHighRisk = aqi > 150;

  return (
    <div className={`bg-gradient-to-br ${
      isHighRisk 
        ? 'from-red-50 to-orange-50 border-red-200' 
        : 'from-yellow-50 to-orange-50 border-yellow-200'
    } rounded-2xl shadow-xl p-6 mb-6 border-2`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${
          isHighRisk ? 'bg-red-100' : 'bg-yellow-100'
        }`}>
          <AlertTriangle className={`w-6 h-6 ${
            isHighRisk ? 'text-red-600' : 'text-yellow-600'
          }`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-800">Personalized Alert</h3>
            {isPersonalized && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                ✨ Tailored for You
              </span>
            )}
          </div>
          <p className="text-gray-700 mb-4 leading-relaxed">{alert}</p>
          
          {actions && actions.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">Recommended Actions:</h4>
              <ul className="space-y-2">
                {actions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {timeEstimate && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-4 pt-4 border-t border-gray-200">
              <Clock className="w-4 h-4" />
              <span>{timeEstimate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

