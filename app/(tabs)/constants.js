// constants.js
export const MOODS = [
  { key: 'extremely_sad', label: '😭', score: 1 },
  { key: 'sad', label: '😞', score: 2 },
  { key: 'neutral', label: '😐', score: 3 },
  { key: 'okay', label: '🙂', score: 4 },
  { key: 'happy', label: '😄', score: 5 },
  { key: 'great', label: '🤩', score: 6 },
];

export const CLUBS = [
  { id: 'driver', name: 'Driver', desc: 'Focus on energy & goal-setting' },
  { id: '3w', name: '3 Wood', desc: 'Focus on balance and alignment' },
  { id: '5w', name: '5 Wood', desc: 'Mindfulness and presence' },
  { id: '3h', name: '3 Hybrid', desc: 'Adaptability and calm under pressure' },
  { id: '5h', name: '5 Hybrid', desc: 'Versatility and confidence' },
  { id: '3i', name: '3 Iron', desc: 'Precision and clarity' },
  { id: '4i', name: '4 Iron', desc: 'Focus and consistency' },
  { id: '5i', name: '5 Iron', desc: 'Confidence and self-talk' },
  { id: '6i', name: '6 Iron', desc: 'Rhythm and tempo' },
  { id: '7i', name: '7 Iron', desc: 'Patience and control' },
  { id: '8i', name: '8 Iron', desc: 'Accuracy and finesse' },
  { id: '9i', name: '9 Iron', desc: 'Courage and risk-taking' },
  { id: 'pw', name: 'Pitching Wedge', desc: 'Short game mastery' },
  { id: 'sw', name: 'Sand Wedge', desc: 'Recovery and resilience' },
  { id: 'putter', name: 'Putter', desc: 'Relaxation and finishing strong' },
];

export const findMoodByKey = (key) => MOODS.find(m => m.key === key);
