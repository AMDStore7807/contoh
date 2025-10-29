export function LoadingDots({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background w-full">
      <div className="flex flex-col items-center gap-4">
        {/* Animated dots */}
        <div className="flex gap-2">
          <div
            className="w-3 h-3 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-3 h-3 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-3 h-3 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
        <p className="text-muted-foreground text-sm font-medium">{text}</p>
      </div>
    </div>
  );
}
