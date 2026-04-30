import Knowledge from "@/models/Knowledge";
import { getEmbedding } from "@/services/gemini";

/**
 * Calculates the cosine similarity between two vectors.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
}

/**
 * Retrieves the most relevant knowledge chunks for a given user query.
 */
export async function getRelevantContext(query: string, limit: number = 3): Promise<string> {
  try {
    const queryEmbedding = await getEmbedding(query);
    const allKnowledge = await Knowledge.find({});
    
    if (allKnowledge.length === 0) {
      return "";
    }

    const scoredKnowledge = allKnowledge.map(k => ({
      content: k.content,
      similarity: cosineSimilarity(queryEmbedding, k.embedding)
    }));

    scoredKnowledge.sort((a, b) => b.similarity - a.similarity);
    const topResults = scoredKnowledge.slice(0, limit);
    
    return topResults.map(k => k.content).join("\n\n");
  } catch (error) {
    console.error("Context Retrieval Error:", error);
    return "";
  }
}
