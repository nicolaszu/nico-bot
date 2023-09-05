import Image from "next/image";

const BotImageRound = ({
  className,
  src,
}: {
  className?: string;
  src: string;
}) => {
  return (
    <div
      className={` rounded-full overflow-hidden ${
        className ? className : "w-16 h-16"
      }`}
    >
      <Image src={src} alt="user image" width={100} height={24} priority />
    </div>
  );
};

export default BotImageRound;
