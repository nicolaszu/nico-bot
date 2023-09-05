import Image from "next/image";
import React from "react";

export const IconButton = ({
  src,
  onClick,
  className,
  width = 32,
  height = 32,
  alt = "default",
  disabled = false,
}: {
  src: string;
  onClick: () => void;
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  disabled?: boolean;
}) => {
  return (
    <div
      onClick={disabled ? () => {} : onClick}
      className={` rounded-full self-center p-2 h-fit w-fit ${
        disabled ? "grayscale-[1]" : "hover:bg-gray-100 cursor-pointer"
      } ${className} `}
    >
      <Image
        src={src}
        alt="default logo"
        width={width}
        height={height}
        priority
      />
    </div>
  );
};
