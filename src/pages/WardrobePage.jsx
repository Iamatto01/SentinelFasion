import { useState, useRef } from 'react';
import { Search, Plus, Filter, Grid3X3, List, X, Check, Trash2, Edit3, Tag } from 'lucide-react';
import { getCategoryIcon, autoTagClothing } from '../store';
import './WardrobePage.css';

const CATEGORIES = ['all', 'tops', 'bottoms', 'shoes', 'accessories', 'outerwear'];
const CATEGORY_LABELS = { all: 'All', tops: 'Tops', bottoms: 'Bottoms', shoes: 'Shoes', accessories: 'Accessories', outerwear: 'Outerwear' };

export default function WardrobePage({ store }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showItemDetail, setShowItemDetail] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', category: 'tops', subcategory: '', colors: ['#808080'], pattern: 'solid', season: ['all'], occasion: ['casual'], brand: '', image: null });
  const fileRef = useRef();

  const filteredItems = store.wardrobe.filter(item => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase()) && !item.brand?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewItem(prev => ({ ...prev, image: ev.target.result }));
        // Auto-tag with AI
        const tags = autoTagClothing(file);
        setNewItem(prev => ({ ...prev, ...tags }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    store.addItem(newItem);
    setNewItem({ name: '', category: 'tops', subcategory: '', colors: ['#808080'], pattern: 'solid', season: ['all'], occasion: ['casual'], brand: '', image: null });
    setShowAddModal(false);
  };

  return (
    <div className="wardrobe-page page-enter">
      {/* Header */}
      <header className="wardrobe-header">
        <h1 className="page-title">My Wardrobe</h1>
        <span className="item-count">{store.wardrobe.length} items</span>
      </header>

      {/* Search Bar */}
      <div className="search-bar glass" id="wardrobe-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search clothes, brands..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch('')}>
            <X size={16} />
          </button>
        )}
        <button className={`view-toggle ${viewMode === 'list' ? 'view-toggle--active' : ''}`} onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}>
          {viewMode === 'grid' ? <List size={18} /> : <Grid3X3 size={18} />}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs" id="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-tab ${activeCategory === cat ? 'category-tab--active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat !== 'all' && <span className="category-emoji">{getCategoryIcon(cat)}</span>}
            {CATEGORY_LABELS[cat]}
            <span className="category-count">
              {cat === 'all' ? store.wardrobe.length : store.wardrobe.filter(i => i.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className={`items-container ${viewMode === 'list' ? 'items-container--list' : ''}`} id="wardrobe-grid">
        {filteredItems.map((item, i) => (
          <div
            key={item.id}
            className={`item-card glass ${viewMode === 'list' ? 'item-card--list' : ''}`}
            style={{ animationDelay: `${i * 0.04}s` }}
            onClick={() => setShowItemDetail(item)}
          >
            <div className="item-card__image" style={{ background: `linear-gradient(135deg, ${item.colors[0]}40, ${item.colors[1] || item.colors[0]}20)` }}>
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <span className="item-emoji">{getCategoryIcon(item.category)}</span>
              )}
              {item.wearCount > 15 && <span className="item-badge item-badge--fav">★</span>}
              {item.wearCount === 0 && <span className="item-badge item-badge--new">NEW</span>}
            </div>
            <div className="item-card__info">
              <span className="item-name">{item.name}</span>
              <span className="item-meta">{item.brand || item.subcategory}</span>
              {viewMode === 'list' && (
                <div className="item-tags-row">
                  <span className="item-wear-count">Worn {item.wearCount}×</span>
                  <div className="item-color-dots">
                    {item.colors.map((c, ci) => <span key={ci} className="color-dot" style={{ background: c }} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="empty-state">
          <span className="empty-emoji">👗</span>
          <h3>No items found</h3>
          <p>Try a different search or category</p>
        </div>
      )}

      {/* Floating Add Button */}
      <button className="fab" onClick={() => setShowAddModal(true)} id="add-item-btn">
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal glass-strong" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Item</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={22} />
              </button>
            </div>

            <div className="modal-body">
              {/* Image upload */}
              <div className="upload-area" onClick={() => fileRef.current?.click()}>
                {newItem.image ? (
                  <img src={newItem.image} alt="Preview" className="upload-preview" />
                ) : (
                  <>
                    <Plus size={32} />
                    <span>Upload Photo</span>
                    <span className="upload-hint">Camera or Gallery</span>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImageUpload} hidden />
              </div>

              {newItem.image && (
                <div className="ai-tag-notice">
                  <Tag size={14} />
                  <span>AI auto-detected: <strong>{newItem.category} / {newItem.subcategory}</strong></span>
                </div>
              )}

              <div className="form-group">
                <label>Name</label>
                <input type="text" placeholder="e.g., Blue Oxford Shirt" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} className="form-input" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))} className="form-input">
                    {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input type="text" placeholder="Optional" value={newItem.brand} onChange={e => setNewItem(p => ({ ...p, brand: e.target.value }))} className="form-input" />
                </div>
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-picker-row">
                  {['#FFFFFF', '#000000', '#1e3a5f', '#722F37', '#556B2F', '#808080', '#4682B4', '#8B4513', '#FF6347', '#FFD700', '#a855f7', '#f472b6'].map(c => (
                    <button
                      key={c}
                      className={`color-swatch ${newItem.colors[0] === c ? 'color-swatch--active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setNewItem(p => ({ ...p, colors: [c] }))}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn--ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleAddItem} id="save-item-btn">
                <Check size={18} />
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {showItemDetail && (
        <div className="modal-overlay" onClick={() => setShowItemDetail(null)}>
          <div className="modal glass-strong" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{showItemDetail.name}</h2>
              <button className="modal-close" onClick={() => setShowItemDetail(null)}>
                <X size={22} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-image" style={{ background: `linear-gradient(135deg, ${showItemDetail.colors[0]}40, ${showItemDetail.colors[1] || showItemDetail.colors[0]}20)` }}>
                {showItemDetail.image ? (
                  <img src={showItemDetail.image} alt={showItemDetail.name} />
                ) : (
                  <span style={{ fontSize: '64px' }}>{getCategoryIcon(showItemDetail.category)}</span>
                )}
              </div>
              <div className="detail-stats">
                <div className="detail-stat">
                  <span className="detail-stat__value">{showItemDetail.wearCount}</span>
                  <span className="detail-stat__label">Times Worn</span>
                </div>
                <div className="detail-stat">
                  <span className="detail-stat__value">{showItemDetail.lastWorn || 'Never'}</span>
                  <span className="detail-stat__label">Last Worn</span>
                </div>
              </div>
              <div className="detail-info-grid">
                <div className="detail-info-item">
                  <span className="detail-info-label">Category</span>
                  <span className="detail-info-value">{getCategoryIcon(showItemDetail.category)} {showItemDetail.category}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">Brand</span>
                  <span className="detail-info-value">{showItemDetail.brand || 'N/A'}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">Pattern</span>
                  <span className="detail-info-value">{showItemDetail.pattern}</span>
                </div>
                <div className="detail-info-item">
                  <span className="detail-info-label">Colors</span>
                  <div className="item-color-dots">
                    {showItemDetail.colors.map((c, i) => <span key={i} className="color-dot color-dot--lg" style={{ background: c }} />)}
                  </div>
                </div>
              </div>
              {showItemDetail.aiTags && (
                <div className="detail-tags">
                  {showItemDetail.aiTags.map(tag => <span key={tag} className="detail-tag">{tag}</span>)}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn--ghost" style={{ color: 'var(--accent-rose)' }} onClick={() => { store.deleteItem(showItemDetail.id); setShowItemDetail(null); }}>
                <Trash2 size={16} /> Delete
              </button>
              <button className="btn btn--primary" onClick={() => setShowItemDetail(null)}>
                <Check size={16} /> Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
