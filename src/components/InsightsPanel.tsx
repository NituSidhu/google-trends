import React from 'react';
import { Lightbulb, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { AnalysisResult } from '../types';
import { format, parseISO } from 'date-fns';

interface InsightsPanelProps {
  analysis: AnalysisResult;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ analysis }) => {
  const { keyword, totalDataPoints, dateRange, insights, seasonality } = analysis;

  const peakMonth = seasonality.monthly.reduce((max, month) => 
    month.averageValue > max.averageValue ? month : max
  );

  const peakQuarter = seasonality.quarterly.reduce((max, quarter) => 
    quarter.averageValue > max.averageValue ? quarter : max
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-2 mb-6">
        <Lightbulb className="h-6 w-6 text-warning-500" />
        <h3 className="text-xl font-bold text-gray-900">Key Insights</h3>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-primary-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-primary-800">Data Points</span>
          </div>
          <p className="text-2xl font-bold text-primary-900">{totalDataPoints}</p>
          <p className="text-xs text-primary-700">Total measurements</p>
        </div>

        <div className="bg-success-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-5 w-5 text-success-600" />
            <span className="text-sm font-medium text-success-800">Peak Month</span>
          </div>
          <p className="text-2xl font-bold text-success-900">{peakMonth.month}</p>
          <p className="text-xs text-success-700">{peakMonth.averageValue}% interest</p>
        </div>

        <div className="bg-warning-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-5 w-5 text-warning-600" />
            <span className="text-sm font-medium text-warning-800">Peak Quarter</span>
          </div>
          <p className="text-2xl font-bold text-warning-900">{peakQuarter.quarter}</p>
          <p className="text-xs text-warning-700">{peakQuarter.percentage}% of searches</p>
        </div>
      </div>

      {/* Date Range */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Analysis Period</h4>
        <p className="text-gray-700">
          <span className="font-medium">From:</span> {format(parseISO(dateRange.start), 'MMMM d, yyyy')}
          {' '}
          <span className="font-medium">To:</span> {format(parseISO(dateRange.end), 'MMMM d, yyyy')}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Analyzing search trends for "{keyword}" over {Math.round((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years
        </p>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Seasonal Insights</h4>
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-xs font-bold text-primary-700">{index + 1}</span>
            </div>
            <p className="text-gray-800 leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>

      {/* Actionable Recommendations */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-success-50 rounded-lg border border-primary-100">
        <h4 className="font-semibold text-gray-900 mb-3">💡 Marketing Recommendations</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start space-x-2">
            <span className="text-primary-600">•</span>
            <span>Plan your marketing campaigns around <strong>{peakMonth.month}</strong> for maximum impact</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary-600">•</span>
            <span>Allocate higher budget during <strong>{peakQuarter.quarter}</strong> when search interest peaks</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary-600">•</span>
            <span>Use off-peak periods for content creation and preparation</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary-600">•</span>
            <span>Consider seasonal promotions aligned with search patterns</span>
          </li>
        </ul>
      </div>
    </div>
  );
};