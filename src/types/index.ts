export interface TrendsDataPoint {
  date: string;
  value: number;
  month: number;
  quarter: number;
  year: number;
}

export interface SeasonalityData {
  monthly: MonthlyData[];
  quarterly: QuarterlyData[];
  yearly: YearlyData[];
}

export interface MonthlyData {
  month: string;
  monthNumber: number;
  averageValue: number;
  totalSearches: number;
  percentage: number;
}

export interface QuarterlyData {
  quarter: string;
  quarterNumber: number;
  averageValue: number;
  totalSearches: number;
  percentage: number;
}

export interface YearlyData {
  year: number;
  averageValue: number;
  totalSearches: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AnalysisResult {
  keyword: string;
  totalDataPoints: number;
  dateRange: {
    start: string;
    end: string;
  };
  seasonality: SeasonalityData;
  insights: string[];
}