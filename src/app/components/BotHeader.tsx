import Image from "next/image";
import ImageRound from "./ImageRound";
import Switcher from "./Switcher";

const BotHeader = ({
  autoplay,
  setAutoplay,
}: {
  autoplay: boolean;
  setAutoplay: (toggle: boolean) => void;
}) => {
  return (
    <div className="flex w-screen gap-2 py-4 px-page border-b justify-between sticky top-0 bg-white">
      <div className="flex gap-2">
        <ImageRound src="/bot.webp" className="lg:w-16 lg:h-16 w-10 h-10" />
        <div className="flex flex-col self-center">
          <p className="text-lg font-medium">Nico-bot</p>
          <p className="text-gray-400">en línea</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 self-center">
        <p className="text-sm text-gray-500">¿Quieres que hable?</p>
        <div className="flex gap-2">
          <Image src="./person.svg" alt="default logo" width={18} height={18} />
          <Switcher setIsChecked={setAutoplay} isChecked={autoplay} />
        </div>
      </div>
    </div>
  );
};

export default BotHeader;
