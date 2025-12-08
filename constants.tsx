/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Agent, AgentRole } from './types';

export const AVAILABLE_AGENTS: Omit<Agent, 'id' | 'status'>[] = [
  {
    role: 'Newsfeed',
    description: 'Scans global headlines and breaking news.',
    icon: '📰',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    role: 'Social Media',
    description: 'Analyzes sentiment on X/Twitter and viral trends.',
    icon: '🐦',
    color: 'from-sky-500 to-indigo-500',
  },
  {
    role: 'Reddit',
    description: 'Deep dives into niche communities and contrarian views.',
    icon: '🤖',
    color: 'from-orange-500 to-red-500',
  },
  {
    role: 'Finance',
    description: 'Reviews market data, earnings, and economic indicators.',
    icon: '📈',
    color: 'from-emerald-500 to-green-400',
  },
  {
    role: 'Macro',
    description: 'Considers geopolitical events and large-scale trends.',
    icon: '🌍',
    color: 'from-purple-500 to-pink-500',
  },
  {
    role: 'Entertainment',
    description: 'Tracks celebrity influence and pop culture shifts.',
    icon: '🎭',
    color: 'from-yellow-400 to-amber-500',
  },
];
