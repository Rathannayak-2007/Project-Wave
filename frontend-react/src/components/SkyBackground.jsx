import { useEffect, useState } from 'react';

export default function SkyBackground() {
  const [isDay, setIsDay] = useState(true);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      // Get current hour in IST
      const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
      const hours = istTime.getHours();
      
      // 6 AM to 6 PM (18:00) is Day
      setIsDay(hours >= 6 && hours < 18);
    };
    
    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#0D1B2A]">
      <img 
        src={isDay ? "/assets/day_sky.jpg" : "/assets/night_sky.jpg"} 
        alt="Sky Background" 
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
      />

      {/* Ambient glow spots overlay */}
      <div className="ambient-glow opacity-30" />
      <div className="ambient-glow-2 opacity-30" />

      {/* Horizon light */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%] pointer-events-none"
           style={{ background: 'linear-gradient(180deg, transparent, rgba(90,132,179,0.3))' }} />
    </div>
  );
}
