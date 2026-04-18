import { useState, useCallback, useMemo, type ReactNode } from 'react';
import './index.css';

interface Habit {
  id: number; name: string; icon: string; color: string;
  streak: number; best: number; completedDays: boolean[];
}

const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const COLORS = ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#ef4444'];

const today = new Date();
const todayIdx = (today.getDay() + 6) % 7; // Mon=0

/* SVG Icon Library */
const s = (d: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;

const ICON_MAP: Record<string, ReactNode> = {
  droplet: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  run: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="17" cy="4" r="2"/><path d="M15 21l-3-6-4 2-3 3"/><path d="M10 15l2-5 5-1 3-3"/></svg>,
  book: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  brain: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2a7 7 0 0 0-7 7c0 3 2 5.4 4 6.5V20h6v-4.5c2-1.1 4-3.5 4-6.5a7 7 0 0 0-7-7z"/><line x1="10" y1="20" x2="10" y2="22"/><line x1="14" y1="20" x2="14" y2="22"/></svg>,
  salad: s("M3 14h18M5.5 14c0-4.4 2.9-8 6.5-8s6.5 3.6 6.5 8M5 14v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"),
  moon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  pill: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="9" transform="rotate(45 12 12)"/><line x1="5" y1="19" x2="19" y2="5"/></svg>,
  edit: s("M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"),
  music: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  zap: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>,
  dumbbell: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6.5 6.5h11M6 10V4M18 10V4M4 8h2v4H4zM18 8h2v4h-2zM6.5 17.5h11M6 20v-6M18 20v-6M4 16h2v4H4zM18 16h2v4h-2z"/></svg>,
  sunrise: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/></svg>,
};

const ICON_KEYS = Object.keys(ICON_MAP);

const defaultHabits: Habit[] = [
  { id: 1, name: 'Drink 8 glasses of water', icon: 'droplet', color: '#06b6d4', streak: 12, best: 18, completedDays: [true, true, true, true, true, false, false] },
  { id: 2, name: 'Morning run — 3km', icon: 'run', color: '#22c55e', streak: 5, best: 14, completedDays: [true, false, true, false, true, false, false] },
  { id: 3, name: 'Read 20 pages', icon: 'book', color: '#f59e0b', streak: 8, best: 21, completedDays: [true, true, true, true, false, false, false] },
  { id: 4, name: 'Meditate 10 min', icon: 'brain', color: '#8b5cf6', streak: 3, best: 10, completedDays: [false, true, false, true, true, false, false] },
  { id: 5, name: 'No sugar after 8pm', icon: 'salad', color: '#ec4899', streak: 7, best: 15, completedDays: [true, true, true, true, true, true, false] },
];

type Page = 'today' | 'progress' | 'settings';

const Ic = {
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  gear: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  fire: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10"/></svg>,
  target: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  percent: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
};

export default function App() {
  const [page, setPage] = useState<Page>('today');
  const [habits, setHabits] = useState<Habit[]>(defaultHabits);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('droplet');
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
      id: Date.now(), name: newName.trim(), icon: newIcon, color: newColor,
      streak: 0, best: 0, completedDays: Array(7).fill(false),
    }]);
    setNewName(''); setShowAdd(false);
  }, [newName, newIcon, newColor]);

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
              <div className="stat-icon" style={{ color: '#6366f1' }}>{Ic.target}</div>
              <div className="stat-num" style={{ color: '#6366f1' }}>{completed}/{habits.length}</div>
              <div className="stat-label">Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#f59e0b' }}>{Ic.fire}</div>
              <div className="stat-num" style={{ color: '#f59e0b' }}>{totalStreak}</div>
              <div className="stat-label">Total Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: '#22c55e' }}>{Ic.percent}</div>
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
                  <div className="habit-icon" style={{ color: h.color, background: `${h.color}15` }}>{ICON_MAP[h.icon]}</div>
                  <div className="habit-info">
                    <div className="habit-name">{h.name}</div>
                    <div className="habit-meta">
                      <span className="habit-streak" style={{ color: '#f59e0b' }}>{Ic.fire} {h.streak} days</span>
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: h.color }}>{ICON_MAP[h.icon]}</span> {h.name}</span>
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
                {ICON_KEYS.map(k => (
                  <button key={k} className={`emoji-opt ${newIcon === k ? 'selected' : ''}`} onClick={() => setNewIcon(k)}>{ICON_MAP[k]}</button>
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
