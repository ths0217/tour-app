import React, { useEffect, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tab, Expense, ScheduleItem, User } from './types';
import BottomNav from './components/BottomNav';
import { ToastProvider } from './components/Toast';
import { HomePageSkeleton } from './components/Skeleton';
import ErrorBoundary from './components/ErrorBoundary';
import AddToHomeScreenPrompt from './components/AddToHomeScreenPrompt';
import { LanguageProvider } from './contexts/LanguageContext';

// Lazy load views for code splitting
const HomeView = lazy(() => import('./views/HomeView'));
const ItineraryView = lazy(() => import('./views/ItineraryView'));
const WalletView = lazy(() => import('./views/WalletView'));
const ChecklistView = lazy(() => import('./views/ChecklistView'));
const ExploreView = lazy(() => import('./views/ExploreView'));
const MapTimelineView = lazy(() => import('./views/MapTimelineView'));
const LoginView = lazy(() => import('./views/LoginView'));
const Onboarding = lazy(() => import('./components/Onboarding'));

// Data version for cache invalidation
const DATA_VERSION = 'v3.9.0';
const VERSION_KEY = 'tourapp_version';

// Clear old data if version changed
if (typeof window !== 'undefined') {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  if (storedVersion !== DATA_VERSION) {
    // Clear expenses and schedule to force reload with new data
    localStorage.removeItem('tourapp_expenses');
    localStorage.removeItem('tourapp_schedule');
    localStorage.setItem(VERSION_KEY, DATA_VERSION);
  }
}

const STORAGE_KEYS = {
  user: 'tourapp_user',
  expenses: 'tourapp_expenses',
  budget: 'tourapp_budget',
  schedule: 'tourapp_schedule',
  familyMembers: 'tourapp_family',
} as const;

const safeLoad = <T,>(key: string, fallback: T, validator?: (value: T) => boolean): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    if (validator && !validator(parsed)) throw new Error('validation failed');
    return parsed;
  } catch (error) {
    localStorage.removeItem(key);
    return fallback;
  }
};

const initialExpenses: Expense[] = [
  { id: 1, title: 'Som Tam Nua 餐廳', amount: 1250, cat: 'Dining', time: '下午 12:30', payer: '媽媽' },
  { id: 2, title: 'Grab 商務車', amount: 350, cat: 'Transport', time: '上午 10:15', payer: '哥哥' },
  { id: 3, title: 'Central World 購物', amount: 4500, cat: 'Retail', time: '昨天', payer: '姊姊' },
];

const initialSchedule: ScheduleItem[] = [
  // Day 1: 01/27 (週二) - 出發日
  { id: 101, date: '2025-01-27', time: '08:00', title: '觀景名廬出發', type: 'transport', desc: '🏠 從家出發前往機場', location: '觀景名廬', completed: false },
  { id: 102, date: '2025-01-27', time: '13:50', title: '臺灣桃園國際機場', type: 'flight', desc: '✈️ 辦理登機手續 • 13:50 離開 • 飛行約 3.5 小時', location: 'TPE', completed: false, travelTime: '🚗 45分' },
  { id: 103, date: '2025-01-27', time: '16:45', title: '素萬那普機場', type: 'flight', desc: '✈️ 抵達曼谷 • 16:45 離開 • 入境通關', location: '素萬那普機場', completed: false, travelTime: '✈️ 3.5時' },
  { id: 104, date: '2025-01-27', time: '16:45', title: 'Bangkok Patio Serviced Apartment', type: 'accommodation', desc: '🏨 入住公寓 • 停留 1 時整理行李', location: 'Bangkok Patio', completed: false, travelTime: '🚗 45分', travelTip: 'Grab 從機場約 ฿350-500' },
  { id: 105, date: '2025-01-27', time: '17:45', title: '喬德夜市新址 Jodd Fairs Ratchada', type: 'dining', desc: '🌋 火山排骨 • 水果西施 • 停留 1 時', location: 'Jodd Fairs Ratchada', completed: false, travelTime: '🚗 15分', travelTip: 'Grab 約 ฿80-120' },

  // Day 2: 01/28 (週三) - 寺廟文化日
  { id: 201, date: '2025-01-28', time: '08:00', title: 'Bangkok Patio 早餐', type: 'accommodation', desc: '🏨 公寓內用早餐', location: 'Bangkok Patio', completed: false },
  { id: 202, date: '2025-01-28', time: '09:00', title: '鄭王廟 (穿泰服)', type: 'activity', desc: '👗 預約泰服體驗 • 停留 4 時 • 拍照打卡', location: 'Wat Arun', completed: false, travelTime: '🚗 25分', travelTip: 'Grab 約 ฿150' },
  { id: 203, date: '2025-01-28', time: '13:10', title: '臥佛寺 Wat Pho', type: 'activity', desc: '🛕 Temple of the Reclining Buddha • 停留 1 時', location: 'Wat Pho', completed: false, travelTime: '⛴️ 5分', travelTip: '搭船渡河 ฿4' },
  { id: 204, date: '2025-01-28', time: '14:20', title: '玉佛寺 Wat Phra Kaeo', type: 'activity', desc: '⛩️ 大皇宮內 • 停留 1 時', location: 'Grand Palace', completed: false, travelTime: '🚶 5分', travelTip: '步行可達' },
  { id: 205, date: '2025-01-28', time: '15:20', title: 'Bangkok Patio 休息', type: 'accommodation', desc: '🏨 回公寓休息', location: 'Bangkok Patio', completed: false, travelTime: '🚗 25分', travelTip: 'Grab 約 ฿150' },

  // Day 3: 01/29 (週四) - 動物園＆遊船日
  { id: 301, date: '2025-01-29', time: '08:00', title: 'Bangkok Patio 早餐', type: 'accommodation', desc: '🏨 公寓內用早餐', location: 'Bangkok Patio', completed: false },
  { id: 302, date: '2025-01-29', time: '09:00', title: '曼谷 Safari World 野生動物園', type: 'activity', desc: '🦁 野生動物園 • 停留 1 時', location: 'Safari World', completed: false, travelTime: '🚗 50分', travelTip: 'Grab 約 ฿350-400' },
  { id: 303, date: '2025-01-29', time: '10:00', title: 'Sabaikay Head Massage + Sleep Salon', type: 'shopping', desc: '💆 按摩休息 • 停留 1 時', location: 'Sabaikay', completed: false, travelTime: '🚗 12分' },
  { id: 304, date: '2025-01-29', time: '19:45', title: '白蘭花河號 ICONSIAM Pier 4', type: 'transport', desc: '🛥️ Chao Phraya Tourist Boat • 21:45 離開', location: 'ICONSIAM', completed: false, travelTime: '🚗 40分', travelTip: 'Grab 約 ฿200-250' },
  { id: 305, date: '2025-01-29', time: '22:31', title: 'Bangkok Patio 回程', type: 'accommodation', desc: '🏨 回公寓休息', location: 'Bangkok Patio', completed: false, travelTime: '⛴️ 30分', travelTip: '遊船回碼頭後 Grab' },

  // Day 4: 01/30 (週五) - 水上市場＆鐵道市集＆換飯店
  { id: 401, date: '2025-01-30', time: '08:00', title: 'Bangkok Patio 退房', type: 'accommodation', desc: '🏨 公寓最後一早', location: 'Bangkok Patio', completed: false },
  { id: 402, date: '2025-01-30', time: '09:00', title: 'Savoey @Terminal 21 Asok', type: 'dining', desc: '🦀 建興酒家 • 咖哩蟹早午餐 • 停留 1 時', location: 'Terminal 21', completed: false, travelTime: '🚗 20分', travelTip: 'Grab 約 ฿100' },
  { id: 403, date: '2025-01-30', time: '10:00', title: '丹嫩莎朵水上市場', type: 'activity', desc: '🛶 經典水上市場 • 坐船遊覽 • 停留 1 時', location: 'Damnoen Saduak', completed: false, travelTime: '🚗 90分', travelTip: '距離曼谷約 100km' },
  { id: 404, date: '2025-01-30', time: '11:00', title: '美功鐵道市集', type: 'activity', desc: '🚂 火車穿越市場 • 停留 1 時', location: 'Maeklong Railway', completed: false, travelTime: '🚗 30分', travelTip: '從水上市場約 25km' },
  { id: 405, date: '2025-01-30', time: '12:00', title: 'Bangkok Patio 取行李', type: 'accommodation', desc: '🧳 取行李前往新飯店', location: 'Bangkok Patio', completed: false, travelTime: '🚗 90分', travelTip: '回曼谷市區' },
  { id: 406, date: '2025-01-30', time: '13:00', title: '曼谷水門文斯飯店 菁英大廈', type: 'accommodation', desc: '🏨 VIE Hotel • 入住新飯店 • 停留 1 時', location: 'VIE Hotel Bangkok', completed: false, travelTime: '🚗 15分', travelTip: 'Grab 約 ฿80' },

  // Day 5: 01/31 (週六) - 暹羅古城＆購物
  { id: 501, date: '2025-01-31', time: '08:00', title: '曼谷水門文斯飯店 (有早餐)', type: 'dining', desc: '🍳 飯店自助早餐 • 停留 1 時', location: 'VIE Hotel Bangkok', completed: false },
  { id: 502, date: '2025-01-31', time: '09:00', title: '暹羅古城 Ancient City', type: 'activity', desc: '🏛️ 泰國縮影 • 停留 1 時', location: 'Ancient City', completed: false, travelTime: '🚗 50分', travelTip: 'Grab 約 ฿300' },
  { id: 503, date: '2025-01-31', time: '10:00', title: '中央世界購物商場 CentralWorld', type: 'shopping', desc: '🛍️ 購物最後衝刺 • 停留 1 時', location: 'CentralWorld', completed: false, travelTime: '🚗 45分', travelTip: 'Grab 約 ฿250' },
  { id: 504, date: '2025-01-31', time: '11:00', title: '曼谷水門文斯飯店 菁英大廈', type: 'accommodation', desc: '🏨 回飯店休息 • 停留 1 時', location: 'VIE Hotel Bangkok', completed: false, travelTime: '🚶 8分', travelTip: '步行可達' },

  // Day 6: 02/01 (週日) - 市區觀光與週末市集
  { id: 601, date: '2025-02-01', time: '08:00', title: '曼谷水門文斯飯店 菁英大廈 (有早餐)', type: 'dining', desc: '🍳 飯店自助早餐 • 停留 1 時', location: '曼谷水門文斯飯店', completed: false },
  { id: 602, date: '2025-02-01', time: '09:00', title: '曼谷四面佛 (Thao Maha Brahma)', type: 'activity', desc: '🙏 許願求平安 • 停留 1 時', location: '曼谷四面佛', completed: false, travelTime: '🚶 5分', travelTip: '飯店步行可達' },
  { id: 603, date: '2025-02-01', time: '10:00', title: '水門市場 (Pratunam Market)', type: 'shopping', desc: '👕 批發購物天堂 • 停留 1 時', location: '水門市場', completed: false, travelTime: '🚶 8分', travelTip: '步行可達' },
  { id: 604, date: '2025-02-01', time: '11:08', title: '洗頭）Sabaikay Head Massage-Sleep Salon', type: 'shopping', desc: '💆 舒壓洗頭按摩 • 停留 1 時', location: 'Sabaikay', completed: false, travelTime: '🚗 15分', travelTip: 'Grab 約 ฿80' },
  { id: 605, date: '2025-02-01', time: '12:08', title: '恰圖恰市集 Chatuchak Weekend Market', type: 'shopping', desc: '🛒 週末市集掃貨 • 停留 1 時', location: '恰圖恰市集', completed: false, travelTime: '🚶 5分', travelTip: 'BTS Mo Chit 站' },
  { id: 606, date: '2025-02-01', time: '13:13', title: 'Sicha Premium Thai Tea @Chatuchak', type: 'dining', desc: '🍵 經典泰式奶茶 • 休息一下', location: 'Sicha', completed: false, travelTime: '🚶 2分', travelTip: '市集內步行' },
  { id: 607, date: '2025-02-01', time: '14:20', title: 'JACK COFFEE JJ MARKET', type: 'dining', desc: '☕ 精品咖啡 • 停留 1 時', location: 'JACK COFFEE', completed: false, travelTime: '🚶 5分', travelTip: '市集內步行' },
  { id: 608, date: '2025-02-01', time: '15:20', title: '曼谷水門文斯飯店 菁英大廈', type: 'accommodation', desc: '🏨 回飯店休息', location: '曼谷水門文斯飯店', completed: false, travelTime: '🚆 25分', travelTip: 'BTS 回 Chit Lom' },

  // Day 7: 02/02 (週一) - 最後一天 & 回程
  { id: 701, date: '2025-02-02', time: '08:00', title: '水門寺', type: 'activity', desc: '🛕 著名翡翠佛塔 • 停留 1 時', location: '水門寺', completed: false },
  { id: 702, date: '2025-02-02', time: '09:00', title: '暹羅中心', type: 'shopping', desc: '🛍️ Siam Center 購物 • 停留 1 時', location: '暹羅中心', completed: false, travelTime: '🚗 20分', travelTip: 'Grab 約 ฿100' },
  { id: 703, date: '2025-02-02', time: '10:00', title: '曼谷水門文斯飯店 菁英大廈 (有早餐)', type: 'dining', desc: '🍳 最後一天早餐 • 準備退房', location: '曼谷水門文斯飯店', completed: false, travelTime: '🚶 8分', travelTip: '步行可達' },
  { id: 704, date: '2025-02-02', time: '14:20', title: 'JACK COFFEE JJ MARKET', type: 'dining', desc: '☕ 最後一杯咖啡 • 停留 1 時', location: 'JACK COFFEE', completed: false, travelTime: '🚆 25分', travelTip: 'BTS Mo Chit 站' },
  { id: 705, date: '2025-02-02', time: '15:20', title: '曼谷水門文斯飯店 菁英大廈', type: 'accommodation', desc: '🏨 取行李準備機場 • 停留 1 時', location: '曼谷水門文斯飯店', completed: false, travelTime: '🚆 25分', travelTip: 'BTS 回 Chit Lom' },
  { id: 706, date: '2025-02-02', time: '17:00', title: '素萬那普機場 Suvarnabhumi Airport', type: 'flight', desc: '✈️ 辦理登機手續 • 回程航班', location: '素萬那普機場', completed: false, travelTime: '🚗 45分', travelTip: 'Grab 約 ฿400-500' },
];

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => safeLoad<User | null>(STORAGE_KEYS.user, null));
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('onboarding_complete');
  });

  // Shared Budget State
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    safeLoad<Expense[]>(STORAGE_KEYS.expenses, initialExpenses, (val) => Array.isArray(val)),
  );
  const [budgetGoal, setBudgetGoal] = useState(() => {
    const fallback = 50000;
    const stored = safeLoad<number | string | null>(STORAGE_KEYS.budget, null);
    const parsed = typeof stored === 'string' ? parseInt(stored, 10) : stored;
    return Number.isFinite(parsed) && (parsed as number) > 0 ? (parsed as number) : fallback;
  });

  // Shared Schedule State
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() =>
    safeLoad<ScheduleItem[]>(STORAGE_KEYS.schedule, initialSchedule, (val) => Array.isArray(val) && val.length > 0),
  );

  // Shared Family Members State (for avatars)
  const initialFamily = [
    { id: 'vickly', name: 'Vickly', role: '我', image: './avatars/me.jpg' },
    { id: 'sherry', name: 'Sherry', role: '姊姊', image: './avatars/sister.jpg' },
    { id: 'brother', name: 'wattbsttrrrog', role: '哥哥', image: './avatars/brother.jpg' },
    { id: 'mom', name: 'Mom', role: '老媽', image: './avatars/mom.jpg' },
  ];

  const [familyMembers, setFamilyMembers] = useState(() => {
    const stored = safeLoad(STORAGE_KEYS.familyMembers, initialFamily, (val) => Array.isArray(val));
    // Merge names/roles from initialFamily, keep custom images from stored
    return initialFamily.map(init => {
      const storedMember = stored.find((s: any) => s.id === init.id);
      return {
        ...init,
        // Keep custom image if user updated it, otherwise use default
        image: storedMember?.image || init.image
      };
    });
  });

  const handleUpdateFamilyMember = (id: string, newImage: string) => {
    setFamilyMembers(members => {
      const updated = members.map(m => m.id === id ? { ...m, image: newImage } : m);
      localStorage.setItem(STORAGE_KEYS.familyMembers, JSON.stringify(updated));
      return updated;
    });
  };

  // Shared Hotel Info (for Wallet & Explore)
  const [hotelInfo, setHotelInfo] = useState({
    name: 'Avani+ Riverside',
    bookingId: 'KV-8829',
    location: 'Avani+ Riverside Bangkok Hotel'
  });

  // Derived State
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const familyMemberCount = 4; // Vickly, Sherry, Alex, Jenny
  const personalBudget = budgetGoal / familyMemberCount;

  // Calculate personal spending (for HomeView) - simplistic view: average spending or explicit 'payer' check?
  // User said: "Home shows personal". Let's assume personal share of the TOTAL budget vs Personal Spending?
  // Or just "Personal Budget" = Total Budget / 4.
  // And "Personal Remaining" = Personal Budget - (My Paid Expenses? Or My Share of Expenses?)
  // Let's go with "My Share of Strategy" => Total Expense / 4.
  const myShareOfSpent = totalSpent / familyMemberCount;
  const myRemaining = personalBudget - myShareOfSpent;

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    if (!Number.isFinite(budgetGoal) || budgetGoal <= 0) {
      setBudgetGoal(50000);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.budget, String(budgetGoal));
  }, [budgetGoal]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.schedule, JSON.stringify(schedule));
  }, [schedule]);

  const renderView = () => {
    switch (activeTab) {
      case 'home': return <HomeView
        user={currentUser}
        budget={{
          total: personalBudget,
          remaining: myRemaining,
          spent: myShareOfSpent
        }}
        schedule={schedule}
        setSchedule={setSchedule}
        onLogout={handleLogout}
        familyMembers={familyMembers}
        onUpdateFamilyMember={handleUpdateFamilyMember}
      />;
      case 'itinerary': return <ItineraryView
        schedule={schedule}
        setSchedule={setSchedule}
      />;
      case 'wallet': return <WalletView
        user={currentUser}
        expenses={expenses}
        setExpenses={setExpenses}
        budgetGoal={budgetGoal}
        setBudgetGoal={setBudgetGoal}
        hotelInfo={hotelInfo}
        setHotelInfo={setHotelInfo}
        familyMembers={familyMembers}
      />;
      case 'checklist': return <ChecklistView currentUser={currentUser} familyMembers={familyMembers} />;
      case 'explore': return <ExploreView hotelInfo={hotelInfo} />;
      case 'map': return <MapTimelineView schedule={schedule} />;
      default: return <HomeView
        user={currentUser}
        budget={{
          total: personalBudget,
          remaining: myRemaining,
          spent: myShareOfSpent
        }}
        schedule={schedule}
        setSchedule={setSchedule}
        onLogout={handleLogout}
      />;
    }
  };

  if (!currentUser) {
    return (
      <Suspense fallback={<HomePageSkeleton />}>
        <LoginView onLogin={handleLogin} familyMembers={familyMembers} />
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-md mx-auto bg-ios-bg overflow-hidden relative font-sans selection:bg-ios-blue/20 safe-area-app">
      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-[90px] relative bg-ios-bg">
        <Suspense fallback={<HomePageSkeleton />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="min-h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Onboarding for first-time users */}
      <Onboarding
        isOpen={showOnboarding && currentUser !== null}
        onComplete={() => setShowOnboarding(false)}
      />

      {/* iOS Safari add-to-home-screen helper */}
      <AddToHomeScreenPrompt />
    </div>
  );
}

// Export wrapped with ToastProvider, LanguageProvider, and ErrorBoundary
export default function AppWithProviders() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
