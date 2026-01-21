export function TypingIndicator() {
  return (
    <div className="flex justify-start w-full mb-4 animate-slide-up">
      <div className="bg-white text-graphite border border-soft-beige rounded-lg px-4 py-3 shadow-soft">
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 bg-warm-gray rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-warm-gray rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-warm-gray rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
