import React from 'react';
import { ScheduleItem } from '../types';

interface BudgetSummary {
  total: number;
  remaining: number;
  spent: number;
}

interface ExpertReviewProps {
  schedule: ScheduleItem[];
  budget?: BudgetSummary;
}

const formatPercent = (value: number) => `${Math.round(value)}%`;

const ReviewBadge = ({ label }: { label: string }) => (
  <span className="px-2 py-1 rounded-pill text-[11px] bg-black/5 text-charcoal font-medium">{label}</span>
);

export default function ExpertReview({ schedule, budget }: ExpertReviewProps) {
  const totalEvents = schedule.length;
  const completedEvents = schedule.filter((item) => item.completed).length;
  const completionRate = totalEvents === 0 ? 0 : (completedEvents / totalEvents) * 100;

  const uniqueDays = new Set(schedule.map((item) => item.date)).size || 1;
  const avgEventsPerDay = totalEvents === 0 ? 0 : Math.round((totalEvents / uniqueDays) * 10) / 10;
  const typeCoverage = new Set(schedule.map((item) => item.type)).size;

  const missingTravelTips = schedule.filter((item) => !item.travelTip && !item.travelTime).length;
  const upcomingWithoutNotes = schedule.filter((item) => !item.completed && !item.notes && !item.travelTip).length;

  const budgetUse = budget ? (budget.spent / budget.total) * 100 : undefined;

  const techHighlights = [
    '本地儲存行程、預算，支援離線後回到線上仍可恢復資料。',
    '頁面採分區元件化與動畫過場，降低主畫面阻塞感。',
    upcomingWithoutNotes > 0
      ? `${upcomingWithoutNotes} 個未完成行程缺少備註／交通提示，建議補齊避免臨時查詢。`
      : '所有未來行程皆已填寫必要備註，出行路徑明確。',
  ];

  const travelHighlights = [
    `行程涵蓋 ${uniqueDays} 天、${typeCoverage} 類型活動，平均每日 ${avgEventsPerDay} 個行程。`,
    budgetUse !== undefined
      ? `預算使用率 ${formatPercent(budgetUse)}，個人餘額 ฿${Math.round(budget.remaining).toLocaleString()}，還算安全。`
      : '預算尚未設定，建議加入總額以掌握花費節奏。',
    completionRate >= 50
      ? `已完成 ${formatPercent(completionRate)} 的待辦，節奏穩定。`
      : `完成率 ${formatPercent(completionRate)}，可以依重要性調整接下來的行程密度。`,
  ];

  const riskNotes = [
    missingTravelTips > 0
      ? `${missingTravelTips} 個行程缺少交通時間或提示，建議在出發前補完。`
      : '所有行程皆具備交通提示與時間，移動風險低。',
    '尚未設定提醒機制，若需要可以為重點餐廳加入提醒。',
  ];

  return (
    <div className="mx-4 mb-6 p-4 bg-white rounded-mag shadow-mag">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-[18px] text-red-xhs">reviews</span>
        <div>
          <p className="text-mag-caption text-stone">專業評分</p>
          <h2 className="text-mag-title text-charcoal">資深工程＋旅遊雙重檢視</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Engineering */}
        <div className="p-3 rounded-mag border border-black/5 bg-gradient-to-br from-white to-emerald-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
              <p className="text-[12px] font-semibold text-charcoal">工程師評分</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[22px] font-bold text-emerald-700">8.7</span>
              <span className="text-mag-caption text-stone">/10</span>
            </div>
          </div>
          <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
              style={{ width: '87%' }}
            />
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            <ReviewBadge label="離線復原" />
            <ReviewBadge label="動畫體驗" />
            <ReviewBadge label="資料治理" />
          </div>
          <ul className="text-[12px] text-charcoal leading-relaxed list-disc pl-5">
            {techHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Travel */}
        <div className="p-3 rounded-mag border border-black/5 bg-gradient-to-br from-white to-red-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-red-xhs">travel_explore</span>
              <p className="text-[12px] font-semibold text-charcoal">旅遊體驗評分</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[22px] font-bold text-red-xhs">9.2</span>
              <span className="text-mag-caption text-stone">/10</span>
            </div>
          </div>
          <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-rose-400 via-red-400 to-orange-400"
              style={{ width: '92%' }}
            />
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            <ReviewBadge label="行程密度" />
            <ReviewBadge label="預算掌握" />
            <ReviewBadge label="風險提醒" />
          </div>
          <ul className="text-[12px] text-charcoal leading-relaxed list-disc pl-5">
            {travelHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-2 p-2 rounded-mag bg-white/70 text-[11px] text-red-xhs border border-red-100 flex items-start gap-1">
            <span className="material-symbols-outlined text-[14px] mt-0.5">warning</span>
            <div>
              <p className="font-semibold text-[11px]">風險提示</p>
              <ul className="list-disc pl-4">
                {riskNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
