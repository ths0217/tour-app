import React, { useEffect, useState } from 'react';
import { isIosSafari, isStandalone } from '../utils/device';

const STORAGE_KEY = 'a2hs_prompt_dismissed';

export default function AddToHomeScreenPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const alreadyDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (alreadyDismissed) return;

    if (isIosSafari() && !isStandalone()) {
      const timer = window.setTimeout(() => setVisible(true), 800);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[env(safe-area-inset-bottom)] pointer-events-none">
      <div className="pointer-events-auto mb-3 rounded-mag bg-white/95 dark:bg-charcoal/90 border border-black/5 dark:border-white/10 shadow-mag px-4 py-3 flex items-center gap-3">
        <div className="text-2xl" aria-hidden>⬆️</div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-charcoal dark:text-white">加入主畫面</p>
          <p className="text-xs text-stone leading-snug">點擊 Safari 底部的「分享」 → 選擇「加入主畫面」，即可全螢幕使用。</p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-xs font-semibold text-ios-blue"
        >
          好的
        </button>
      </div>
    </div>
  );
}
