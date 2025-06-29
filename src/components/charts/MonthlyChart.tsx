import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyData } from '../../types';

interface MonthlyChartProps {
  data: MonthlyData[];
  keyword: string;
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ data, keyword }) => {
  const chartData = data.map(item => ({
    ...item,
    displayMonth: item.month.substring(0, 3) // Show abbreviated month names
  }));

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
          <p className="font-semibold text-gray-900">{data.month}</p>
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

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Monthly Seasonality</h3>
        <p className="text-gray-600">
          Average search interest for "{keyword}" by month across all years
        </p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="displayMonth" 
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
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.slice(0, 4).map((month, index) => (
          <div key={month.month} className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{month.month}</p>
            <p className="text-lg font-bold text-primary-600">{month.averageValue}%</p>
            <p className="text-xs text-gray-500">{month.percentage}% of total</p>
          </div>
        ))}
      </div>
    </div>
  );
};