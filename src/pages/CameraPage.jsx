import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Sparkles, RotateCcw, Download, Share2, User, ArrowRight, Video } from 'lucide-react';
import { getCategoryIcon, autoTagClothing } from '../store';
import './CameraPage.css';

export default function CameraPage({ store }) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'tryon' | 'add'
  const [bodyImage, setBodyImage] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Camera State
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraTarget, setCameraTarget] = useState('add'); // 'add' | 'body'
  
  const fileRef = useRef();
  const addFileRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async (target) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: target === 'body' ? 'user' : 'environment' }
      });
      setStream(mediaStream);
      setCameraTarget(target);
      setCameraActive(true);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Could not access camera. Please allow camera permissions.");
    }
  };

  useEffect(() => {
    if (cameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const processAddImage = (dataUrl, file) => {
    const tags = autoTagClothing(file);
    store.addItem({
      ...tags,
      name: `New ${tags.subcategory || tags.category}`,
      image: dataUrl,
      brand: '',
    });
    alert("Item added to wardrobe!");
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      stopCamera();
      
      if (cameraTarget === 'add') {
         fetch(dataUrl).then(res => res.blob()).then(blob => {
             const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
             processAddImage(dataUrl, file);
         });
      } else {
         setBodyImage(dataUrl);
         setMode('tryon');
      }
    }
  };

  const handleBodyUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBodyImage(ev.target.result);
        setMode('tryon');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleTryOn = () => {
    if (!bodyImage || selectedItems.length === 0) return;
    setProcessing(true);
    // Simulate AI virtual try-on processing
    setTimeout(() => {
      setResult({
        image: bodyImage, // In production, this would be the AI-generated image
        items: selectedItems.map(id => store.wardrobe.find(w => w.id === id)).filter(Boolean),
        timestamp: new Date().toISOString(),
      });
      setProcessing(false);
    }, 2000);
  };

  const handleAddUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        processAddImage(ev.target.result, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredWardrobe = activeCategory === 'all' 
    ? store.wardrobe 
    : store.wardrobe.filter(i => i.category === activeCategory);

  return (
    <div className="camera-page page-enter">
      {/* Live Camera Modal */}
      {cameraActive && (
        <div className="camera-modal overlay glass">
          <div className="camera-viewfinder">
            <video ref={videoRef} autoPlay playsInline muted />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            <button className="camera-close-btn btn btn--icon glass" onClick={stopCamera}>
              <X size={24} />
            </button>
            
            <div className="camera-controls">
              <button className="camera-capture-btn" onClick={capturePhoto}>
                <div className="inner-circle"></div>
              </button>
            </div>
            
            <div className="camera-instructions glass">
              {cameraTarget === 'body' ? 'Align your full body in the frame' : 'Frame your clothing item clearly'}
            </div>
          </div>
        </div>
      )}

      {/* Mode Tabs */}
      {!cameraActive && (
        <div className="mode-tabs glass">
          <button className={`mode-tab ${mode === 'upload' || mode === 'tryon' ? 'mode-tab--active' : ''}`} onClick={() => { setMode('upload'); setResult(null); }}>
            <Sparkles size={18} />
            Virtual Try-On
          </button>
          <button className={`mode-tab ${mode === 'add' ? 'mode-tab--active' : ''}`} onClick={() => setMode('add')}>
            <Upload size={18} />
            Add to Wardrobe
          </button>
        </div>
      )}

      {/* ADD MODE */}
      {mode === 'add' && !cameraActive && (
        <div className="add-mode animate-fade-in">
          <div className="add-card glass">
            <div className="add-icon-ring glass">
              <Camera size={48} strokeWidth={1.5} />
            </div>
            <h3>Add New Item</h3>
            <p>Digitize your wardrobe in seconds</p>
            
            <div className="add-actions">
              <button className="btn btn--primary glass-btn" onClick={() => startCamera('add')}>
                <Camera size={20} />
                Open Camera
              </button>
              <button className="btn btn--ghost w-full" onClick={() => addFileRef.current?.click()}>
                <Upload size={20} />
                Upload from Gallery
              </button>
            </div>
            <input ref={addFileRef} type="file" accept="image/*" onChange={handleAddUpload} hidden />
          </div>
          
          <div className="ai-notice glass">
            <Sparkles size={20} className="text-secondary" />
            <div>
              <strong>AI Auto-Tagging Active</strong>
              <p>We'll automatically extract category, colors, and style tags from your item.</p>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD MODE - No body image yet */}
      {mode === 'upload' && !bodyImage && !cameraActive && (
        <div className="upload-mode animate-fade-in">
          <div className="tryon-hero glass">
            <div className="hero-icon-ring glass">
              <User size={48} strokeWidth={1.5} />
            </div>
            <h2>Virtual Try-On</h2>
            <p>Upload or take a full-body photo to see how outfits look on you</p>
            
            <div className="upload-actions">
              <button className="upload-body-btn btn btn--primary glass-btn" onClick={() => startCamera('body')} id="upload-body-btn">
                <Camera size={20} />
                Take Photo Now
              </button>
              <button className="upload-body-btn btn btn--ghost w-full" onClick={() => fileRef.current?.click()}>
                <Upload size={20} />
                Choose from Gallery
              </button>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleBodyUpload} hidden />

          <div className="tryon-tips glass">
            <h3>📸 Tips for best results</h3>
            <ul>
              <li>Stand facing the camera with arms slightly apart</li>
              <li>Use a plain, well-lit background</li>
              <li>Wear form-fitting clothes for better AI overlay</li>
            </ul>
          </div>
        </div>
      )}

      {/* TRY-ON MODE - Body image uploaded */}
      {mode === 'tryon' && bodyImage && !cameraActive && (
        <div className="tryon-mode animate-fade-in">
          {/* Preview */}
          <div className="tryon-preview glass">
            <div className="tryon-image-container glass">
              <img src={result?.image || bodyImage} alt="Your photo" className="tryon-body-img" />
              {processing && (
                <div className="tryon-processing glass">
                  <Sparkles size={32} className="processing-sparkle" />
                  <span>AI is styling you...</span>
                </div>
              )}
              {result && !processing && (
                <div className="tryon-overlay-items">
                  {result.items.map((item, i) => (
                    <div key={item.id} className="overlay-tag glass" style={{ top: `${20 + i * 18}%`, left: '10px', animationDelay: `${i * 0.2}s` }}>
                      <span>{getCategoryIcon(item.category)}</span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="tryon-image-actions">
              <button className="img-action glass-btn btn" onClick={() => { setBodyImage(null); setResult(null); setMode('upload'); }}>
                <RotateCcw size={18} /> Re-Take
              </button>
              {result && (
                <>
                  <button className="img-action glass-btn btn"><Download size={18} /> Save</button>
                  <button className="img-action glass-btn btn"><Share2 size={18} /> Share</button>
                </>
              )}
            </div>
          </div>

          {/* Wardrobe selector */}
          <div className="tryon-wardrobe glass">
            <div className="tryon-wardrobe-header">
              <h3>Select Clothes (<span className="text-secondary">{selectedItems.length}</span>)</h3>
            </div>

            <div className="tryon-category-tabs">
              {['all', 'tops', 'bottoms', 'shoes', 'outerwear'].map(cat => (
                <button key={cat} className={`mini-tab glass-tab ${activeCategory === cat ? 'mini-tab--active' : ''}`} onClick={() => setActiveCategory(cat)}>
                  {cat === 'all' ? 'All' : getCategoryIcon(cat)}
                </button>
              ))}
            </div>

            <div className="tryon-items-scroll">
              {filteredWardrobe.map(item => (
                <button
                  key={item.id}
                  className={`tryon-item-chip glass ${selectedItems.includes(item.id) ? 'tryon-item-chip--selected' : ''}`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="tryon-chip-color" style={{ background: `linear-gradient(135deg, ${item.colors[0]}60, ${item.colors[1] || item.colors[0]}30)` }}>
                    {item.image ? <img src={item.image} alt="" /> : <span>{getCategoryIcon(item.category)}</span>}
                  </div>
                  <span className="tryon-chip-name">{item.name}</span>
                  {selectedItems.includes(item.id) && <span className="tryon-check">✓</span>}
                </button>
              ))}
              {filteredWardrobe.length === 0 && (
                 <div className="empty-state text-sm p-4 text-center op-70">
                    No items in this category yet.
                 </div>
              )}
            </div>

            <button className="btn btn--primary tryon-go-btn glass-btn" onClick={handleTryOn} disabled={selectedItems.length === 0 || processing} id="generate-tryon-btn">
              <Sparkles size={18} />
              {processing ? 'Processing...' : 'Generate Try-On'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
