import { mistral } from "@ai-sdk/mistral";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { searchListings } from "@/app/_actions/listing";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Chat API received request body:", body);
    const { messages } = body;

    // Check environment variables for available AI model provider
    const mistralKey = process.env.MISTRAL_API_KEY;
    const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!mistralKey && !googleKey) {
      console.error("Missing AI API key (MISTRAL_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY)");
      return new Response(
        JSON.stringify({
          error: "API Key missing. Please configure MISTRAL_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in Vercel project environment variables.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Choose active model
    const aiModel = mistralKey
      ? mistral("mistral-large-latest")
      : google("gemini-1.5-flash");

    // Build clean conversation history — drop any messages with no text
    const coreMessages = messages
      .slice(-6)
      .map((m: any) => {
        const textContent = m.parts
          ? m.parts
              .filter((p: any) => p.type === "text")
              .map((p: any) => p.text)
              .join("")
          : m.content || "";

        return { role: m.role, content: textContent.trim() };
      })
      .filter((m: any) => m.content.length > 0);

    // Get the latest user message to check if they're asking about properties
    const lastUserMessage =
      coreMessages.filter((m: any) => m.role === "user").pop()?.content || "";

    // Pre-fetch listings from the database to give the AI real context
    let listingsContext = "";
    const propertyKeywords =
      /propert|listing|house|condo|apartment|townhouse|recommend|find|search|buy|rent|available|bedroom|bed|bath|price|budget|makati|manila|quezon|cebu|davao|bgc|taguig|pasig/i;

    if (propertyKeywords.test(lastUserMessage)) {
      try {
        const results = await searchListings({ perPage: 10 });
        if (results.listings.length > 0) {
          const listingsSummary = results.listings
            .map(
              (l, i) =>
                `${i + 1}. "${l.title}" — ${l.location}, ₱${l.price.toLocaleString()}, ${l.beds} bed / ${l.baths} bath, ${l.area} sqm, Type: ${l.type}`
            )
            .join("\n");
          listingsContext = `\n\nHere are the current DOKYU property listings available in the database:\n${listingsSummary}\n\nAlways recommend from the above listings when asked. If none match the user's criteria, say so honestly.`;
        }
      } catch (e) {
        console.error("Failed to fetch listings for AI context:", e);
      }
    }

    const result = streamText({
      model: aiModel,
      maxOutputTokens: 800,
      system: `You are an expert real estate assistant for DOKYU in the Philippines. You must ONLY answer questions related to property listings, DOKYU services, and real estate advice. If a user asks about anything else, politely decline. Be highly direct, concise, and straight to the point. Do not use filler words, fluff, or overly apologetic language. No markdown headers. Conversational but direct tone.${listingsContext}`,
      messages: coreMessages,
    });

    console.log("Stream successfully created");
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("CRITICAL ERROR in chat API:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate response." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
