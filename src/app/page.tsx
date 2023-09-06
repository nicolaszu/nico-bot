"use client";

import { useEffect, useRef, useState } from "react";
import BotHeader from "./components/BotHeader";
import BotMessage from "./components/BotMessage";
import MessageInput from "./components/MessageInput";
import UserMessage from "./components/UserMessage";
import { PROMPT, WELCOME_MESSAGE } from "./constants/defaults";
import dynamic from "next/dynamic";

const AudioRecorder = dynamic(() => import("./components/AudioRecorder"), {
  ssr: false,
});

type Message = { content: string; role: Role };
type Role = "user" | "assistant" | "system";

export default function Home() {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isAudioInput, setIsAudioInput] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTextFromAudio, setIsLoadingTextFromAudio] = useState(false);
  const [autoplay, setAutoplay] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    { content: PROMPT, role: "system" },
  ]);

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [messages]);

  const onSend = async (message: string) => {
    setIsLoading(true);
    const newMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: message,
      },
    ];

    setMessages(newMessages);

    try {
      const response = await fetch(`${window.location.origin}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = response.body;
      if (!data) {
        return;
      }
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullContent = "";
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        fullContent = fullContent + chunkValue;

        const withNewChunk: Message[] = [
          ...newMessages,
          {
            content: fullContent,
            role: "assistant",
          },
        ];
        setMessages(withNewChunk);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSendAudio = async (audioBlob: Blob, ext: string) => {
    setIsLoadingTextFromAudio(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, `audio.${ext}`);
      const response = await fetch(`${window.location.origin}/api/whisper`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      onSend(responseData.result);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    } finally {
      setIsLoadingTextFromAudio(false);
    }
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-full">
      <BotHeader autoplay={autoplay} setAutoplay={setAutoplay} />
      <main className="px-page pt-2 !pb-[6rem] lg:py-8">
        <BotMessage content={WELCOME_MESSAGE} forceStopAudio={isAudioInput} />
        {messages.map((message, i) => {
          return message.role === "user" ? (
            <UserMessage key={i} content={message.content} />
          ) : message.role === "assistant" ? (
            <BotMessage
              key={i}
              content={message.content}
              autoplay={autoplay}
              isDoneStreaming={!isLoading}
              isLastMessage={messages.length - 1 === i}
              forceStopAudio={isAudioInput}
            />
          ) : null;
        })}
        {isLoadingTextFromAudio && (
          <div className="flex items-center p-3">
            <svg
              aria-hidden="true"
              className="w-6 h-6 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="#CBD6F7"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <p className="text-gray-500">Preparando tu mensaje</p>
          </div>
        )}
      </main>
      <div
        className={
          "px-page py-6 fixed w-full bottom-0 bg-white grid grid-cols-[1fr_auto] gap-4 items-center"
        }
      >
        {!isAudioInput && (
          <MessageInput
            onSend={onSend}
            disabled={isLoading || isLoadingTextFromAudio}
            onStart={() => setIsTextInput(true)}
            onDiscard={() => setIsTextInput(false)}
          />
        )}
        {!isTextInput && (
          <AudioRecorder
            className={isAudioInput ? "col-span-full col-end-[none]" : ""}
            onSend={onSendAudio}
            disabled={isLoading || isLoadingTextFromAudio}
            onStart={() => setIsAudioInput(true)}
            onDiscard={() => setIsAudioInput(false)}
          />
        )}
      </div>
    </div>
  );
}
