import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
}

const steps = [
  {
    title: '歡迎來到曼谷探險！',
    subtitle: '讓我們快速了解如何使用',
    icon: '✈️',
    features: [
      { icon: '📋', text: '智慧行程規劃' },
      { icon: '💰', text: '預算追蹤分帳' },
      { icon: '🗺️', text: '離線導航支援' },
      { icon: '🆘', text: '緊急聯絡資訊' },
    ],
    gradient: 'from-red-500 via-pink-500 to-purple-500',
  },
  {
    title: '首頁總覽',
    subtitle: '一目了然的旅程資訊',
    icon: '🏠',
    features: [
      { icon: '☀️', text: '即時天氣與問候' },
      { icon: '💵', text: '預算使用狀況' },
      { icon: '⏰', text: '下一站提醒' },
      { icon: '🔥', text: '熱門行程推薦' },
    ],
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
  },
  {
    title: '行程管理',
    subtitle: '拖拉排序，輕鬆調整',
    icon: '📅',
    features: [
      { icon: '✋', text: '拖拉重新排序' },
      { icon: '🤖', text: 'AI 智慧建議' },
      { icon: '⚠️', text: '時間衝突偵測' },
      { icon: '📤', text: '分享行程圖片' },
    ],
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
  },
  {
    title: '快速工具',
    subtitle: '點擊即可使用',
    icon: '🛠️',
    features: [
      { icon: '🚕', text: '一鍵叫 Grab' },
      { icon: '💱', text: '即時匯率換算' },
      { icon: '🈲', text: '翻譯泰文' },
      { icon: '🆘', text: '緊急聯絡資訊' },
    ],
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
  },
  {
    title: '準備出發！',
    subtitle: '祝您有個愉快的旅程',
    icon: '🎉',
    features: [],
    gradient: 'from-purple-500 via-pink-500 to-red-500',
  },
];

export default function Onboarding({ isOpen, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('onboarding_complete', 'true');
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_complete', 'true');
    onComplete();
  };

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient}`} />
          
          {/* Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 w-full max-w-sm px-8 text-center text-white"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-[80px] mb-6"
            >
              {step.icon}
            </motion.div>

            {/* Title */}
            <h1 className="text-[24px] font-bold mb-2">{step.title}</h1>
            <p className="text-[14px] text-white/80 mb-8">{step.subtitle}</p>

            {/* Features */}
            {step.features.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-8">
                {step.features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="bg-white/20 backdrop-blur-sm rounded-mag p-3 text-left"
                  >
                    <span className="text-[20px] block mb-1">{feature.icon}</span>
                    <span className="text-[12px]">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mb-8">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentStep ? 'bg-white w-6' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="w-full py-4 bg-white text-charcoal rounded-mag font-semibold text-[15px] shadow-lg"
            >
              {currentStep === steps.length - 1 ? '開始使用' : '下一步'}
            </motion.button>

            {currentStep < steps.length - 1 && (
              <button
                onClick={handleSkip}
                className="mt-4 text-[13px] text-white/70"
              >
                跳過教學
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
