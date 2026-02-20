import { useEffect, useState } from "react";

export function FloatingEmojis() {
    const [emojis, setEmojis] = useState<Array<{ id: number; left: number; animationDuration: number; emoji: string }>>([]);

    useEffect(() => {
        const emojiList = ["💖", "🔥", "✨", "💫", "💸", "👑", "🚀", "💎"];
        const interval = setInterval(() => {
            setEmojis((prev) => {
                const newEmoji = {
                    id: Date.now(),
                    left: Math.random() * 100,
                    animationDuration: 5 + Math.random() * 10, // 5-15s
                    emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
                };
                // Remove old emojis to keep DOM light
                return [...prev.slice(-20), newEmoji];
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {emojis.map((item) => (
                <div
                    key={item.id}
                    className="absolute bottom-0 text-2xl opacity-50 animate-float-up"
                    style={{
                        left: `${item.left}%`,
                        animationDuration: `${item.animationDuration}s`,
                    }}
                >
                    {item.emoji}
                </div>
            ))}
            <style>
                {`
          @keyframes float-up {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 0.7; }
            90% { opacity: 0.7; }
            100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
          }
          .animate-float-up {
            animation-name: float-up;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
          }
        `}
            </style>
        </div>
    );
}
