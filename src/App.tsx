import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { OpenAISettings } from './components/OpenAISettings';
import { QuarterlySeasonalityChart } from './components/charts/QuarterlySeasonalityChart';
import { MonthlyChart } from './components/charts/MonthlyChart';
import { YearlyChart } from './components/charts/YearlyChart';
import { InsightsPanel } from './components/InsightsPanel';
import { parseCSVFile, analyzeSeasonality } from './utils/dataProcessor';
import { OpenAIService } from './utils/openaiService';
import { AnalysisResult } from './types';
import { AlertCircle, Download, RefreshCw, Sparkles } from 'lucide-react';

function App() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(false);
  const [isGeneratingAIInsights, setIsGeneratingAIInsights] = useState(false);
  const [openaiService] = useState(new OpenAIService());

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai-api-key');
    if (savedApiKey) {
      setOpenaiApiKey(savedApiKey);
      openaiService.updateApiKey(savedApiKey);
    }
  }, [openaiService]);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (openaiApiKey) {
      localStorage.setItem('openai-api-key', openaiApiKey);
      openaiService.updateApiKey(openaiApiKey);
    } else {
      localStorage.removeItem('openai-api-key');
    }
  }, [openaiApiKey, openaiService]);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const { data, keyword, country } = await parseCSVFile(file);
      let result = analyzeSeasonality(data, keyword, country);
      
      // Generate AI insights if enabled
      if (aiInsightsEnabled && openaiService.isConfigured()) {
        setIsGeneratingAIInsights(true);
        try {
          const aiInsights = await openaiService.generateEnhancedInsights(result);
          result = {
            ...result,
            insights: aiInsights,
            hasAIInsights: true
          };
        } catch (aiError) {
          console.error('AI insights generation failed:', aiError);
          // Continue with regular insights if AI fails
          result = {
            ...result,
            hasAIInsights: false
          };
        } finally {
          setIsGeneratingAIInsights(false);
        }
      }
      
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
      hasAIInsights: analysis.hasAIInsights || false,
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

  const handleApiKeyChange = (key: string) => {
    setOpenaiApiKey(key);
  };

  const handleAIToggle = (enabled: boolean) => {
    setAiInsightsEnabled(enabled);
  };

  const isValidApiKey = openaiApiKey.startsWith('sk-') && openaiApiKey.length > 20;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysis ? (
          <div className="space-y-8">
            {/* OpenAI Settings */}
            <OpenAISettings
              apiKey={openaiApiKey}
              onApiKeyChange={handleApiKeyChange}
              isEnabled={aiInsightsEnabled}
              onToggle={handleAIToggle}
            />

            <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            
            {isGeneratingAIInsights && (
              <div className="max-w-2xl mx-auto p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary-600 animate-pulse" />
                  <div>
                    <p className="text-primary-800 font-medium">Generating AI Insights</p>
                    <p className="text-primary-700 text-sm mt-1">Creating personalized recommendations...</p>
                  </div>
                </div>
              </div>
            )}
            
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
                        <span>Quarterly business cycle analysis with strategic insights</span>
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
                        <span>Actionable marketing recommendations and budget allocation guidance</span>
                      </li>
                      {isValidApiKey && (
                        <li className="flex items-start space-x-2">
                          <Sparkles className="h-4 w-4 text-primary-500 mt-1" />
                          <span className="text-primary-600 font-medium">AI-powered personalized insights and strategic recommendations</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Analysis Results for "{analysis.keyword}"
                  </h2>
                  {analysis.hasAIInsights && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium">
                      <Sparkles className="h-3 w-3" />
                      <span>AI Enhanced</span>
                    </div>
                  )}
                </div>
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
            <MonthlyChart 
              data={analysis.seasonality.monthly} 
              keyword={analysis.keyword} 
            />
            
            {/* Yearly Chart - Full Width */}
            <YearlyChart 
              data={analysis.seasonality.yearly} 
              keyword={analysis.keyword} 
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">
              Built to help marketers and analysts discover hidden seasonal patterns in Google Trends data.
            </p>
            <p className="text-xs mt-2 text-gray-400">
              Upload your Google Trends CSV files to get started with advanced seasonality analysis.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;