import ImageRound from "./ImageRound";

const UserMessage = ({ content }: { content: string }) => {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-4 border-b py-6 justify-items-start">
      <ImageRound className="lg:w-12 lg:h-12 w-10 h-10" src="/paola.jpeg" />
      <div>
        <p className="text-blue-700 font-medium">Paola Gaviria</p>
        <p className="prose lg:prose-xl max-w-screen-md mx-auto  bg-white text-gray-800 leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
};

export default UserMessage;
