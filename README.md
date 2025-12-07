# BreatheEasy Alert 🌬️

A web app that uses browser geolocation to deliver real-time hyperlocal air quality warnings and personalized action plans to prevent respiratory issues globally.

## ✨ Features

### Core Features

- **🌍 Real-time Air Quality**: Fetches live AQI data from OpenAQ API based on your location
  - Multiple API fallback methods for maximum reliability
  - Estimated data when no nearby monitoring stations are available
  - US EPA AQI calculation from PM2.5/PM10 concentrations

- **🤖 AI-Powered Personalized Alerts**: Uses Google Gemini AI to generate highly personalized alerts and action plans
  - Tailored recommendations based on your health profile
  - Context-aware suggestions for your specific situation
  - Fallback alerts when AI is unavailable

- **👤 User Profile System**: Build a comprehensive health profile for personalized recommendations
  - **Age Group**: Child, Adult, or Senior
  - **Health Conditions**: Asthma, COPD, Heart Disease, Pregnancy, or None
  - **Sensitivity Level**: Low, Moderate, High, or Very High
  - **Daily Outdoor Time**: Low, Moderate, or High
  - Editable profile with 3-step onboarding flow
  - Profile data stored locally for privacy

- **📊 Personalized Recommendations**: 
  - Recommendations adapt based on your profile
  - **For Asthma/COPD**: "Keep rescue inhaler nearby", "Use HEPA air purifier"
  - **For Children**: "Keep kids indoors", "Postpone outdoor play"
  - **For High Sensitivity**: Stricter precautions, lower AQI thresholds
  - **For High Outdoor Time**: Activity rescheduling suggestions, indoor alternatives

- **📤 Shareable Warnings**: Create and share air quality warning cards with your community
  - Web Share API integration
  - Copy to clipboard fallback
  - Downloadable alert cards

- **🗺️ Community Exposure Map**: Visualize air quality exposure zones on an interactive map
  - Leaflet.js integration with OpenStreetMap
  - Shows your location and air quality zones
  - Historical exposure points visualization
  - Color-coded pollution hotspots

- **📈 Exposure Tracking & Metrics**: Track your air quality history and impact
  - **Total Checks**: Number of times you've checked air quality
  - **Bad Exposures Avoided**: Count of times you avoided unhealthy air (AQI > 100)
  - **Average AQI**: Your average air quality index over time
  - 30-day exposure history
  - localStorage-based data persistence

### 🎯 Advanced Personalization Features

- **📊 Weekly Exposure Score**: 
  - **Personal Exposure Index**: 7-day rolling weighted sum of AQI × time spent outside
  - **Risk Assessment**: Low/Medium/High/Very High exposure bands vs WHO/EPA guidelines
  - **Risk Explanations**: Personalized explanations per risk level based on your profile
  - **Visual Indicators**: Color-coded risk badges and progress tracking

- **📋 Health-Aware Weekly Report**:
  - **AI-Generated Summary**: Gemini AI creates personalized weekly health reports
  - **Risk Explanation**: 2-3 sentence health risk assessment based on your average AQI and profile
  - **Top 5 Actions**: Personalized action items specific to your health conditions
  - **Week Comparison**: "What changed vs last week?" with better/worse analysis
  - **Trend Interpretation**: Long-term risk interpretation with actionable insights
  - **Smart Caching**: Reports cached for 24 hours to optimize API usage

- **⏱️ Time-in-Bad-Air Tracker**:
  - **Exposure Tracking**: Estimates minutes/hours spent in AQI > 100 and > 150
  - **Week-over-Week Comparison**: Percentage change with visual indicators
  - **Improvement Metrics**: "You spent ~4 hours in unhealthy air this week (↓ 30% from last week)"
  - **Personalized Estimates**: Based on your daily outdoor time profile setting

- **🎯 Goal-Based Coaching**:
  - **Set Custom Goals**: 
    - Target weekly exposure band (Low/Medium/High)
    - Max bad air days per week
    - Max weekly exposure index
  - **Progress Tracking**: Visual progress bars and goal status indicators
  - **AI Coaching Tips**: Gemini-generated personalized nudges to help you meet goals
  - **Real-time Feedback**: "To hit your goal, avoid outdoor running on very high AQI evenings this week"

- **🕐 Smart Routine & Calendar Suggestions**:
  - **Routine Setup**: Configure morning/evening activities and commute windows
  - **Best Hour Analysis**: Analyzes historical data to suggest optimal times for outdoor activities
  - **Personalized Recommendations**: "Best time for running: 6:00-7:00" based on your routine
  - **Calendar Integration**: Download .ics files for "clean-air time" blocks
  - **Copy to Clipboard**: Quick access to best times for planning

- **🔔 Trigger-Based Personalized Alerts**:
  - **Profile-Based Thresholds**: Auto-calculated AQI thresholds based on your health profile
    - Asthma/COPD users: Lower thresholds (e.g., 80 AQI)
    - High sensitivity: Even lower thresholds
    - Children/Seniors: More conservative thresholds
  - **Custom Thresholds**: Set your own AQI alert level
  - **Real-time Monitoring**: Alerts when current AQI exceeds your threshold
  - **Threshold Explanations**: AI explains why your threshold matters using WHO/EPA language

- **🧪 Pollutant-Specific Insights**:
  - **Dominant Pollutant Analysis**: Identifies which pollutant (PM2.5, PM10, NO2, O3) dominated your week
  - **Health Impact Cards**: "What this does to your body" explanations per pollutant
  - **Personalized Advice**: 
    - Traffic NO2 → "Avoid main roads"
    - PM2.5 → "Close windows, use air purifier"
    - Ozone → "Limit afternoon activities"
  - **Pollutant Breakdown**: Visual breakdown of all pollutants detected

- **📈 Risk Trajectory & Long-Term View**:
  - **4-Week Trend Chart**: Visual chart showing average weekly AQI and exposure index
  - **Trend Direction**: "Getting Safer / Stable / Getting Riskier" labels
  - **Consecutive High Exposure Warnings**: Alerts for 3+ weeks of high exposure
  - **AI Interpretation**: Gemini provides plain-language risk interpretation
  - **Long-Term Health Guidance**: "Three weeks in a row of high exposure can increase long-term heart and lung risk"

- **🎨 Beautiful UI/UX**: 
  - Modern, responsive design with Tailwind CSS
  - **Dark Mode Support**: Toggle between light and dark themes
  - System preference detection for automatic theme selection
  - Color-coded AQI indicators (Good, Moderate, Unhealthy, etc.)
  - Gradient backgrounds and smooth animations
  - Mobile-first responsive design
  - Accessible and user-friendly interface

- **📊 Sample Data Mode**: 
  - **Load Sample Data**: Visualize the app with realistic historical data
  - Perfect for demos, testing, or when real data isn't available
  - Generates 7 days of sample AQI readings (2-3 checks per day)
  - Includes sample profile, goals, routine, and trigger settings
  - **Clear Sample Data**: Remove sample data and return to real data mode

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS** for styling
- **Leaflet.js** for maps
- **OpenAQ API** for air quality data
- **Google Gemini AI** for personalized alerts
- **localStorage** for history and metrics

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Deployment

This app is ready to deploy on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your `VITE_GEMINI_API_KEY` in Vercel's environment variables
4. Deploy!

## 🚀 Usage

### First Time Setup

1. **Allow Location Access**: Grant location permissions when prompted (required for air quality data)

2. **Build Your Profile** (Optional but Recommended):
   - Complete the 3-step profile setup
   - Select your age group
   - Indicate any health conditions
   - Set your sensitivity level and outdoor time
   - You can skip this and edit later, but personalized recommendations require a profile

3. **View Your Air Quality**:
   - The app automatically fetches air quality data for your location
   - See your current AQI with color-coded indicators
   - View personalized alerts tailored to your profile

### Daily Usage

- **Toggle Dark Mode**: Click the sun/moon icon in the top right to switch themes
- **Check Air Quality**: Click "Refresh" to get the latest data
- **Load Sample Data**: Click "Load Sample Data" to see the app with demo data (great for testing!)
- **View Personalized Recommendations**: See AI-generated action plans based on your profile
- **Monitor Weekly Exposure**: Check your Personal Exposure Index and risk level
- **Review Weekly Report**: Read your AI-generated health-aware weekly summary
- **Track Goals**: Monitor progress toward your air quality goals
- **Check Trigger Alerts**: See if current AQI exceeds your personalized threshold
- **Get Best Times**: View recommended hours for outdoor activities
- **Share Alerts**: Use the share button to warn your community
- **Explore the Map**: See exposure zones and historical data
- **Track Your Impact**: Monitor how many bad exposures you've avoided
- **Edit Profile**: Update your profile anytime to refine recommendations

### Advanced Features Usage

- **Sample Data Mode**:
  - Click "Load Sample Data" button (top left) to populate the app with realistic demo data
  - Perfect for:
    - Testing all features without real location data
    - Demonstrating the app's capabilities
    - Understanding how features work with historical data
  - Generates 7 days of sample readings with varying AQI levels
  - Includes sample profile, goals, and settings
  - Click "Clear Sample Data" to remove and return to real data mode

- **Dark Mode**:
  - Click the sun/moon icon (top right) to toggle between light and dark themes
  - Theme preference is saved and persists across sessions
  - Automatically detects your system preference on first visit
  - All components support dark mode with proper contrast

- **Set Goals**: 
  1. Click "Set Goals" in the Goal Tracker card
  2. Choose your target exposure band or max bad air days
  3. Get AI coaching tips to help you achieve them

- **Configure Routine**:
  1. Click "Set Routine" in Routine Suggestions
  2. Enter your morning/evening activities and commute times
  3. Get personalized "best hour" recommendations
  4. Download calendar events for clean-air times

- **Customize Alerts**:
  1. Click "Configure" in Trigger-Based Alerts
  2. Use profile-based threshold (recommended) or set custom AQI level
  3. Get real-time alerts when air quality exceeds your threshold

- **View Weekly Report**:
  - Automatically generated once per week
  - Click "Refresh" to force regenerate (uses AI)
  - Cached for 24 hours to optimize performance

### Profile Management

- Click "Edit" on your profile card to update information
- Changes immediately update your personalized recommendations
- Profile data is stored locally in your browser (privacy-first)

## 📊 Impact Metrics

The app tracks your personal impact:

- **Total Checks**: Number of times you've checked air quality
- **Bad Exposures Avoided**: Count of times you avoided unhealthy air (AQI > 100)
- **Average AQI**: Your average air quality index over time

### How Personalization Works

The app uses your profile to provide recommendations:

- **Age-based**: Children and seniors get more conservative recommendations
- **Health-based**: Asthma/COPD users get specific medication and equipment reminders
- **Sensitivity-based**: Higher sensitivity = stricter precautions at lower AQI levels
- **Activity-based**: High outdoor time users get scheduling suggestions

### Example Personalized Alerts

**For User with Asthma + High Sensitivity:**
- "⚠️ As someone with asthma and high sensitivity, you're at elevated risk. Keep your rescue inhaler nearby and avoid all outdoor activities today."
- Actions: "Keep rescue inhaler nearby", "Use HEPA air purifier", "Avoid outdoor activities completely"

**For Child with Low Sensitivity:**
- "Keep children indoors and postpone outdoor play"
- Actions tailored for child safety with appropriate precautions

## 🔧 Technical Details

### API Integration

- **OpenAQ API v2**: 
  - Multiple endpoint fallbacks (latest measurements, locations)
  - Progressive radius expansion (10km → 50km → 100km)
  - Estimated data generation when no stations available
  - Handles CORS and network errors gracefully

- **Google Gemini AI**: 
  - Personalized alert generation
  - Profile-aware recommendations
  - Weekly health reports
  - Goal coaching tips
  - Risk trajectory interpretation
  - JSON-structured responses
  - Graceful fallback to rule-based alerts
  - Smart caching to minimize API calls

### Data Storage

- **localStorage** for:
  - User profile data
  - Air quality history (last 100 entries with pollutant data)
  - Profile snapshots with each check for weekly analysis
  - Exposure tracking (30-day history)
  - Impact metrics
  - Weekly exposure calculations
  - Goal settings and progress
  - Routine preferences
  - Trigger alert configurations
  - Weekly report cache (24-hour TTL)

### Browser Compatibility

- Modern browsers with geolocation support
- Web Share API (with clipboard fallback)
- localStorage support required
- CSS custom properties for dark mode (all modern browsers)

## 📝 API Credits

- **OpenAQ**: Free, open-source air quality data
- **Google Gemini**: AI-powered personalized alerts
- **OpenStreetMap**: Map tiles via Leaflet.js

## 🎯 Why It Fits Code for Impact

- **Global Impact**: Air pollution kills 7M yearly across all ages
- **Scalable**: 1 user can alert 100s via sharing
- **Measurable**: Clear metrics like "avoided 500 bad exposures today"
- **Unique**: Advanced personalization with weekly reports, goals, and long-term tracking
- **Comprehensive**: 8+ advanced features for deep personalization
- **AI-Powered**: Multiple Gemini AI integrations for personalized insights
- **Accessible**: Works on any device with a browser, no app install needed
- **Privacy-First**: All data stored locally, no server required
- **Actionable**: Goal-based coaching and routine suggestions drive behavior change
- **Health-Focused**: WHO/EPA-aligned recommendations with pollutant-specific advice

## 🛠️ Development

### Project Structure

```
breatheEasy/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx            # Main dashboard
│   │   ├── ProfileSetup.jsx          # Profile onboarding
│   │   ├── ProfileView.jsx           # Profile display/edit
│   │   ├── AQIDisplay.jsx            # AQI visualization
│   │   ├── AlertCard.jsx             # Personalized alerts
│   │   ├── ShareableCard.jsx         # Share functionality
│   │   ├── AirQualityMap.jsx         # Interactive map
│   │   ├── Metrics.jsx               # Impact metrics
│   │   ├── WeeklyExposureCard.jsx    # Weekly exposure score
│   │   ├── WeeklyReport.jsx          # Health-aware weekly report
│   │   ├── GoalTracker.jsx           # Goal-based coaching
│   │   ├── RoutineSuggestions.jsx    # Smart routine & calendar
│   │   ├── TriggerAlerts.jsx         # Custom alert thresholds
│   │   ├── PollutantInsights.jsx     # Pollutant-specific analysis
│   │   ├── RiskTrajectory.jsx        # 4-week trend visualization
│   │   ├── SampleDataButton.jsx      # Sample data loader
│   │   └── ThemeToggle.jsx          # Dark mode toggle
│   ├── contexts/
│   │   └── ThemeContext.jsx         # Theme context provider
│   ├── services/
│   │   ├── geolocation.js            # Location services
│   │   ├── openaq.js                 # OpenAQ API integration
│   │   ├── gemini.js                 # Gemini AI integration
│   │   ├── profile.js                # Profile management
│   │   ├── storage.js                # localStorage utilities
│   │   ├── weeklyExposure.js         # Weekly exposure calculations
│   │   ├── weeklyReport.js           # Weekly report generation
│   │   ├── goals.js                  # Goal tracking
│   │   ├── goalCoaching.js           # AI goal coaching
│   │   ├── routine.js                # Routine analysis & calendar
│   │   ├── triggerAlerts.js          # Custom alert thresholds
│   │   ├── trajectoryAnalysis.js     # Long-term trend analysis
│   │   └── sampleData.js             # Sample data generator
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── README.md
```

### Key Technologies

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Leaflet.js**: Interactive maps
- **React-Leaflet**: React bindings for Leaflet
- **Google Generative AI**: Gemini Pro model
- **Lucide React**: Icon library

## 📄 License

MIT

---

Built with ❤️ for Code for Impact

## 🆕 What's New

### Latest Features

- **🌙 Dark Mode**: Toggle between light and dark themes with system preference detection
- **📊 Sample Data Mode**: Load realistic demo data to visualize all features without real location data

### Advanced Personalization Suite

The app includes a comprehensive set of advanced personalization features:

1. **Weekly Exposure Analysis**: Track your 7-day Personal Exposure Index with risk assessments
2. **AI Weekly Reports**: Get personalized health summaries with actionable insights
3. **Time Tracking**: Monitor hours spent in unhealthy air with week-over-week comparisons
4. **Goal Setting**: Set and track air quality goals with AI coaching
5. **Smart Scheduling**: Get personalized "best hour" recommendations for outdoor activities
6. **Custom Alerts**: Profile-based or custom AQI thresholds with real-time monitoring
7. **Pollutant Insights**: Understand which pollutants affect you most with health impact explanations
8. **Long-Term Trends**: 4-week trajectory analysis with AI risk interpretation

All features work together to provide a complete, personalized air quality management system.

---

**Help prevent respiratory issues globally, one personalized alert at a time.** 🌬️✨

