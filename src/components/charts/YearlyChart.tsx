import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { YearlyData } from '../../types';

interface YearlyChartProps {
  data: YearlyData[];
  keyword: string;
}

export const YearlyChart: React.FC<YearlyChartProps> = ({ data, keyword }) => {
  // Calculate Y-axis domain with padding
  const values = data.map(d => d.averageValue);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.1; // 10% padding
  const yAxisMin = Math.max(0, minValue - padding);
  const yAxisMax = maxValue + padding;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-primary-600">
            Average Interest: <span className="font-medium">{data.averageValue}%</span>
          </p>
          <div className="flex items-center mt-2">
            {data.trend === 'up' && <TrendingUp className="h-4 w-4 text-success-600 mr-1" />}
            {data.trend === 'down' && <TrendingDown className="h-4 w-4 text-error-600 mr-1" />}
            {data.trend === 'stable' && <Minus className="h-4 w-4 text-gray-600 mr-1" />}
            <span className={`text-sm font-medium ${
              data.trend === 'up' ? 'text-success-600' : 
              data.trend === 'down' ? 'text-error-600' : 'text-gray-600'
            }`}>
              {data.trend === 'up' ? 'Trending Up' : 
               data.trend === 'down' ? 'Trending Down' : 'Stable'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Y-axis tick formatter to show whole numbers
  const formatYAxisTick = (value: number) => {
    return `${Math.round(value)}%`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Yearly Trends</h3>
        <p className="text-gray-600">
          Year-over-year search interest trends for "{keyword}"
        </p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="year" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
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
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center space-x-2 px-3 py-2 bg-success-50 rounded-lg">
          <TrendingUp className="h-4 w-4 text-success-600" />
          <span className="text-sm font-medium text-success-800">
            {data.filter(d => d.trend === 'up').length} years trending up
          </span>
        </div>
        <div className="flex items-center space-x-2 px-3 py-2 bg-error-50 rounded-lg">
          <TrendingDown className="h-4 w-4 text-error-600" />
          <span className="text-sm font-medium text-error-800">
            {data.filter(d => d.trend === 'down').length} years trending down
          </span>
        </div>
        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
          <Minus className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">
            {data.filter(d => d.trend === 'stable').length} years stable
          </span>
        </div>
      </div>
    </div>
  );
};