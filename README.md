# RetailAnalytics - Sales Intelligence Platform

A modern, full-featured retail sales analytics dashboard built with Next.js 16, React 19, and Recharts. Designed as a portfolio application for Data Analysts and Data Scientists.

## Features

### 📊 Dashboard & KPIs
- Real-time KPI cards displaying total sales, average order value, growth rate, and order count
- Beautiful card-based layout with loading states
- Responsive grid system for mobile and desktop

### 📈 Sales Analytics
- Interactive line charts showing daily revenue trends
- Pie charts for revenue breakdown by category
- Horizontal bar charts for top 10 products
- Detailed sales data table with sorting and filtering
- Multiple chart types using Recharts library

### 🤖 ML-Powered Forecasting
- Time-series sales predictions using ARIMA models
- Confidence intervals for predictions (95% confidence level)
- Historical vs. predicted data visualization
- Customizable forecast horizon (7-180 days)
- Detailed forecast table with bounds

### 📤 File Upload & Import
- Drag-and-drop file upload interface
- Support for CSV, Excel, and JSON formats
- Real-time data preview
- File validation and error handling
- Progress tracking

### 📄 Reports & Exports
- Multiple report templates (Executive Summary, Sales Analysis, Forecast, Inventory)
- Export in PDF, Excel, and CSV formats
- Date range filtering
- Recent downloads tracking

### 👤 User Profile
- User information display
- Account settings management
- Connected services overview
- Two-factor authentication setup
- OAuth integration support

## Tech Stack

- **Frontend Framework**: Next.js 16 with App Router
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Charts & Visualizations**: Recharts
- **Data Parsing**: PapaParse (CSV handling)
- **HTTP Client**: Axios
- **State Management**: SWR (for data fetching)
- **Authentication**: next-auth with OAuth support
- **Development**: TypeScript, ESLint

## API Endpoints

The frontend consumes these backend endpoints:

```
POST   /login           - User authentication
POST   /upload          - Upload CSV/Excel files
GET    /dashboard       - Dashboard KPIs
GET    /sales           - Sales data with filters
POST   /forecast        - Generate ML predictions
GET    /reports         - Report data
GET    /profile         - User profile information
```

### Example Backend Implementation

The backend should be a Node.js/Express or similar server running on `http://localhost:3001`.

**Note**: Currently, the app will show an error if the backend API is not connected. For testing with mock data, you can modify `lib/api-client.ts` to return mock data.

## Getting Started

### Prerequisites
- Node.js 18+ (v20 recommended)
- pnpm (or npm/yarn)

### Installation

1. **Clone or setup the project**
```bash
cd retailanalytics
pnpm install
```

2. **Set environment variables** (if needed)
```bash
# Create .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. **Run the development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development

- **Hot Module Replacement**: Changes auto-reload
- **TypeScript Checking**: Type safety across the app
- **ESLint**: Code quality enforcement

## Project Structure

```
/
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Dashboard home page
│   ├── analytics/           # Sales analytics page
│   ├── forecast/            # ML forecasting page
│   ├── upload/              # File upload page
│   ├── reports/             # Reports and exports page
│   ├── profile/             # User profile page
│   └── auth/login/          # Login page
├── components/
│   └── KPICard.tsx          # Reusable KPI card component
├── lib/
│   ├── api-client.ts        # Centralized API client
│   ├── utils.ts             # Utility functions
│   └── mock-data.ts         # Mock data for testing
├── app/globals.css          # Global styles and theme
└── package.json
```

## Key Components

### KPICard Component
Reusable component for displaying key performance indicators:
```tsx
<KPICard
  title="Total Sales"
  value={kpis?.totalSales}
  unit="$"
  change={12.5}
  isPositive={true}
  icon={<TrendingUp />}
  loading={loading}
/>
```

### API Client
Centralized API client with automatic token management:
```tsx
import { apiClient } from '@/lib/api-client'

// Login
const response = await apiClient.login({ email, password })

// Fetch sales data
const data = await apiClient.getSalesData()

// Generate forecast
const forecast = await apiClient.generateForecast({ horizon: 30 })
```

## Design System

### Color Palette
- **Primary**: Deep Blue (`#8366d5`)
- **Accent**: Green (`#6db85f`)
- **Secondary**: Warm Orange (`#d9a62d`)
- **Background**: Light Gray (`#f8f8f8`)
- **Cards**: White with subtle borders

### Typography
- **Headings**: System font stack
- **Body**: System font stack
- **Mono**: For code/technical data

## Testing with Mock Data

To test without a backend:

1. Create a `.env.local` file with:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

2. Modify `lib/api-client.ts` to use mock data when backend is unavailable

3. Use the mock data utilities:
```tsx
import { generateMockSalesData, mockDashboardKPI } from '@/lib/mock-data'
```

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your repository
- Vercel auto-detects Next.js
- Add environment variables if needed

3. **Deploy**
```bash
vercel deploy
```

### Environment Variables (Production)
```
NEXT_PUBLIC_API_URL=<your-backend-url>
```

## Performance Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Use Next.js Image component
- **API Caching**: SWR with automatic revalidation
- **CSS**: Minimal CSS with Tailwind purging
- **JS Bundle**: Optimized with Tree Shaking

## Security Considerations

- **API Tokens**: Stored in localStorage (consider using httpOnly cookies in production)
- **CORS**: Configure backend to allow frontend origin
- **Input Validation**: Use Zod for schema validation
- **SQL Injection**: Always use parameterized queries on backend
- **Authentication**: Implement OAuth and JWT properly

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Advanced filtering and search
- [ ] Custom report builder
- [ ] Data quality monitoring
- [ ] Alerting system
- [ ] Mobile app (React Native)
- [ ] Dark mode toggle
- [ ] Multi-user collaboration
- [ ] API documentation portal
- [ ] Performance monitoring

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an GitHub issue
- Check documentation at [nextjs.org](https://nextjs.org)
- Review Recharts docs at [recharts.org](https://recharts.org)

---

**Created with v0** - Built for modern analytics applications
