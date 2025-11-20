// Script to check tutorial videos in Firebase
// Run this script to see what tutorials exist in your database

const { initializeApp } = require('firebase/app');
const { collection, getDocs, getFirestore, query } = require('firebase/firestore');

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

// Function to check tutorials in Firebase
async function checkTutorials() {
  try {
    console.log('🔍 Checking tutorials collection in Firebase...\n');
    
    const tutorialsRef = collection(db, 'tutorials');
    const q = query(tutorialsRef);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No tutorials found in the database!');
      console.log('\nTo fix this:');
      console.log('1. Run: node scripts/add-sample-tutorials.js');
      console.log('2. Or manually add tutorials in Firebase Console');
      return;
    }
    
    console.log(`✅ Found ${querySnapshot.size} tutorial(s)\n`);
    
    // Group by club type
    const tutorialsByClub = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const clubType = data.clubType || 'Unknown';
      
      if (!tutorialsByClub[clubType]) {
        tutorialsByClub[clubType] = [];
      }
      
      tutorialsByClub[clubType].push({
        id: doc.id,
        ...data
      });
    });
    
    // Display results
    console.log('📊 Tutorials by Club Type:');
    console.log('═'.repeat(80));
    
    Object.keys(tutorialsByClub).sort().forEach(clubType => {
      console.log(`\n🏌️  ${clubType} (${tutorialsByClub[clubType].length} video${tutorialsByClub[clubType].length > 1 ? 's' : ''})`);
      
      tutorialsByClub[clubType].forEach((tutorial, index) => {
        console.log(`  ${index + 1}. ${tutorial.title || 'Untitled'}`);
        console.log(`     ID: ${tutorial.id}`);
        console.log(`     Order: ${tutorial.order ?? 'missing'}`);
        console.log(`     Description: ${tutorial.description || 'N/A'}`);
        console.log(`     Duration: ${tutorial.duration || 'N/A'}`);
        console.log(`     Difficulty: ${tutorial.difficulty || 'N/A'}`);
        console.log(`     Video URL: ${tutorial.videoUrl ? '✓' : '✗'}`);
        
        // Check for issues
        const issues = [];
        if (!tutorial.order && tutorial.order !== 0) issues.push('Missing order field');
        if (!tutorial.videoUrl) issues.push('Missing videoUrl');
        if (!tutorial.title) issues.push('Missing title');
        
        if (issues.length > 0) {
          console.log(`     ⚠️  Issues: ${issues.join(', ')}`);
        }
        console.log('');
      });
    });
    
    // Check specifically for Driver
    console.log('═'.repeat(80));
    if (tutorialsByClub['Driver']) {
      console.log(`\n✅ Driver tutorials exist: ${tutorialsByClub['Driver'].length} video(s)`);
    } else {
      console.log('\n❌ No Driver tutorials found!');
      console.log('\nPossible issues:');
      console.log('1. The clubType field might have a different value (check spelling/case)');
      console.log('2. No documents exist for Driver yet');
      console.log('\nExisting club types in database:');
      Object.keys(tutorialsByClub).forEach(club => {
        console.log(`   - "${club}"`);
      });
    }
    
    console.log('\n✨ Check complete!');
    
  } catch (error) {
    console.error('❌ Error checking tutorials:', error);
    console.error('Error details:', error.message);
  }
}

// Run the script
checkTutorials().then(() => process.exit(0));

