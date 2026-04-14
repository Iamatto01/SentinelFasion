import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Heart, Check, ChevronLeft, ChevronRight, Zap, ThumbsUp, ThumbsDown, SlidersHorizontal, Send, Bot } from 'lucide-react';
import { generateOutfitSuggestion, compareOutfits, getCategoryIcon, getGroqStylistAdvice } from '../store';
import './StylistPage.css';

const OCCASIONS = ['casual', 'work', 'date', 'formal', 'sporty', 'event'];

export default function StylistPage({ store }) {
  const [suggestions, setSuggestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [occasion, setOccasion] = useState('casual');
  const [showPrefs, setShowPrefs] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [prefs, setPrefs] = useState({ formality: 40, colorful: 50 });

  // Chat state
  const [chatMode, setChatMode] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    generateSuggestions();
  }, [occasion]);

  const generateSuggestions = () => {
    setLoading(true);
    setTimeout(() => {
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(generateOutfitSuggestion(store.wardrobe, occasion, { temp: 28, condition: 'sunny' }, prefs));
      }
      setSuggestions(results);
      setCurrentIndex(0);
      setLoading(false);
    }, 800);
  };

  const handleCompare = () => {
    if (suggestions.length < 2) return;
    const a = suggestions[currentIndex];
    const b = suggestions[(currentIndex + 1) % suggestions.length];
    const result = compareOutfits(a.items, b.items, store.wardrobe, { occasion });
    setComparison({
      ...result,
      outfitADetails: a,
      outfitBDetails: b,
    });
    setShowComparison(true);
  };

  const nextSuggestion = () => {
    setCurrentIndex(prev => (prev + 1) % suggestions.length);
  };

  const prevSuggestion = () => {
    setCurrentIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
  };

  const handleAskGroq = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || aiLoading) return;
    
    const userMsg = prompt.trim();
    setChatLog(prev => [...prev, { role: 'user', content: userMsg }]);
    setPrompt("");
    setAiLoading(true);

    try {
      const response = await getGroqStylistAdvice(store.wardrobe, userMsg);
      setChatLog(prev => [...prev, { role: 'ai', content: response }]);
    } catch (err) {
      setChatLog(prev => [...prev, { role: 'ai', content: 'Oops! Unable to reach the AI server right now.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  const current = suggestions[currentIndex];

  return (
    <div className="stylist-page page-enter">
      <header className="stylist-header">
        <div>
          <h1 className="page-title">
            <Sparkles size={24} className="sparkle-icon" />
            AI Stylist
          </h1>
          <p className="stylist-subtitle">Smart outfit suggestions powered by AI</p>
        </div>
        <button className="prefs-toggle glass" onClick={() => setChatMode(!chatMode)} id="style-chat-btn">
          {chatMode ? <Zap size={20} /> : <Bot size={20} />}
        </button>
      </header>

      {/* AI Chat Mode */}
      {chatMode && (
        <div className="chat-panel glass animate-slide-up">
           <div className="chat-messages">
             {chatLog.map((msg, idx) => (
                <div key={idx} className={`chat-msg ${msg.role === 'user' ? 'msg-user' : 'msg-ai'}`}>
                   {msg.role === 'ai' && <Sparkles size={14} className="msg-icon" />}
                   <div className="msg-bubble glass-strong">{msg.content}</div>
                </div>
             ))}
             {aiLoading && (
                <div className="chat-msg msg-ai">
                   <Sparkles size={14} className="msg-icon processing-sparkle" />
                   <div className="msg-bubble glass-strong">Thinking...</div>
                </div>
             )}
             {chatLog.length === 0 && !aiLoading && (
                <div className="empty-chat text-muted">Ask Groq AI for custom styling! (e.g. "What should I wear to a summer wedding?")</div>
             )}
           </div>
           
           <form className="chat-input-row" onSubmit={handleAskGroq}>
             <input type="text" className="chat-input glass-strong" placeholder="Ask AI..." value={prompt} onChange={e => setPrompt(e.target.value)} disabled={aiLoading} />
             <button type="submit" className="chat-send-btn glass" disabled={aiLoading || !prompt.trim()}>
               <Send size={18} />
             </button>
           </form>
        </div>
      )}

      {/* Style Preferences */}
      {showPrefs && (
        <div className="prefs-panel glass animate-slide-up">
          <h3>Style Preferences</h3>
          <div className="pref-slider">
            <div className="pref-labels"><span>Casual</span><span>Formal</span></div>
            <input type="range" min="0" max="100" value={prefs.formality} onChange={e => setPrefs(p => ({ ...p, formality: +e.target.value }))} className="slider" />
          </div>
          <div className="pref-slider">
            <div className="pref-labels"><span>Minimal</span><span>Colorful</span></div>
            <input type="range" min="0" max="100" value={prefs.colorful} onChange={e => setPrefs(p => ({ ...p, colorful: +e.target.value }))} className="slider" />
          </div>
        </div>
      )}

      {/* Occasion Tabs */}
      <div className="occasion-tabs">
        {OCCASIONS.map(occ => (
          <button
            key={occ}
            className={`occ-tab ${occasion === occ ? 'occ-tab--active' : ''}`}
            onClick={() => setOccasion(occ)}
          >
            {occ}
          </button>
        ))}
      </div>

      {/* Suggestion Carousel */}
      {loading ? (
        <div className="loading-state">
          <div className="ai-thinking">
            <Sparkles size={32} className="thinking-sparkle" />
            <span>AI is styling your outfit...</span>
          </div>
        </div>
      ) : current ? (
        <>
          {/* Navigation dots */}
          <div className="carousel-dots">
            {suggestions.map((_, i) => (
              <button key={i} className={`carousel-dot ${i === currentIndex ? 'carousel-dot--active' : ''}`} onClick={() => setCurrentIndex(i)} />
            ))}
          </div>

          <div className="suggestion-card glass gradient-border animate-scale-in" key={currentIndex}>
            {/* Score */}
            <div className="suggestion-score-bar">
              <div className="suggestion-score">
                <Zap size={18} className="score-icon" />
                <span className="score-num">{current.score}%</span>
                <span className="score-text">Match</span>
              </div>
              <div className="suggestion-tags">
                <span className="s-tag s-tag--occasion">{current.occasion}</span>
                <span className="s-tag s-tag--weather">☀️ {current.weather.temp}°C</span>
              </div>
            </div>

            {/* Items */}
            <div className="suggestion-items">
              {current.itemDetails.map((item, i) => (
                <div key={item.id} className="s-item" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="s-item__color" style={{ background: `linear-gradient(135deg, ${item.colors[0]}80, ${item.colors[1] || item.colors[0]}40)` }}>
                    <span>{getCategoryIcon(item.category)}</span>
                  </div>
                  <div className="s-item__info">
                    <span className="s-item__name">{item.name}</span>
                    <span className="s-item__brand">{item.brand || item.subcategory}</span>
                  </div>
                  <div className="s-item__colors">
                    {item.colors.map((c, ci) => <span key={ci} className="mini-dot" style={{ background: c }} />)}
                  </div>
                </div>
              ))}
            </div>

            {/* AI Reason */}
            <div className="ai-reason">
              <Sparkles size={14} />
              <p>{current.reason}</p>
            </div>

            {/* Actions */}
            <div className="suggestion-actions">
              <button className="s-action" onClick={prevSuggestion}>
                <ChevronLeft size={22} />
              </button>
              <button className="s-action s-action--dislike">
                <ThumbsDown size={20} />
              </button>
              <button className="s-action s-action--main" onClick={() => { store.saveOutfit({ name: `AI Outfit ${Date.now()}`, items: current.items, occasion: current.occasion, season: 'spring', aiScore: current.score, aiReason: current.reason }); }} id="wear-outfit-btn">
                <Heart size={22} />
              </button>
              <button className="s-action s-action--like">
                <ThumbsUp size={20} />
              </button>
              <button className="s-action" onClick={nextSuggestion}>
                <ChevronRight size={22} />
              </button>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="stylist-bottom-actions">
            <button className="btn btn--secondary" onClick={generateSuggestions} id="regenerate-btn">
              <RefreshCw size={16} /> Regenerate
            </button>
            <button className="btn btn--primary" onClick={handleCompare} id="compare-btn">
              <Zap size={16} /> Compare
            </button>
          </div>
        </>
      ) : null}

      {/* Comparison Modal */}
      {showComparison && comparison && (
        <div className="modal-overlay" onClick={() => setShowComparison(false)}>
          <div className="modal glass-strong compare-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Outfit Comparison</h2>
              <button className="modal-close" onClick={() => setShowComparison(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="compare-grid">
                <div className={`compare-side ${comparison.winner === 'A' ? 'compare-side--winner' : ''}`}>
                  <h3 className="compare-label">Outfit A</h3>
                  <div className="compare-items">
                    {comparison.outfitADetails.itemDetails.map(item => (
                      <div key={item.id} className="compare-item">
                        <span>{getCategoryIcon(item.category)}</span>
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="compare-scores">
                    <div className="cs"><span>Style</span><div className="cs-bar"><div className="cs-fill" style={{ width: `${comparison.outfitA.style}%` }} /></div><span>{comparison.outfitA.style}%</span></div>
                    <div className="cs"><span>Weather</span><div className="cs-bar"><div className="cs-fill cs-fill--gold" style={{ width: `${comparison.outfitA.weather}%` }} /></div><span>{comparison.outfitA.weather}%</span></div>
                    <div className="cs"><span>Occasion</span><div className="cs-bar"><div className="cs-fill cs-fill--emerald" style={{ width: `${comparison.outfitA.occasion}%` }} /></div><span>{comparison.outfitA.occasion}%</span></div>
                  </div>
                  <div className="compare-total">{comparison.outfitA.score}%</div>
                </div>

                <div className="compare-vs">VS</div>

                <div className={`compare-side ${comparison.winner === 'B' ? 'compare-side--winner' : ''}`}>
                  <h3 className="compare-label">Outfit B</h3>
                  <div className="compare-items">
                    {comparison.outfitBDetails.itemDetails.map(item => (
                      <div key={item.id} className="compare-item">
                        <span>{getCategoryIcon(item.category)}</span>
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="compare-scores">
                    <div className="cs"><span>Style</span><div className="cs-bar"><div className="cs-fill" style={{ width: `${comparison.outfitB.style}%` }} /></div><span>{comparison.outfitB.style}%</span></div>
                    <div className="cs"><span>Weather</span><div className="cs-bar"><div className="cs-fill cs-fill--gold" style={{ width: `${comparison.outfitB.weather}%` }} /></div><span>{comparison.outfitB.weather}%</span></div>
                    <div className="cs"><span>Occasion</span><div className="cs-bar"><div className="cs-fill cs-fill--emerald" style={{ width: `${comparison.outfitB.occasion}%` }} /></div><span>{comparison.outfitB.occasion}%</span></div>
                  </div>
                  <div className="compare-total">{comparison.outfitB.score}%</div>
                </div>
              </div>

              <div className="compare-verdict glass">
                <Sparkles size={16} />
                <p>{comparison.reason}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Outfits */}
      {store.outfits.length > 0 && (
        <section className="saved-section">
          <h2 className="section-title">💾 Saved Outfits</h2>
          <div className="saved-list">
            {store.outfits.map((outfit, i) => (
              <div key={outfit.id} className="saved-outfit-card glass" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="saved-outfit__items">
                  {outfit.items.map(itemId => {
                    const item = store.wardrobe.find(w => w.id === itemId);
                    return item ? (
                      <div key={itemId} className="saved-item-chip" style={{ background: `${item.colors[0]}30` }}>
                        {getCategoryIcon(item.category)}
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="saved-outfit__info">
                  <span className="saved-name">{outfit.name}</span>
                  <span className="saved-meta">{outfit.aiScore}% match · {outfit.occasion}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
