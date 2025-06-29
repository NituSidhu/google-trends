import OpenAI from 'openai';
import { AnalysisResult } from '../types';

export class OpenAIService {
  private client: OpenAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  }

  updateApiKey(apiKey: string) {
    if (apiKey && apiKey.startsWith('sk-')) {
      this.client = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });
    } else {
      this.client = null;
    }
  }

  async generateEnhancedInsights(analysis: AnalysisResult): Promise<string[]> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    const prompt = this.buildPrompt(analysis);

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a marketing analytics expert specializing in seasonal trends and business strategy. Provide actionable, specific insights based on Google Trends data.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse the response into individual insights
      return this.parseInsights(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI insights. Please check your API key and try again.');
    }
  }

  private buildPrompt(analysis: AnalysisResult): string {
    const { keyword, seasonality, dateRange } = analysis;
    
    const peakMonth = seasonality.monthly.reduce((max, month) => 
      month.averageValue > max.averageValue ? month : max
    );
    
    const lowMonth = seasonality.monthly.reduce((min, month) => 
      month.averageValue < min.averageValue ? month : min
    );

    const peakQuarter = seasonality.quarterly.reduce((max, quarter) => 
      quarter.averageValue > max.averageValue ? quarter : max
    );

    const recentYears = seasonality.yearly.slice(-3);
    const trendDirection = this.analyzeTrendDirection(recentYears);

    return `
Analyze this Google Trends data for "${keyword}" from ${dateRange.start} to ${dateRange.end}:

SEASONAL PATTERNS:
- Peak month: ${peakMonth.month} (${peakMonth.averageValue}% interest)
- Low month: ${lowMonth.month} (${lowMonth.averageValue}% interest)
- Peak quarter: ${peakQuarter.quarter} (${peakQuarter.percentage}% of searches)
- Recent trend: ${trendDirection}

MONTHLY DATA:
${seasonality.monthly.map(m => `${m.month}: ${m.averageValue}%`).join(', ')}

QUARTERLY DATA:
${seasonality.quarterly.map(q => `${q.quarter}: ${q.averageValue}%`).join(', ')}

Please provide 5-7 specific, actionable marketing insights. Focus on:
1. Strategic timing for campaigns and budget allocation
2. Market opportunities and competitive advantages
3. Consumer behavior patterns and motivations
4. Seasonal business planning recommendations
5. Risk mitigation for low-demand periods

Format each insight as a complete sentence that a marketing manager could immediately act upon. Avoid generic advice and focus on data-driven recommendations specific to this search pattern.
    `.trim();
  }

  private analyzeTrendDirection(recentYears: any[]): string {
    if (recentYears.length < 2) return 'insufficient data';
    
    const upTrends = recentYears.filter(y => y.trend === 'up').length;
    const downTrends = recentYears.filter(y => y.trend === 'down').length;
    
    if (upTrends > downTrends) return 'growing';
    if (downTrends > upTrends) return 'declining';
    return 'stable';
  }

  private parseInsights(content: string): string[] {
    // Split by numbered points or bullet points
    const insights = content
      .split(/\d+\.|•|-/)
      .map(insight => insight.trim())
      .filter(insight => insight.length > 20) // Filter out short fragments
      .slice(0, 7); // Limit to 7 insights

    return insights.length > 0 ? insights : [content.trim()];
  }

  isConfigured(): boolean {
    return this.client !== null;
  }
}