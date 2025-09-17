// utils/heartRateUtils.js
import { addDoc, collection, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Save heart rate data to Firebase
export const saveHeartRateData = async (uid, sessionId, heartRateData) => {
  try {
    // Update the session with heart rate data
    await updateDoc(doc(db, `users/${uid}/sessions/${sessionId}`), {
      ...heartRateData,
      updatedAt: serverTimestamp(),
    });

    // Also save to a separate heart rate collection for historical tracking
    await addDoc(collection(db, `users/${uid}/heartRateRecords`), {
      ...heartRateData,
      sessionId,
      createdAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Error saving heart rate data:', error);
    return false;
  }
};

// Fetch heart rate history for visualization
export const fetchHeartRateHistory = async (uid, limitCount = 50) => {
  try {
    const q = query(
      collection(db, `users/${uid}/heartRateRecords`),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const heartRateHistory = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.hrBefore && data.hrAfter) {
        heartRateHistory.push({
          id: doc.id,
          hrBefore: data.hrBefore,
          hrAfter: data.hrAfter,
          difference: data.hrAfter - data.hrBefore,
          createdAt: data.createdAt?.toDate() || new Date(),
          sessionId: data.sessionId,
        });
      }
    });
    
    return heartRateHistory.sort((a, b) => a.createdAt - b.createdAt);
  } catch (error) {
    console.error('Error fetching heart rate history:', error);
    return [];
  }
};

// Calculate heart rate statistics
export const calculateHeartRateStats = (heartRateHistory) => {
  if (!heartRateHistory || heartRateHistory.length === 0) {
    return {
      averageDifference: 0,
      maxDifference: 0,
      minDifference: 0,
      totalSessions: 0,
      averageHrBefore: 0,
      averageHrAfter: 0,
    };
  }

  const differences = heartRateHistory.map(record => record.difference);
  const hrBeforeValues = heartRateHistory.map(record => record.hrBefore);
  const hrAfterValues = heartRateHistory.map(record => record.hrAfter);

  return {
    averageDifference: Math.round(differences.reduce((sum, diff) => sum + diff, 0) / differences.length),
    maxDifference: Math.max(...differences),
    minDifference: Math.min(...differences),
    totalSessions: heartRateHistory.length,
    averageHrBefore: Math.round(hrBeforeValues.reduce((sum, hr) => sum + hr, 0) / hrBeforeValues.length),
    averageHrAfter: Math.round(hrAfterValues.reduce((sum, hr) => sum + hr, 0) / hrAfterValues.length),
  };
};
