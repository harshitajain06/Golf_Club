# 🎥 Firebase Video Tutorial Setup Guide

Complete guide for adding tutorial videos to your Golf Club App for all club types.

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Data Structure](#data-structure)
- [All Club Types](#all-club-types)
- [Adding Videos](#adding-videos)
- [Sample Data for Each Club](#sample-data-for-each-club)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
Run the automated script to add sample tutorials:
```bash
node scripts/add-sample-tutorials.js
```

### Option 2: Manual Setup
Follow the instructions below to manually add videos through Firebase Console.

---

## 📊 Data Structure

### Firestore Collection
**Collection Name:** `tutorials`

### Required Fields for Each Video Document

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `title` | String | ✅ Yes | Video title | "Driver Setup Position" |
| `description` | String | ✅ Yes | Brief description | "Learn proper setup and alignment" |
| `videoUrl` | String | ✅ Yes | Video URL (YouTube or direct) | "https://youtube.com/..." |
| `clubType` | String | ✅ Yes | Must match club name exactly | "Driver" |
| `order` | Number | ✅ Yes | Sort order (1, 2, 3...) | 1 |
| `duration` | String | ✅ Yes | Video length (MM:SS) | "5:30" |
| `difficulty` | String | ✅ Yes | Skill level | "Beginner" |
| `thumbnailUrl` | String | ❌ Optional | Thumbnail image URL | "https://..." |
| `createdAt` | Timestamp | ❌ Optional | Creation date | Auto-generated |
| `updatedAt` | Timestamp | ❌ Optional | Last update date | Auto-generated |

### Difficulty Levels
- `"Beginner"` - For new golfers
- `"Intermediate"` - For developing golfers
- `"Advanced"` - For experienced golfers

---

## 🏌️ All Club Types

Your app supports these 9 club types. **Use the exact names** shown below for the `clubType` field:

| Club ID | Club Name | Focus Area |
|---------|-----------|------------|
| `driver` | **Driver** | Energy & goal-setting |
| `3w` | **3-Wood** | Balance and alignment |
| `5w` | **5-Wood** | Mindfulness and presence |
| `hyb` | **Hybrid** | Adaptability and calm under pressure |
| `3i` | **3-Iron** | Precision and clarity |
| `5i` | **5-Iron** | Confidence and self-talk |
| `7i` | **7-Iron** | Patience and control |
| `9i` | **9-Iron** | Courage and risk-taking |
| `putter` | **Putter** | Relaxation and finishing strong |

---

## 📝 Adding Videos

### Method 1: Firebase Console (Manual)

1. **Open Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `golf-club-522dd`

2. **Navigate to Firestore Database**
   - Click "Firestore Database" in the left sidebar
   - Click "Start collection" (if first time) or find existing `tutorials` collection

3. **Create Collection**
   - Collection ID: `tutorials`
   - Click "Next"

4. **Add Document**
   - Click "Auto-ID" to generate document ID (or provide custom ID)
   - Add fields using the table below:

5. **Add Each Field**
   - Click "Add field"
   - Enter field name, select type, and enter value
   - Repeat for all required fields

6. **Save Document**
   - Click "Save"
   - Repeat for each video tutorial

### Method 2: Using Scripts

**Add Sample Data:**
```bash
node scripts/add-sample-tutorials.js
```

**Verify Data:**
```bash
node scripts/check-tutorials.js
```

---

## 🎬 Sample Data for Each Club

### 🏌️ Driver Tutorials

#### Video 1: Driver Setup and Grip
```javascript
{
  title: "Driver Setup and Grip",
  description: "Master the proper setup position and grip technique for maximum distance with the driver",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "Driver",
  order: 1,
  duration: "5:30",
  difficulty: "Beginner",
  thumbnailUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400"
}
```

#### Video 2: Driver Swing Mechanics
```javascript
{
  title: "Driver Swing Mechanics",
  description: "Learn the full swing motion focusing on energy transfer and goal-oriented techniques",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "Driver",
  order: 2,
  duration: "7:15",
  difficulty: "Intermediate",
  thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
}
```

#### Video 3: Driver Distance Control
```javascript
{
  title: "Driver Distance Control",
  description: "Advanced techniques for controlling distance and maintaining accuracy off the tee",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "Driver",
  order: 3,
  duration: "8:45",
  difficulty: "Advanced",
  thumbnailUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400"
}
```

---

### 🌲 3-Wood Tutorials

#### Video 1: 3-Wood Setup and Balance
```javascript
{
  title: "3-Wood Setup and Balance",
  description: "Perfect your balance and alignment with the 3-wood for fairway success",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "3-Wood",
  order: 1,
  duration: "6:00",
  difficulty: "Beginner",
  thumbnailUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400"
}
```

#### Video 2: 3-Wood Off the Deck
```javascript
{
  title: "3-Wood Off the Deck",
  description: "Learn to hit confident fairway woods with proper balance and alignment",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "3-Wood",
  order: 2,
  duration: "7:30",
  difficulty: "Intermediate",
  thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
}
```

---

### 🌲 5-Wood Tutorials

#### Video 1: 5-Wood Fundamentals
```javascript
{
  title: "5-Wood Mindfulness Fundamentals",
  description: "Stay present and mindful while executing 5-wood shots from any lie",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "5-Wood",
  order: 1,
  duration: "5:45",
  difficulty: "Beginner",
  thumbnailUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400"
}
```

#### Video 2: 5-Wood Versatility
```javascript
{
  title: "5-Wood Shot Versatility",
  description: "Master different 5-wood shots with mindful presence and awareness",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "5-Wood",
  order: 2,
  duration: "8:00",
  difficulty: "Intermediate",
  thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
}
```

---

### 🔄 Hybrid Tutorials

#### Video 1: Hybrid Basics
```javascript
{
  title: "Hybrid Club Basics",
  description: "Learn adaptability and stay calm under pressure with hybrid clubs",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "Hybrid",
  order: 1,
  duration: "6:30",
  difficulty: "Beginner",
  thumbnailUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400"
}
```

#### Video 2: Hybrid Versatility
```javascript
{
  title: "Hybrid Shot Versatility",
  description: "Adapt to any situation with hybrid clubs - rough, fairway, or tight lies",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "Hybrid",
  order: 2,
  duration: "7:45",
  difficulty: "Intermediate",
  thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
}
```

---

### 🎯 3-Iron Tutorials

#### Video 1: 3-Iron Precision
```javascript
{
  title: "3-Iron Precision Setup",
  description: "Develop precision and mental clarity with long iron fundamentals",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "3-Iron",
  order: 1,
  duration: "6:15",
  difficulty: "Intermediate",
  thumbnailUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400"
}
```

#### Video 2: 3-Iron Control
```javascript
{
  title: "3-Iron Ball Flight Control",
  description: "Master precision shots with clear mental focus and proper technique",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "3-Iron",
  order: 2,
  duration: "8:20",
  difficulty: "Advanced",
  thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
}
```

---

### 🎯 5-Iron Tutorials

#### Video 1: 5-Iron Confidence Building
```javascript
{
  title: "5-Iron Confidence and Self-Talk",
  description: "Build confidence with positive self-talk and solid 5-iron fundamentals",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "5-Iron",
  order: 1,
  duration: "5:50",
  difficulty: "Beginner",
  thumbnailUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400"
}
```

#### Video 2: 5-Iron Mental Game
```javascript
{
  title: "5-Iron Mental Approach",
  description: "Combine confident technique with powerful positive self-talk for consistent iron play",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "5-Iron",
  order: 2,
  duration: "7:00",
  difficulty: "Intermediate",
  thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
}
```

---

### 🎯 7-Iron Tutorials

#### Video 1: 7-Iron Fundamentals
```javascript
{
  title: "7-Iron Patience and Control",
  description: "Learn patience and ball control with the most versatile club in the bag",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "7-Iron",
  order: 1,
  duration: "6:45",
  difficulty: "Beginner",
  thumbnailUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400"
}
```

#### Video 2: 7-Iron Distance Control
```javascript
{
  title: "7-Iron Distance Control",
  description: "Master patient, controlled swings for consistent distance with 7-iron",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "7-Iron",
  order: 2,
  duration: "8:10",
  difficulty: "Intermediate",
  thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
}
```

#### Video 3: 7-Iron Shot Shaping
```javascript
{
  title: "7-Iron Shot Shaping",
  description: "Advanced control techniques for shaping shots with patience and precision",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "7-Iron",
  order: 3,
  duration: "9:00",
  difficulty: "Advanced",
  thumbnailUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400"
}
```

---

### 🎯 9-Iron Tutorials

#### Video 1: 9-Iron Courage and Basics
```javascript
{
  title: "9-Iron Courage and Risk-Taking",
  description: "Build courage to take risks and attack pins with short irons",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "9-Iron",
  order: 1,
  duration: "5:30",
  difficulty: "Beginner",
  thumbnailUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400"
}
```

#### Video 2: 9-Iron Aggressive Play
```javascript
{
  title: "9-Iron Aggressive Pin Hunting",
  description: "Learn when to take risks and how to execute aggressive short iron shots",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "9-Iron",
  order: 2,
  duration: "7:20",
  difficulty: "Intermediate",
  thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
}
```

---

### ⛳ Putter Tutorials

#### Video 1: Putting Fundamentals
```javascript
{
  title: "Putting Fundamentals and Relaxation",
  description: "Develop a relaxed putting routine for finishing strong on the greens",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "Putter",
  order: 1,
  duration: "4:30",
  difficulty: "Beginner",
  thumbnailUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400"
}
```

#### Video 2: Putting Distance Control
```javascript
{
  title: "Putting Distance Control",
  description: "Master distance control while staying relaxed and confident on the greens",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "Putter",
  order: 2,
  duration: "6:00",
  difficulty: "Intermediate",
  thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
}
```

#### Video 3: Putting Mental Game
```javascript
{
  title: "Putting Mental Game and Finishing",
  description: "Develop mental toughness and relaxation techniques for pressure putts",
  videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
  clubType: "Putter",
  order: 3,
  duration: "7:30",
  difficulty: "Advanced",
  thumbnailUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400"
}
```

---

## 🎥 Video URL Formats

### YouTube Videos
**Option 1: Standard URL**
```
https://www.youtube.com/watch?v=VIDEO_ID
```

**Option 2: Embed URL (Recommended)**
```
https://www.youtube.com/embed/VIDEO_ID
```

### Direct Video Files
```
https://yourdomain.com/path/to/video.mp4
```

### Recommended Video Hosting
- **YouTube** - Free, reliable, good mobile support
- **Vimeo** - Professional, customizable player
- **Firebase Storage** - For private videos
- **AWS S3 / CloudFront** - For scalable hosting

---

## ✅ Verification

### Step 1: Run Check Script
After adding videos, verify them:
```bash
node scripts/check-tutorials.js
```

### Expected Output:
```
🔍 Checking tutorials collection in Firebase...

✅ Found 25 tutorial(s)

📊 Tutorials by Club Type:
════════════════════════════════════════════════════════════════════════════════

🏌️  3-Iron (2 videos)
  1. 3-Iron Precision Setup
     ID: xyz123
     Order: 1
     Duration: 6:15
     Difficulty: Intermediate
     Video URL: ✓
...
```

### Step 2: Test in App
1. Open your Golf Club app
2. Log in or create an account
3. Select a club from the home screen
4. Scroll to "Tutorial Videos" section
5. Tap on a video to play
6. Verify video plays correctly

---

## 🐛 Troubleshooting

### Problem: No Videos Showing in App

**Solution 1: Check Collection Name**
- Collection must be named exactly `tutorials` (lowercase)
- Verify in Firebase Console

**Solution 2: Check clubType Field**
- Must match club names exactly (case-sensitive)
- Valid values: "Driver", "3-Wood", "5-Wood", "Hybrid", "3-Iron", "5-Iron", "7-Iron", "9-Iron", "Putter"

**Solution 3: Check Required Fields**
Run verification script:
```bash
node scripts/check-tutorials.js
```
This will highlight missing fields with ⚠️ warnings

### Problem: Videos Won't Play

**Solution 1: Check Video URL**
- Test URL in browser first
- Use direct video URLs or YouTube embed URLs
- Avoid URLs that require authentication

**Solution 2: Check Video Format**
- Supported: MP4, MOV, M4V
- Not supported: AVI, WMV, FLV

**Solution 3: Check CORS Settings**
If using custom hosting, ensure CORS is enabled for your domain

### Problem: Videos Loading Slowly

**Solution 1: Optimize Video Files**
- Compress videos before uploading
- Recommended: 720p resolution, 2-5 MB per minute

**Solution 2: Use CDN**
- Host videos on CDN (CloudFront, Firebase CDN)
- Use YouTube for free CDN hosting

### Problem: Script Errors

**Error: `Cannot find module 'firebase/app'`**
```bash
npm install
# or
npm install firebase
```

**Error: `Permission denied`**
- Check Firebase rules in console
- Ensure Firestore rules allow read access:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tutorials/{tutorial} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 📊 Database Statistics

After following this guide, you'll have:
- **9 Club Types** covered
- **~25 Tutorial Videos** (sample data provided)
- **3 Difficulty Levels** for progressive learning
- **Complete coverage** of all clubs in your app

---

## 🔗 Related Files

- **Check Script**: `scripts/check-tutorials.js`
- **Add Script**: `scripts/add-sample-tutorials.js`
- **Firebase Config**: `config/firebase.js`
- **Club Constants**: `app/(tabs)/constants.js`
- **Practice Screen**: `app/(tabs)/PracticeScreen.js`

---

## 📞 Support

If you encounter issues:
1. Run `node scripts/check-tutorials.js` to diagnose
2. Check Firebase Console for data
3. Review Firestore rules
4. Check network connectivity
5. Verify video URLs are accessible

---

## 🎯 Next Steps

1. ✅ Add videos for each club type
2. ✅ Verify using check script
3. ✅ Test in the app
4. ✅ Replace sample videos with real content
5. ✅ Add more videos based on user feedback

---

**Created**: November 2024  
**Updated**: November 2024  
**Version**: 1.0

