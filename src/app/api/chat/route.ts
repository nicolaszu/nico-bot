import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge"; // 'nodejs' is the default

const openai = new OpenAI();

export async function POST(request: Request) {
  if (!openai.apiKey) {
    return NextResponse.json(
      "OpenAI API key not configured, please follow instructions in README.md",
      { status: 400 }
    );
    return;
  }
  const data = await request.json();
  const messages = data.messages || "";

  try {
    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-3.5-turbo",
      stream: true,
    });

    const stream = OpenAIStream(completion);
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      return NextResponse.json(error.response.data, {
        status: error.response.data,
      });
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);

      return NextResponse.json("An error occurred during your request.", {
        status: 500,
      });
    }
  }
}
