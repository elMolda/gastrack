# GasTrack Deployment Guide

## Prerequisites

1. **GitHub Account** - For repository hosting
2. **Vercel Account** - For deployment (free tier available)
3. **Supabase Account** - Already created with database schema

## Deployment Steps

### 1. Push Code to GitHub

```bash
# Add all files to git
git add .

# Commit changes
git commit -m "feat: Add Supabase data layer with authentication"

# Push to GitHub
git push origin main
```

### 2. Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "Add New" → "Project"**
3. **Import your GitHub repository**
4. **Vercel will auto-detect SvelteKit** and configure the build settings automatically

### 3. Configure Environment Variables in Vercel

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Click **Add New**
3. Add the following variables **one by one**:

**First variable:**
- **Name**: `PUBLIC_SUPABASE_URL`
- **Value**: `https://dhbgrxahiqnglxwtejqb.supabase.co`
- Click **Save**

**Second variable:**
- **Name**: `PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoYmdyeGFoaXFuZ2x4d3RlanFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzMTE0MDcsImV4cCI6MjA5OTg4NzQwN30.npGCyD9xXgoPJDziiBhOf90J3Jyh5-wusKfHyDWnhhg`
- Click **Save**

**Important**: Add these as plain environment variables, NOT as secrets. Vercel will auto-detect the SvelteKit project configuration.

### 4. Deploy

1. Click **Deploy** in Vercel dashboard
2. Wait for build to complete
3. Your app will be available at `https://your-project.vercel.app`

## Testing the Application

### 1. Create a Test User
1. Visit your deployed app
2. Click "Register" to create a new account
3. Fill in the car setup form (mandatory after registration)
4. You should be redirected to the dashboard

### 2. Test Real-time Features
1. Add a new fuel log from the "Add Log" page
2. The dashboard should automatically update with the new data
3. Check that statistics are calculated correctly

## Database Management

### Access Supabase Dashboard
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project: `dhbgrxahiqnglxwtejqb`
3. You can:
   - View tables in **Table Editor**
   - Run SQL queries in **SQL Editor**
   - Monitor usage in **Project Settings**

### Database Schema
The schema has been created with:
- **Users table** (extends Supabase Auth)
- **Cars table** (user vehicles)
- **Fuel logs table** (fuel tracking data)
- **Row Level Security (RLS)** enabled
- **Automatic timestamps** (created_at, updated_at)

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check Supabase project URL and anon key
   - Verify RLS policies are enabled
   - Ensure `auth.users` table exists

2. **Database Connection Issues**
   - Verify environment variables in Vercel
   - Check Supabase project is active
   - Ensure database schema was applied

3. **Build Failures**
   - Check Node.js version (requires 18+)
   - Verify all dependencies in package.json
   - Check build logs in Vercel dashboard

### Logs & Monitoring

1. **Vercel Logs**: Project dashboard → **Logs** tab
2. **Supabase Logs**: Project dashboard → **Logs** → **Database Logs**
3. **Application Logs**: Check browser console for client-side errors

## Maintenance

### Regular Tasks
1. **Monitor Usage**: Check Supabase and Vercel usage metrics
2. **Backup Database**: Use Supabase backup feature
3. **Update Dependencies**: Run `npm update` periodically

### Scaling Considerations
- **Free Tier Limits**: Both Vercel and Supabase have free tier limits
- **Upgrade Plans**: Consider upgrading if you exceed limits
- **Database Indexing**: Add indexes for frequently queried columns

## Support

For issues:
1. Check the [GitHub repository](https://github.com/elMolda/gastrack) for updates
2. Review Supabase documentation at [supabase.com/docs](https://supabase.com/docs)
3. Check SvelteKit documentation at [svelte.dev/docs](https://svelte.dev/docs)

The end