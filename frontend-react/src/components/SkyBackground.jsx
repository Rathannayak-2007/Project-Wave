import { useEffect, useRef } from 'react';

export default function SkyBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
  }, []);
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#0D1B2A]">
      {/* Video Background */}
      <video 
        ref={videoRef}
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen"
      >
        <source src="/assets/sky_background.mp4" type="video/mp4" />
      </video>

      {/* Ambient glow spots overlay */}
      <div className="ambient-glow opacity-50" />
      <div className="ambient-glow-2 opacity-50" />

      {/* Horizon light */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%] pointer-events-none"
           style={{ background: 'linear-gradient(180deg, transparent, rgba(90,132,179,0.2))' }} />
    </div>
  );
}
