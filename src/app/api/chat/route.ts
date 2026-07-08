// ============================================
// AI Health Chat API Route (Gemini)
// ============================================

import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are MediCore Health Assistant, a friendly and knowledgeable AI health chatbot integrated into a hospital management system. Your role is to:

1. Answer general health questions in a clear, easy-to-understand way.
2. Provide helpful information about common symptoms, medications, and wellness tips.
3. Be empathetic and supportive in your responses.
4. Keep responses concise (2-4 paragraphs max) unless the user asks for more detail.

IMPORTANT RULES:
- Only greet the user (e.g. "Hello there!") in your VERY FIRST response of the conversation. For all follow-up messages, skip the greeting entirely and jump straight into the answer.
- Always include a brief disclaimer when giving medical advice: remind users that your information is for educational purposes only and does not replace professional medical consultation.
- Never attempt to diagnose specific conditions definitively.
- If a user describes a medical emergency, urgently advise them to call emergency services or visit the nearest hospital immediately.
- You can suggest that the user book an appointment with a doctor through the MediCore platform for personalized care.
- Be professional and use simple language. Use emojis sparingly to be friendly.
- Format your responses with proper paragraphs for readability.`;

interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "AI service is not configured. Please add GEMINI_API_KEY to your environment variables." },
        { status: 503 }
      );
    }

    const { message, history } = await request.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build conversation history for context
    const contents: ChatMessage[] = [];

    // Add previous conversation history (last 10 messages to keep context manageable)
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add the current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);

      if (response.status === 429) {
        return NextResponse.json(
          { error: "I'm receiving too many requests right now. Please wait a moment and try again. 🙏" },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Failed to get AI response. Please try again." },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I wasn't able to generate a response. Please try again.";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
