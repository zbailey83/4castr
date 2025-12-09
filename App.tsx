/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { AgentCard } from './components/AgentCard';
import { Agent, MarketAnalysis } from './types';
import { AVAILABLE_AGENTS } from './constants';
import { orchestrateAgents, runAgentAnalysis, generateConsensus } from './services/geminiService';

function App() {
  const [analysis, setAnalysis] = useState<MarketAnalysis>({
    topic: '',
    status: 'input',
    agents: []
  });

  const [inputText, setInputText] = useState('');
  const [isOrchestrating, setIsOrchestrating] = useState(false);

  // --- Actions ---

  const startAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setAnalysis(prev => ({ ...prev, topic: inputText, status: 'orchestrating' }));
    setIsOrchestrating(true);

    // 1. Orchestrate
    const availableRoles = AVAILABLE_AGENTS.map(a => a.role);
    const selectedRoles = await orchestrateAgents(inputText, availableRoles as string[]);
    
    // Create Agent instances
    const newAgents: Agent[] = selectedRoles.map((role, idx) => {
      const template = AVAILABLE_AGENTS.find(a => a.role === role)!;
      return { ...template, id: idx.toString(), status: 'selected' };
    });

    setAnalysis(prev => ({
      ...prev,
      status: 'swarming',
      agents: newAgents
    }));
    setIsOrchestrating(false);

    // 2. Swarm Execution (Parallel)
    const agentPromises = newAgents.map(async (agent) => {
        // Set to loading
        setAnalysis(prev => ({
            ...prev,
            agents: prev.agents.map(a => a.id === agent.id ? { ...a, status: 'analyzing' } : a)
        }));

        // Fetch
        const results = await runAgentAnalysis(agent.role, inputText);

        // Update
        setAnalysis(prev => ({
            ...prev,
            agents: prev.agents.map(a => a.id === agent.id ? { ...a, status: 'completed', findings: results } : a)
        }));
        
        return { role: agent.role, data: results };
    });

    const allFindings = await Promise.all(agentPromises);

    // 3. Consensus
    setAnalysis(prev => ({ ...prev, status: 'consensus' }));
    
    const consensus = await generateConsensus(inputText, allFindings);
    
    setAnalysis(prev => ({
        ...prev,
        finalConsensus: consensus
    }));
  };

  const reset = () => {
    setAnalysis({ topic: '', status: 'input', agents: [] });
    setInputText('');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden text-black scanlines grain">
      
      <div className="absolute inset-0 flex flex-col items-center p-4 md:p-8 overflow-y-auto">
        
        {/* Header Area */}
        <header className="w-full max-w-5xl flex justify-between items-center mb-8 z-10">
          <div className="flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-[var(--electric-blue)] to-[var(--cyber-purple)] flex items-center justify-center font-bold text-2xl text-white shadow-lg group-hover:rotate-12 transition-transform duration-300">
                4
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]" style={{fontFamily: 'var(--font-heading)'}}>
                4CASTR
            </h1>
          </div>
          {analysis.status !== 'input' && (
             <button onClick={reset} className="y2k-btn bg-white/80 backdrop-blur-sm text-sm py-2 px-6">
                New Analysis
             </button>
          )}
        </header>

        {/* --- Phase 1: Input --- */}
        {analysis.status === 'input' && (
          <div className="flex-1 flex flex-col justify-center items-center w-full max-w-2xl animate-fade-in-up hover:scale-[1.01] transition-transform duration-500">
            <div className="y2k-window w-full shadow-[12px_12px_0px_rgba(0,0,0,0.1)]">
               <div className="y2k-window-header justify-between">
                   <div className="flex gap-2 items-center">
                       <span className="text-[var(--primary)] font-bold">prediction_swarm.exe</span>
                   </div>
                   <div className="y2k-window-controls">
                       <div className="y2k-control-dot bg-yellow-400"></div>
                       <div className="y2k-control-dot bg-green-400"></div>
                       <div className="y2k-control-dot bg-red-400"></div>
                   </div>
               </div>
               
               <div className="p-8 bg-white/90 backdrop-blur-xl">
                    <h2 className="text-3xl font-bold mb-4 text-center" style={{fontFamily: 'var(--font-heading)'}}>
                        Prediction Swarm
                    </h2>
                    <p className="text-slate-600 text-center mb-8 text-lg">
                        Enter a Polymarket URL or a prediction question to deploy the agent swarm.
                    </p>
                   
                    <form onSubmit={startAnalysis} className="space-y-6">
                     <input
                        type="text"
                        placeholder="e.g. Will Bitcoin hit $100k in 2024?"
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded px-4 py-4 text-lg focus:outline-none focus:border-[var(--electric-blue)] focus:shadow-[4px_4px_0px_var(--electric-blue)] transition-all placeholder:text-slate-400"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                     />
                     <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="w-full y2k-btn bg-[var(--electric-blue)] text-white border-white shadow-[4px_4px_0px_rgba(0,0,0,0.2)] hover:bg-[var(--lime-green)] hover:border-white hover:text-black font-bold text-xl py-4"
                     >
                        Deploy Agents
                     </button>
                    </form>

                    {/* Sample Prompts */}
                    <div className="mt-8 flex flex-wrap gap-3 justify-center">
                        {['Will GTA VI release in 2025?', 'Fed Interest Rate Cuts 2024', 'Box Office: Dune 2'].map(s => (
                            <button key={s} onClick={() => setInputText(s)} className="text-sm bg-slate-100 hover:bg-[var(--hot-pink)] hover:text-white border border-slate-300 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-medium">
                                {s}
                            </button>
                        ))}
                    </div>
               </div>
            </div>
          </div>
        )}

        {/* --- Phase 2: Orchestration & Swarm --- */}
        {analysis.status !== 'input' && (
            <div className="w-full max-w-7xl flex flex-col gap-8 animate-fade-in pb-20">
                
                {/* Orchestrator Card */}
                <div className="y2k-window w-full shadow-lg">
                    <div className="y2k-window-header bg-gradient-to-r from-blue-100 to-white">
                        <span>orchestrator_log.txt</span>
                    </div>
                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 bg-white/95">
                        
                        <div className={`w-24 h-24 rounded-full border-4 border-[var(--electric-blue)] flex items-center justify-center text-4xl shrink-0 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] ${isOrchestrating ? 'animate-spin' : ''} bg-white`}>
                            {isOrchestrating ? <span>⚙️</span> : <span>🧠</span>}
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                            <div className="text-[var(--hot-pink)] font-mono uppercase tracking-widest mb-2 font-bold">Current Analysis</div>
                            <h2 className="text-3xl md:text-4xl font-black text-black mb-2" style={{fontFamily: 'var(--font-heading)'}}>"{analysis.topic}"</h2>
                            {isOrchestrating ? (
                                <p className="text-slate-500 text-lg animate-pulse">Analyzing topic complexity and selecting optimal agent swarm...</p>
                            ) : (
                                <p className="text-slate-700 text-lg">Deployed <span className="font-bold bg-[var(--lime-green)] px-2"> {analysis.agents.length} specialist agents</span> to analyze market sentiment.</p>
                            )}
                        </div>

                        {/* Final Consensus Display */}
                        {analysis.finalConsensus && (
                            <div className="flex items-center gap-4 bg-black text-white p-6 rounded border-2 border-[var(--lime-green)] animate-bounce shadow-[6px_6px_0px_var(--lime-green)]">
                                <div className="text-right">
                                    <div className="text-[10px] text-[var(--lime-green)] uppercase tracking-widest mb-1">Consensus Probability</div>
                                    <div className={`text-4xl font-black ${analysis.finalConsensus.probability > 50 ? 'text-[var(--lime-green)]' : 'text-red-500'}`} style={{fontFamily: 'var(--font-heading)'}}>
                                        {analysis.finalConsensus.probability}% <span className="text-lg text-white">YES</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Agent Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {analysis.agents.map((agent) => (
                        <div key={agent.id} className="animate-fade-in-up" style={{animationDelay: `${parseInt(agent.id) * 100}ms`}}>
                            <AgentCard agent={agent} />
                        </div>
                    ))}
                    {/* Placeholder loading skeletons if orchestrating */}
                    {isOrchestrating && [1,2,3].map(i => (
                         <div key={i} className="h-[240px] rounded-lg border-2 border-slate-200 bg-white/50 animate-pulse"></div>
                    ))}
                </div>

                {/* Final Verdict Section */}
                {analysis.finalConsensus && (
                    <div className="y2k-window w-full shadow-2xl mt-4 animate-fade-in-up">
                        <div className="y2k-window-header bg-[var(--hot-pink)] text-white">
                            <span>VERDICT_FINAL.DOC</span>
                        </div>
                        <div className="bg-white p-8">
                            <h3 className="text-2xl font-bold text-black mb-6 flex items-center gap-3" style={{fontFamily: 'var(--font-heading)'}}>
                                <span>⚖️</span> Swarm Verdict
                            </h3>
                            <p className="text-xl text-black mb-8 font-medium leading-relaxed border-l-8 border-[var(--cyber-purple)] pl-6 bg-slate-50 py-4">
                                {analysis.finalConsensus.verdict}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {analysis.finalConsensus.topReasons.map((reason, i) => (
                                    <div key={i} className="bg-slate-50 p-4 rounded border-2 border-slate-100 hover:border-[var(--electric-blue)] transition-colors group">
                                        <span className="text-[var(--electric-blue)] font-black text-2xl mr-2 group-hover:scale-110 inline-block transition-transform">0{i+1}</span>
                                        <span className="font-medium text-slate-800">{reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

      </div>
      
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default App;
