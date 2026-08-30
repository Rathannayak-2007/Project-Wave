import { useEffect, useRef } from 'react';

export default function SkyBackground() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.3;
    }
  }, []);
  
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#0D1B2A]">
      {/* Heavily blurred video for smooth morphing colors without visible frame stutter */}
      <video 
        ref={videoRef}
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen scale-110"
        style={{ filter: 'blur(20px)' }}
      >
        <source src="/assets/sky_background.mp4" type="video/mp4" />
      </video>

      {/* 60fps Smooth CSS Clouds */}
      <div className="cloud cloud-1 !opacity-40" />
      <div className="cloud cloud-2 !opacity-50" />
      <div className="cloud cloud-3 !opacity-30" />
      <div className="cloud cloud-4 !opacity-40" />

      {/* Ambient glow spots overlay */}
      <div className="ambient-glow opacity-60" />
      <div className="ambient-glow-2 opacity-60" />

      {/* Horizon light */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%] pointer-events-none"
           style={{ background: 'linear-gradient(180deg, transparent, rgba(90,132,179,0.3))' }} />
    </div>
  );
}
