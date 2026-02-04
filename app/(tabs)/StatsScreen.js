// screens/StatsScreen.js
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
// import { VictoryAxis, VictoryBar, VictoryChart, VictoryLine } from 'victory-native';
import { auth, db } from '../../config/firebase';
import { calculateHeartRateStats, fetchHeartRateHistory } from '../../utils/heartRateUtils';
import { calculatePerformanceTrends, getClubInsights } from '../../utils/performanceUtils';
import { findMoodByKey, MOODS } from './constants';
import { Section } from './ui';

export default function StatsScreen() {
  const [sessions, setSessions] = useState([]);
  const [heartRateHistory, setHeartRateHistory] = useState([]);
  const [heartRateStats, setHeartRateStats] = useState(null);
  const [moodChecks, setMoodChecks] = useState([]);
  const [timelinePeriod, setTimelinePeriod] = useState('month'); // 'week' or 'month'

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

  // Filter sessions for timeline period
  const timelineSessions = useMemo(() => {
    const now = new Date();
    const startDate = new Date();
    
    if (timelinePeriod === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    return sessions
      .filter(s => {
        const sessionDate = s.startedAt?.toDate?.() || new Date(s.startedAt?.seconds * 1000);
        return sessionDate >= startDate;
      })
      .sort((a, b) => {
        const dateA = a.startedAt?.toDate?.() || new Date(a.startedAt?.seconds * 1000);
        const dateB = b.startedAt?.toDate?.() || new Date(b.startedAt?.seconds * 1000);
        return dateA - dateB;
      });
  }, [sessions, timelinePeriod]);

  // Calculate performance trends
  const performanceTrends = useMemo(() => {
    return calculatePerformanceTrends(timelineSessions);
  }, [timelineSessions]);

  // Get club insights
  const clubInsights = useMemo(() => {
    return getClubInsights(timelineSessions);
  }, [timelineSessions]);

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

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return '📈';
    if (trend === 'declining') return '📉';
    return '➡️';
  };

  const getTrendColor = (trend) => {
    if (trend === 'improving') return '#10b981';
    if (trend === 'declining') return '#ef4444';
    return '#6b7280';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 8 }}>📊 Performance Tracker</Text>

        {/* Performance Timeline */}
        <Section title="4️⃣ Performance Timeline">
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => setTimelinePeriod('week')}
              style={[
                periodBtn,
                timelinePeriod === 'week' && periodBtnActive
              ]}
            >
              <Text style={[periodBtnText, timelinePeriod === 'week' && periodBtnTextActive]}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTimelinePeriod('month')}
              style={[
                periodBtn,
                timelinePeriod === 'month' && periodBtnActive,
                { marginLeft: 8 }
              ]}
            >
              <Text style={[periodBtnText, timelinePeriod === 'month' && periodBtnTextActive]}>
                Month
              </Text>
            </TouchableOpacity>
          </View>

          {timelineSessions.length === 0 ? (
            <Text style={{ color: '#6b7280' }}>
              No performance data for this {timelinePeriod}. Complete some sessions to see your trends.
            </Text>
          ) : (
            <View>
              {/* Confidence Trend */}
              {performanceTrends.confidence.trend !== 'no_data' && (
                <View style={trendItem}>
                  <Text style={trendLabel}>
                    {getTrendIcon(performanceTrends.confidence.trend)} Confidence
                  </Text>
                  <Text style={[trendValue, { color: getTrendColor(performanceTrends.confidence.trend) }]}>
                    {performanceTrends.confidence.change >= 0 ? '+' : ''}{performanceTrends.confidence.change}%
                  </Text>
                </View>
              )}

              {/* Focus Trend */}
              {performanceTrends.focus.trend !== 'no_data' && (
                <View style={trendItem}>
                  <Text style={trendLabel}>
                    {getTrendIcon(performanceTrends.focus.trend)} Focus
                  </Text>
                  <Text style={[trendValue, { color: getTrendColor(performanceTrends.focus.trend) }]}>
                    {performanceTrends.focus.change >= 0 ? '+' : ''}{performanceTrends.focus.change}%
                  </Text>
                </View>
              )}

              {/* Calmness Trend */}
              {performanceTrends.calmness.trend !== 'no_data' && (
                <View style={trendItem}>
                  <Text style={trendLabel}>
                    {getTrendIcon(performanceTrends.calmness.trend)} Calmness
                  </Text>
                  <Text style={[trendValue, { color: getTrendColor(performanceTrends.calmness.trend) }]}>
                    {performanceTrends.calmness.change >= 0 ? '+' : ''}{performanceTrends.calmness.change}%
                  </Text>
                </View>
              )}

              {/* Emotional Stability Trend */}
              {performanceTrends.emotionalStability.trend !== 'no_data' && (
                <View style={trendItem}>
                  <Text style={trendLabel}>
                    {getTrendIcon(performanceTrends.emotionalStability.trend)} Emotional Stability
                  </Text>
                  <Text style={[trendValue, { color: getTrendColor(performanceTrends.emotionalStability.trend) }]}>
                    {performanceTrends.emotionalStability.change >= 0 ? '+' : ''}{performanceTrends.emotionalStability.change}%
                  </Text>
                </View>
              )}

              {/* Session Consistency Trend */}
              {performanceTrends.sessionConsistency.trend !== 'no_data' && (
                <View style={trendItem}>
                  <Text style={trendLabel}>
                    {getTrendIcon(performanceTrends.sessionConsistency.trend)} Session Consistency
                  </Text>
                  <Text style={[trendValue, { color: getTrendColor(performanceTrends.sessionConsistency.trend) }]}>
                    {performanceTrends.sessionConsistency.change >= 0 ? '+' : ''}{performanceTrends.sessionConsistency.change}%
                  </Text>
                </View>
              )}

              {/* Summary Insights */}
              {timelineSessions.length > 0 && (
                <View style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f9ff', borderRadius: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#1e40af' }}>
                    Key Insights ({timelinePeriod === 'week' ? 'This Week' : 'This Month'}):
                  </Text>
                  {performanceTrends.confidence.trend !== 'no_data' && (
                    <Text style={{ fontSize: 13, color: '#1e40af', marginBottom: 4 }}>
                      • Confidence {performanceTrends.confidence.trend === 'improving' ? 'improved' : performanceTrends.confidence.trend === 'declining' ? 'declined' : 'remained stable'} by {Math.abs(performanceTrends.confidence.change)}%
                    </Text>
                  )}
                  {performanceTrends.focus.trend !== 'no_data' && (
                    <Text style={{ fontSize: 13, color: '#1e40af', marginBottom: 4 }}>
                      • Focus {performanceTrends.focus.trend === 'improving' ? 'improved' : performanceTrends.focus.trend === 'declining' ? 'declined' : 'remained stable'}
                    </Text>
                  )}
                  {performanceTrends.calmness.trend !== 'no_data' && (
                    <Text style={{ fontSize: 13, color: '#1e40af', marginBottom: 4 }}>
                      • Calmness {performanceTrends.calmness.trend === 'improving' ? 'improved' : performanceTrends.calmness.trend === 'declining' ? 'declined' : 'remained stable'}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </Section>

        {/* Club-by-Club Insights */}
        {clubInsights.length > 0 && (
          <Section title="🏌️ Club Performance Insights">
            {clubInsights.map((insight, index) => (
              <View key={index} style={{ marginBottom: 16, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#1f2937' }}>
                  {insight.clubName}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, color: '#6b7280' }}>Sessions:</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151' }}>{insight.sessionCount}</Text>
                </View>
                {insight.avgConsistency !== null && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, color: '#6b7280' }}>Avg Consistency:</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151' }}>{insight.avgConsistency}/10</Text>
                  </View>
                )}
                {insight.avgComposure !== null && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, color: '#6b7280' }}>Avg Composure:</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151' }}>{insight.avgComposure}/10</Text>
                  </View>
                )}
                {insight.fluctuation !== null && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 13, color: '#6b7280' }}>Fluctuation:</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: insight.fluctuation > 2 ? '#ef4444' : '#10b981' }}>
                      {insight.fluctuation > 2 ? 'High' : 'Low'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            
            {/* Summary of best/worst clubs */}
            {clubInsights.length >= 2 && (
              <View style={{ marginTop: 16, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#166534' }}>
                  Club Summary:
                </Text>
                {clubInsights.filter(c => c.avgComposure !== null).length > 0 && (
                  <>
                    <Text style={{ fontSize: 13, color: '#166534', marginBottom: 4 }}>
                      • Strongest composure: {clubInsights.filter(c => c.avgComposure !== null).slice(0, 2).map(c => c.clubName).join(', ')}
                    </Text>
                    {clubInsights.filter(c => c.fluctuation !== null && c.fluctuation > 2).length > 0 && (
                      <Text style={{ fontSize: 13, color: '#166534' }}>
                        • Most fluctuation: {clubInsights.filter(c => c.fluctuation !== null && c.fluctuation > 2).map(c => c.clubName).join(', ')}
                      </Text>
                    )}
                  </>
                )}
              </View>
            )}
          </Section>
        )}

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

const periodBtn = {
  flex: 1,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
  backgroundColor: '#f3f4f6',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#e5e7eb',
};

const periodBtnActive = {
  backgroundColor: '#3b82f6',
  borderColor: '#2563eb',
};

const periodBtnText = {
  fontSize: 14,
  fontWeight: '600',
  color: '#6b7280',
};

const periodBtnTextActive = {
  color: '#ffffff',
};

const trendItem = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 8,
  borderBottomWidth: 1,
  borderBottomColor: '#e5e7eb',
};

const trendLabel = {
  fontSize: 14,
  color: '#374151',
  flex: 1,
};

const trendValue = {
  fontSize: 14,
  fontWeight: '700',
};
