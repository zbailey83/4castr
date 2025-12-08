/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type AgentRole = 'Orchestrator' | 'Newsfeed' | 'Social Media' | 'Reddit' | 'Finance' | 'Macro' | 'Entertainment';

export interface AgentFindings {
  keyFindings: string[];
  confidenceScore: number; // 0-100
  prediction: 'YES' | 'NO' | 'UNCERTAIN';
  reasoning: string;
}

export interface Agent {
  id: string;
  role: AgentRole;
  status: 'idle' | 'selected' | 'analyzing' | 'completed';
  findings?: AgentFindings;
  description: string;
  icon: string;
  color: string;
}

export interface MarketAnalysis {
  topic: string;
  url?: string;
  status: 'input' | 'orchestrating' | 'swarming' | 'consensus';
  agents: Agent[];
  finalConsensus?: {
    probability: number;
    topReasons: string[];
    verdict: string;
  };
}
