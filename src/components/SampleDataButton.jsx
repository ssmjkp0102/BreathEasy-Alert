import { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle } from 'lucide-react';
import { loadSampleData, clearSampleData } from '../services/sampleData';

export default function SampleDataButton({ onDataLoaded }) {
  const [status, setStatus] = useState(null);
  const [hasData, setHasData] = useState(() => {
    try {
      const history = localStorage.getItem('breatheEasy_history');
      return history && JSON.parse(history).length > 0;
    } catch {
      return false;
    }
  });

  // Update hasData when status changes or component mounts
  useEffect(() => {
    const checkData = () => {
      try {
        const history = localStorage.getItem('breatheEasy_history');
        const hasHistory = history && JSON.parse(history).length > 0;
        setHasData(hasHistory);
      } catch {
        setHasData(false);
      }
    };

    // Check immediately and after status changes
    checkData();
    if (status) {
      const timeout = setTimeout(checkData, 500);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  const handleLoadSample = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const result = loadSampleData();
      console.log('Sample data load result:', result);
      setStatus(result);
      
      if (result.success) {
        // Force state update
        setHasData(true);
        
        // Wait a moment for localStorage to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Call callback to update parent component
        if (onDataLoaded) {
          console.log('Calling onDataLoaded callback');
          onDataLoaded();
        }
        
        // Clear status after showing success message
        setTimeout(() => setStatus(null), 3000);
      } else {
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (error) {
      console.error('Error in handleLoadSample:', error);
      setStatus({
        success: false,
        message: `Error: ${error.message}`,
      });
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleClear = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const result = clearSampleData();
      console.log('Sample data clear result:', result);
      setStatus(result);
      
      if (result.success) {
        // Force state update
        setHasData(false);
        
        // Wait a moment for localStorage to be cleared
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Call callback to update parent component
        if (onDataLoaded) {
          console.log('Calling onDataLoaded callback after clear');
          onDataLoaded();
        }
        
        // Clear status after showing success message
        setTimeout(() => setStatus(null), 3000);
      } else {
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (error) {
      console.error('Error in handleClear:', error);
      setStatus({
        success: false,
        message: `Error: ${error.message}`,
      });
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {status && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
          status.success 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
        }`}>
          {status.success ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span>{status.message}</span>
        </div>
      )}
      
      {!hasData ? (
        <button
          onClick={handleLoadSample}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors shadow-md"
        >
          <Database className="w-4 h-4" />
          Load Sample Data
        </button>
      ) : (
        <button
          onClick={handleClear}
          className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-xl transition-colors"
        >
          <XCircle className="w-4 h-4" />
          Clear Sample Data
        </button>
      )}
    </div>
  );
}

