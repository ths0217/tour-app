import React, { useMemo, useState } from 'react';

interface DriverCardProps {
  title?: string;
  location?: string;
}

const fallbackThaiAddress = '請帶我去這個地址，謝謝';

export default function DriverCard({ title, location }: DriverCardProps) {
  const [copied, setCopied] = useState(false);

  const thaiLabel = useMemo(() => {
    if (!location) return fallbackThaiAddress;
    return `請帶我去：${location}（曼谷）`;
  }, [location]);

  const handleCopy = async () => {
    if (!thaiLabel) return;
    try {
      await navigator.clipboard.writeText(thaiLabel);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      setCopied(false);
    }
  };

  return (
    <div className="mt-4 bg-white rounded-mag p-4 shadow-mag border border-black/5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-mag-caption text-stone mb-1">司機提示卡</p>
          <h3 className="text-mag-body font-semibold text-charcoal">{title || '目的地'}</h3>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-[12px] font-semibold text-red-xhs hover:underline"
        >
          <span className="material-symbols-outlined text-[16px]">content_copy</span>
          {copied ? '已複製' : '複製泰文給司機'}
        </button>
      </div>

      <div className="bg-charcoal text-white rounded-2xl px-4 py-5 text-center space-y-2">
        <p className="text-[12px] text-white/80">Show this to your driver</p>
        <p className="text-[22px] font-bold leading-relaxed">{thaiLabel}</p>
        <p className="text-[12px] text-white/70">(曼谷市區)</p>
      </div>
    </div>
  );
}
