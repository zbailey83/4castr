/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef } from 'react';
import { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt Effect with smooth spring animation
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || agent.status === 'idle') return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / (width / 2);
    const y = (e.clientY - top - height / 2) / (height / 2);
    cardRef.current.style.transform = `perspective(1000px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    }
  };

  const handleMouseEnter = () => {
    if (cardRef.current && agent.status !== 'idle') {
      cardRef.current.style.transition = 'transform 450ms linear(0, 0.2348, 0.6075, 0.8763, 1.0076, 1.0451, 1.0389, 1.0217, 1.0079, 1.0006, 0.9981, 0.9981, 0.9988, 0.9995, 1)';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 75) return 'bg-[var(--lime-green)]';
    if (score >= 50) return 'bg-yellow-400';
    return 'bg-[var(--hot-pink)]';
  };

  const getConfidenceText = (score: number) => {
    if (score >= 75) return 'text-[var(--lime-green)]';
    if (score >= 50) return 'text-yellow-600';
    return 'text-[var(--hot-pink)]';
  };

  const isLoading = agent.status === 'analyzing';
  const isDone = agent.status === 'completed';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
        className={`
        y2k-window
        ${isLoading ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : ''}
        flex flex-col h-full min-h-[300px] bg-white dark:bg-slate-800
      `}
      style={{
        transition: 'border-color 300ms ease-out, box-shadow 300ms ease-out',
      }}
    >
      {/* Header */}
      <div className="y2k-window-header justify-between bg-slate-100 dark:bg-slate-700">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : isDone ? 'bg-[var(--lime-green)]' : 'bg-slate-300 dark:bg-slate-500'}`}></div>
          <span className="truncate text-xs font-bold font-mono tracking-tighter text-slate-600 dark:text-slate-300">{agent.role.replace(/ /g, '_').toLowerCase()}.exe</span>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 border border-slate-400 dark:border-slate-500"></div>
          <div className="w-2 h-2 border border-slate-400 dark:border-slate-500 bg-slate-400 dark:bg-slate-500"></div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col h-full relative">
        <div className="flex items-start gap-3 mb-4 border-b-2 border-slate-100 dark:border-slate-700 pb-4">
          <div 
            className={`w-12 h-12 rounded border-2 border-black dark:border-slate-400 flex items-center justify-center text-2xl shadow-[4px_4px_0px_rgba(0,0,0,0.1)] bg-white dark:bg-slate-700 shrink-0`}
            style={{
              transition: 'transform 450ms linear(0, 0.2348, 0.6075, 0.8763, 1.0076, 1.0451, 1.0389, 1.0217, 1.0079, 1.0006, 0.9981, 0.9981, 0.9988, 0.9995, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.15) rotate(5deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            }}
          >
            {agent.icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-black dark:text-white font-bold text-sm md:text-base leading-tight font-sans text-transform uppercase tracking-tight">{agent.role}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 line-clamp-2 leading-tight">{agent.description}</p>
          </div>
        </div>

        <div className="flex-1 text-xs text-slate-800 dark:text-slate-200 relative flex flex-col">
          {agent.status === 'selected' && <div className="text-slate-400 dark:text-slate-500 italic flex items-center justify-center h-full font-mono">Waiting for execution...</div>}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-8 h-8 border-4 border-t-[var(--electric-blue)] border-r-[var(--hot-pink)] border-b-[var(--lime-green)] border-l-[var(--cyber-purple)] rounded-full animate-spin"></div>
              <span className="animate-pulse text-[var(--electric-blue)] font-mono text-[10px] uppercase tracking-widest font-bold">Dowloading Data...</span>
            </div>
          )}

          {isDone && agent.findings && (
            <div className="animate-fade-in flex flex-col h-full">
              {/* Prediction Badge */}
              <div className={`mb-4 font-mono text-center font-bold py-1 border-2 text-sm uppercase
                    ${agent.findings.prediction === 'YES' ? 'border-[var(--lime-green)] text-[var(--lime-green)] bg-green-50 dark:bg-green-900/30' :
                  agent.findings.prediction === 'NO' ? 'border-[var(--hot-pink)] text-[var(--hot-pink)] bg-pink-50 dark:bg-pink-900/30' : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'}
                `}>
                Prediction: {agent.findings.prediction}
              </div>

              {/* Confidence Meter */}
              <div className="mb-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Confidence</span>
                  <span className={`text-sm font-black ${getConfidenceText(agent.findings.confidenceScore)}`}>
                    {agent.findings.confidenceScore}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 overflow-hidden rounded">
                  <div
                    className={`h-full ${getConfidenceColor(agent.findings.confidenceScore)} relative`}
                    style={{ 
                      width: `${agent.findings.confidenceScore}%`,
                      transition: 'width 1000ms linear(0, 0.7973, 1.2533, 1.0429, 0.9361, 0.9912, 1.0161, 1.0017, 0.996, 0.9997, 1, 1, 1)',
                    }}
                  >
                    <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhZWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-20"></div>
                  </div>
                </div>
              </div>

              {/* Key Findings */}
              <div className="space-y-2 flex-1">
                {agent.findings.keyFindings.map((f, i) => (
                  <div 
                    key={i} 
                    className="text-[11px] leading-relaxed p-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-medium cursor-default text-slate-800 dark:text-slate-200"
                    style={{
                      transition: 'background-color 300ms ease-out, border-color 300ms ease-out, transform 450ms linear(0, 0.2348, 0.6075, 0.8763, 1.0076, 1.0451, 1.0389, 1.0217, 1.0079, 1.0006, 0.9981, 0.9981, 0.9988, 0.9995, 1)',
                      animationDelay: `${i * 50}ms`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgb(241 245 249)';
                      e.currentTarget.style.borderColor = 'var(--electric-blue)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <span 
                      className="mr-1 text-[var(--cyber-purple)] inline-block"
                      style={{
                        transition: 'transform 450ms linear(0, 0.2348, 0.6075, 0.8763, 1.0076, 1.0451, 1.0389, 1.0217, 1.0079, 1.0006, 0.9981, 0.9981, 0.9988, 0.9995, 1)',
                      }}
                    >
                      ►
                    </span> {f}
                  </div>
                ))}
              </div>

              {/* Reasoning Footer */}
              <div className="mt-3 pt-3 border-t-2 border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 dark:text-slate-500 italic line-clamp-2 font-serif">
                "{agent.findings.reasoning}"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
