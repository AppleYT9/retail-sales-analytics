# Quick Start Guide - RetailAnalytics

Get up and running with RetailAnalytics in 2 minutes!

## Prerequisites
- Node.js 18+ (v20 recommended)
- pnpm (or npm/yarn)

## Installation & Running

### 1. Install Dependencies
```bash
cd /vercel/share/v0-project
pnpm install
```

### 2. Start Development Server
```bash
pnpm dev
```

### 3. Open in Browser
Navigate to `http://localhost:3000`

That's it! The app is now running.

## Features to Explore

### 📊 Dashboard (Home)
- View KPI cards with sales metrics
- See growth indicators
- Access quick action links

### 📈 Sales Analytics
- Explore interactive charts
- View revenue trends
- Analyze top products and categories
- Browse detailed sales table

### 🤖 Forecasting
- Generate sales predictions
- Set custom forecast horizon (7-180 days)
- View confidence intervals
- See historical vs predicted data

### 📤 Upload Data
- Drag and drop CSV/Excel files
- Preview data before uploading
- See upload status

### 📄 Reports
- Select report type
- Choose export format (PDF/Excel/CSV)
- Set date ranges
- Download business reports

### 👤 Profile
- View user information
- Manage account settings
- Toggle features like 2FA

## Demo Credentials

When testing with a backend (if available):
- **Email**: demo@example.com
- **Password**: demo123

## API Configuration

The app connects to a backend at `http://localhost:3001`

If your backend is elsewhere, set:
```bash
# In .env.local
NEXT_PUBLIC_API_URL=http://your-backend-url
```

## Without a Backend

The app will show errors when trying to fetch data. To test with mock data:

1. Modify `lib/api-client.ts` to return mock data
2. Or use the mock data utilities:
   ```typescript
   import { mockSalesData, mockDashboardKPI } from '@/lib/mock-data'
   ```

## Deployment

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Deploy to Other Platforms
```bash
pnpm build
pnpm start
```

Then follow your hosting provider's instructions.

## Project Commands

```bash
# Development
pnpm dev              # Start dev server

# Building
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint

# Other
pnpm format           # Format code (if configured)
```

## Useful URLs

- **App**: http://localhost:3000
- **Dashboard**: http://localhost:3000/
- **Analytics**: http://localhost:3000/analytics
- **Forecasting**: http://localhost:3000/forecast
- **Upload**: http://localhost:3000/upload
- **Reports**: http://localhost:3000/reports
- **Profile**: http://localhost:3000/profile
- **Login**: http://localhost:3000/auth/login

## File Upload Format

Expected CSV format:
```
Date,Category,Product,Quantity,Price,Region
2024-01-15,Electronics,Laptop Pro,2,1299.99,North America
2024-01-16,Accessories,Mouse,5,49.99,Europe
...
```

Supported formats: CSV, Excel (.xlsx), JSON

## Troubleshooting

### Backend API Errors
If you see "Failed to fetch KPIs" or "Backend API is not connected":
- Make sure your backend is running on http://localhost:3001
- Or set NEXT_PUBLIC_API_URL to your backend URL
- Or modify the API client to use mock data

### Port Already in Use
If port 3000 is already in use:
```bash
# Use a different port
pnpm dev -- -p 3001
```

### Node Modules Issues
If you have strange errors:
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

## Next Steps

1. **Explore the Code**
   - Check `components/KPICard.tsx` for reusable components
   - Review `lib/api-client.ts` for API integration pattern
   - Study `app/globals.css` for theme configuration

2. **Customize**
   - Modify colors in `app/globals.css`
   - Change API endpoints in `lib/api-client.ts`
   - Add your own components in `/components`

3. **Deploy**
   - Connect GitHub repository
   - Push to GitHub
   - Deploy to Vercel with one click

## Documentation

- **Main README**: See `README.md` for comprehensive documentation
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md` for technical details
- **API Reference**: Check `lib/api-client.ts` for API methods

## Need Help?

- 📖 Check the README.md for detailed documentation
- 🔍 Review the implementation summary
- 💬 Check the code comments
- 🐛 Enable browser DevTools for debugging

---

**Happy Analytics! 🚀**
