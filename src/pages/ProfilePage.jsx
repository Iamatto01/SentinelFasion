import { useState, useMemo } from 'react';
import { Settings, Award, TrendingUp, Leaf, Edit3, ChevronRight, Shirt, ShoppingBag } from 'lucide-react';
import { getColorHex, getCategoryIcon } from '../store';
import './ProfilePage.css';

const ACHIEVEMENTS = [
  { id: 'explorer', emoji: '🎨', label: 'Color Explorer', desc: 'Used 5+ colors', unlocked: true },
  { id: 'mixmaster', emoji: '✨', label: 'Mix Master', desc: '10 outfits created', unlocked: true },
  { id: 'minimalist', emoji: '🎯', label: 'Minimalist Pro', desc: '90%+ wardrobe used', unlocked: false },
  { id: 'streak', emoji: '🔥', label: 'Style Streak', desc: '7 days in a row', unlocked: true },
  { id: 'green', emoji: '🌿', label: 'Eco Warrior', desc: 'Low-buy month', unlocked: false },
  { id: 'trendy', emoji: '💫', label: 'Trendsetter', desc: '5 unique outfits', unlocked: true },
];

export default function ProfilePage({ store }) {
  const [editName, setEditName] = useState(false);
  const [nameValue, setNameValue] = useState(store.profile.name);

  const stats = useMemo(() => store.getStats(), [store]);

  const colorEntries = useMemo(() => {
    const entries = Object.entries(stats.colorMap).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((s, [, v]) => s + v, 0);
    return entries.map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100), color: getColorHex(name) }));
  }, [stats]);

  const categoryEntries = useMemo(() => {
    const entries = Object.entries(stats.categoryMap);
    const total = entries.reduce((s, [, v]) => s + v, 0);
    return entries.map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }));
  }, [stats]);

  // Sustainability (mock)
  const sustainScore = Math.min(100, Math.round(stats.utilization * 1.1));

  const handleSaveName = () => {
    store.setProfile(prev => ({ ...prev, name: nameValue }));
    setEditName(false);
  };

  // Calendar heatmap (last 30 days)
  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hasOutfit = store.history.some(h => h.date === dateStr);
      days.push({ date: dateStr, active: hasOutfit, day: date.getDate() });
    }
    return days;
  }, [store.history]);

  return (
    <div className="profile-page page-enter">
      {/* Profile Header */}
      <div className="profile-header glass gradient-border">
        <div className="profile-avatar-lg">
          <span>{store.profile.name[0]}</span>
        </div>
        <div className="profile-info">
          {editName ? (
            <div className="name-edit-row">
              <input className="name-input" value={nameValue} onChange={e => setNameValue(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveName()} />
              <button className="name-save" onClick={handleSaveName}>✓</button>
            </div>
          ) : (
            <h1 className="profile-name" onClick={() => setEditName(true)}>
              {store.profile.name}
              <Edit3 size={14} className="edit-icon" />
            </h1>
          )}
          <span className="style-persona">{store.profile.stylePersona}</span>
        </div>
        <button className="settings-btn"><Settings size={22} /></button>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card glass">
          <Shirt size={20} className="stat-icon stat-icon--purple" />
          <span className="stat-value">{stats.totalItems}</span>
          <span className="stat-label">Items</span>
        </div>
        <div className="stat-card glass">
          <ShoppingBag size={20} className="stat-icon stat-icon--gold" />
          <span className="stat-value">{stats.totalOutfits}</span>
          <span className="stat-label">Outfits</span>
        </div>
        <div className="stat-card glass">
          <TrendingUp size={20} className="stat-icon stat-icon--emerald" />
          <span className="stat-value">{stats.utilization}%</span>
          <span className="stat-label">Utilized</span>
        </div>
      </div>

      {/* Sustainability Score */}
      <div className="sustain-card glass" id="sustainability-score">
        <div className="sustain-header">
          <Leaf size={20} className="sustain-icon" />
          <h2>Sustainability Score</h2>
        </div>
        <div className="sustain-ring-container">
          <svg viewBox="0 0 120 120" className="sustain-ring-svg">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="url(#sustainGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${sustainScore * 3.27} 327`} transform="rotate(-90 60 60)" className="sustain-fill" />
            <defs>
              <linearGradient id="sustainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          <div className="sustain-value">
            <span className="sustain-num">{sustainScore}</span>
            <span className="sustain-pct">%</span>
          </div>
        </div>
        <p className="sustain-desc">
          {sustainScore >= 80 ? "🌟 Excellent! You're maximizing your wardrobe." : sustainScore >= 50 ? "👍 Good progress! Try wearing more of your items." : "💡 Tip: You have many unworn items. Let AI suggest new combinations!"}
        </p>
      </div>

      {/* Color Distribution */}
      <section className="analytics-section">
        <h2 className="section-title">🎨 Wardrobe Colors</h2>
        <div className="color-chart glass">
          <div className="color-bars">
            {colorEntries.slice(0, 8).map(({ name, pct, color }) => (
              <div key={name} className="color-bar-item">
                <div className="color-bar-label">
                  <span className="color-bar-dot" style={{ background: color }} />
                  <span>{name}</span>
                </div>
                <div className="color-bar-track">
                  <div className="color-bar-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="color-bar-pct">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Breakdown */}
      <section className="analytics-section">
        <h2 className="section-title">📊 Category Breakdown</h2>
        <div className="category-chart glass">
          {categoryEntries.map(({ name, count, pct }) => (
            <div key={name} className="cat-row">
              <span className="cat-icon">{getCategoryIcon(name)}</span>
              <span className="cat-name">{name}</span>
              <div className="cat-bar-track">
                <div className="cat-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="cat-count">{count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Most Worn */}
      <section className="analytics-section">
        <h2 className="section-title">🏆 Most Worn</h2>
        <div className="most-worn glass">
          {stats.mostWorn.map((item, i) => (
            <div key={item.id} className="most-worn-item">
              <span className="rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
              <div className="mw-color" style={{ background: `linear-gradient(135deg, ${item.colors[0]}60, ${item.colors[1] || item.colors[0]}30)` }}>
                {getCategoryIcon(item.category)}
              </div>
              <div className="mw-info">
                <span className="mw-name">{item.name}</span>
                <span className="mw-count">Worn {item.wearCount} times</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Style Calendar */}
      <section className="analytics-section">
        <h2 className="section-title">📅 Style Calendar</h2>
        <div className="calendar-heatmap glass">
          <div className="calendar-grid">
            {calendarDays.map((d) => (
              <div
                key={d.date}
                className={`calendar-cell ${d.active ? 'calendar-cell--active' : ''}`}
                title={d.date}
              >
                <span className="cell-day">{d.day}</span>
              </div>
            ))}
          </div>
          <div className="calendar-legend">
            <span className="legend-item"><span className="legend-dot" /> No outfit</span>
            <span className="legend-item"><span className="legend-dot legend-dot--active" /> Outfit logged</span>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="analytics-section">
        <h2 className="section-title"><Award size={18} /> Achievements</h2>
        <div className="achievements-grid">
          {ACHIEVEMENTS.map(ach => (
            <div key={ach.id} className={`achievement-card glass ${!ach.unlocked ? 'achievement-card--locked' : ''}`}>
              <span className="ach-emoji">{ach.emoji}</span>
              <span className="ach-label">{ach.label}</span>
              <span className="ach-desc">{ach.desc}</span>
              {!ach.unlocked && <span className="ach-lock">🔒</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
