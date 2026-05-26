import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadBufferToMediaStorage } from "@/lib/media-storage";

export const runtime = "nodejs";
export const maxDuration = 60;

type GeminiPart = {
  text?: string;
  inlineData?: {
    mimeType?: string;
    data?: string;
  };
  inline_data?: {
    mime_type?: string;
    data?: string;
  };
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

function extensionFromMimeType(mimeType: string) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  return "png";
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { prompt, title, aspectRatio } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const model = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image-preview";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            responseFormat: {
              image: {
                aspectRatio: aspectRatio || "16:9",
                imageSize: "1K",
              },
            },
          },
        }),
      }
    );

    const data = (await response.json()) as GeminiResponse;
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Gemini image generation failed" },
        { status: response.status }
      );
    }

    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((part) => part.inlineData?.data || part.inline_data?.data);
    const text = parts
      .map((part) => part.text)
      .filter(Boolean)
      .join("\n")
      .trim();

    const inlineData = imagePart?.inlineData;
    const inlineDataSnake = imagePart?.inline_data;
    const imageBase64 = inlineData?.data || inlineDataSnake?.data;
    const mimeType = inlineData?.mimeType || inlineDataSnake?.mime_type || "image/png";

    if (!imageBase64) {
      return NextResponse.json(
        { error: text || "Gemini did not return an image" },
        { status: 502 }
      );
    }

    const extension = extensionFromMimeType(mimeType);
    const uploaded = await uploadBufferToMediaStorage({
      buffer: Buffer.from(imageBase64, "base64"),
      filename: `gemini-${title || "post-image"}.${extension}`,
      contentType: mimeType,
    });

    return NextResponse.json({
      url: uploaded.url,
      filename: uploaded.filename,
      mimeType,
      text,
      model,
    });
  } catch (error) {
    console.error("Gemini image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate image" },
      { status: 500 }
    );
  }
}
