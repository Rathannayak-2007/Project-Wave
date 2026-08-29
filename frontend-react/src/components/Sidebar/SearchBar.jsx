import { useState, useRef, useEffect } from 'react';

export default function SearchBar({ onAddLocation, searchPlaces }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const places = await searchPlaces(value);
        setResults(places);
        setIsOpen(places.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (place) => {
    onAddLocation(place);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="px-3 pt-4 pb-2 relative" ref={containerRef}>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Search for a city..."
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm font-medium
                     bg-white/8 border border-white/10 text-white/80 placeholder-white/30
                     focus:outline-none focus:border-white/25 focus:bg-white/12
                     transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute left-3 right-3 top-full mt-1 z-50 rounded-xl overflow-hidden
                        bg-sky-mid/95 backdrop-blur-xl border border-white/10 shadow-2xl
                        max-h-[320px] overflow-y-auto"
             style={{ background: 'rgba(27, 38, 59, 0.95)' }}>
          {results.map((place) => (
            <button
              key={place.id}
              onClick={() => handleSelect(place)}
              className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors
                         border-b border-white/5 last:border-0 flex items-center gap-3"
            >
              <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <div>
                <p className="text-white text-sm font-medium">{place.name}</p>
                <p className="text-white/40 text-xs">
                  {place.admin1}{place.admin1 && place.country ? ', ' : ''}{place.country}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
