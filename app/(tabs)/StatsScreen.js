// screens/StatsScreen.js
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
// import { VictoryAxis, VictoryBar, VictoryChart, VictoryLine } from 'victory-native';
import { auth, db } from '../../config/firebase';
import { calculateHeartRateStats, fetchHeartRateHistory } from '../../utils/heartRateUtils';
import { CLUBS, findMoodByKey } from './constants';
import { Section } from './ui';

export default function StatsScreen() {
  const [sessions, setSessions] = useState([]);
  const [heartRateHistory, setHeartRateHistory] = useState([]);
  const [heartRateStats, setHeartRateStats] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const q = query(collection(db, `users/${uid}/sessions`), orderBy('startedAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
    const byDay = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      byDay[d.toISOString().slice(0,10)] = null;
    }
    sessions.forEach(s => {
      const t = s.completedAt?.toDate?.() ?? s.startedAt?.toDate?.() ?? null;
      if (!t) return;
      const key = new Date(t).toISOString().slice(0,10);
      if (key in byDay) {
        const mk = s.moodAfter || s.moodBefore;
        const mood = findMoodByKey(mk);
        byDay[key] = mood ? mood.score : null;
      }
    });
    return Object.entries(byDay).map(([date, score]) => ({ x: date.slice(5), y: score ?? 0 }));
  }, [sessions]);

  // Club performance avg rating
  const clubPerf = useMemo(() => {
    const agg = {};
    sessions.forEach(s => {
      if (!s.clubId || s.rating == null) return;
      agg[s.clubId] = agg[s.clubId] || { total: 0, count: 0, name: CLUBS.find(c => c.id === s.clubId)?.name || s.clubId };
      agg[s.clubId].total += s.rating;
      agg[s.clubId].count += 1;
    });
    return Object.values(agg).map(({ total, count, name }) => ({ club: name, rating: count ? total / count : 0 }));
  }, [sessions]);

  // HR before vs after across sessions
  const hrSeries = useMemo(() => {
    const items = sessions
      .filter(s => s.hrBefore && s.hrAfter)
      .sort((a, b) => (a.startedAt?.seconds || 0) - (b.startedAt?.seconds || 0))
      .map((s, idx) => ({ x: idx + 1, before: s.hrBefore, after: s.hrAfter }));
    return items;
  }, [sessions]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 8 }}>📊 Your Stats</Text>

        <Section title="Mood (last 7 days)">
          {moodSeries.every(p => p.y === 0) ? (
            <Text>No data yet. Complete a session to see your mood trend.</Text>
          ) : (
            <View style={{ height: 200, backgroundColor: '#f8fafc', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#6b7280' }}>Mood chart temporarily disabled</Text>
            </View>
          )}
        </Section>

        <Section title="Club Performance Tracker (avg rating)">
          {clubPerf.length === 0 ? (
            <Text>No club sessions yet.</Text>
          ) : (
            <View style={{ height: 200, backgroundColor: '#f8fafc', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#6b7280' }}>Club performance chart temporarily disabled</Text>
            </View>
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
