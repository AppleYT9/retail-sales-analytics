# Deployment Guide - RetailAnalytics

Complete guide for deploying RetailAnalytics to production.

## Quick Deploy to Vercel (Recommended)

### Option 1: One-Click Deploy
1. Click the "Publish" button in the v0 interface
2. Connect your GitHub account
3. Vercel automatically detects Next.js
4. Configure environment variables (if needed)
5. Deploy

### Option 2: Manual Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts and confirm deployment
```

### Option 3: GitHub + Vercel Integration
1. Push project to GitHub
2. Go to vercel.com
3. Import your repository
4. Vercel auto-configures Next.js
5. Set environment variables
6. Deploy

## Environment Variables

Create `.env.production` or set in Vercel dashboard:

```
# Backend API URL (if you have a backend)
NEXT_PUBLIC_API_URL=https://your-api.com

# Next.js specific
NEXT_PUBLIC_GA_ID=your-analytics-id  # Optional: Google Analytics
```

## Pre-Deployment Checklist

- [ ] Run `pnpm build` locally - no errors
- [ ] Test all pages locally
- [ ] Update metadata in `app/layout.tsx` if needed
- [ ] Check environment variables are set
- [ ] Review and update `README.md` if needed
- [ ] Add favicon/logo if desired
- [ ] Test on mobile viewport

## Build and Test Locally

### Build
```bash
pnpm build
```

This creates an optimized production build in `.next/`.

### Test Production Build
```bash
pnpm build
pnpm start
```

Open http://localhost:3000 and test all features.

## Self-Hosted Deployment

### Prerequisites
- Node.js 18+ server
- npm or pnpm installed
- 512MB+ RAM

### Steps

1. **Clone/Pull Repository**
```bash
git clone your-repo-url
cd retailanalytics
```

2. **Install Dependencies**
```bash
pnpm install
```

3. **Build**
```bash
pnpm build
```

4. **Set Environment Variables**
```bash
export NEXT_PUBLIC_API_URL=https://your-backend.com
# Or create .env.production file
```

5. **Start Server**
```bash
pnpm start
```

The app runs on http://localhost:3000 by default.

6. **Use Process Manager (Recommended)**
```bash
# Using PM2
npm install -g pm2
pm2 start "pnpm start" --name "retailanalytics"
pm2 save
pm2 startup

# Or using supervisor/systemd
```

## Docker Deployment

### Create Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --prod

# Copy application
COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

### Build and Run Docker Image
```bash
docker build -t retailanalytics .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://your-api.com \
  retailanalytics
```

## Cloud Platform Deployment

### AWS EC2
1. Launch Ubuntu 22.04 instance
2. Connect via SSH
3. Install Node.js and pnpm
4. Clone repository
5. Follow "Self-Hosted Deployment" steps
6. Setup nginx as reverse proxy
7. Configure SSL with Let's Encrypt

### AWS Amplify
1. Connect GitHub repository
2. Select Next.js as framework
3. Configure build settings
4. Set environment variables
5. Deploy

### AWS Lightsail
1. Create Node.js container instance
2. Upload/clone project
3. Install dependencies
4. Build application
5. Configure port forwarding
6. Setup SSL

### DigitalOcean App Platform
1. Create new app
2. Connect GitHub repository
3. Auto-detects Next.js
4. Set environment variables
5. Deploy

### Heroku (Free tier ended, but instructions work on compatible platforms)
1. Create account and app
2. Connect GitHub
3. Enable automatic deploys
4. Add environment variables
5. Deploy

### Railway.app
1. Create new project
2. Select Next.js template or connect GitHub
3. Set environment variables
4. Deploy automatically
5. Get live URL

## Performance Optimization

### Build Optimization
The build already includes:
- Code splitting
- Tree shaking
- CSS purging
- Image optimization (ready for `next/image`)

### Runtime Optimization
- Pages cached with SWR
- API responses cached client-side
- CSS-in-JS minimized
- JavaScript tree-shaken

### Monitoring
Consider adding:
- Vercel Analytics (built-in)
- New Relic
- DataDog
- Sentry for error tracking

## SSL/HTTPS

### Automatic (Vercel)
Vercel provides free SSL certificates automatically.

### Self-Hosted with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Renew automatically
sudo certbot renew --dry-run
```

## Backup Strategy

### Code
- Push to GitHub regularly
- Tag releases: `git tag v1.0.0`

### Data (if applicable)
- Regular database backups
- Store backups separately
- Test restore procedures

## Monitoring & Logging

### Vercel Dashboard
- Automatic performance monitoring
- Function logs
- Deployment history

### Custom Logging
Add to `pnpm start` or server configuration:
- Winston/Morgan for request logging
- Sentry for error tracking
- Custom metrics

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

### Port Already in Use
```bash
# Use different port
PORT=3001 pnpm start
```

### Out of Memory
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 pnpm build
```

### API Errors in Production
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend is accessible
- Check CORS headers
- Review browser console logs

## Domain Configuration

### Add Custom Domain (Vercel)
1. Go to Vercel dashboard
2. Project Settings > Domains
3. Add custom domain
4. Update DNS records
5. Wait for verification (usually 24h)

### Update DNS Records
Point your domain to:
- For Vercel: `cname.vercel-dns.com`
- For other providers: IP provided by host

## Scaling Considerations

### For High Traffic
- Use CDN (Vercel uses Cloudflare)
- Enable caching headers
- Optimize images
- Consider serverless functions

### Database Scaling
When adding real database:
- Use connection pooling
- Add read replicas
- Implement caching layer (Redis)
- Monitor query performance

## CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm lint
      - name: Deploy to Vercel
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: vercel --prod --token $VERCEL_TOKEN
```

## Post-Deployment

### Verify
- [ ] Site loads on custom domain
- [ ] All pages accessible
- [ ] Charts display correctly
- [ ] Forms submit properly
- [ ] Mobile responsive

### Setup Monitoring
- [ ] Enable error tracking
- [ ] Configure alerts
- [ ] Setup uptime monitoring
- [ ] Monitor performance metrics

### Documentation
- [ ] Update API endpoint URLs
- [ ] Document deployment process
- [ ] Create runbooks for common issues
- [ ] Setup alerting for team

## Rollback Procedure

### Vercel
1. Go to Deployments tab
2. Find previous working deployment
3. Click "Promote to Production"

### GitHub
```bash
git revert <commit-hash>
git push origin main
# Redeploy
```

## Support & Resources

- **Vercel Docs**: vercel.com/docs
- **Next.js Docs**: nextjs.org/docs
- **Deployment Help**: vercel.com/help
- **Status**: vercel.com/status

---

**Deployment Guide Complete!** 🚀

Your RetailAnalytics app is ready for production. Start with Vercel for easiest deployment.
