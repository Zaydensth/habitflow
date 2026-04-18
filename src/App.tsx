import { useState, useCallback, useMemo } from 'react';
import './index.css';

interface Habit {
  id: number; name: string; emoji: string; color: string;
  streak: number; best: number; completedDays: boolean[];
}

const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const EMOJIS = ['💧', '🏃', '📖', '🧘', '💤', '🥗', '💊', '✍️', '🎸', '🧠', '💪', '🌅'];
const COLORS = ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#ef4444'];

const today = new Date();
const todayIdx = (today.getDay() + 6) % 7; // Mon=0

const defaultHabits: Habit[] = [
  { id: 1, name: 'Drink 8 glasses of water', emoji: '💧', color: '#06b6d4', streak: 12, best: 18, completedDays: [true, true, true, true, true, false, false] },
  { id: 2, name: 'Morning run — 3km', emoji: '🏃', color: '#22c55e', streak: 5, best: 14, completedDays: [true, false, true, false, true, false, false] },
  { id: 3, name: 'Read 20 pages', emoji: '📖', color: '#f59e0b', streak: 8, best: 21, completedDays: [true, true, true, true, false, false, false] },
  { id: 4, name: 'Meditate 10 min', emoji: '🧘', color: '#8b5cf6', streak: 3, best: 10, completedDays: [false, true, false, true, true, false, false] },
  { id: 5, name: 'No sugar after 8pm', emoji: '🥗', color: '#ec4899', streak: 7, best: 15, completedDays: [true, true, true, true, true, true, false] },
];

type Page = 'today' | 'progress' | 'settings';

const Ic = {
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  gear: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  fire: <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><path d="M12 23c-3.6 0-7-2.4-7-7 0-3.2 2.1-5.7 3.4-7.1L12 5l3.6 3.9C16.9 10.3 19 12.8 19 16c0 4.6-3.4 7-7 7z"/></svg>,
};

export default function App() {
  const [page, setPage] = useState<Page>('today');
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('💧');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [settings, setSettings] = useState({ notifications: true, darkMode: true, weekStart: true, sounds: false });

  const toggleDay = useCallback((id: number) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const days = [...h.completedDays];
      days[todayIdx] = !days[todayIdx];
      return { ...h, completedDays: days, streak: days[todayIdx] ? h.streak + 1 : Math.max(0, h.streak - 1) };
    }));
  }, []);

  const addHabit = useCallback(() => {
    if (!newName.trim()) return;
    setHabits(prev => [...prev, {
      id: Date.now(), name: newName.trim(), emoji: newEmoji, color: newColor,
      streak: 0, best: 0, completedDays: Array(7).fill(false),
    }]);
    setNewName(''); setShowAdd(false);
  }, [newName, newEmoji, newColor]);

  const completed = useMemo(() => habits.filter(h => h.completedDays[todayIdx]).length, [habits]);
  const totalStreak = useMemo(() => habits.reduce((a, h) => a + h.streak, 0), [habits]);
  const completionPct = habits.length ? Math.round((completed / habits.length) * 100) : 0;

  // Streak heatmap data (fake 35 days)
  const heatmap = useMemo(() => Array.from({ length: 35 }, (_, i) => {
    if (i > 28) return 0;
    return Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : 0;
  }), []);

  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="app">
      {/* ---- TODAY ---- */}
      {page === 'today' && (
        <>
          <div className="page-header">
            <div>
              <h1><span>HabitFlow</span></h1>
              <p className="date-label">{dateStr}</p>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-num" style={{ color: '#6366f1' }}>{completed}/{habits.length}</div>
              <div className="stat-label">Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: '#f59e0b' }}>🔥 {totalStreak}</div>
              <div className="stat-label">Total Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: '#22c55e' }}>{completionPct}%</div>
              <div className="stat-label">Completion</div>
            </div>
          </div>

          <div className="habits-section">
            <div className="section-head">
              <h2>Today's Habits</h2>
              <button className="add-btn" onClick={() => setShowAdd(true)}>+</button>
            </div>

            {habits.map(h => (
              <div key={h.id} className="habit-card">
                <div className="habit-top">
                  <span className="habit-emoji">{h.emoji}</span>
                  <div className="habit-info">
                    <div className="habit-name">{h.name}</div>
                    <div className="habit-meta">
                      <span className="habit-streak" style={{ color: '#f59e0b' }}>🔥 {h.streak} days</span>
                      <span>Best: {h.best}</span>
                    </div>
                  </div>
                  <button className={`check-btn ${h.completedDays[todayIdx] ? 'done' : ''}`} onClick={() => toggleDay(h.id)}>
                    {h.completedDays[todayIdx] && Ic.check}
                  </button>
                </div>
                <div className="week-dots">
                  {DAY_NAMES.map((d, i) => (
                    <div key={i} className={`week-dot ${h.completedDays[i] ? 'filled' : ''} ${i === todayIdx ? 'today' : ''}`}
                      style={h.completedDays[i] ? { background: h.color, color: '#fff', borderColor: 'transparent' } : {}}>
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---- PROGRESS ---- */}
      {page === 'progress' && (
        <>
          <div className="page-header"><div><h1><span>Progress</span></h1><p className="date-label">Your analytics</p></div></div>

          <div className="progress-card">
            <h3>Today's Completion</h3>
            <div className="ring-wrap">
              <svg className="ring-svg" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" className="ring-track" />
                <circle cx="60" cy="60" r="50" className="ring-fill" stroke="#6366f1"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - completionPct / 100)}`}
                  transform="rotate(-90 60 60)" />
                <text x="60" y="56" className="ring-text">{completionPct}%</text>
                <text x="60" y="70" className="ring-sub">completed</text>
              </svg>
              <div className="ring-stats">
                <div className="ring-stat"><div className="dot" style={{ background: '#22c55e' }} /> {completed} done</div>
                <div className="ring-stat"><div className="dot" style={{ background: '#ef4444' }} /> {habits.length - completed} remaining</div>
                <div className="ring-stat"><div className="dot" style={{ background: '#f59e0b' }} /> {totalStreak} total streak</div>
              </div>
            </div>
          </div>

          <div className="progress-card">
            <h3>Streak Heatmap — Last 5 Weeks</h3>
            <div className="streak-grid">
              {heatmap.map((v, i) => (
                <div key={i} className="streak-cell" style={{ background: v > 0 ? `rgba(99,102,241,${0.15 + (v / 5) * 0.7})` : 'var(--bg-3)' }} />
              ))}
            </div>
          </div>

          <div className="progress-card">
            <h3>Habit Performance</h3>
            {habits.map(h => {
              const done = h.completedDays.filter(Boolean).length;
              const pct = Math.round((done / 7) * 100);
              return (
                <div key={h.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', marginBottom: 4 }}>
                    <span>{h.emoji} {h.name}</span>
                    <span style={{ color: h.color, fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: h.color, borderRadius: 3, transition: 'width .4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ---- SETTINGS ---- */}
      {page === 'settings' && (
        <>
          <div className="page-header"><div><h1><span>Settings</span></h1><p className="date-label">Customize your experience</p></div></div>

          <div className="settings-group">
            <h3>Preferences</h3>
            {([
              ['notifications', 'Push Notifications', 'Daily reminders'],
              ['darkMode', 'Dark Mode', 'Always on'],
              ['weekStart', 'Start Week on Monday', 'Calendar preference'],
              ['sounds', 'Sound Effects', 'Completion sounds'],
            ] as const).map(([key, label, sub]) => (
              <div key={key} className="setting-item">
                <div><span>{label}</span><br /><small>{sub}</small></div>
                <button className={`toggle ${settings[key] ? 'on' : 'off'}`}
                  onClick={() => setSettings(p => ({ ...p, [key]: !p[key] }))}>
                  <div className="toggle-knob" />
                </button>
              </div>
            ))}
          </div>

          <div className="settings-group">
            <h3>Data</h3>
            <div className="setting-item"><div><span>Export Data</span><br /><small>Download as JSON</small></div><span style={{ fontSize: '.72rem', color: 'var(--accent)' }}>Export</span></div>
            <div className="setting-item"><div><span>Reset All Data</span><br /><small>This cannot be undone</small></div><span style={{ fontSize: '.72rem', color: 'var(--red)' }}>Reset</span></div>
          </div>

          <div className="settings-group">
            <h3>About</h3>
            <div className="setting-item"><div><span>Version</span></div><small>1.0.0</small></div>
            <div className="setting-item"><div><span>Made with</span></div><small>React + TypeScript</small></div>
          </div>
        </>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <h3>New Habit</h3>
            <div className="modal-field">
              <label>Habit Name</label>
              <input placeholder="e.g., Drink 8 glasses of water" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
            </div>
            <div className="modal-field">
              <label>Icon</label>
              <div className="emoji-picker">
                {EMOJIS.map(e => (
                  <button key={e} className={`emoji-opt ${newEmoji === e ? 'selected' : ''}`} onClick={() => setNewEmoji(e)}>{e}</button>
                ))}
              </div>
            </div>
            <div className="modal-field">
              <label>Color</label>
              <div className="color-picker">
                {COLORS.map(c => (
                  <button key={c} className={`color-opt ${newColor === c ? 'selected' : ''}`}
                    style={{ background: c }} onClick={() => setNewColor(c)} />
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn-save" onClick={addHabit}>Create Habit</button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Bar */}
      <div className="tab-bar">
        <button className={`tab ${page === 'today' ? 'active' : ''}`} onClick={() => setPage('today')}>
          {Ic.home} Today
        </button>
        <button className={`tab ${page === 'progress' ? 'active' : ''}`} onClick={() => setPage('progress')}>
          {Ic.chart} Progress
        </button>
        <button className={`tab ${page === 'settings' ? 'active' : ''}`} onClick={() => setPage('settings')}>
          {Ic.gear} Settings
        </button>
      </div>
    </div>
  );
}
