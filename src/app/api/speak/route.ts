import { NextResponse } from "next/server";
import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs";
import util from "util";
import { google } from "@google-cloud/text-to-speech/build/protos/protos";
import { Readable, ReadableOptions, Stream } from "stream";

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function POST(request: Request) {
  try {
    // The text to synthesize
    const data = await request.json();
    const message = data.message || "";
    const voice =
      data.message.length <= 500 ? "es-US-Studio-B" : "es-US-Wavenet-B";

    // Construct the request
    const voiceReq: google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: { text: message },
      // Select the language and SSML voice gender (optional)
      voice: { languageCode: "es-US", name: voice },
      // select the type of audio encoding
      audioConfig: { audioEncoding: "MP3", speakingRate: 1.2 },
    };

    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(voiceReq);

    const respNext = new NextResponse(response.audioContent, {
      status: 200,
      headers: new Headers({
        "content-type": "audio/mpeg",
      }),
    });
    return respNext;
  } catch (e) {
    console.debug(e);
    return NextResponse.json(e, { status: 500 });
  }
}
