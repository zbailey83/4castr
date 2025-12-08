/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { Background3D } from './components/Background3D';
import { AgentCard } from './components/AgentCard';
import { Agent, MarketAnalysis, AgentRole } from './types';
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
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 text-white font-sans selection:bg-indigo-500/30">
      
      {/* Persistent Background */}
      <Background3D />

      <div className="absolute inset-0 flex flex-col items-center p-4 md:p-8 overflow-y-auto">
        
        {/* Header Area */}
        <header className="w-full max-w-5xl flex justify-between items-center mb-8 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-lg">4</div>
            <h1 className="text-xl font-bold tracking-widest text-blue-100">4CASTR</h1>
          </div>
          {analysis.status !== 'input' && (
             <button onClick={reset} className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                New Analysis
             </button>
          )}
        </header>

        {/* --- Phase 1: Input --- */}
        {analysis.status === 'input' && (
          <div className="flex-1 flex flex-col justify-center items-center w-full max-w-xl animate-fade-in-up">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl w-full">
               <h2 className="text-2xl font-light mb-2 text-center">Prediction Markets Swarm</h2>
               <p className="text-slate-400 text-center text-sm mb-6">Enter a Polymarket URL or a prediction question to deploy the agent swarm.</p>
               
               <form onSubmit={startAnalysis} className="space-y-4">
                 <input
                    type="text"
                    placeholder="e.g. Will Bitcoin hit $100k in 2024?"
                    className="w-full bg-black/40 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                 />
                 <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                 >
                    Deploy Agents
                 </button>
               </form>
            </div>
            
            {/* Sample Prompts */}
            <div className="mt-8 flex gap-2 overflow-x-auto max-w-full pb-2 no-scrollbar">
                {['Will GTA VI release in 2025?', 'Fed Interest Rate Cuts 2024', 'Box Office: Dune 2'].map(s => (
                    <button key={s} onClick={() => setInputText(s)} className="text-xs bg-slate-800/50 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors">
                        {s}
                    </button>
                ))}
            </div>
          </div>
        )}

        {/* --- Phase 2: Orchestration & Swarm --- */}
        {analysis.status !== 'input' && (
            <div className="w-full max-w-6xl flex flex-col gap-6 animate-fade-in pb-20">
                
                {/* Orchestrator Card */}
                <div className="w-full bg-slate-800/40 backdrop-blur-md border border-indigo-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    
                    <div className="w-16 h-16 rounded-full bg-indigo-900/50 flex items-center justify-center text-3xl shrink-0 border border-indigo-500/50">
                        {isOrchestrating ? <span className="animate-spin">⚙️</span> : <span>🧠</span>}
                    </div>
                    
                    <div className="flex-1">
                        <div className="text-indigo-400 text-xs font-mono uppercase tracking-widest mb-1">Orchestrator</div>
                        <h2 className="text-xl font-bold text-white mb-1">"{analysis.topic}"</h2>
                        {isOrchestrating ? (
                            <p className="text-slate-400 text-sm animate-pulse">Analyzing topic complexity and selecting optimal agent swarm...</p>
                        ) : (
                            <p className="text-slate-300 text-sm">Deployed <span className="text-white font-bold">{analysis.agents.length} specialist agents</span> to analyze market sentiment and data.</p>
                        )}
                    </div>

                    {/* Final Consensus Display */}
                    {analysis.finalConsensus && (
                        <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/10 animate-fade-in-up">
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest">Consensus Probability</div>
                                <div className={`text-3xl font-black ${analysis.finalConsensus.probability > 50 ? 'text-green-400' : 'text-red-400'}`}>
                                    {analysis.finalConsensus.probability}% <span className="text-sm text-white">YES</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Agent Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysis.agents.map((agent) => (
                        <div key={agent.id} className="animate-fade-in-up">
                            <AgentCard agent={agent} />
                        </div>
                    ))}
                    {/* Placeholder loading skeletons if orchestrating */}
                    {isOrchestrating && [1,2,3].map(i => (
                         <div key={i} className="h-[200px] rounded-xl border border-slate-800 bg-slate-900/30 animate-pulse"></div>
                    ))}
                </div>

                {/* Final Verdict Section */}
                {analysis.finalConsensus && (
                    <div className="w-full bg-gradient-to-br from-slate-900 to-black border border-slate-700 p-6 rounded-2xl mt-4 animate-fade-in-up shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <span>⚖️</span> Swarm Verdict
                        </h3>
                        <p className="text-lg text-slate-200 mb-6 font-light leading-relaxed border-l-4 border-indigo-500 pl-4">
                            {analysis.finalConsensus.verdict}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {analysis.finalConsensus.topReasons.map((reason, i) => (
                                <div key={i} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 text-sm text-slate-300">
                                    <span className="text-indigo-400 font-bold mr-2">0{i+1}</span>
                                    {reason}
                                </div>
                            ))}
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
