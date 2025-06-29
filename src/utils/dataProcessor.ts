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
      header: false, // Parse without assuming header structure
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as string[][];
          
          if (rows.length === 0) {
            throw new Error('CSV file is empty');
          }

          // Find the header row by looking for date-related keywords
          let headerRowIndex = -1;
          let headerRow: string[] = [];
          
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const hasDateColumn = row.some(cell => {
              const cellLower = cell.toLowerCase().trim();
              return cellLower.includes('week') || 
                     cellLower.includes('month') || 
                     cellLower.includes('date') ||
                     cellLower === 'day';
            });
            
            if (hasDateColumn && row.length >= 2) {
              headerRowIndex = i;
              headerRow = row;
              break;
            }
          }

          if (headerRowIndex === -1) {
            throw new Error('Could not find header row with date column in CSV file');
          }

          // Find date and value column indices
          const dateColumnIndex = headerRow.findIndex(header => {
            const headerLower = header.toLowerCase().trim();
            return headerLower.includes('week') || 
                   headerLower.includes('month') || 
                   headerLower.includes('date') ||
                   headerLower === 'day';
          });

          const valueColumnIndex = headerRow.findIndex((header, index) => {
            if (index === dateColumnIndex) return false;
            const headerLower = header.toLowerCase().trim();
            return !headerLower.includes('week') && 
                   !headerLower.includes('month') && 
                   !headerLower.includes('date') &&
                   headerLower !== 'day' &&
                   header.trim() !== '';
          });

          if (dateColumnIndex === -1) {
            throw new Error('Could not find date column in CSV file');
          }

          if (valueColumnIndex === -1) {
            throw new Error('Could not find value column in CSV file');
          }

          // Process data rows
          const dataRows = rows.slice(headerRowIndex + 1);
          const processedData: TrendsDataPoint[] = [];

          dataRows.forEach((row, index) => {
            if (row.length <= Math.max(dateColumnIndex, valueColumnIndex)) {
              return; // Skip rows that don't have enough columns
            }

            const dateStr = row[dateColumnIndex]?.trim();
            const valueStr = row[valueColumnIndex]?.trim();

            if (!dateStr || !valueStr || valueStr === '') {
              return; // Skip empty rows
            }

            try {
              let date: Date;
              
              // Handle different date formats
              if (dateStr.includes('-')) {
                // Format: 2023-01-01 or 2023-01-01 - 2023-01-07
                const datePart = dateStr.split(' - ')[0];
                if (datePart.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  date = parse(datePart, 'yyyy-MM-dd', new Date());
                } else {
                  date = new Date(datePart);
                }
              } else if (dateStr.includes('/')) {
                // Try MM/dd/yyyy or dd/MM/yyyy formats
                date = new Date(dateStr);
              } else {
                // Try other formats
                date = new Date(dateStr);
              }

              if (isNaN(date.getTime())) {
                console.warn(`Skipping row ${index + headerRowIndex + 1} due to invalid date: ${dateStr}`);
                return;
              }

              // Parse value - handle both integer and percentage formats
              let value = 0;
              if (valueStr.includes('%')) {
                value = parseFloat(valueStr.replace('%', '')) || 0;
              } else if (valueStr === '<1') {
                value = 0.5; // Treat '<1' as 0.5
              } else {
                value = parseFloat(valueStr) || 0;
              }
              
              processedData.push({
                date: format(date, 'yyyy-MM-dd'),
                value,
                month: getMonth(date) + 1, // getMonth returns 0-11, we want 1-12
                quarter: getQuarter(date),
                year: getYear(date)
              });
            } catch (error) {
              console.warn(`Skipping row ${index + headerRowIndex + 1} due to parsing error:`, error);
            }
          });

          if (processedData.length === 0) {
            throw new Error('No valid data points found in the CSV file. Please check the file format.');
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

// Extract keyword from CSV file content or filename
const extractKeywordFromFile = (file: File, rows: string[][]): string => {
  // First, try to extract from CSV content (look for keyword in early rows)
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const row = rows[i];
    for (const cell of row) {
      const cellStr = cell.trim();
      // Look for patterns like "yahoo: (United States)" or similar
      if (cellStr.includes(':') && (cellStr.includes('(') || cellStr.length > 3)) {
        // Extract the part before the colon and clean it up
        const keyword = cellStr.split(':')[0].trim();
        if (keyword.length > 0 && !keyword.toLowerCase().includes('week') && 
            !keyword.toLowerCase().includes('month') && !keyword.toLowerCase().includes('date')) {
          return keyword;
        }
      }
      // Look for cells that might contain the search term
      if (cellStr.length > 2 && cellStr.length < 50 && 
          !cellStr.toLowerCase().includes('week') && 
          !cellStr.toLowerCase().includes('month') && 
          !cellStr.toLowerCase().includes('date') &&
          !cellStr.includes('%') && isNaN(Number(cellStr))) {
        return cellStr.replace(/[()]/g, '').trim();
      }
    }
  }
  
  // Fallback to filename
  return file.name.replace('.csv', '').replace(/[_-]/g, ' ');
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