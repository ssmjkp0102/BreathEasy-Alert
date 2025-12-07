import { Share2, Download } from 'lucide-react';
import { getAQICategory } from '../services/openaq';

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

export default function ShareableCard({ aqiData, alert }) {
  const category = getAQICategory(aqiData.aqi);

  const handleShare = async () => {
    const shareData = {
      title: 'BreatheEasy Alert - Air Quality Warning',
      text: `Air Quality Alert: ${aqiData.aqi} AQI (${category.level}) at ${aqiData.location}. ${alert?.alert || ''}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const text = `🚨 Air Quality Alert 🚨\n\nAQI: ${aqiData.aqi} (${category.level})\nLocation: ${aqiData.location}\n\n${alert?.alert || ''}\n\n${alert?.actions?.slice(0, 3).map(a => `• ${a}`).join('\n') || ''}\n\nStay safe! Check air quality at: ${window.location.href}`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert('Alert copied to clipboard!');
    });
  };

  const downloadCard = () => {
    // Create a canvas or use html2canvas library for better image generation
    // For now, we'll create a simple text file
    const content = `BreatheEasy Alert\n\nAir Quality Index: ${aqiData.aqi}\nCategory: ${category.level}\nLocation: ${aqiData.location}\n\n${alert?.alert || ''}\n\nActions:\n${alert?.actions?.map(a => `- ${a}`).join('\n') || ''}\n\nGenerated: ${new Date().toLocaleString()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `breathe-easy-alert-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Share Warning</h3>
      
      <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-600">AQI: {aqiData.aqi}</span>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${getBadgeColorClasses(category.color)}`}>
            {category.level}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{aqiData.location}</p>
        {alert?.alert && (
          <p className="text-sm text-gray-700 mt-2">{alert.alert}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          <Share2 className="w-5 h-5" />
          Share Alert
        </button>
        <button
          onClick={downloadCard}
          className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

