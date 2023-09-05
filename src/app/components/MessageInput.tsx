import Image from "next/image";
import { ChangeEvent, useRef, useState } from "react";
import AudioRecorder from "./AudioRecorder";
import { IconButton } from "./IconButton";

const MessageInput = ({
  onStart,
  onDiscard,
  onSend,
  disabled = false,
}: {
  onStart: () => void;
  onSend: (message: string) => void;
  onDiscard: () => void;
  disabled?: boolean;
}) => {
  const [input, setInput] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && input !== "") {
      onSend(event.currentTarget.value);
      event.currentTarget.value = "";
      setInput("");
      onDiscard();
    }
  };

  const handleMouseClick = () => {
    if (input !== "") {
      onSend(inputRef!.current!.value);
      inputRef!.current!.value = "";
      setInput("");
      onDiscard();
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (input === "" && e.currentTarget.value !== "") {
      onStart();
    }
    if (input !== "" && e.currentTarget.value === "") {
      onDiscard();
    }
    setInput(e.currentTarget.value);
  };

  return (
    <>
      <input
        disabled={disabled}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        type="text"
        autoFocus
        placeholder="Escribe aquí tu mensaje"
        className="focus:ring-0 focus-visible:ring-0 resize-none flex h-10 w-full rounded-md border border-input bg-slate-100 brod px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium  focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
      {input !== "" && (
        <IconButton
          src="/send.svg"
          onClick={handleMouseClick}
          disabled={disabled || input === ""}
        />
      )}
    </>
  );
};

export default MessageInput;
