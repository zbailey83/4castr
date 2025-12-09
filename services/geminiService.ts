/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";
import { AgentRole, AgentFindings } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    console.warn("API Key is missing!");
  }
  return new GoogleGenAI({ apiKey });
};
const modelId = 'gemini-2.0-flash-exp';

// --- Schemas ---

const orchestratorSchema = {
  type: Type.OBJECT,
  properties: {
    selectedAgents: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3-6 agent roles best suited for this topic.",
    },
    reasoning: { type: Type.STRING, description: "Why these agents were chosen." }
  },
  required: ['selectedAgents', 'reasoning'],
};

const agentAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    keyFindings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 concise bullet points of evidence found.",
    },
    confidenceScore: {
      type: Type.INTEGER,
      description: "Confidence percentage (0-100) in the prediction.",
    },
    prediction: {
      type: Type.STRING,
      enum: ['YES', 'NO', 'UNCERTAIN'],
      description: "The agent's predicted outcome for the market.",
    },
    reasoning: {
      type: Type.STRING,
      description: "A short summary of the logic used.",
    }
  },
  required: ['keyFindings', 'confidenceScore', 'prediction', 'reasoning'],
};

const consensusSchema = {
  type: Type.OBJECT,
  properties: {
    probability: {
      type: Type.INTEGER,
      description: "Final aggregated probability percentage (0-100) for YES.",
    },
    topReasons: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Top 3 consensus reasons driving the verdict.",
    },
    verdict: {
      type: Type.STRING,
      description: "A definitive statement summarizing the swarm's outlook.",
    }
  },
  required: ['probability', 'topReasons', 'verdict'],
};

// --- Services ---

export const orchestrateAgents = async (topic: string, availableRoles: string[]): Promise<string[]> => {
  const prompt = `
    You are the Orchestrator for a Prediction Market Analysis Swarm.
    Topic/Market: "${topic}"
    
    Available Agents: ${availableRoles.join(', ')}.
    
    Task: Select 3 to 6 agents from the list that would provide the most relevant and diverse perspectives to predict the outcome of this market.
    Return JSON.
  `;

  try {
    const response = await getAI().models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: orchestratorSchema,
        temperature: 0.5,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Filter to ensure only valid roles are returned
      return data.selectedAgents.filter((r: string) => availableRoles.includes(r));
    }
  } catch (e) {
    console.error("Orchestrator failed", e);
    // Fallback
    return availableRoles.slice(0, 3);
  }
  return availableRoles.slice(0, 3);
};

export const runAgentAnalysis = async (role: AgentRole, topic: string): Promise<AgentFindings> => {
  const prompt = `
    You are the ${role} Agent.
    Market/Topic: "${topic}"
    
    Task: Analyze this topic from the perspective of your role (${role}).
    Use the Google Search tool to find recent and relevant information.
    Provide 3 key findings, a confidence score (0-100), and a prediction (YES/NO/UNCERTAIN).
    
    IMPORTANT: Return the result as a valid JSON object (no markdown) with this structure:
    {
      "keyFindings": ["string"],
      "confidenceScore": number,
      "prediction": "YES" | "NO" | "UNCERTAIN",
      "reasoning": "string"
    }
  `;

  try {
    const response = await getAI().models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseSchema and responseMimeType are not supported with googleSearch
      },
    });

    if (response.text) {
      let jsonStr = response.text.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(json)?|```$/g, '').trim();
      }
      return JSON.parse(jsonStr) as AgentFindings;
    }
  } catch (e: any) {
    console.error(`${role} analysis failed:`, e.message || e, e.stack);
  }

  return {
    keyFindings: ["Data unavailable", "Analysis inconclusive", "Check source manually"],
    confidenceScore: 50,
    prediction: 'UNCERTAIN',
    reasoning: "Analysis failed due to connection or model error."
  };
};

export const generateConsensus = async (topic: string, agentResults: { role: string, data: AgentFindings }[]): Promise<{ probability: number, topReasons: string[], verdict: string }> => {
  const context = agentResults.map(a => `
    Agent: ${a.role}
    Prediction: ${a.data.prediction}
    Confidence: ${a.data.confidenceScore}%
    Findings: ${a.data.keyFindings.join('; ')}
  `).join('\n');

  const prompt = `
    You are the Consensus Engine.
    Topic: "${topic}"
    
    Agent Reports:
    ${context}
    
    Task: Synthesize these reports into a final probability for a "YES" outcome. Provide the top 3 driving reasons and a short verdict.
  `;

  try {
    const response = await getAI().models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: consensusSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (e) {
    console.error("Consensus failed", e);
  }

  return {
    probability: 50,
    topReasons: ["Conflicting data", "Insufficient consensus"],
    verdict: "Unable to reach consensus."
  };
};