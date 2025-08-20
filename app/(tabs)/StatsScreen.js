// screens/StatsScreen.js
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { auth, db } from '../../config/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Section } from './ui';
import { VictoryBar, VictoryChart, VictoryLine, VictoryTheme, VictoryAxis } from 'victory-native';
import { CLUBS, findMoodByKey } from './constants';

export default function StatsScreen() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const q = query(collection(db, `users/${uid}/sessions`), orderBy('startedAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
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
            <VictoryChart theme={VictoryTheme.material} domain={{ y: [0, 6] }}>
              <VictoryAxis tickFormat={(t) => t} />
              <VictoryAxis dependentAxis tickFormat={(t) => ['', '😭','😞','😐','🙂','😄','🤩'][t]} />
              <VictoryLine data={moodSeries} x="x" y="y" />
            </VictoryChart>
          )}
        </Section>

        <Section title="Club Performance Tracker (avg rating)">
          {clubPerf.length === 0 ? (
            <Text>No club sessions yet.</Text>
          ) : (
            <VictoryChart theme={VictoryTheme.material} domainPadding={20}>
              <VictoryAxis style={{ tickLabels: { angle: -30, fontSize: 10 }}} />
              <VictoryAxis dependentAxis tickFormat={(t) => t.toFixed(0)} />
              <VictoryBar data={clubPerf} x="club" y="rating" />
            </VictoryChart>
          )}
        </Section>

        <Section title="Heart Rate: Before vs After (per session)">
          {hrSeries.length === 0 ? (
            <Text>HR data appears once you record during practice and after.</Text>
          ) : (
            <View>
              <Text style={{ marginBottom: 8 }}>X-axis = session order</Text>
              <VictoryChart theme={VictoryTheme.material}>
                <VictoryAxis />
                <VictoryAxis dependentAxis />
                <VictoryLine data={hrSeries.map(p => ({ x: p.x, y: p.before }))} />
                <VictoryLine data={hrSeries.map(p => ({ x: p.x, y: p.after }))} />
              </VictoryChart>
            </View>
          )}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
