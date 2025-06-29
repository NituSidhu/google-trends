import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { QuarterlyData } from '../../types';

interface QuarterlyChartProps {
  data: QuarterlyData[];
  keyword: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const QuarterlyChart: React.FC<QuarterlyChartProps> = ({ data, keyword }) => {
  const CustomTooltip = ({ active, payload }: any) => {
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

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Quarterly Distribution</h3>
        <p className="text-gray-600">
          Search interest distribution for "{keyword}" across quarters
        </p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="percentage"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry: any) => (
                <span style={{ color: entry.color }}>
                  {entry.payload.quarter} ({entry.payload.averageValue}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((quarter, index) => (
          <div key={quarter.quarter} className="text-center p-3 bg-gray-50 rounded-lg">
            <div 
              className="w-4 h-4 rounded-full mx-auto mb-2"
              style={{ backgroundColor: COLORS[index] }}
            ></div>
            <p className="text-sm font-medium text-gray-900">{quarter.quarter}</p>
            <p className="text-lg font-bold text-primary-600">{quarter.averageValue}%</p>
            <p className="text-xs text-gray-500">{quarter.percentage}% of total</p>
          </div>
        ))}
      </div>
    </div>
  );
};