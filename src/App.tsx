import { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { QuarterlySeasonalityChart } from './components/charts/QuarterlySeasonalityChart';
import { MonthlyChart } from './components/charts/MonthlyChart';
import { YearlyChart } from './components/charts/YearlyChart';
import { InsightsPanel } from './components/InsightsPanel';
import { parseCSVFile, analyzeSeasonality } from './utils/dataProcessor';
import { AnalysisResult } from './types';
import { AlertCircle, Download, RefreshCw, Mail, ExternalLink } from 'lucide-react';

function App() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const { data, keyword, country } = await parseCSVFile(file);
      const result = analyzeSeasonality(data, keyword, country);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file');
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
  };

  const exportData = () => {
    if (!analysis) return;
    
    const exportData = {
      keyword: analysis.keyword,
      dateRange: analysis.dateRange,
      insights: analysis.insights,
      monthlyData: analysis.seasonality.monthly,
      quarterlyData: analysis.seasonality.quarterly,
      yearlyData: analysis.seasonality.yearly
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.keyword}-seasonality-analysis.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysis ? (
          <div className="space-y-8">
            <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            
            {error && (
              <div className="max-w-2xl mx-auto p-4 bg-error-50 border border-error-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-error-600" />
                  <div>
                    <p className="text-error-800 font-medium">Processing Error</p>
                    <p className="text-error-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Demo Section */}
            <div className="max-w-4xl mx-auto mt-12">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Use This Tool?</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">The Problem with Standard Google Trends</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start space-x-2">
                        <span className="text-error-500 mt-1">•</span>
                        <span>Hard to detect seasonal patterns in the standard line graph</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-error-500 mt-1">•</span>
                        <span>No clear quarterly business cycle analysis</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-error-500 mt-1">•</span>
                        <span>Difficult to identify peak marketing opportunities</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-error-500 mt-1">•</span>
                        <span>No actionable business insights for strategic planning</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">What You'll Get</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start space-x-2">
                        <span className="text-success-500 mt-1">•</span>
                        <span>Quarterly business cycle analysis with clear patterns</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-success-500 mt-1">•</span>
                        <span>Monthly seasonality patterns for campaign timing</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-success-500 mt-1">•</span>
                        <span>Year-over-year trend analysis for market insights</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-success-500 mt-1">•</span>
                        <span>Clean data visualizations that reveal hidden patterns</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-8 text-center">
                <div className="flex justify-center mb-4">
                  <Mail className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Have Questions?</h3>
                <p className="text-gray-700 mb-4">
                  Need help with your analysis or have suggestions for improvements?
                </p>
                <a
                  href="mailto:yaguneetsidhu@gmail.com"
                  className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>Contact Me</span>
                </a>
                <p className="text-sm text-gray-600 mt-3">
                  yaguneetsidhu@gmail.com
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Analysis Results for "{analysis.keyword}"
                </h2>
                <p className="text-gray-600 mt-1">
                  {analysis.totalDataPoints} data points analyzed
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={exportData}
                  className="flex items-center space-x-2 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Data</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>New Analysis</span>
                </button>
              </div>
            </div>

            {/* Insights Panel */}
            <InsightsPanel analysis={analysis} />

            {/* Quarterly Seasonality Chart - Full Width */}
            <QuarterlySeasonalityChart 
              data={analysis.seasonality.quarterly} 
              keyword={analysis.keyword} 
            />

            {/* Monthly Chart - Full Width */}
            <div className="w-full">
              <MonthlyChart 
                data={analysis.seasonality.monthly} 
                keyword={analysis.keyword} 
              />
            </div>
            
            {/* Yearly Chart - Full Width */}
            <div className="w-full">
              <YearlyChart 
                data={analysis.seasonality.yearly} 
                keyword={analysis.keyword} 
              />
            </div>

            {/* Contact Section for Results Page */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Questions About Your Analysis?</h3>
                <p className="text-gray-700 mb-3">
                  Need help interpreting your results or want to discuss your findings?
                </p>
                <a
                  href="mailto:yaguneetsidhu@gmail.com"
                  className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
                >
                  <Mail className="h-4 w-4" />
                  <span>Get in Touch</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <p className="text-sm">
              Built to help marketers and analysts discover hidden seasonal patterns in Google Trends data.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
              <a
                href="mailto:yaguneetsidhu@gmail.com"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>yaguneetsidhu@gmail.com</span>
              </a>
              <a
                href="https://nitusidhu.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Visit nitusidhu.com</span>
              </a>
            </div>
            <p className="text-xs text-gray-400">
              Upload your Google Trends CSV files to get started with advanced seasonality analysis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;