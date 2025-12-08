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
  
  // 3D Tilt Effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || agent.status === 'idle') return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / (width / 2);
    const y = (e.clientY - top - height / 2) / (height / 2);
    cardRef.current.style.transform = `perspective(1000px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 75) return 'from-emerald-400 to-green-500 shadow-emerald-500/50';
    if (score >= 50) return 'from-yellow-400 to-amber-500 shadow-amber-500/50';
    return 'from-red-400 to-orange-500 shadow-red-500/50';
  };

  const getConfidenceText = (score: number) => {
    if (score >= 75) return 'text-emerald-300';
    if (score >= 50) return 'text-amber-300';
    return 'text-red-300';
  };

  const isLoading = agent.status === 'analyzing';
  const isDone = agent.status === 'completed';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        relative overflow-hidden rounded-xl border p-4 shadow-xl transition-all duration-500 backdrop-blur-md group
        ${isLoading ? 'border-yellow-400/50 bg-yellow-900/20' : ''}
        ${isDone ? 'border-indigo-400/50 bg-indigo-900/40' : 'border-slate-700 bg-slate-800/60'}
        flex flex-col h-full min-h-[240px]
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br ${agent.color} shadow-lg shrink-0`}>
          {agent.icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-white font-bold text-sm md:text-base leading-none truncate">{agent.role}</h3>
          <p className="text-slate-400 text-[10px] mt-1 line-clamp-1">{agent.description}</p>
        </div>
        {isDone && (
            <div className={`ml-auto font-mono text-xs font-bold px-2 py-1 rounded border border-white/10 shrink-0 ${
                agent.findings?.prediction === 'YES' ? 'bg-green-500/20 text-green-300' :
                agent.findings?.prediction === 'NO' ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'
            }`}>
                {agent.findings?.prediction}
            </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 text-xs text-slate-300 relative flex flex-col">
        {agent.status === 'selected' && <div className="text-slate-500 italic flex items-center justify-center h-full">Queued for analysis...</div>}
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-80">
            <div className="relative">
                <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
            </div>
            <span className="animate-pulse text-yellow-200/80 font-mono text-[10px] uppercase tracking-widest">Scanning Data Sources...</span>
          </div>
        )}

        {isDone && agent.findings && (
          <div className="animate-fade-in flex flex-col h-full">
             {/* Confidence Meter */}
             <div className="mb-4">
                <div className="flex justify-between items-end mb-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Confidence</span>
                    <span className={`text-sm font-mono font-bold ${getConfidenceText(agent.findings.confidenceScore)}`}>
                        {agent.findings.confidenceScore}%
                    </span>
                </div>
                <div className="w-full h-1.5 bg-slate-900/80 rounded-full overflow-hidden border border-white/5">
                    <div 
                        className={`h-full bg-gradient-to-r ${getConfidenceColor(agent.findings.confidenceScore)} shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all duration-1000 ease-out relative`} 
                        style={{ width: `${agent.findings.confidenceScore}%` }}
                    >
                         <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
             </div>

             {/* Key Findings */}
             <div className="space-y-2 flex-1">
                {agent.findings.keyFindings.map((f, i) => (
                    <div key={i} className="text-[11px] leading-relaxed bg-black/20 p-2 rounded-md border-l-2 border-slate-700/50 hover:border-indigo-500/50 transition-colors">
                        {f}
                    </div>
                ))}
             </div>
             
             {/* Reasoning Footer */}
             <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-slate-400/80 italic line-clamp-2">
                "{agent.findings.reasoning}"
             </div>
          </div>
        )}
      </div>
      
      {/* Status Light */}
      <div className={`absolute top-0 right-0 p-1`}>
         <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-ping' : isDone ? 'bg-indigo-400' : 'hidden'}`}></div>
      </div>
    </div>
  );
};