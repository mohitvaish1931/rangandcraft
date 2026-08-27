import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { API_ENDPOINTS } from '../utils/api';

const ShowcaseVideos: React.FC = () => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const { state, dispatch } = useAppContext();
  const [items, setItems] = useState<any[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (state.videos && state.videos.length > 0) {
      setItems(state.videos as any[]);
    } else {
      setItems([
        { id: 'mor', type: 'video', src: 'https://player.vimeo.com/external/447822549.sd.mp4?s=8d1b6e8f3f3c8e3c9d8b3b7d9b6a6c1f3c2d1e0f', title: 'mor' },
        { id: 'showcase1', type: 'video', src: 'https://player.vimeo.com/external/452301931.sd.mp4?s=0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8g9', title: 'showcase1' },
      ]);
    }
  }, [state.videos]);

  const addVideo = async () => {
    try {
        if (file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('title', title || file.name || 'Video');
        const res = await fetch(API_ENDPOINTS.VIDEOS, { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Add failed');
        const v = await res.json();
        dispatch({ type: 'SET_VIDEOS', payload: [v, ...(state.videos || [])] });
      } else if (url) {
        const res = await fetch(API_ENDPOINTS.VIDEOS, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title || 'Video', url }) });
        if (!res.ok) throw new Error('Add failed');
        const v = await res.json();
        dispatch({ type: 'SET_VIDEOS', payload: [v, ...(state.videos || [])] });
      } else {
        return;
      }
      setTitle(''); setUrl(''); setFile(null); setShowInput(false);
    } catch (e) {
      // fallback to local
      const id = Date.now().toString();
      const newV = { id, title: title || (file ? file.name : 'Video'), url: url || (file ? URL.createObjectURL(file) : '') };
      dispatch({ type: 'ADD_VIDEO', payload: newV });
      setTitle(''); setUrl(''); setFile(null); setShowInput(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="py-24 bg-luxury-dark border-t border-gold-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="text-left">
            <h3 className="luxury-serif text-3xl md:text-4xl text-text-primary mb-2">CINEMATIC JOURNEY</h3>
            <p className="text-text-secondary text-sm font-light italic tracking-wide">Witness the artistry in motion</p>
          </div>
          <div className="flex items-center gap-4">
            {state.user && state.user.email === 'admin@RANG AND CRAFT.com' && (
              <button 
                onClick={() => setShowInput(!showInput)} 
                className="px-6 py-2.5 bg-primary-purple text-white rounded-full text-xs tracking-widest luxury-serif hover:bg-text-primary transition-all duration-300 shadow-lg hover:shadow-primary-purple/20"
              >
                {showInput ? 'CLOSE' : 'ADD VIDEO'}
              </button>
            )}
            <div className="hidden sm:flex gap-4">
              <button
                onClick={() => scroll('left')}
                className="w-12 h-12 rounded-full bg-white border border-gold-primary/20 text-text-primary hover:bg-primary-purple hover:text-white hover:border-primary-purple transition-all duration-300 shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6 mx-auto" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-12 h-12 rounded-full bg-white border border-gold-primary/20 text-text-primary hover:bg-primary-purple hover:text-white hover:border-primary-purple transition-all duration-300 shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6 mx-auto" />
              </button>
            </div>
          </div>
        </div>

        {showInput && (
          <div className="mb-12 animate-fade-in">
            <div className="bg-white border border-gold-primary/30 p-8 rounded-3xl shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Video Title" 
                  className="px-6 py-3 bg-luxury-dark border border-gold-primary/20 text-text-primary rounded-full placeholder-text-muted outline-none focus:border-primary-purple transition-all duration-300" 
                />
                <input 
                  value={url} 
                  onChange={e => setUrl(e.target.value)} 
                  placeholder="Video URL (mp4)" 
                  className="px-6 py-3 bg-luxury-dark border border-gold-primary/20 text-text-primary rounded-full placeholder-text-muted outline-none focus:border-primary-purple transition-all duration-300" 
                />
                <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={e => setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} 
                    className="text-xs text-text-secondary"
                  />
                  <button 
                    onClick={addVideo} 
                    className="bg-primary-purple text-white px-8 py-3 rounded-full text-xs tracking-widest luxury-serif hover:bg-text-primary transition-all duration-300 shadow-md"
                  >
                    ADD
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          ref={scrollerRef}
          className="flex gap-8 overflow-x-auto no-scrollbar pb-8 pr-4 snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth' }}
        >
          {items.map((item) => (
            <div
              key={(item as any)._id || item.id}
              className="min-w-[280px] sm:min-w-[340px] md:min-w-[380px] snap-start bg-white border border-gold-primary/20 rounded-3xl overflow-hidden relative shadow-lg group hover:border-primary-purple/30 transition-all duration-500"
            >
              <Link to="/products">
                {item.type === 'video' ? (
                  <video
                    src={item.src}
                    className="w-full h-[520px] object-cover group-hover:scale-105 transition-transform duration-700"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img 
                    src={(item as any).src} 
                    alt={item.title} 
                    className="w-full h-[520px] object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-primary-purple/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="absolute left-6 bottom-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-xs luxury-serif tracking-[0.2em] bg-white/90 backdrop-blur-md text-text-primary px-6 py-2.5 rounded-full border border-gold-primary/30 shadow-xl uppercase font-bold">
                    {item.title}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Mobile controls */}
        <div className="flex sm:hidden justify-center gap-6 mt-6">
          <button
            onClick={() => scroll('left')}
            className="w-12 h-12 rounded-full bg-white border border-gold-primary/20 text-text-primary shadow-sm"
            aria-label="Scroll left mobile"
          >
            <ChevronLeft className="w-6 h-6 mx-auto" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-12 h-12 rounded-full bg-white border border-gold-primary/20 text-text-primary shadow-sm"
            aria-label="Scroll right mobile"
          >
            <ChevronRight className="w-6 h-6 mx-auto" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseVideos;
