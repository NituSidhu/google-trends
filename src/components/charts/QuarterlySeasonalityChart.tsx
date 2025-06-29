import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Briefcase, DollarSign } from 'lucide-react';
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

  const CustomTooltip = ({ active, payload, label }: any) => {
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

  // Generate business insights based on peak quarter
  const getBusinessInsights = (peakQ: QuarterlyData, lowQ: QuarterlyData) => {
    const insights = [];
    const variation = ((peakQ.averageValue - lowQ.averageValue) / lowQ.averageValue * 100);

    switch (peakQ.quarter) {
      case 'Q1':
        insights.push({
          title: "New Year Resolution Effect",
          description: "Q1 peaks often indicate New Year motivation, fresh starts, or post-holiday planning behavior.",
          businessImplication: "Launch campaigns in December to capture early January momentum. Focus on goal-setting and improvement messaging."
        });
        break;
      case 'Q2':
        insights.push({
          title: "Spring Planning & Growth",
          description: "Q2 spikes typically reflect spring planning, business growth initiatives, or preparation for summer activities.",
          businessImplication: "Capitalize on planning season with strategic content. Ideal time for B2B launches and service offerings."
        });
        break;
      case 'Q3':
        insights.push({
          title: "Back-to-School & Preparation",
          description: "Q3 peaks often align with back-to-school season, fall preparation, or end-of-summer planning.",
          businessImplication: "Target educational markets, family planning, and preparation-focused campaigns. High conversion potential."
        });
        break;
      case 'Q4':
        insights.push({
          title: "Holiday & Year-End Rush",
          description: "Q4 spikes indicate holiday shopping, year-end business activities, or gift-giving behavior.",
          businessImplication: "Maximize holiday marketing spend. Focus on gift guides, year-end promotions, and urgency messaging."
        });
        break;
    }

    // Add variation insight
    if (variation > 50) {
      insights.push({
        title: "High Seasonal Volatility",
        description: `${Math.round(variation)}% variation suggests strong seasonal dependency.`,
        businessImplication: "Plan inventory, staffing, and cash flow around peak seasons. Consider counter-seasonal strategies for low periods."
      });
    } else if (variation > 25) {
      insights.push({
        title: "Moderate Seasonality",
        description: `${Math.round(variation)}% variation shows predictable seasonal patterns.`,
        businessImplication: "Adjust marketing budgets quarterly. Maintain baseline operations with seasonal scaling."
      });
    }

    return insights;
  };

  const businessInsights = getBusinessInsights(peakQuarter, lowQuarter);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-bold text-gray-900">Quarterly Seasonality</h3>
        </div>
        <p className="text-gray-600">
          Search interest patterns for "{keyword}" across quarters - revealing seasonal business cycles
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

      {/* Business Insights Section */}
      <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="flex items-center space-x-2 mb-4">
          <Briefcase className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Business Intelligence</h4>
        </div>
        
        <div className="space-y-4">
          {businessInsights.map((insight, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {index === 0 ? (
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  ) : (
                    <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-1">{insight.title}</h5>
                  <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    <p className="text-sm font-medium text-blue-800">
                      💡 Business Strategy: {insight.businessImplication}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <h4 className="font-semibold text-green-800 mb-3">📈 Strategic Recommendations</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-green-700 mb-2">Peak Season Strategy ({peakQuarter.quarter})</h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Increase marketing budget by 30-50%</li>
              <li>• Scale inventory and staffing</li>
              <li>• Launch premium campaigns</li>
              <li>• Maximize conversion optimization</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-green-700 mb-2">Off-Season Strategy ({lowQuarter.quarter})</h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Focus on content creation</li>
              <li>• Build email lists and retargeting</li>
              <li>• Test new campaigns at lower cost</li>
              <li>• Prepare for next peak season</li>
            </ul>
          </div>
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