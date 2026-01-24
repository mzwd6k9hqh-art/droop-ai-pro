export const globalMarkets = [
  {
    id: 1,
    name: 'E-commerce & Retail',
    growth: '+23%',
    size: '$5.8T',
    description: 'Digital retail continues to dominate with mobile commerce leading growth.',
    trend: 'up',
  },
  {
    id: 2,
    name: 'SaaS & Cloud Services',
    growth: '+18%',
    size: '$480B',
    description: 'Enterprise software adoption accelerating across all sectors.',
    trend: 'up',
  },
  {
    id: 3,
    name: 'Digital Health',
    growth: '+31%',
    size: '$230B',
    description: 'Telehealth and wellness apps showing exceptional growth post-pandemic.',
    trend: 'up',
  },
  {
    id: 4,
    name: 'Fintech',
    growth: '+15%',
    size: '$310B',
    description: 'Payment solutions and neobanks reshaping financial services.',
    trend: 'up',
  },
];

export const bestCountries = [
  {
    id: 1,
    name: 'United States',
    flag: '🇺🇸',
    score: 94,
    highlights: ['Large consumer market', 'Strong VC ecosystem', 'Tech talent pool'],
  },
  {
    id: 2,
    name: 'Singapore',
    flag: '🇸🇬',
    score: 91,
    highlights: ['Tax incentives', 'Gateway to Asia', 'Pro-business policies'],
  },
  {
    id: 3,
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    score: 88,
    highlights: ['Zero income tax', 'Strategic location', 'Growing tech hub'],
  },
  {
    id: 4,
    name: 'Germany',
    flag: '🇩🇪',
    score: 85,
    highlights: ['Strong economy', 'EU access', 'Industrial expertise'],
  },
  {
    id: 5,
    name: 'United Kingdom',
    flag: '🇬🇧',
    score: 83,
    highlights: ['Financial hub', 'English speaking', 'Strong IP laws'],
  },
];

export const trendingNiches = [
  {
    id: 1,
    name: 'AI-Powered Productivity Tools',
    interest: 95,
    competition: 'Medium',
    potential: 'Very High',
    description: 'Automation and AI assistants for business workflows.',
  },
  {
    id: 2,
    name: 'Sustainable Products',
    interest: 87,
    competition: 'High',
    potential: 'High',
    description: 'Eco-friendly alternatives in every consumer category.',
  },
  {
    id: 3,
    name: 'Remote Work Solutions',
    interest: 82,
    competition: 'Medium',
    potential: 'High',
    description: 'Tools and services for distributed teams.',
  },
  {
    id: 4,
    name: 'Creator Economy Tools',
    interest: 78,
    competition: 'Low',
    potential: 'Very High',
    description: 'Monetization and management for content creators.',
  },
  {
    id: 5,
    name: 'Pet Tech & Services',
    interest: 74,
    competition: 'Low',
    potential: 'Medium',
    description: 'Smart products and premium services for pet owners.',
  },
];

export const analyticsInsights = {
  salesPerformance: [
    {
      title: 'Revenue Trend Analysis',
      insight: 'Your simulated revenue shows a 12% month-over-month growth trajectory. Key drivers include Q4 seasonal demand and improved customer retention.',
      recommendation: 'Focus on maintaining momentum through targeted upselling campaigns.',
      impact: 'High',
    },
    {
      title: 'Top Performing Segments',
      insight: 'Enterprise customers contribute 65% of revenue despite being only 15% of total customers.',
      recommendation: 'Consider developing enterprise-specific features and dedicated support tiers.',
      impact: 'High',
    },
    {
      title: 'Geographic Distribution',
      insight: 'North American market shows highest engagement with 45% of total interactions.',
      recommendation: 'Explore expansion opportunities in underserved regions like APAC and LATAM.',
      impact: 'Medium',
    },
  ],
  marketOpportunities: [
    {
      title: 'Emerging Market Gap',
      insight: 'Analysis shows 40% of your target audience lacks solutions for mobile-first workflows.',
      recommendation: 'Prioritize mobile app development or responsive redesign.',
      opportunity: '$2.3M potential',
    },
    {
      title: 'Partnership Potential',
      insight: 'Complementary tools in your space have overlapping customer bases without direct competition.',
      recommendation: 'Explore integration partnerships with productivity and CRM platforms.',
      opportunity: '3x reach expansion',
    },
    {
      title: 'Pricing Optimization',
      insight: 'Competitor analysis reveals room for a mid-tier pricing option.',
      recommendation: 'Introduce a Professional tier between Starter and Premium.',
      opportunity: '+25% conversions',
    },
  ],
  conversionSuggestions: [
    {
      title: 'Onboarding Optimization',
      insight: 'Users completing the guided setup have 3x higher retention rates.',
      action: 'Implement an interactive onboarding wizard for new users.',
      expectedLift: '+40% activation',
    },
    {
      title: 'Trial-to-Paid Improvements',
      insight: 'Trial users who engage with AI features convert at 2x the rate.',
      action: 'Highlight AI capabilities during the trial experience.',
      expectedLift: '+28% conversion',
    },
    {
      title: 'Checkout Friction',
      insight: 'Analysis suggests simplified payment flow could reduce abandonment.',
      action: 'Implement one-click upgrade and multiple payment options.',
      expectedLift: '+15% completion',
    },
  ],
};

export const aiResponses: Record<string, string> = {
  default: `Based on my analysis of current market conditions, here are key insights for your business:

**Market Position Assessment:**
Your target market shows strong growth potential with a projected 18% CAGR over the next 3 years. Key opportunities exist in:
- Digital transformation services
- Subscription-based models
- AI-enhanced product features

**Strategic Recommendations:**
1. **Focus on retention**: Customer acquisition costs are rising 15% YoY. Investing in retention could improve LTV by 35%.
2. **Expand digital presence**: 73% of B2B buyers prefer digital purchasing channels.
3. **Consider partnerships**: Strategic alliances could accelerate market penetration by 2-3x.

**Competitive Landscape:**
Your positioning shows strength in user experience but opportunity exists in enterprise features. Consider developing SSO, advanced analytics, and team management capabilities.

Would you like me to dive deeper into any of these areas?`,

  pricing: `Here's a comprehensive pricing strategy analysis:

**Current Market Pricing Benchmarks:**
- Entry-level SaaS: $15-29/month
- Professional tier: $49-99/month
- Enterprise: $200-500+/month

**Recommendations:**
1. **Value-based pricing**: Anchor pricing to customer outcomes, not features
2. **Annual discounts**: Offer 20-25% for annual commitments to improve cash flow
3. **Usage-based component**: Consider adding usage tiers to capture enterprise value

**Psychological Pricing Tips:**
- Use .99 pricing for lower tiers, round numbers for premium
- Show monthly price even for annual billing to appear lower
- Include "Most Popular" badge on target tier

The goal is maximizing revenue while maintaining competitive positioning.`,

  growth: `Let me analyze growth strategies tailored to your business context:

**Organic Growth Channels:**
1. **Content Marketing**: SEO-optimized content drives 40% of B2B leads
2. **Community Building**: Active communities show 33% higher retention
3. **Product-Led Growth**: Free trials with clear upgrade paths

**Paid Acquisition:**
- Google Ads: Average CAC $45-80 for SaaS
- LinkedIn: Best for B2B, higher quality but $80-150 CAC
- Facebook/Instagram: B2C focused, $25-50 CAC

**Recommended Stack:**
1. Start with content + SEO (3-6 month runway)
2. Layer in paid channels with clear attribution
3. Invest in referral program (typically 2-5x ROI)

**Growth Metrics to Track:**
- MRR growth rate (target: 10-15% MoM early stage)
- CAC payback period (target: <12 months)
- Net revenue retention (target: >100%)`,

  market: `Here's my analysis of market opportunities:

**High-Growth Sectors (2024-2025):**
1. **AI/ML Tools**: 45% CAGR, massive VC interest
2. **Climate Tech**: Government incentives driving adoption
3. **Healthcare Tech**: Post-pandemic digital transformation
4. **EdTech**: Corporate training market expanding

**Geographic Opportunities:**
- **Southeast Asia**: Fastest growing internet economy
- **Middle East**: Heavy infrastructure investment
- **Latin America**: Fintech boom underway

**Entry Strategies:**
1. **Localization**: Adapt product for local preferences
2. **Partnerships**: Find local distribution partners
3. **Compliance first**: Ensure regulatory alignment before launch

**Risk Assessment:**
- Currency fluctuation: Medium risk
- Regulatory changes: Varies by region
- Competition: Increasing but market still growing

Would you like detailed analysis on any specific market or sector?`,
};

export function getAIResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('price') || lowerQuery.includes('pricing') || lowerQuery.includes('cost')) {
    return aiResponses.pricing;
  }
  if (lowerQuery.includes('grow') || lowerQuery.includes('scale') || lowerQuery.includes('marketing')) {
    return aiResponses.growth;
  }
  if (lowerQuery.includes('market') || lowerQuery.includes('opportunity') || lowerQuery.includes('expansion')) {
    return aiResponses.market;
  }
  
  return aiResponses.default;
}
