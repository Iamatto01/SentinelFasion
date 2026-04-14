import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, CloudRain, Cloud, Thermometer, MapPin, ChevronRight, Sparkles, Calendar, Shirt, RefreshCw, Clock } from 'lucide-react';
import { getCategoryIcon, getOccasionEmoji } from '../store';
import './HomePage.css';

const WEATHER = { temp: 28, condition: 'sunny', humidity: 65, city: 'Kuala Lumpur', high: 32, low: 24 };
const OCCASIONS = [
  { id: 'casual', label: 'Casual', emoji: '😊' },
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'date', label: 'Date', emoji: '❤️' },
  { id: 'gym', label: 'Gym', emoji: '💪' },
  { id: 'event', label: 'Event', emoji: '🎉' },
  { id: 'formal', label: 'Formal', emoji: '👔' },
];

export default function HomePage({ store }) {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [todayOutfit, setTodayOutfit] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState('casual');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    generateTodayOutfit();
  }, [selectedOccasion]);

  const generateTodayOutfit = () => {
    setRefreshing(true);
    // Simulate AI thinking delay
    setTimeout(() => {
      const tops = store.wardrobe.filter(i => i.category === 'tops');
      const bottoms = store.wardrobe.filter(i => i.category === 'bottoms');
      const shoes = store.wardrobe.filter(i => i.category === 'shoes');
      const accessories = store.wardrobe.filter(i => i.category === 'accessories');
      
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const items = [pick(tops), pick(bottoms), pick(shoes), pick(accessories)].filter(Boolean);
      
      setTodayOutfit({
        items,
        score: 85 + Math.floor(Math.random() * 12),
        occasion: selectedOccasion,
      });
      setRefreshing(false);
    }, 600);
  };

  const stats = store.getStats();

  return (
    <div className="home-page page-enter">
      {/* Header */}
      <header className="home-header">
        <div className="home-header__left">
          <h1 className="home-greeting">{greeting}, <span className="gradient-text">{store.profile.name}</span></h1>
          <p className="home-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="home-avatar" onClick={() => navigate('/profile')}>
          <span>{store.profile.name[0]}</span>
        </div>
      </header>

      {/* Weather Card */}
      <section className="weather-card glass" id="weather-widget">
        <div className="weather-main">
          <span className="weather-icon">☀️</span>
          <div className="weather-temp">
            <span className="weather-temp__value">{WEATHER.temp}°</span>
            <span className="weather-temp__unit">C</span>
          </div>
        </div>
        <div className="weather-details">
          <div className="weather-detail">
            <MapPin size={14} />
            <span>{WEATHER.city}</span>
          </div>
          <div className="weather-detail">
            <Thermometer size={14} />
            <span>H:{WEATHER.high}° L:{WEATHER.low}°</span>
          </div>
          <div className="weather-detail">
            <Cloud size={14} />
            <span>{WEATHER.humidity}% humidity</span>
          </div>
        </div>
        <div className="weather-tip">
          <Sparkles size={14} />
          <span>Light, breathable fabrics recommended today</span>
        </div>
      </section>

      {/* Occasion Selector */}
      <section className="occasion-section">
        <h2 className="section-title">What's the occasion?</h2>
        <div className="occasion-chips">
          {OCCASIONS.map(occ => (
            <button
              key={occ.id}
              className={`occasion-chip ${selectedOccasion === occ.id ? 'occasion-chip--active' : ''}`}
              onClick={() => setSelectedOccasion(occ.id)}
              id={`occasion-${occ.id}`}
            >
              <span>{occ.emoji}</span>
              <span>{occ.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Today's Outfit Suggestion */}
      <section className="outfit-suggestion" id="daily-outfit">
        <div className="section-header">
          <h2 className="section-title">
            <Sparkles size={18} className="section-icon" />
            Today's AI Suggestion
          </h2>
          <button className={`refresh-btn ${refreshing ? 'refresh-btn--spin' : ''}`} onClick={generateTodayOutfit} id="refresh-outfit">
            <RefreshCw size={18} />
          </button>
        </div>

        {todayOutfit ? (
          <div className="outfit-card glass gradient-border">
            <div className="outfit-card__score">
              <div className="score-ring">
                <svg viewBox="0 0 36 36" className="score-svg">
                  <path
                    className="score-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="score-fill"
                    strokeDasharray={`${todayOutfit.score}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="score-value">{todayOutfit.score}%</span>
              </div>
              <span className="score-label">Match</span>
            </div>
            <div className="outfit-card__items">
              {todayOutfit.items.map((item, i) => (
                <div key={item.id} className="outfit-item-preview" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="outfit-item-color" style={{ background: item.colors[0] }}>
                    <span>{getCategoryIcon(item.category)}</span>
                  </div>
                  <div className="outfit-item-info">
                    <span className="outfit-item-name">{item.name}</span>
                    <span className="outfit-item-cat">{item.subcategory}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="outfit-card__actions">
              <button className="btn btn--primary" onClick={() => navigate('/stylist')} id="wear-this-btn">
                <Sparkles size={16} />
                Wear This
              </button>
              <button className="btn btn--ghost" onClick={generateTodayOutfit}>
                <RefreshCw size={16} />
                New Suggestion
              </button>
            </div>
          </div>
        ) : (
          <div className="outfit-skeleton glass">
            <div className="skeleton-block" />
            <div className="skeleton-block skeleton-block--short" />
            <div className="skeleton-block skeleton-block--short" />
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-grid">
          <button className="action-card glass" onClick={() => navigate('/wardrobe')} id="action-wardrobe">
            <div className="action-icon" style={{ background: 'rgba(168, 85, 247, 0.15)' }}>
              <Shirt size={24} color="var(--accent-primary-light)" />
            </div>
            <span className="action-label">My Wardrobe</span>
            <span className="action-count">{stats.totalItems} items</span>
          </button>
          <button className="action-card glass" onClick={() => navigate('/camera')} id="action-tryon">
            <div className="action-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
              <Sparkles size={24} color="var(--accent-gold)" />
            </div>
            <span className="action-label">Virtual Try-On</span>
            <span className="action-count">AI Powered</span>
          </button>
          <button className="action-card glass" onClick={() => navigate('/stylist')} id="action-calendar">
            <div className="action-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <Calendar size={24} color="var(--accent-emerald)" />
            </div>
            <span className="action-label">Outfit Calendar</span>
            <span className="action-count">{stats.historyCount} logged</span>
          </button>
          <button className="action-card glass" onClick={() => navigate('/profile')} id="action-analytics">
            <div className="action-icon" style={{ background: 'rgba(14, 165, 233, 0.15)' }}>
              <Clock size={24} color="var(--accent-sky)" />
            </div>
            <span className="action-label">Style Analytics</span>
            <span className="action-count">{stats.utilization}% used</span>
          </button>
        </div>
      </section>

      {/* Recent Outfits */}
      <section className="recent-section">
        <div className="section-header">
          <h2 className="section-title">Recent Outfits</h2>
          <button className="see-all-btn" onClick={() => navigate('/stylist')}>
            See All <ChevronRight size={16} />
          </button>
        </div>
        <div className="recent-scroll">
          {store.outfits.slice(0, 4).map((outfit, i) => (
            <div key={outfit.id} className="recent-card glass" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="recent-card__items">
                {outfit.items.slice(0, 3).map((itemId) => {
                  const item = store.wardrobe.find(w => w.id === itemId);
                  return item ? (
                    <div key={itemId} className="recent-item-dot" style={{ background: item.colors[0] }} title={item.name}>
                      <span style={{fontSize:'12px'}}>{getCategoryIcon(item.category)}</span>
                    </div>
                  ) : null;
                })}
                {outfit.items.length > 3 && <span className="recent-more">+{outfit.items.length - 3}</span>}
              </div>
              <span className="recent-name">{outfit.name}</span>
              <div className="recent-meta">
                <span className="recent-score">{outfit.aiScore}% match</span>
                <span className="recent-occasion">{getOccasionEmoji(outfit.occasion)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
