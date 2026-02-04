// utils/performanceUtils.js
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Calculate session performance metrics
 */
export const calculateSessionPerformance = (performanceData) => {
  const {
    confidenceBefore,
    confidenceAfter,
    focusScore,
  } = performanceData;

  const confidenceShift = confidenceAfter - confidenceBefore;
  const overallSessionQuality = Math.round(
    (confidenceAfter + focusScore) / 2
  );

  return {
    confidenceShift,
    focusScore,
    overallSessionQuality,
    confidenceBefore,
    confidenceAfter,
  };
};

/**
 * Calculate calmness index
 */
export const calculateCalmnessIndex = (calmnessData) => {
  const {
    hrBefore,
    hrAfter,
    moodBefore,
    moodAfter,
  } = calmnessData;

  if (!hrBefore || !hrAfter) {
    return null;
  }

  const hrChange = hrAfter - hrBefore;
  const hrChangePercent = Math.round((hrChange / hrBefore) * 100);
  
  // Calmness percentage: negative change is better (calmer)
  // We normalize this to a 0-100 scale where 0% = very agitated, 100% = very calm
  const calmnessPercent = Math.max(0, Math.min(100, 50 - hrChangePercent));
  
  const moodChange = moodAfter && moodBefore ? moodAfter - moodBefore : 0;

  return {
    hrChange,
    hrChangePercent,
    calmnessPercent,
    moodChange,
    hrBefore,
    hrAfter,
    moodBefore,
    moodAfter,
  };
};

/**
 * Calculate club performance summary
 */
export const calculateClubPerformance = (clubSessions) => {
  if (!clubSessions || clubSessions.length === 0) {
    return null;
  }

  const consistencyScores = clubSessions
    .map(s => s.consistencyScore)
    .filter(s => s !== null && s !== undefined);
  
  const decisionClarityScores = clubSessions
    .map(s => s.decisionClarity)
    .filter(s => s !== null && s !== undefined);
  
  const emotionalImprovements = clubSessions
    .map(s => s.emotionalImprovement)
    .filter(s => s !== null && s !== undefined);

  const avgConsistency = consistencyScores.length > 0
    ? Math.round(consistencyScores.reduce((a, b) => a + b, 0) / consistencyScores.length)
    : null;
  
  const avgDecisionClarity = decisionClarityScores.length > 0
    ? Math.round(decisionClarityScores.reduce((a, b) => a + b, 0) / decisionClarityScores.length)
    : null;
  
  const avgEmotionalImprovement = emotionalImprovements.length > 0
    ? Math.round(emotionalImprovements.reduce((a, b) => a + b, 0) / emotionalImprovements.length)
    : null;

  // Calculate consistency trend (improving, stable, declining)
  let consistencyTrend = 'stable';
  if (consistencyScores.length >= 2) {
    const recent = consistencyScores.slice(-3);
    const older = consistencyScores.slice(0, -3);
    if (older.length > 0) {
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
      if (recentAvg > olderAvg + 0.5) consistencyTrend = 'improving';
      else if (recentAvg < olderAvg - 0.5) consistencyTrend = 'declining';
    }
  }

  return {
    totalSessions: clubSessions.length,
    avgConsistency,
    avgDecisionClarity,
    avgEmotionalImprovement,
    consistencyTrend,
  };
};

/**
 * Fetch performance data for timeline
 */
export const fetchPerformanceTimeline = async (uid, period = 'month') => {
  try {
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    const sessionsRef = collection(db, `users/${uid}/sessions`);
    const q = query(
      sessionsRef,
      orderBy('startedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const sessions = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const sessionDate = data.startedAt?.toDate?.() || new Date();
      
      if (sessionDate >= startDate) {
        sessions.push({
          id: doc.id,
          ...data,
          date: sessionDate,
        });
      }
    });

    return sessions.sort((a, b) => a.date - b.date);
  } catch (error) {
    console.error('Error fetching performance timeline:', error);
    return [];
  }
};

/**
 * Calculate performance trends
 */
export const calculatePerformanceTrends = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return {
      confidence: { trend: 'no_data', change: 0 },
      focus: { trend: 'no_data', change: 0 },
      calmness: { trend: 'no_data', change: 0 },
      emotionalStability: { trend: 'no_data', change: 0 },
      sessionConsistency: { trend: 'no_data', change: 0 },
    };
  }

  // Confidence trends
  const confidenceScores = sessions
    .map(s => s.confidenceAfter)
    .filter(s => s !== null && s !== undefined);
  
  const confidenceChange = confidenceScores.length >= 2
    ? Math.round(((confidenceScores[confidenceScores.length - 1] - confidenceScores[0]) / confidenceScores[0]) * 100)
    : 0;

  // Focus trends
  const focusScores = sessions
    .map(s => s.focusScore)
    .filter(s => s !== null && s !== undefined);
  
  const focusChange = focusScores.length >= 2
    ? Math.round(((focusScores[focusScores.length - 1] - focusScores[0]) / focusScores[0]) * 100)
    : 0;

  // Calmness trends (from heart rate changes)
  const calmnessScores = sessions
    .map(s => {
      if (s.hrBefore && s.hrAfter) {
        const hrChange = s.hrAfter - s.hrBefore;
        return Math.max(0, Math.min(100, 50 - Math.round((hrChange / s.hrBefore) * 100)));
      }
      return null;
    })
    .filter(s => s !== null);
  
  const calmnessChange = calmnessScores.length >= 2
    ? Math.round(calmnessScores[calmnessScores.length - 1] - calmnessScores[0])
    : 0;

  // Emotional stability (from mood changes)
  // Helper function to convert mood key to score
  const getMoodScore = (mood) => {
    if (typeof mood === 'number') return mood; // Already a score
    if (typeof mood === 'string') {
      // Try to find mood by key (would need to import, but for now assume it's a score if numeric string)
      const moodMap = {
        'extremely_sad': 1, 'sad': 2, 'neutral': 3,
        'okay': 4, 'happy': 5, 'great': 6
      };
      return moodMap[mood] || null;
    }
    return null;
  };

  const emotionalStabilityScores = sessions
    .map(s => {
      const moodBeforeScore = getMoodScore(s.moodBefore);
      const moodAfterScore = getMoodScore(s.moodAfter);
      if (moodBeforeScore !== null && moodAfterScore !== null) {
        return Math.abs(moodAfterScore - moodBeforeScore); // Lower is more stable
      }
      return null;
    })
    .filter(s => s !== null);
  
  const emotionalStabilityChange = emotionalStabilityScores.length >= 2
    ? Math.round(((emotionalStabilityScores[0] - emotionalStabilityScores[emotionalStabilityScores.length - 1]) / emotionalStabilityScores[0]) * 100)
    : 0;

  // Session consistency (from consistency scores)
  const consistencyScores = sessions
    .map(s => s.consistencyScore)
    .filter(s => s !== null && s !== undefined);
  
  const consistencyChange = consistencyScores.length >= 2
    ? Math.round(((consistencyScores[consistencyScores.length - 1] - consistencyScores[0]) / consistencyScores[0]) * 100)
    : 0;

  return {
    confidence: {
      trend: confidenceChange > 5 ? 'improving' : confidenceChange < -5 ? 'declining' : 'stable',
      change: confidenceChange,
    },
    focus: {
      trend: focusChange > 5 ? 'improving' : focusChange < -5 ? 'declining' : 'stable',
      change: focusChange,
    },
    calmness: {
      trend: calmnessChange > 5 ? 'improving' : calmnessChange < -5 ? 'declining' : 'stable',
      change: calmnessChange,
    },
    emotionalStability: {
      trend: emotionalStabilityChange > 5 ? 'improving' : emotionalStabilityChange < -5 ? 'declining' : 'stable',
      change: emotionalStabilityChange,
    },
    sessionConsistency: {
      trend: consistencyChange > 5 ? 'improving' : consistencyChange < -5 ? 'declining' : 'stable',
      change: consistencyChange,
    },
  };
};

/**
 * Get club-by-club insights
 */
export const getClubInsights = (sessions) => {
  if (!sessions || sessions.length === 0) {
    return [];
  }

  const clubGroups = {};
  
  sessions.forEach(session => {
    const clubName = session.clubName || 'Unknown';
    if (!clubGroups[clubName]) {
      clubGroups[clubName] = [];
    }
    clubGroups[clubName].push(session);
  });

  const insights = Object.entries(clubGroups).map(([clubName, clubSessions]) => {
    const performance = calculateClubPerformance(clubSessions);
    
    // Calculate composure score (combination of consistency, calmness, emotional improvement)
    const composureScores = clubSessions.map(s => {
      let score = 0;
      let count = 0;
      
      if (s.consistencyScore !== null && s.consistencyScore !== undefined) {
        score += s.consistencyScore;
        count++;
      }
      
      if (s.hrBefore && s.hrAfter) {
        const hrChange = s.hrAfter - s.hrBefore;
        const calmness = Math.max(0, Math.min(10, 10 - (hrChange / 5))); // Normalize to 0-10
        score += calmness;
        count++;
      }
      
      if (s.emotionalImprovement !== null && s.emotionalImprovement !== undefined) {
        score += s.emotionalImprovement;
        count++;
      }
      
      return count > 0 ? score / count : null;
    }).filter(s => s !== null);
    
    const avgComposure = composureScores.length > 0
      ? Math.round((composureScores.reduce((a, b) => a + b, 0) / composureScores.length) * 10) / 10
      : null;

    // Calculate fluctuation (standard deviation of composure scores)
    const fluctuation = composureScores.length >= 2
      ? Math.round(Math.sqrt(
          composureScores.reduce((sum, score) => {
            const mean = composureScores.reduce((a, b) => a + b, 0) / composureScores.length;
            return sum + Math.pow(score - mean, 2);
          }, 0) / composureScores.length
        ) * 10) / 10
      : null;

    return {
      clubName,
      ...performance,
      avgComposure,
      fluctuation,
      sessionCount: clubSessions.length,
    };
  });

  return insights.sort((a, b) => {
    // Sort by composure (highest first), then by session count
    if (a.avgComposure !== null && b.avgComposure !== null) {
      return b.avgComposure - a.avgComposure;
    }
    return b.sessionCount - a.sessionCount;
  });
};
