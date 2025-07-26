import express from "express";
import payload from "payload";
import OpenAI from "openai";

const router = express.Router();

router.post("/chat", async (req, res) => {
  console.log("Received chat request:", {
    body: req.body,
    headers: req.headers,
  });

  try {
    const { message, lang } = req.body;

    if (!message) {
      console.error("No message provided in request");
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    try {
      console.log("Searching for FAQ in database...");
      const faq = await payload.find({
        collection: "faq",
        where: {
          question: { like: message },
          language: { equals: lang },
        },
      });

      if (faq.docs.length > 0) {
        console.log("Found matching FAQ");
        return res.json({
          answer: faq.docs[0].answer,
          source: "local",
        });
      }

      // When no FAQ matches
      const fallbackQuestion = await payload.find({
        collection: "fallbackLogs",
        where: {
          question: { like: message },
          language: { equals: lang },
        },
      });

      if (fallbackQuestion.docs.length > 0) {
        await payload.update({
          collection: "fallbackLogs",
          where: {
            question: { equals: message },
            language: { equals: lang },
          },
          data: {
            // @ts-ignore
            count: fallbackQuestion.docs[0].count + 1,
          },
        });
      } else {
        await payload.create({
          collection: "fallbackLogs",
          data: {
            question: message,
            language: lang,
          },
        });
      }

      console.log("No matching FAQ found, querying OpenAI...");
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful hotel concierge answering questions for guests.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      });

      const answer =
        response.choices[0]?.message?.content || "No response from AI";
      return res.json({
        answer,
        source: "openai",
      });
    } catch (error: any) {
      console.error("Error in chat processing:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        status: error.status,
        response: error.response?.data,
      });

      return res.status(500).json({
        error: "Error processing your request",
        details: error.message || "Unknown error",
        code: error.code,
      });
    }
  } catch (error: any) {
    console.error("Unexpected error in chat endpoint:", error);

    return res.status(500).json({
      error: "Internal server error",
      details: error.message || "Unknown error",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

export default router;
