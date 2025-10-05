// Script to add sample tutorial videos to Firebase
// Run this script to populate your Firebase console with sample tutorial data

import { initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore } from 'firebase/firestore';

// Your Firebase config (same as in config/firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyBap_zf0Nhghp3K-LCCqSAU6kYA8lnEvBc",
  authDomain: "golf-club-522dd.firebaseapp.com",
  projectId: "golf-club-522dd",
  storageBucket: "golf-club-522dd.firebasestorage.app",
  messagingSenderId: "600567638058",
  appId: "1:600567638058:web:f35064a411ba9625713b53",
  measurementId: "G-WN87MY8N6X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample tutorial videos data
const sampleTutorials = [
  // Driver tutorials
  {
    title: "Driver Setup and Grip",
    description: "Learn the proper setup position and grip technique for the driver",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U", // Real golf tutorial video
    duration: "5:30",
    difficulty: "Beginner",
    clubType: "Driver",
    order: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=300&h=200&fit=crop&crop=center",
    // Fallback video URL for better compatibility
    fallbackVideoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
  },
  {
    title: "Driver Swing Mechanics",
    description: "Master the full swing motion for maximum distance with the driver",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U", // Real golf tutorial video
    duration: "7:15",
    difficulty: "Intermediate",
    clubType: "Driver",
    order: 2,
    thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=300&h=200&fit=crop&crop=center"
  },
  
  // Iron tutorials
  {
    title: "Iron Ball Striking",
    description: "Perfect your ball striking technique with irons",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U", // Real golf tutorial video
    duration: "6:45",
    difficulty: "Beginner",
    clubType: "7 Iron",
    order: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop&crop=center"
  },
  {
    title: "Iron Distance Control",
    description: "Learn to control distance and trajectory with different irons",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U", // Real golf tutorial video
    duration: "8:20",
    difficulty: "Intermediate",
    clubType: "7 Iron",
    order: 2,
    thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=300&h=200&fit=crop&crop=center"
  },
  
  // Wedge tutorials
  {
    title: "Wedge Short Game",
    description: "Master the short game with wedges around the green",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U", // Real golf tutorial video
    duration: "9:10",
    difficulty: "Intermediate",
    clubType: "Pitching Wedge",
    order: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop&crop=center"
  },
  
  // Putter tutorials
  {
    title: "Putting Fundamentals",
    description: "Learn the basics of putting technique and alignment",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U", // Real golf tutorial video
    duration: "4:30",
    difficulty: "Beginner",
    clubType: "Putter",
    order: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=300&h=200&fit=crop&crop=center"
  },
  {
    title: "Putting Distance Control",
    description: "Develop feel and distance control on the putting green",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U", // Real golf tutorial video
    duration: "6:00",
    difficulty: "Intermediate",
    clubType: "Putter",
    order: 2,
    thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=300&h=200&fit=crop&crop=center"
  }
];

// Function to add tutorials to Firebase
async function addSampleTutorials() {
  try {
    console.log('Adding sample tutorial videos to Firebase...');
    
    for (const tutorial of sampleTutorials) {
      await addDoc(collection(db, 'tutorials'), {
        ...tutorial,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`Added tutorial: ${tutorial.title} for ${tutorial.clubType}`);
    }
    
    console.log('✅ All sample tutorials added successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to your Firebase Console');
    console.log('2. Navigate to Firestore Database');
    console.log('3. You should see a "tutorials" collection');
    console.log('4. Replace the sample video URLs with actual YouTube or video URLs');
    console.log('5. Test the app to see the videos in the Practice Screen');
    
  } catch (error) {
    console.error('❌ Error adding tutorials:', error);
  }
}

// Run the script
addSampleTutorials();
