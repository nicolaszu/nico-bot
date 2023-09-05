"use client";

import { useEffect, useRef, useState } from "react";
import BotHeader from "./components/BotHeader";
import BotMessage from "./components/BotMessage";
import MessageInput from "./components/MessageInput";
import UserMessage from "./components/UserMessage";
import { PROMPT, WELCOME_MESSAGE } from "./constants/defaults";
import AudioRecorder from "./components/AudioRecorder";

type Message = { content: string; role: Role };
type Role = "user" | "assistant" | "system";

export default function Home() {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isAudioInput, setIsAudioInput] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const onSendAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.wav");
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
      </main>
      <div
        className={
          "px-page py-6 fixed w-full bottom-0 bg-white grid grid-cols-[1fr_auto] gap-4 items-center"
        }
      >
        {!isAudioInput && (
          <MessageInput
            onSend={onSend}
            disabled={isLoading}
            onStart={() => setIsTextInput(true)}
            onDiscard={() => setIsTextInput(false)}
          />
        )}
        {!isTextInput && (
          <AudioRecorder
            className={isAudioInput ? "col-span-full" : ""}
            onSend={onSendAudio}
            disabled={isLoading}
            onStart={() => setIsAudioInput(true)}
            onDiscard={() => setIsAudioInput(false)}
          />
        )}
      </div>
    </div>
  );
}
