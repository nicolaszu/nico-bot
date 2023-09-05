import { useEffect, useRef, useState } from "react";
import ImageRound from "./ImageRound";
import { IconButton } from "./IconButton";

const BotMessage = ({
  content,
  autoplay = false,
}: {
  content: string;
  autoplay?: boolean;
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlayAudio = async () => {
    setIsPlaying(true);

    if (!audioRef.current) {
      await fetchAndPlayAudio();
    }

    audioRef!.current!.play();
  };

  const handlePauseAudio = () => {
    setIsPlaying(false);
    audioRef!.current!.pause();
  };

  useEffect(() => {
    if (autoplay) {
      fetchAndPlayAudio();
    }
  }, []);

  const fetchAndPlayAudio = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${window.location.origin}/api/speak`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: content }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioUrl);
      audioRef.current.autoplay = autoplay;
      if (autoplay) {
        setIsPlaying(true);
      }
      audioRef!.current!.onended = () => {
        setIsPlaying(false);
      };
    } catch (error) {
      console.error("Error fetching audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-[auto_1fr] gap-4 border-b py-6 justify-items-start">
      <ImageRound className="lg:w-12 lg:h-12 w-10 h-10" src="/bot.webp" />
      <div>
        <div className="flex  items-center gap-2">
          <p
            onClick={() =>
              !isPlaying ? handlePlayAudio() : handlePauseAudio()
            }
            className="text-green-500 font-medium"
          >
            Nico-bot
          </p>
          {isLoading ? (
            <svg
              aria-hidden="true"
              className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
          ) : !isPlaying ? (
            <IconButton
              src="/play.svg"
              onClick={handlePlayAudio}
              width={18}
              height={18}
              className="hover:bg-white !p-0"
            />
          ) : (
            <IconButton
              src="/pause.svg"
              onClick={handlePauseAudio}
              width={18}
              height={18}
              className="hover:bg-white !p-0"
            />
          )}
        </div>
        <p className=" whitespace-pre-wrap prose lg:prose-xl max-w-screen-md mx-auto  bg-white text-gray-800 leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
};

export default BotMessage;