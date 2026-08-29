export default function SkyBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden"
         style={{ background: 'linear-gradient(180deg, #0D1B2A 0%, #1B263B 30%, #1D395E 60%, #415A77 100%)' }}>
      {/* Ambient glow spots */}
      <div className="ambient-glow" />
      <div className="ambient-glow-2" />

      {/* Volumetric cloud layers */}
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />
      <div className="cloud cloud-4" />

      {/* Horizon light */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%] pointer-events-none"
           style={{ background: 'linear-gradient(180deg, transparent, rgba(90,132,179,0.08))' }} />
    </div>
  );
}
