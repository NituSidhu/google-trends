import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';
import { QuarterlyData } from '../../types';

interface QuarterlySeasonalityChartProps {
  data: QuarterlyData[];
  keyword: string;
}

export const QuarterlySeasonalityChart: React.FC<QuarterlySeasonalityChartProps> = ({ data, keyword }) => {
  // Calculate Y-axis domain with padding
  const values = data.map(d => d.averageValue);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.1; // 10% padding
  const yAxisMin = Math.max(0, minValue - padding);
  const yAxisMax = maxValue + padding;

  const CustomTooltip = ({ active, payload, _label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.quarter}</p>
          <p className="text-primary-600">
            Average Interest: <span className="font-medium">{data.averageValue}%</span>
          </p>
          <p className="text-gray-600">
            Share of Total: <span className="font-medium">{data.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Y-axis tick formatter to show whole numbers
  const formatYAxisTick = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const peakQuarter = data.reduce((max, quarter) => 
    quarter.averageValue > max.averageValue ? quarter : max
  );

  const lowQuarter = data.reduce((min, quarter) => 
    quarter.averageValue < min.averageValue ? quarter : min
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-bold text-gray-900">Quarterly Seasonality</h3>
        </div>
        <p className="text-gray-600">
          Search interest patterns for "{keyword}" across quarters
        </p>
      </div>
      
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="quarter" 
              stroke="#6b7280"
              fontSize={14}
              tickLine={false}
              fontWeight="500"
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[yAxisMin, yAxisMax]}
              tickFormatter={formatYAxisTick}
              label={{ value: 'Average Interest (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone"
              dataKey="averageValue" 
              stroke="#3b82f6"
              strokeWidth={4}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-success-50 p-4 rounded-lg border border-success-200">
          <h4 className="font-semibold text-success-800 mb-2">Peak Quarter</h4>
          <p className="text-2xl font-bold text-success-900">{peakQuarter.quarter}</p>
          <p className="text-sm text-success-700">
            {peakQuarter.averageValue}% average interest • {peakQuarter.percentage}% of total searches
          </p>
        </div>
        
        <div className="bg-warning-50 p-4 rounded-lg border border-warning-200">
          <h4 className="font-semibold text-warning-800 mb-2">Low Quarter</h4>
          <p className="text-2xl font-bold text-warning-900">{lowQuarter.quarter}</p>
          <p className="text-sm text-warning-700">
            {lowQuarter.averageValue}% average interest • {lowQuarter.percentage}% of total searches
          </p>
        </div>
      </div>

      {/* Quarter Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {data.map((quarter) => (
          <div key={quarter.quarter} className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{quarter.quarter}</p>
            <p className="text-lg font-bold text-primary-600">{quarter.averageValue}%</p>
            <p className="text-xs text-gray-500">{quarter.percentage}% of total</p>
            <p className="text-xs text-gray-400 mt-1">
              {quarter.quarter === 'Q1' && 'Jan-Mar'}
              {quarter.quarter === 'Q2' && 'Apr-Jun'}
              {quarter.quarter === 'Q3' && 'Jul-Sep'}
              {quarter.quarter === 'Q4' && 'Oct-Dec'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};