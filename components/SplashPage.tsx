/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState, useRef } from 'react';

interface SplashPageProps {
  onEnter: () => void;
}

export const SplashPage: React.FC<SplashPageProps> = ({ onEnter }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Enable scrolling for splash page
    document.body.style.overflow = 'auto';
    // Trigger ready state after initial render
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'hidden';
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollTop = window.scrollY;
      const maxScroll = containerRef.current.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / maxScroll, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleEnterClick = () => {
    // Smooth scroll to top before transitioning
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      onEnter();
    }, 500);
  };

  const words = [
    "Welcome",
    "to",
    "4CASTR",
    "—",
    "Where",
    "AI",
    "Agents",
    "Swarm",
    "to",
    "Predict",
    "the",
    "Future"
  ];

  useEffect(() => {
    // Enable scrolling for splash page
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-screen min-h-[200vh] overflow-hidden text-black scanlines grain"
    >
      {/* Fixed background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--electric-blue)] via-[var(--lime-green)] to-[var(--cyber-purple)] opacity-90" />
      
      {/* Animated text container */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
        <div 
          ref={textRef}
          className={`text-center transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 px-4">
            {words.map((word, index) => {
              const wordProgress = Math.max(0, Math.min(1, (scrollProgress * words.length) - index));
              const opacity = wordProgress > 0.3 ? 1 : wordProgress * 3;
              const scale = 0.8 + (wordProgress * 0.4);
              const yOffset = (1 - wordProgress) * 50;
              
              return (
                <span
                  key={index}
                  className="inline-block text-4xl md:text-6xl lg:text-8xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)]"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    opacity,
                    transform: `translateY(${yOffset}px) scale(${scale})`,
                    transition: 'opacity 400ms linear(0, 0.7973, 1.2533, 1.0429, 0.9361, 0.9912, 1.0161, 1.0017, 0.996, 0.9997, 1, 1, 1), transform 400ms linear(0, 0.7973, 1.2533, 1.0429, 0.9361, 0.9912, 1.0161, 1.0017, 0.996, 0.9997, 1, 1, 1)',
                    textShadow: '0 0 20px rgba(255,255,255,0.5), 4px 4px 0px rgba(0,0,0,0.3)',
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
        <div 
          className={`flex flex-col items-center gap-2 transition-opacity duration-500 ${scrollProgress > 0.8 ? 'opacity-0' : 'opacity-100'}`}
        >
          <span className="text-white text-sm font-bold uppercase tracking-widest drop-shadow-lg">
            Scroll to Continue
          </span>
          <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
            <div 
              className="w-1 h-3 bg-white rounded-full animate-bounce"
              style={{
                animation: 'bounce 1.5s infinite',
              }}
            />
          </div>
        </div>
      </div>

      {/* Enter button - appears when scrolled enough */}
      <div 
        className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-700 ${
          scrollProgress > 0.7 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <button
          onClick={handleEnterClick}
          className="y2k-btn bg-white/90 backdrop-blur-md text-[var(--hot-pink)] border-2 border-white shadow-[8px_8px_0px_rgba(0,0,0,0.3)] font-bold text-xl md:text-2xl px-8 md:px-12 py-4 md:py-6 uppercase tracking-wider relative overflow-hidden group"
          style={{
            transition: 'transform 500ms linear(0, 0.3892, 0.921, 1.1515, 1.1295, 1.037, 0.9817, 0.9751, 0.9892, 1.0011, 1, 1.0026, 1.0003, 0.9993, 0.9994, 0.9998, 1), box-shadow 500ms linear(0, 0.3892, 0.921, 1.1515, 1.1295, 1.037, 0.9817, 0.9751, 0.9892, 1.0011, 1, 1.0026, 1.0003, 0.9993, 0.9994, 0.9998, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '12px 12px 0px rgba(0,0,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '8px 8px 0px rgba(0,0,0,0.3)';
          }}
        >
          <span className="relative z-10">Enter Prediction Swarm</span>
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--electric-blue)] via-[var(--lime-green)] to-[var(--cyber-purple)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* Spacer to enable scrolling */}
      <div className="h-[150vh] w-full" />

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>
    </div>
  );
};

