import Image from "next/image";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { IconButton } from "./IconButton";

function AudioRecorder({
  onStart,
  onDiscard,
  onSend,
  disabled = false,
  className,
}: {
  onStart: () => void;
  onSend: (audio: Blob) => void;
  onDiscard: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const [recordingInitiated, setRecordingInitiated] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [progress, setProgress] = useState(0);
  const [durationRecoding, setDurationRecording] = useState<Date>(new Date(0));
  const [durationAudio, setDurationAudio] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRecording) {
        setDurationRecording((curDate: Date) => {
          const date = new Date(0);
          date.setSeconds(curDate.getSeconds() + 1);
          return date;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording && recordingInitiated) {
      const audioBlob = new Blob(chunks, { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioUrl);
      setDurationAudio(durationRecoding.getSeconds());
      audioRef!.current!.ondurationchange = () => {
        setDurationAudio(audioRef!.current!.duration);
      };
    }
  }, [isRecording, recordingInitiated, chunks]);

  const handleStartRecording = () => {
    onStart();
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        setChunks((prev) => [...prev, event.data]);
      };
      mediaRecorderRef.current.start();
      setRecordingInitiated(true);
      setIsRecording(true);
    });
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current && mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handlePlayAudio = () => {
    setIsPlaying(true);

    audioRef!.current!.play();

    audioRef!.current!.ontimeupdate = () => {
      setProgress(audioRef!.current!.currentTime);
    };

    audioRef!.current!.onended = () => {
      setIsPlaying(false);
    };
  };

  const handlePauseAudio = () => {
    setIsPlaying(false);
    audioRef!.current!.pause();
  };

  const handleDiscardAudio = () => {
    setChunks([]);
    setRecordingInitiated(false);
    setIsRecording(false);
    setProgress(0);
    setDurationRecording(new Date(0));
    onDiscard();
  };

  const send = () => {
    if (isRecording) {
      handleStopRecording();
      mediaRecorderRef!.current!.ondataavailable = (event) => {
        const audioBlob = new Blob([...chunks, event.data], {
          type: "audio/wav",
        });
        handleDiscardAudio();
        onSend(audioBlob);
      };
    } else {
      const audioBlob = new Blob(chunks, { type: "audio/wav" });
      handleDiscardAudio();
      onSend(audioBlob);
    }
  };

  return (
    <div className={`w-full ${className} `}>
      <>
        {!recordingInitiated ? (
          <IconButton
            disabled={disabled}
            src="/mic.svg"
            onClick={handleStartRecording}
          />
        ) : (
          <>
            <div className="grid grid-cols-[auto_1fr_auto_auto] w-full gap-2">
              <IconButton
                disabled={disabled}
                src="/bin.svg"
                onClick={handleDiscardAudio}
              />
              {isRecording ? (
                <div className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-md w-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-gray-600 font-medium ">
                    {durationRecoding.toISOString().substring(14, 19)}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-md w-full">
                  <p className="text-gray-600 font-medium ">
                    {new Date(progress * 1000).toISOString().substring(14, 19)}
                  </p>
                  <progress
                    className="w-full"
                    value={progress}
                    max={durationAudio}
                  />
                </div>
              )}

              {!isRecording ? (
                <>
                  {isPlaying ? (
                    <IconButton
                      disabled={disabled}
                      src="/pause.svg"
                      onClick={handlePauseAudio}
                    />
                  ) : (
                    <IconButton
                      disabled={disabled}
                      src="/play.svg"
                      onClick={handlePlayAudio}
                    />
                  )}
                </>
              ) : (
                <IconButton
                  disabled={disabled}
                  src="/pause.svg"
                  onClick={handleStopRecording}
                  className=" hover:bg-red-100"
                />
              )}
              <IconButton
                disabled={disabled}
                src="/send.svg"
                onClick={send}
                className=" hover:bg-blue-100"
              />
            </div>
          </>
        )}
      </>
    </div>
  );
}

export default AudioRecorder;
