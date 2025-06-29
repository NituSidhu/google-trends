import React from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8" />
            <BarChart3 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Google Trends Seasonality Analyzer</h1>
            <p className="text-primary-100 mt-2">
              Discover hidden seasonal patterns in your Google Trends data with advanced visualizations
            </p>
          </div>
        </div>
        
        <div className="bg-primary-700/50 rounded-lg p-4">
          <p className="text-primary-50 text-sm leading-relaxed">
            Transform your Google Trends CSV exports into actionable insights. Upload your data to reveal 
            monthly seasonality, quarterly patterns, and yearly trends that are invisible in the standard Google Trends interface.
          </p>
        </div>
      </div>
    </header>
  );
};