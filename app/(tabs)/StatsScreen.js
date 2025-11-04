// screens/StatsScreen.js
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
// import { VictoryAxis, VictoryBar, VictoryChart, VictoryLine } from 'victory-native';
import { auth, db } from '../../config/firebase';
import { calculateHeartRateStats, fetchHeartRateHistory } from '../../utils/heartRateUtils';
import { findMoodByKey, MOODS } from './constants';
import { Section } from './ui';

export default function StatsScreen() {
  const [sessions, setSessions] = useState([]);
  const [heartRateHistory, setHeartRateHistory] = useState([]);
  const [heartRateStats, setHeartRateStats] = useState(null);
  const [moodChecks, setMoodChecks] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const q = query(collection(db, `users/${uid}/sessions`), orderBy('startedAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Load mood checks
  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const q = query(collection(db, `users/${uid}/moodChecks`), orderBy('ts', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const moodData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('Mood checks received:', moodData);
      setMoodChecks(moodData);
    });
    return unsub;
  }, []);

  // Load heart rate history
  useEffect(() => {
    if (!auth.currentUser) return;
    const loadHeartRateData = async () => {
      try {
        const history = await fetchHeartRateHistory(auth.currentUser.uid);
        setHeartRateHistory(history);
        setHeartRateStats(calculateHeartRateStats(history));
      } catch (error) {
        console.error('Error loading heart rate data:', error);
      }
    };
    loadHeartRateData();
  }, []);

  // Mood last 7 days
  const moodSeries = useMemo(() => {
    console.log('Processing mood series with moodChecks:', moodChecks);
    const byDay = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      byDay[d.toISOString().slice(0,10)] = null;
    }
    
    // Process mood checks for the last 7 days
    // Since moodChecks is ordered by 'desc', we want the most recent mood for each day
    moodChecks.forEach(moodCheck => {
      const t = moodCheck.ts?.toDate?.() ?? null;
      if (!t) return;
      const key = new Date(t).toISOString().slice(0,10);
      console.log('Processing mood check:', { moodKey: moodCheck.moodKey, date: key, timestamp: t });
      if (key in byDay && byDay[key] === null) { // Only set if not already set (most recent wins)
        const mood = findMoodByKey(moodCheck.moodKey);
        byDay[key] = mood ? mood.score : null;
        console.log('Set mood for', key, 'to', mood?.score);
      }
    });
    
    const result = Object.entries(byDay).map(([date, score]) => ({ 
      x: date.slice(5), 
      y: score ?? 0,
      date: date,
      hasData: score !== null
    }));
    console.log('Final mood series:', result);
    return result;
  }, [moodChecks]);


  // HR before vs after across sessions
  const hrSeries = useMemo(() => {
    const items = sessions
      .filter(s => s.hrBefore && s.hrAfter)
      .sort((a, b) => (a.startedAt?.seconds || 0) - (b.startedAt?.seconds || 0))
      .map((s, idx) => ({ x: idx + 1, before: s.hrBefore, after: s.hrAfter }));
    return items;
  }, [sessions]);

  // Simple Mood Chart Component
  const MoodChart = ({ data }) => {
    const maxScore = 6;
    const minScore = 1;
    const chartHeight = 120;
    const chartWidth = 280;
    const padding = 20;
    
    const getMoodEmoji = (score) => {
      const mood = MOODS.find(m => m.score === score);
      return mood ? mood.label : '😐';
    };
    
    const getMoodColor = (score) => {
      if (score <= 2) return '#ef4444'; // Red for sad
      if (score <= 3) return '#f59e0b'; // Orange for neutral
      if (score <= 4) return '#10b981'; // Green for okay
      return '#3b82f6'; // Blue for happy/great
    };

    return (
      <View style={{ height: 160, backgroundColor: '#f8fafc', borderRadius: 8, padding: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: chartHeight }}>
          {data.map((point, index) => (
            <View key={index} style={{ alignItems: 'center', flex: 1 }}>
              <View style={{ 
                height: point.hasData ? (point.y / maxScore) * (chartHeight - 40) : 0,
                width: 20,
                backgroundColor: point.hasData ? getMoodColor(point.y) : '#e5e7eb',
                borderRadius: 10,
                marginBottom: 8,
                opacity: point.hasData ? 1 : 0.3
              }} />
              <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                {point.x}
              </Text>
              <Text style={{ fontSize: 16 }}>
                {point.hasData ? getMoodEmoji(point.y) : '—'}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Legend */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
            <View style={{ width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: 4, marginRight: 4 }} />
            <Text style={{ fontSize: 10, color: '#6b7280' }}>Sad</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
            <View style={{ width: 8, height: 8, backgroundColor: '#10b981', borderRadius: 4, marginRight: 4 }} />
            <Text style={{ fontSize: 10, color: '#6b7280' }}>Good</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 8, height: 8, backgroundColor: '#3b82f6', borderRadius: 4, marginRight: 4 }} />
            <Text style={{ fontSize: 10, color: '#6b7280' }}>Great</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 8 }}>📊 Your Stats</Text>

        <Section title="Mood (last 7 days)">
          {moodSeries.every(p => !p.hasData) ? (
            <Text>No mood data yet. Check in with your mood to see your trend.</Text>
          ) : (
            <MoodChart data={moodSeries} />
          )}
        </Section>


        <Section title="❤️ Heart Rate Statistics">
          {heartRateStats && heartRateStats.totalSessions > 0 ? (
            <View>
              <View style={statsContainer}>
                <View style={statItem}>
                  <Text style={statValue}>{heartRateStats.totalSessions}</Text>
                  <Text style={statLabel}>Total Sessions</Text>
                </View>
                <View style={statItem}>
                  <Text style={statValue}>{heartRateStats.averageHrBefore}</Text>
                  <Text style={statLabel}>Avg Before (bpm)</Text>
                </View>
                <View style={statItem}>
                  <Text style={statValue}>{heartRateStats.averageHrAfter}</Text>
                  <Text style={statLabel}>Avg After (bpm)</Text>
                </View>
              </View>
              
              <View style={statsContainer}>
                <View style={statItem}>
                  <Text style={[statValue, { color: heartRateStats.averageDifference > 0 ? '#ef4444' : '#10b981' }]}>
                    {heartRateStats.averageDifference > 0 ? '+' : ''}{heartRateStats.averageDifference}
                  </Text>
                  <Text style={statLabel}>Avg Difference (bpm)</Text>
                </View>
                <View style={statItem}>
                  <Text style={statValue}>{heartRateStats.maxDifference}</Text>
                  <Text style={statLabel}>Max Increase (bpm)</Text>
                </View>
                <View style={statItem}>
                  <Text style={statValue}>{heartRateStats.minDifference}</Text>
                  <Text style={statLabel}>Min Change (bpm)</Text>
                </View>
              </View>

              <View style={{ marginTop: 16, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' }}>
                  Recent Sessions:
                </Text>
                {heartRateHistory.slice(-5).map((record, index) => (
                  <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, color: '#6b7280' }}>
                      Session {heartRateHistory.length - 4 + index}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#374151' }}>
                      {record.hrBefore} → {record.hrAfter} 
                      <Text style={{ color: record.difference > 0 ? '#ef4444' : '#10b981' }}>
                        {' '}({record.difference > 0 ? '+' : ''}{record.difference})
                      </Text>
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={{ color: '#6b7280' }}>
              No heart rate data available. Complete some practice sessions to see your statistics.
            </Text>
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const statsContainer = {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginBottom: 12,
  paddingVertical: 12,
  backgroundColor: '#f8fafc',
  borderRadius: 8,
};

const statItem = {
  alignItems: 'center',
  flex: 1,
};

const statValue = {
  fontSize: 18,
  fontWeight: '700',
  color: '#1f2937',
};

const statLabel = {
  fontSize: 12,
  color: '#6b7280',
  marginTop: 2,
  textAlign: 'center',
};
