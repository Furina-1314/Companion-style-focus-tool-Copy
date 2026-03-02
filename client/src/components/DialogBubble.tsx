import { useGame, type DialogMessage } from "@/contexts/GameContext";
import { useEffect, useState, useCallback, useRef } from "react";
import { MessageCircle } from "lucide-react";

export default function DialogBubble() {
  const { state, getDialogForType } = useGame();
  const [currentDialog, setCurrentDialog] = useState<DialogMessage | null>(null);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const hasShownGreetingRef = useRef(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 休息结束时的提示
  useEffect(() => {
    if (state.timerMode === "break" && !state.isTimerRunning && state.sessionsCompleted > 0) {
      const dialog = getDialogForType("rest");
      showDialog(dialog);
    }
  }, [state.timerMode, state.sessionsCompleted, getDialogForType]);

  // 每日问候语
  useEffect(() => {
    if (hasShownGreetingRef.current) return;
    
    const lastGreeting = localStorage.getItem("focus-companion-last-greeting");
    const today = new Date().toDateString();
    
    if (lastGreeting !== today) {
      localStorage.setItem("focus-companion-last-greeting", today);
      hasShownGreetingRef.current = true;
      const timer = setTimeout(() => {
        const dialog = getDialogForType("greeting");
        showDialog(dialog);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [getDialogForType]);

  const showDialog = useCallback((dialog: DialogMessage) => {
    // 清理之前的隐藏定时器
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setCurrentDialog(dialog);
    setDisplayedText("");
    setIsTyping(true);
    setIsVisible(true);
  }, []);

  // 打字机效果
  useEffect(() => {
    if (!currentDialog || !isTyping) return;
    const text = currentDialog.text;
    let index = 0;
    
    // 清理之前的隐藏定时器
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
        hideTimeoutRef.current = setTimeout(() => setIsVisible(false), 6000);
      }
    }, 45);

    return () => {
      clearInterval(interval);
    };
  }, [currentDialog, isTyping]);

  if (!isVisible || !currentDialog) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="glass-strong rounded-2xl px-5 py-4 relative shadow-xl">
        {/* 装饰 */}
        <div className="absolute -top-2 left-4 w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-[10px]">
          ✨
        </div>
        
        {/* 内容 */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-md">
            <MessageCircle size={18} className="text-white" />
          </div>
          <div className="flex-1 pt-1">
            <p className="text-sm font-medium leading-relaxed">
              {displayedText}
              {isTyping && (
                <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle animate-pulse" />
              )}
            </p>
            {!isTyping && (
              <p className="text-[10px] text-muted-foreground mt-2">
                来自你的专注植物 💚
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
