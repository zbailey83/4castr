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
    // Enable scrolling for splash page - override CSS
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyHeight = document.body.style.height;
    
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    
    // Trigger ready state after initial render
    const timer = setTimeout(() => setIsReady(true), 100);
    
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalBodyOverflow || 'hidden';
      document.body.style.height = originalBodyHeight || '';
      document.documentElement.style.overflow = originalHtmlOverflow || 'hidden';
      document.documentElement.style.height = '';
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      // Get scroll position - try multiple methods for compatibility
      const scrollTop = window.pageYOffset 
        || document.documentElement.scrollTop 
        || document.body.scrollTop 
        || 0;
      
      // Get container dimensions
      const containerHeight = containerRef.current.offsetHeight || containerRef.current.scrollHeight;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // Calculate max scrollable distance
      const maxScroll = Math.max(containerHeight - viewportHeight, viewportHeight);
      const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      
      setScrollProgress(progress);
    };

    // Use requestAnimationFrame for smoother scroll tracking
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Wait for DOM to be ready and force a recalculation
    const initTimer = setTimeout(() => {
      handleScroll();
      // Force a layout recalculation
      if (containerRef.current) {
        containerRef.current.offsetHeight;
      }
    }, 150);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Also listen on the document for better compatibility
    document.addEventListener('scroll', onScroll, { passive: true });
    
    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleScroll);
      document.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleEnterClick = () => {
    // Smooth scroll to top before transitioning
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      onEnter();
    }, 500);
  };

  const lines = [
    ["Welcome", "to"],
    ["4CASTR"],
    ["Where", "AI", "Agents", "Swarm"],
    ["to", "Predict", "the", "Future"]
  ];

  return (
    <div 
      ref={containerRef}
      className="relative w-full min-h-[200vh] text-black scanlines grain"
      style={{ 
        overflow: 'visible',
        position: 'relative',
        zIndex: 1
      }}
    >
      {/* Fixed background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--electric-blue)] via-[var(--lime-green)] to-[var(--cyber-purple)] opacity-90" />
      
      {/* Animated text container */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10">
        <div 
          ref={textRef}
          className={`text-center transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex flex-col items-center justify-center gap-4 md:gap-6 lg:gap-8 px-4">
            {lines.map((line, lineIndex) => {
              const lineProgress = Math.max(0, Math.min(1, (scrollProgress * lines.length) - lineIndex));
              const opacity = lineProgress > 0.3 ? 1 : lineProgress * 3;
              const scale = 0.8 + (lineProgress * 0.4);
              const yOffset = (1 - lineProgress) * 50;
              const is4CASTR = lineIndex === 1 && line[0] === '4CASTR';
              
              return (
                <div
                  key={lineIndex}
                  className="flex flex-wrap justify-center items-center gap-2 md:gap-3 lg:gap-4"
                  style={{
                    opacity,
                    transform: `translateY(${yOffset}px) scale(${scale})`,
                    transition: 'opacity 400ms linear(0, 0.7973, 1.2533, 1.0429, 0.9361, 0.9912, 1.0161, 1.0017, 0.996, 0.9997, 1, 1, 1), transform 400ms linear(0, 0.7973, 1.2533, 1.0429, 0.9361, 0.9912, 1.0161, 1.0017, 0.996, 0.9997, 1, 1, 1)',
                  }}
                >
                  {line.map((word, wordIndex) => {
                    const is4CASTRWord = is4CASTR && wordIndex === 0;
                    return (
                      <span
                        key={`${lineIndex}-${wordIndex}`}
                        className={`inline-block font-black drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)] ${
                          is4CASTRWord 
                            ? 'text-5xl md:text-7xl lg:text-9xl animate-pulse-glow' 
                            : 'text-4xl md:text-6xl lg:text-8xl'
                        }`}
                        style={{
                          fontFamily: 'var(--font-heading)',
                          letterSpacing: is4CASTRWord ? '0.1em' : '0.05em',
                          textShadow: is4CASTRWord 
                            ? '0 0 40px rgba(0,212,255,0.8), 0 0 80px rgba(154,255,0,0.6), 0 0 120px rgba(191,0,255,0.4), 4px 4px 0px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.5)'
                            : '0 0 20px rgba(255,255,255,0.5), 4px 4px 0px rgba(0,0,0,0.3)',
                          background: is4CASTRWord 
                            ? 'linear-gradient(135deg, #00d4ff 0%, #9aff00 25%, #ff006e 50%, #bf00ff 75%, #00d4ff 100%)'
                            : 'transparent',
                          backgroundSize: is4CASTRWord ? '200% 200%' : 'auto',
                          WebkitBackgroundClip: is4CASTRWord ? 'text' : 'initial',
                          WebkitTextFillColor: is4CASTRWord ? 'transparent' : 'white',
                          backgroundClip: is4CASTRWord ? 'text' : 'initial',
                          animation: is4CASTRWord ? 'pulse-glow 3s ease-in-out infinite, gradient-shift-text 4s ease infinite' : 'none',
                          filter: is4CASTRWord ? 'brightness(1.2)' : 'none',
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
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

      {/* Spacer to enable scrolling - increased height for better scroll experience */}
      <div className="h-[200vh] w-full" aria-hidden="true" />

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        @keyframes pulse-glow {
          0%, 100% { 
            filter: brightness(1.2) drop-shadow(0 0 40px rgba(0,212,255,0.8)) drop-shadow(0 0 80px rgba(154,255,0,0.6));
            transform: scale(1);
          }
          50% { 
            filter: brightness(1.5) drop-shadow(0 0 60px rgba(0,212,255,1)) drop-shadow(0 0 100px rgba(154,255,0,0.8)) drop-shadow(0 0 140px rgba(191,0,255,0.6));
            transform: scale(1.05);
          }
        }
        @keyframes gradient-shift-text {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite, gradient-shift-text 4s ease infinite;
        }
      `}</style>
    </div>
  );
};

