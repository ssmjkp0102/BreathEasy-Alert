import { getAQICategory } from '../services/openaq';

const getColorClasses = (color) => {
  const colorMap = {
    'aqi-good': 'bg-green-100 border-green-500',
    'aqi-moderate': 'bg-yellow-100 border-yellow-500',
    'aqi-unhealthy-sensitive': 'bg-orange-100 border-orange-500',
    'aqi-unhealthy': 'bg-red-100 border-red-500',
    'aqi-very-unhealthy': 'bg-purple-100 border-purple-500',
    'aqi-hazardous': 'bg-red-200 border-red-700',
  };
  return colorMap[color] || 'bg-gray-100 border-gray-500';
};

const getBadgeColorClasses = (color) => {
  const colorMap = {
    'aqi-good': 'bg-green-100 text-green-800',
    'aqi-moderate': 'bg-yellow-100 text-yellow-800',
    'aqi-unhealthy-sensitive': 'bg-orange-100 text-orange-800',
    'aqi-unhealthy': 'bg-red-100 text-red-800',
    'aqi-very-unhealthy': 'bg-purple-100 text-purple-800',
    'aqi-hazardous': 'bg-red-200 text-red-900',
  };
  return colorMap[color] || 'bg-gray-100 text-gray-800';
};

export default function AQIDisplay({ aqi, location, aqiData }) {
  if (!aqi) return null;

  const category = getAQICategory(aqi);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Current Air Quality</h2>
          <p className="text-gray-600 text-sm mt-1">{location || 'Your Location'}</p>
        </div>
        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${getColorClasses(category.color)} border-4`}>
          <span className="text-3xl font-bold text-gray-800">{aqi}</span>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBadgeColorClasses(category.color)}`}>
            {category.level}
          </span>
          {aqiData?.isEstimated && (
            <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
              Estimated
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm">{category.description}</p>
        {aqiData?.isEstimated && (
          <p className="text-xs text-yellow-600 mt-2">
            ⚠️ No nearby monitoring station found. Displaying estimated values.
          </p>
        )}
      </div>

      {/* AQI Scale */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">AQI Scale</p>
        <div className="flex gap-1 h-3 rounded-full overflow-hidden">
          <div className="flex-1 bg-aqi-good"></div>
          <div className="flex-1 bg-aqi-moderate"></div>
          <div className="flex-1 bg-aqi-unhealthy-sensitive"></div>
          <div className="flex-1 bg-aqi-unhealthy"></div>
          <div className="flex-1 bg-aqi-very-unhealthy"></div>
          <div className="flex-1 bg-aqi-hazardous"></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span>50</span>
          <span>100</span>
          <span>150</span>
          <span>200</span>
          <span>300</span>
          <span>500</span>
        </div>
      </div>
    </div>
  );
}

