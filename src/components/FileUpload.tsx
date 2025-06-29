import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, ExternalLink, MousePointer, Download as DownloadIcon, Search, Calendar, Globe } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSelectFile(file);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSelectFile(file);
    }
  }, []);

  const validateAndSelectFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file exported from Google Trends.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB.');
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleChange}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            {isProcessing ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isProcessing ? 'Processing your file...' : 'Upload Google Trends CSV'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your CSV file here, or click to browse
            </p>
            
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm mb-4"
            >
              <FileText className="h-4 w-4" />
              <span>{showInstructions ? 'Hide' : 'Show'} step-by-step instructions</span>
            </button>
          </div>
        </div>
      </div>

      {showInstructions && (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <FileText className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-bold text-gray-900">How to Export Your Google Trends Data</h3>
          </div>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-primary-600" />
                  <span>Go to Google Trends</span>
                </h4>
                <p className="text-gray-700 mb-3">
                  Visit <a href="https://trends.google.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline inline-flex items-center space-x-1">
                    <span>trends.google.com</span>
                    <ExternalLink className="h-3 w-3" />
                  </a> in your web browser
                </p>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="text-sm text-gray-600">
                    💡 <strong>Tip:</strong> Make sure you're on the main Google Trends homepage, not a specific trend page
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <Search className="h-4 w-4 text-primary-600" />
                  <span>Enter Your Search Term</span>
                </h4>
                <p className="text-gray-700 mb-3">
                  In the search box at the top, type your keyword or topic (e.g., "coffee", "fitness", "tax software")
                </p>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Examples:</strong> "yoga classes", "christmas gifts", "tax preparation", "summer vacation"
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary-600" />
                  <span>Select Time Range</span>
                </h4>
                <p className="text-gray-700 mb-3">
                  Click on the time dropdown (usually shows "Past 12 months") and select your desired time period
                </p>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Recommended:</strong> Select "2004-present" or "Past 5 years" for the best seasonal analysis with more data points
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-primary-600" />
                  <span>Choose Location (Optional)</span>
                </h4>
                <p className="text-gray-700 mb-3">
                  You can filter by country/region by clicking on "Worldwide" and selecting your target location
                </p>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Worldwide data often provides the most comprehensive seasonal patterns
                  </p>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-success-100 text-success-700 rounded-full flex items-center justify-center font-bold text-sm">
                5
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <DownloadIcon className="h-4 w-4 text-success-600" />
                  <span>Download the CSV File</span>
                </h4>
                <p className="text-gray-700 mb-3">
                  Look for the download button (↓) in the top-right corner of the interest over time graph and click it
                </p>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Make sure you're downloading from the main "Interest over time" chart, not from related topics or queries
                  </p>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-success-100 text-success-700 rounded-full flex items-center justify-center font-bold text-sm">
                6
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <Upload className="h-4 w-4 text-success-600" />
                  <span>Upload Here</span>
                </h4>
                <p className="text-gray-700 mb-3">
                  Once downloaded, drag and drop the CSV file into the upload area above, or click to browse and select it
                </p>
                <div className="bg-primary-50 p-3 rounded-lg border border-primary-200">
                  <p className="text-sm text-primary-800">
                    <strong>File format:</strong> The file should be named something like "multiTimeline.csv" and contain date and interest data
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-900 mb-3">Troubleshooting Tips</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-error-500 mt-1">•</span>
                <span><strong>Can't find download button?</strong> Make sure you're looking at the main "Interest over time" graph, not other sections</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-error-500 mt-1">•</span>
                <span><strong>File won't upload?</strong> Ensure the file ends with .csv and is from Google Trends (not manually created)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-error-500 mt-1">•</span>
                <span><strong>No seasonal patterns?</strong> Try using a longer time range (2+ years) for better seasonal analysis</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-error-500 mt-1">•</span>
                <span><strong>Error processing file?</strong> The CSV might be corrupted - try downloading it again from Google Trends</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-error-600" />
            <p className="text-error-800 font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};