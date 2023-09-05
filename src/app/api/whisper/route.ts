import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(request: Request) {
  if (!openai.apiKey) {
    return NextResponse.json(
      "OpenAI API key not configured, please follow instructions in README.md",
      { status: 400 }
    );
  }
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;
  if (!file) {
    return NextResponse.json("No file uploaded", { status: 400 });
  }

  try {
    const audio = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "es",
    });
    return NextResponse.json({ result: audio.text }, { status: 200 });
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
