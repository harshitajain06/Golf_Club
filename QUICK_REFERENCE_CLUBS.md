# 🏌️ Quick Reference: Club Types & Video Data

Quick lookup guide for adding videos to Firebase for each club type.

## 📋 Club Types (Use EXACTLY as shown)

| Club Type | clubType Value | Focus Area |
|-----------|---------------|------------|
| Driver | `"Driver"` | Energy & goal-setting |
| 3-Wood | `"3-Wood"` | Balance and alignment |
| 5-Wood | `"5-Wood"` | Mindfulness and presence |
| Hybrid | `"Hybrid"` | Adaptability and calm |
| 3-Iron | `"3-Iron"` | Precision and clarity |
| 5-Iron | `"5-Iron"` | Confidence and self-talk |
| 7-Iron | `"7-Iron"` | Patience and control |
| 9-Iron | `"9-Iron"` | Courage and risk-taking |
| Putter | `"Putter"` | Relaxation and finishing |

## 📊 Document Structure Template

```javascript
{
  // Required Fields
  title: "Video Title Here",
  description: "Brief description of what the video teaches",
  videoUrl: "https://www.youtube.com/watch?v=VIDEO_ID",
  clubType: "Driver", // ⚠️ Use exact name from table above
  order: 1, // Number: 1, 2, 3...
  duration: "5:30", // String: "MM:SS" format
  difficulty: "Beginner", // "Beginner", "Intermediate", or "Advanced"
  
  // Optional Fields
  thumbnailUrl: "https://images.unsplash.com/...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🚀 Quick Commands

```bash
# Add sample tutorials
node scripts/add-sample-tutorials.js

# Verify tutorials
node scripts/check-tutorials.js
```

## ⚡ Firebase Console Quick Steps

1. Go to Firebase Console → Your Project
2. Firestore Database → `tutorials` collection
3. Add document → Auto-ID
4. Add fields from template above
5. Save

## ✅ Common Mistakes to Avoid

❌ **Wrong:** `clubType: "driver"` (lowercase)  
✅ **Correct:** `clubType: "Driver"` (exact match)

❌ **Wrong:** `clubType: "7-iron"`  
✅ **Correct:** `clubType: "7-Iron"`

❌ **Wrong:** `order: "1"` (string)  
✅ **Correct:** `order: 1` (number)

❌ **Wrong:** `duration: 330` (seconds)  
✅ **Correct:** `duration: "5:30"` (MM:SS string)

## 🎯 Minimum Videos per Club

- **Beginner friendly:** 2-3 videos per club
- **Complete coverage:** 3-5 videos per club
- **Total recommended:** 25-35 videos across all clubs

## 📞 Troubleshooting One-Liners

| Issue | Solution |
|-------|----------|
| Videos not showing | Check `clubType` spelling (case-sensitive) |
| Videos out of order | Check `order` field is a number, not string |
| Video won't play | Test URL in browser first |
| Script fails | Run `npm install` then try again |
| Permission denied | Check Firestore security rules |

## 🔗 Full Documentation

See `FIREBASE_VIDEO_SETUP.md` for complete guide with:
- Sample data for all 9 clubs
- Step-by-step Firebase Console instructions
- Video hosting recommendations
- Detailed troubleshooting guide

