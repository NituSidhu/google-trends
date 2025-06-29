import Papa from 'papaparse';
import { format, parse, getMonth, getQuarter, getYear } from 'date-fns';
import { TrendsDataPoint, SeasonalityData, AnalysisResult, MonthlyData, QuarterlyData, YearlyData } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const QUARTER_NAMES = ['Q1', 'Q2', 'Q3', 'Q4'];

export const parseCSVFile = (file: File): Promise<TrendsDataPoint[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as any[];
          
          // Skip the first few rows that contain metadata
          const dataStartIndex = data.findIndex(row => 
            Object.keys(row).some(key => key.toLowerCase().includes('date') || key.toLowerCase().includes('week'))
          );
          
          if (dataStartIndex === -1) {
            throw new Error('Could not find data section in CSV file');
          }

          const relevantData = data.slice(dataStartIndex);
          const processedData: TrendsDataPoint[] = [];

          relevantData.forEach((row, index) => {
            const keys = Object.keys(row);
            const dateKey = keys.find(key => 
              key.toLowerCase().includes('date') || 
              key.toLowerCase().includes('week') ||
              key.toLowerCase().includes('month')
            );
            const valueKey = keys.find(key => 
              key !== dateKey && 
              !key.toLowerCase().includes('date') && 
              !key.toLowerCase().includes('week') &&
              row[key] !== '' &&
              !isNaN(Number(row[key]))
            );

            if (dateKey && valueKey && row[dateKey] && row[valueKey] !== '') {
              try {
                let date: Date;
                const dateStr = row[dateKey].trim();
                
                // Handle different date formats
                if (dateStr.includes('-')) {
                  // Format: 2023-01-01 or 2023-01-01 - 2023-01-07
                  const datePart = dateStr.split(' - ')[0];
                  date = parse(datePart, 'yyyy-MM-dd', new Date());
                } else {
                  // Try other common formats
                  date = new Date(dateStr);
                }

                if (isNaN(date.getTime())) {
                  return; // Skip invalid dates
                }

                const value = parseInt(row[valueKey]) || 0;
                
                processedData.push({
                  date: format(date, 'yyyy-MM-dd'),
                  value,
                  month: getMonth(date) + 1, // getMonth returns 0-11, we want 1-12
                  quarter: getQuarter(date),
                  year: getYear(date)
                });
              } catch (error) {
                console.warn(`Skipping row ${index} due to date parsing error:`, error);
              }
            }
          });

          if (processedData.length === 0) {
            throw new Error('No valid data points found in the CSV file');
          }

          resolve(processedData.sort((a, b) => a.date.localeCompare(b.date)));
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
};

export const analyzeSeasonality = (data: TrendsDataPoint[], keyword: string): AnalysisResult => {
  // Monthly analysis
  const monthlyGroups = data.reduce((acc, point) => {
    if (!acc[point.month]) {
      acc[point.month] = [];
    }
    acc[point.month].push(point.value);
    return acc;
  }, {} as Record<number, number[]>);

  const monthlyData: MonthlyData[] = Object.entries(monthlyGroups).map(([month, values]) => {
    const monthNum = parseInt(month);
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const totalSearches = values.reduce((sum, val) => sum + val, 0);
    
    return {
      month: MONTH_NAMES[monthNum - 1],
      monthNumber: monthNum,
      averageValue: Math.round(averageValue * 100) / 100,
      totalSearches,
      percentage: 0 // Will be calculated after all months are processed
    };
  });

  // Calculate percentages for monthly data
  const totalMonthlySearches = monthlyData.reduce((sum, month) => sum + month.totalSearches, 0);
  monthlyData.forEach(month => {
    month.percentage = Math.round((month.totalSearches / totalMonthlySearches) * 100 * 100) / 100;
  });

  // Quarterly analysis
  const quarterlyGroups = data.reduce((acc, point) => {
    if (!acc[point.quarter]) {
      acc[point.quarter] = [];
    }
    acc[point.quarter].push(point.value);
    return acc;
  }, {} as Record<number, number[]>);

  const quarterlyData: QuarterlyData[] = Object.entries(quarterlyGroups).map(([quarter, values]) => {
    const quarterNum = parseInt(quarter);
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const totalSearches = values.reduce((sum, val) => sum + val, 0);
    
    return {
      quarter: QUARTER_NAMES[quarterNum - 1],
      quarterNumber: quarterNum,
      averageValue: Math.round(averageValue * 100) / 100,
      totalSearches,
      percentage: 0
    };
  });

  // Calculate percentages for quarterly data
  const totalQuarterlySearches = quarterlyData.reduce((sum, quarter) => sum + quarter.totalSearches, 0);
  quarterlyData.forEach(quarter => {
    quarter.percentage = Math.round((quarter.totalSearches / totalQuarterlySearches) * 100 * 100) / 100;
  });

  // Yearly analysis
  const yearlyGroups = data.reduce((acc, point) => {
    if (!acc[point.year]) {
      acc[point.year] = [];
    }
    acc[point.year].push(point.value);
    return acc;
  }, {} as Record<number, number[]>);

  const yearlyData: YearlyData[] = Object.entries(yearlyGroups).map(([year, values]) => {
    const yearNum = parseInt(year);
    const averageValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const totalSearches = values.reduce((sum, val) => sum + val, 0);
    
    return {
      year: yearNum,
      averageValue: Math.round(averageValue * 100) / 100,
      totalSearches,
      trend: 'stable' as const
    };
  }).sort((a, b) => a.year - b.year);

  // Calculate trends for yearly data
  yearlyData.forEach((yearData, index) => {
    if (index > 0) {
      const previousYear = yearlyData[index - 1];
      const change = ((yearData.averageValue - previousYear.averageValue) / previousYear.averageValue) * 100;
      
      if (change > 5) {
        yearData.trend = 'up';
      } else if (change < -5) {
        yearData.trend = 'down';
      } else {
        yearData.trend = 'stable';
      }
    }
  });

  // Generate insights
  const insights = generateInsights(monthlyData, quarterlyData, yearlyData);

  return {
    keyword,
    totalDataPoints: data.length,
    dateRange: {
      start: data[0].date,
      end: data[data.length - 1].date
    },
    seasonality: {
      monthly: monthlyData.sort((a, b) => a.monthNumber - b.monthNumber),
      quarterly: quarterlyData.sort((a, b) => a.quarterNumber - b.quarterNumber),
      yearly: yearlyData
    },
    insights
  };
};

const generateInsights = (monthly: MonthlyData[], quarterly: QuarterlyData[], yearly: YearlyData[]): string[] => {
  const insights: string[] = [];

  // Peak month insight
  const peakMonth = monthly.reduce((max, month) => 
    month.averageValue > max.averageValue ? month : max
  );
  insights.push(`Peak search activity occurs in ${peakMonth.month} with ${peakMonth.averageValue}% of maximum interest.`);

  // Low month insight
  const lowMonth = monthly.reduce((min, month) => 
    month.averageValue < min.averageValue ? month : min
  );
  insights.push(`Lowest search activity is in ${lowMonth.month} with ${lowMonth.averageValue}% of maximum interest.`);

  // Seasonal pattern insight
  const seasonalVariation = (peakMonth.averageValue - lowMonth.averageValue) / lowMonth.averageValue * 100;
  if (seasonalVariation > 50) {
    insights.push(`Strong seasonal pattern detected with ${Math.round(seasonalVariation)}% variation between peak and low months.`);
  } else if (seasonalVariation > 25) {
    insights.push(`Moderate seasonal pattern with ${Math.round(seasonalVariation)}% variation between peak and low months.`);
  } else {
    insights.push(`Relatively stable search volume throughout the year with ${Math.round(seasonalVariation)}% variation.`);
  }

  // Peak quarter insight
  const peakQuarter = quarterly.reduce((max, quarter) => 
    quarter.averageValue > max.averageValue ? quarter : max
  );
  insights.push(`${peakQuarter.quarter} shows the highest quarterly activity with ${peakQuarter.percentage}% of total searches.`);

  // Yearly trend insight
  if (yearly.length > 1) {
    const recentTrend = yearly.slice(-3); // Last 3 years
    const upTrends = recentTrend.filter(y => y.trend === 'up').length;
    const downTrends = recentTrend.filter(y => y.trend === 'down').length;
    
    if (upTrends > downTrends) {
      insights.push(`Recent years show an upward trend in search interest.`);
    } else if (downTrends > upTrends) {
      insights.push(`Recent years show a declining trend in search interest.`);
    } else {
      insights.push(`Search interest has remained relatively stable in recent years.`);
    }
  }

  return insights;
};