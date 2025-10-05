# Tutorial Videos Setup Guide

This guide explains how to set up tutorial videos in your Firebase console for the Practice Screen.

## Overview

The Practice Screen now includes a "Tutorial Videos" section that fetches and displays videos from Firebase Firestore. Users can tap on videos to watch them in a modal player.

## Firebase Collection Structure

The app expects a `tutorials` collection in Firestore with the following document structure:

```json
{
  "title": "Driver Setup and Grip",
  "description": "Learn the proper setup position and grip technique for the driver",
  "videoUrl": "https://www.youtube.com/embed/VIDEO_ID",
  "duration": "5:30",
  "difficulty": "Beginner",
  "clubType": "Driver",
  "order": 1,
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Field Descriptions

- **title** (string): The display name of the tutorial
- **description** (string): Brief description of what the tutorial covers
- **videoUrl** (string): YouTube embed URL or direct video URL
- **duration** (string): Video duration in MM:SS format
- **difficulty** (string): "Beginner", "Intermediate", or "Advanced"
- **clubType** (string): The golf club this tutorial is for (e.g., "Driver", "7 Iron", "Putter")
- **order** (number): Display order for videos of the same club type
- **thumbnailUrl** (string, optional): Thumbnail image URL
- **createdAt** (timestamp): When the tutorial was created
- **updatedAt** (timestamp): When the tutorial was last updated

## Setting Up Tutorial Videos

### Option 1: Use the Sample Script

1. Run the sample script to add placeholder tutorials:
   ```bash
   node scripts/add-sample-tutorials.js
   ```

2. Go to your Firebase Console
3. Navigate to Firestore Database
4. Find the "tutorials" collection
5. Replace the sample video URLs with actual YouTube or video URLs

### Option 2: Manual Setup

1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Create a new collection called "tutorials"
4. Add documents with the structure shown above

## Video URL Formats

### YouTube Videos
Use the embed format:
```
https://www.youtube.com/embed/VIDEO_ID
```

### Direct Video URLs
Use direct links to video files:
```
https://example.com/path/to/video.mp4
```

## Club Types

The app supports these club types (matching the breathing exercises):
- Driver
- 3 Wood
- 5 Wood
- 3 Hybrid
- 5 Hybrid
- 3 Iron
- 4 Iron
- 5 Iron
- 6 Iron
- 7 Iron
- 8 Iron
- 9 Iron
- Pitching Wedge
- Sand Wedge
- Putter

## Features

### Video Display
- Videos are displayed in cards with thumbnails
- Each card shows title, description, duration, and difficulty
- Videos are filtered by the current club type
- Videos are ordered by the "order" field

### Video Player
- Tap any video card to open the video player modal
- Uses react-native-video for better cross-platform video playback
- Supports fullscreen video and native video controls
- Shows loading states while videos load
- Displays video information below the player
- Includes error handling with retry functionality

### Loading States
- Shows loading spinner while fetching videos
- Displays "No videos available" message when no videos exist for a club
- Handles errors gracefully with user-friendly messages

## Testing

1. Add some tutorial videos to your Firebase console
2. Navigate to the Practice Screen
3. Select a golf club
4. Scroll to the "Tutorial Videos" section
5. Tap on a video to test the player

## Troubleshooting

### Videos Not Loading
- Check that the `tutorials` collection exists in Firestore
- Verify that documents have the correct `clubType` field
- Ensure video URLs are valid and accessible

### Video Player Issues
- For YouTube videos, use direct video URLs or embed URLs
- For direct video URLs, ensure the video format is supported by react-native-video (MP4, MOV, etc.)
- Check that the video URL is accessible from the device
- If videos don't play, try using direct video file URLs instead of YouTube embed URLs

### Performance
- Consider using thumbnail images to improve loading performance
- Limit the number of videos per club type for better performance
- Use appropriate video quality for mobile devices

## Future Enhancements

Potential improvements for the tutorial system:
- Video progress tracking
- User ratings and reviews
- Offline video caching
- Video categories and tags
- Search functionality
- Video transcripts
- Multiple language support
