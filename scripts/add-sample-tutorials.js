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

// Sample tutorial videos data for ALL 9 club types
const sampleTutorials = [
  // ========== DRIVER ==========
  {
    title: "Driver Setup and Grip",
    description: "Master the proper setup position and grip technique for maximum distance with the driver",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "5:30",
    difficulty: "Beginner",
    clubType: "Driver",
    order: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400"
  },
  {
    title: "Driver Swing Mechanics",
    description: "Learn the full swing motion focusing on energy transfer and goal-oriented techniques",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "7:15",
    difficulty: "Intermediate",
    clubType: "Driver",
    order: 2,
    thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
  },
  {
    title: "Driver Distance Control",
    description: "Advanced techniques for controlling distance and maintaining accuracy off the tee",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "8:45",
    difficulty: "Advanced",
    clubType: "Driver",
    order: 3,
    thumbnailUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400"
  },
  
  // ========== 3-WOOD ==========
  {
    title: "3-Wood Setup and Balance",
    description: "Perfect your balance and alignment with the 3-wood for fairway success",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "6:00",
    difficulty: "Beginner",
    clubType: "3-Wood",
    order: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400"
  },
  {
    title: "3-Wood Off the Deck",
    description: "Learn to hit confident fairway woods with proper balance and alignment",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "7:30",
    difficulty: "Intermediate",
    clubType: "3-Wood",
    order: 2,
    thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
  },
  
  // ========== 5-WOOD ==========
  {
    title: "5-Wood Mindfulness Fundamentals",
    description: "Stay present and mindful while executing 5-wood shots from any lie",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "5:45",
    difficulty: "Beginner",
    clubType: "5-Wood",
    order: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400"
  },
  {
    title: "5-Wood Shot Versatility",
    description: "Master different 5-wood shots with mindful presence and awareness",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "8:00",
    difficulty: "Intermediate",
    clubType: "5-Wood",
    order: 2,
    thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
  },
  
  // ========== HYBRID ==========
  {
    title: "Hybrid Club Basics",
    description: "Learn adaptability and stay calm under pressure with hybrid clubs",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "6:30",
    difficulty: "Beginner",
    clubType: "Hybrid",
    order: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400"
  },
  {
    title: "Hybrid Shot Versatility",
    description: "Adapt to any situation with hybrid clubs - rough, fairway, or tight lies",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "7:45",
    difficulty: "Intermediate",
    clubType: "Hybrid",
    order: 2,
    thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
  },
  
  // ========== 3-IRON ==========
  {
    title: "3-Iron Precision Setup",
    description: "Develop precision and mental clarity with long iron fundamentals",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "6:15",
    difficulty: "Intermediate",
    clubType: "3-Iron",
    order: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400"
  },
  {
    title: "3-Iron Ball Flight Control",
    description: "Master precision shots with clear mental focus and proper technique",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "8:20",
    difficulty: "Advanced",
    clubType: "3-Iron",
    order: 2,
    thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
  },
  
  // ========== 5-IRON ==========
  {
    title: "5-Iron Confidence and Self-Talk",
    description: "Build confidence with positive self-talk and solid 5-iron fundamentals",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "5:50",
    difficulty: "Beginner",
    clubType: "5-Iron",
    order: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400"
  },
  {
    title: "5-Iron Mental Approach",
    description: "Combine confident technique with powerful positive self-talk for consistent iron play",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "7:00",
    difficulty: "Intermediate",
    clubType: "5-Iron",
    order: 2,
    thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
  },
  
  // ========== 7-IRON ==========
  {
    title: "7-Iron Patience and Control",
    description: "Learn patience and ball control with the most versatile club in the bag",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "6:45",
    difficulty: "Beginner",
    clubType: "7-Iron",
    order: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400"
  },
  {
    title: "7-Iron Distance Control",
    description: "Master patient, controlled swings for consistent distance with 7-iron",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "8:10",
    difficulty: "Intermediate",
    clubType: "7-Iron",
    order: 2,
    thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
  },
  {
    title: "7-Iron Shot Shaping",
    description: "Advanced control techniques for shaping shots with patience and precision",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "9:00",
    difficulty: "Advanced",
    clubType: "7-Iron",
    order: 3,
    thumbnailUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400"
  },
  
  // ========== 9-IRON ==========
  {
    title: "9-Iron Courage and Risk-Taking",
    description: "Build courage to take risks and attack pins with short irons",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "5:30",
    difficulty: "Beginner",
    clubType: "9-Iron",
    order: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400"
  },
  {
    title: "9-Iron Aggressive Pin Hunting",
    description: "Learn when to take risks and how to execute aggressive short iron shots",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "7:20",
    difficulty: "Intermediate",
    clubType: "9-Iron",
    order: 2,
    thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
  },
  
  // ========== PUTTER ==========
  {
    title: "Putting Fundamentals and Relaxation",
    description: "Develop a relaxed putting routine for finishing strong on the greens",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "4:30",
    difficulty: "Beginner",
    clubType: "Putter",
    order: 1,
    thumbnailUrl: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400"
  },
  {
    title: "Putting Distance Control",
    description: "Master distance control while staying relaxed and confident on the greens",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "6:00",
    difficulty: "Intermediate",
    clubType: "Putter",
    order: 2,
    thumbnailUrl: "https://images.unsplash.com/photo-1593111774240-d529f12cf4b4?w=400"
  },
  {
    title: "Putting Mental Game and Finishing",
    description: "Develop mental toughness and relaxation techniques for pressure putts",
    videoUrl: "https://www.youtube.com/watch?v=8V4FyvnGk0U",
    duration: "7:30",
    difficulty: "Advanced",
    clubType: "Putter",
    order: 3,
    thumbnailUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400"
  }
];

// Function to add tutorials to Firebase
async function addSampleTutorials() {
  try {
    console.log('🎥 Adding sample tutorial videos to Firebase...\n');
    console.log(`Total tutorials to add: ${sampleTutorials.length}`);
    console.log('═'.repeat(60));
    
    let count = 0;
    const clubCounts = {};
    
    for (const tutorial of sampleTutorials) {
      await addDoc(collection(db, 'tutorials'), {
        ...tutorial,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      count++;
      clubCounts[tutorial.clubType] = (clubCounts[tutorial.clubType] || 0) + 1;
      console.log(`✓ [${count}/${sampleTutorials.length}] ${tutorial.clubType}: ${tutorial.title}`);
    }
    
    console.log('═'.repeat(60));
    console.log('\n✅ All sample tutorials added successfully!\n');
    
    console.log('📊 Summary by Club Type:');
    Object.keys(clubCounts).sort().forEach(club => {
      console.log(`   • ${club}: ${clubCounts[club]} video${clubCounts[club] > 1 ? 's' : ''}`);
    });
    
    console.log('\n📝 Next Steps:');
    console.log('1. Run: node scripts/check-tutorials.js (to verify)');
    console.log('2. Go to Firebase Console → Firestore Database');
    console.log('3. View the "tutorials" collection');
    console.log('4. Replace sample video URLs with real golf tutorial URLs');
    console.log('5. Test the app to see videos in the Practice Screen\n');
    
    console.log('💡 Tip: See FIREBASE_VIDEO_SETUP.md for detailed documentation');
    
  } catch (error) {
    console.error('❌ Error adding tutorials:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your Firebase configuration in config/firebase.js');
    console.error('2. Verify Firestore is enabled in Firebase Console');
    console.error('3. Check Firestore security rules allow writes');
  }
}

// Run the script
addSampleTutorials();
