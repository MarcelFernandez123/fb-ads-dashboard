# FB Ads Dashboard

Real-time Facebook Ads performance dashboard built with Next.js 14, connecting to your MCP server for live data.

## Features

- **Account Overview**: View all 6 ad accounts at a glance with key metrics
- **Account-specific KPIs**:
  - E-commerce (Charlie Ralph): ROAS with color-coded thresholds
  - Gym (ROAR MMA): Cost per Subscription with conversion funnel
  - Lead Gen: Cost per Result metrics
- **Campaign Deep Dive**: Expandable campaign table with ad set/ad breakdowns
- **Performance Charts**: Line charts, bar charts, funnel visualization, ROAS trends
- **Alerts System**: Real-time alerts for declining metrics
- **Comparison View**: Side-by-side comparison of up to 3 accounts
- **Auto-refresh**: Data refreshes every 15 minutes

## Ad Accounts

1. **Cale Henderson** - Lead Gen
2. **Charlie Ralph Melbourne** - E-commerce (ROAS focus)
3. **Charlie Ralph Gold Coast** - E-commerce (ROAS focus)
4. **ROAR MMA Rockingham** - Gym Lead Gen (Cost per Sub focus)
5. **Blank Kanvas** - Lead Gen
6. **ChiropracticHUB** - Lead Gen

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Data Fetching**: React Query
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MCP server with Facebook Ads integration (optional - demo data available)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fb-ads-dashboard.git
cd fb-ads-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
MCP_ENDPOINT=http://localhost:3001
MCP_AUTH_TOKEN=your_token
FB_CALE_HENDERSON_ID=act_XXXXXXXXX
# ... other account IDs
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/src
  /app
    /page.tsx                    # Dashboard home - account overview
    /accounts/[slug]/page.tsx    # Account detail view
    /compare/page.tsx            # Comparison view
    /api/fb-data/route.ts        # MCP data fetching endpoint
    /api/refresh/route.ts        # Manual refresh trigger
  /components
    /dashboard
      /AccountCard.tsx           # Account summary card
      /MetricsRow.tsx            # Metrics display grid
      /AlertsBanner.tsx          # Alerts display
      /Header.tsx                # Navigation header
      /MobileNav.tsx             # Mobile bottom navigation
    /charts
      /SparkLine.tsx             # Mini trend chart
      /PerformanceChart.tsx      # Main performance chart
      /FunnelChart.tsx           # ROAR funnel visualization
      /ROASChart.tsx             # Charlie Ralph ROAS trend
      /CampaignBarChart.tsx      # Campaign comparison bar chart
    /tables
      /CampaignTable.tsx         # Expandable campaign table
    /ui                          # shadcn/ui components
  /lib
    /mcp-client.ts               # MCP connection logic
    /metrics-config.ts           # Account-specific configurations
    /thresholds.ts               # Color coding thresholds
    /utils.ts                    # Utility functions
  /hooks
    /useFBData.ts                # React Query hooks
    /useAccountMetrics.ts        # Metrics processing hooks
  /types
    /metrics.ts                  # TypeScript interfaces
```

## Account Configuration

Each account has specific metric sets and thresholds:

```typescript
const accountConfig = {
  'charlie-ralph-melb': {
    type: 'ecommerce',
    primaryKPI: 'roas',
    thresholds: { roas: { green: 5, yellow: 3 } }
  },
  'roar-mma-rockingham': {
    type: 'leadgen-gym',
    primaryKPI: 'costPerSubscription',
    thresholds: { costPerSubscription: { green: 50, yellow: 80 } }
  },
  // ...
}
```

## Threshold Color Coding

### ROAS (Charlie Ralph accounts)
- Green: ROAS > 5x
- Yellow: ROAS 3x - 5x
- Red: ROAS < 3x

### Cost Per Subscription (ROAR MMA)
- Green: < $50
- Yellow: $50 - $80
- Red: > $80

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Set these in your Vercel project settings:
- `MCP_ENDPOINT`
- `MCP_AUTH_TOKEN`
- `FB_CALE_HENDERSON_ID`
- `FB_CHARLIE_RALPH_MELB_ID`
- `FB_CHARLIE_RALPH_GC_ID`
- `FB_ROAR_MMA_ID`
- `FB_BLANK_KANVAS_ID`
- `FB_CHIROPRACTICHUB_ID`

## MCP Integration

The dashboard connects to your existing FB AI Agent MCP server. The MCP client (`/lib/mcp-client.ts`) makes requests to fetch:

- Account-level insights
- Campaign data with ad sets and ads
- Daily breakdown for charts

Without MCP configuration, the dashboard uses demo data for development.

## License

MIT
