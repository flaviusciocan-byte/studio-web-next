import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generate = mutation({
  args: {
    moduleId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, { moduleId, prompt }) => {
    if (moduleId.trim().length === 0) {
      throw new Error("moduleId must be non-empty");
    }
    if (prompt.trim().length === 0) {
      throw new Error("prompt must be non-empty");
    }
    const provider = process.env.ZARIA_AI_PROVIDER;
    if (!provider) {
      throw new Error("ZARIA_AI_PROVIDER is not set");
    }

    let result: string;
    switch (provider) {
      case "groq":
        result = `[groq] response for ${moduleId}`;
        break;
      case "openrouter":
        result = `[openrouter] response for ${moduleId}`;
        break;
      case "gemini":
        result = `[gemini] response for ${moduleId}`;
        break;
      case "cohere":
        result = `[cohere] response for ${moduleId}`;
        break;
      default:
        throw new Error(`Unsupported ZARIA_AI_PROVIDER: ${provider}`);
    }

    await ctx.db.insert("generations", {
      moduleId,
      prompt,
      result,
      createdAt: Date.now(),
    });
    return result;
  },
});
