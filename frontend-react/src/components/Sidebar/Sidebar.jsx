import SearchBar from './SearchBar';
import LocationCard from './LocationCard';

export default function Sidebar({ locations, selectedId, onSelectLocation, onAddLocation, searchPlaces }) {
  return (
    <aside className="glass-sidebar h-full flex flex-col overflow-hidden"
           style={{ width: '320px', minWidth: '320px' }}>
      <SearchBar onAddLocation={onAddLocation} searchPlaces={searchPlaces} />
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
        {locations.map(loc => (
          <LocationCard
            key={loc.id}
            location={loc}
            isActive={loc.id === selectedId}
            onClick={onSelectLocation}
          />
        ))}
      </div>
    </aside>
  );
}
