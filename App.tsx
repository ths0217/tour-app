import React, { useEffect, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tab, Expense, ScheduleItem, User } from './types';
import BottomNav from './components/BottomNav';
import { ToastProvider } from './components/Toast';
import { HomePageSkeleton } from './components/Skeleton';
import ErrorBoundary from './components/ErrorBoundary';
import AddToHomeScreenPrompt from './components/AddToHomeScreenPrompt';

// Lazy load views for code splitting
const HomeView = lazy(() => import('./views/HomeView'));
const ItineraryView = lazy(() => import('./views/ItineraryView'));
const WalletView = lazy(() => import('./views/WalletView'));
const ChecklistView = lazy(() => import('./views/ChecklistView'));
const ExploreView = lazy(() => import('./views/ExploreView'));
const LoginView = lazy(() => import('./views/LoginView'));
const Onboarding = lazy(() => import('./components/Onboarding'));

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
  { id: 2, title: 'Grab 商務車', amount: 350, cat: 'Transport', time: '上午 10:15', payer: '爸爸' },
  { id: 3, title: 'Central World 購物', amount: 4500, cat: 'Retail', time: '昨天', payer: '妹妹' },
];

const initialSchedule: ScheduleItem[] = [
  // Day 1: 1/27 (Mon) - The Beginning
  { id: 101, date: '2025-01-27', time: '14:30', title: '抵達曼谷 BKK', type: 'flight', desc: '📍 Suvarnabhumi Airport • 領行李後叫 Grab 前往飯店', location: 'BKK', completed: true },
  { id: 102, date: '2025-01-27', time: '16:00', title: '入住 Avani+ Riverside', type: 'hotel', desc: '🏨 接待大廳 • Booking: KV-8829 • 絕美河景房 Check-in ✨', location: 'Avani+ Riverside', completed: true, travelTime: '🚗 45m', travelTip: '建議叫 Grab XL' },
  { id: 103, date: '2025-01-27', time: '18:00', title: 'The Rim 河畔晚餐', type: 'restaurant', desc: '🍽️ 河畔氛圍 • 建議點打拋豬與冬蔭功 🌶️', location: 'The Rim', completed: false, travelTime: '🚶 5m', travelTip: '飯店樓下步行可達' },
  { id: 104, date: '2025-01-27', time: '20:00', title: 'Asiatique 河濱夜市', type: 'attraction', desc: '🎡 摩天輪拍照 • 伴手禮小店巡禮 🛍️', location: 'Asiatique', completed: false, travelTime: '⛴️ 15m', travelTip: '飯店免費接駁船' },

  // Day 2: 1/28 (Tue) - Culture & Michelin (Restored)
  { id: 201, date: '2025-01-28', time: '09:00', title: '鄭王廟 (Wat Arun)', type: 'camera', desc: '📸 J-Tip: 預約 "Sense of Thai" 租泰服 • 避開中午人潮 ☀️', location: 'Wat Arun', completed: false, travelTime: '⛴️ 30m', travelTip: '搭船至 N8 碼頭' },
  { id: 202, date: '2025-01-28', time: '12:30', title: 'Supanniga Eating Room', type: 'restaurant', desc: '🦀 米其林推薦 • 必點蟹肉烘蛋 & 甘蔗煙燻魚 🤤', location: 'Supanniga Tha Tien', completed: false, travelTime: '⛴️ 10m', travelTip: '或是 Grab 叫車' },
  { id: 203, date: '2025-01-28', time: '15:00', title: '臥佛寺按摩學校', type: 'spa', desc: '💆‍♀️ 正宗古法按摩 • 釋放走路的疲勞 ✨', location: 'Wat Pho Massage', completed: false, travelTime: '🚶 10m', travelTip: '吃飽散步過去' },
  { id: 204, date: '2025-01-28', time: '17:30', title: 'IconSiam & % Arabica', type: 'shopping_bag', desc: '☕️ 絕美景觀咖啡 • 逛室內水上市場吹冷氣 ❄️', location: 'ICONSIAM', completed: false, travelTime: '⛴️ 15m', travelTip: 'ICONSIAM 接駁船' },

  // Day 3: 1/29 (Wed) - City Chic & Mango Tango (Restored)
  { id: 301, date: '2025-01-29', time: '11:00', title: 'Central Embassy', type: 'checkroom', desc: '📚 Open House 最美書店 • 貴婦百貨逛街 💃', location: 'Central Embassy', completed: false, travelTime: '🚆 25m', travelTip: 'BTS Phloen Chit' },
  { id: 302, date: '2025-01-29', time: '13:00', title: 'Kub Kao Kub Pla', type: 'restaurant', desc: '🐟 吃飯吃魚 • 精緻泰式料理 Chain 🍴', location: 'Central World', completed: false, travelTime: '🚶 10m', travelTip: 'Skywalk 步行' },
  { id: 303, date: '2025-01-29', time: '15:30', title: 'Mango Tango 甜點', type: 'icecream', desc: '🥭 芒果糯米飯始祖 • J-Tip: 下午茶時段人少 🤫', location: 'Siam Square', completed: false, travelTime: '🚆 10m', travelTip: 'BTS Siam' },
  { id: 304, date: '2025-01-29', time: '17:30', title: 'Red Sky Bar', type: 'wine_bar', desc: '🥂 55F 高空日落 • Happy Hour 買一送一 🌅', location: 'Centara Grand', completed: false, travelTime: '🚶 10m', travelTip: 'Centara 飯店頂樓' },
  { id: 305, date: '2025-01-29', time: '20:00', title: 'Pratunam / Big C', type: 'shopping_cart', desc: '🍪 掃貨行程 • Pocky, 海苔, 芒果乾一次買齊 🛒', location: 'Big C Rajdamri', completed: false, travelTime: '🚶 5m', travelTip: '就在對面' },

  // Day 4: 1/30 (Thu) - Trendy Vibes
  { id: 401, date: '2025-01-30', time: '11:00', title: 'The Commons Thonglor', type: 'brunch', desc: '🧱 工業風清水模 • 網美早午餐 Roast 🥯', location: 'Thong Lor Soi 17', completed: false, travelTime: '🚗 20m', travelTip: 'Grab 較方便' },
  { id: 402, date: '2025-01-30', time: '14:00', title: 'Ekkamai 選物店', type: 'checkroom', desc: '🧥 Treasure Factory 挖寶 • 文青必逛 Vintage ✨', location: 'Ekkamai', completed: false, travelTime: '🚗 10m', travelTip: '車程短' },
  { id: 403, date: '2025-01-30', time: '18:00', title: 'Jodd Fairs 夜市', type: 'fastfood', desc: '🌋 火山排骨 & 水果西施 • 觀光客必去打卡點 📸', location: 'Rama 9', completed: false, travelTime: '🚆 25m', travelTip: 'MRT Rama 9' },
  { id: 404, date: '2025-01-30', time: '20:30', title: 'Tichuca Rooftop', type: 'celebration', desc: '🪼 巨型水母酒吧 • Threads爆紅熱點 (需護照) 🥃', location: 'T-One Building', completed: false, travelTime: '🚗 15m', travelTip: 'Grab 回 Thong Lor' },

  // Day 5: 1/31 (Fri) - Artsy & Local
  { id: 501, date: '2025-01-31', time: '10:30', title: "Gump's Ari", type: 'camera', desc: '🍭 色彩繽紛創意社區 • 隨手拍都好看📷', location: 'Ari', completed: false, travelTime: '🚆 30m', travelTip: 'BTS Ari' },
  { id: 502, date: '2025-01-31', time: '12:30', title: 'Lay Lao (Ari)', type: 'restaurant', desc: '🥘 米其林必比登 • 道地東北菜 Som Tum 🌶️', location: 'Ari Soi 2', completed: false, travelTime: '🚶 5m', travelTip: '步行可達' },
  { id: 503, date: '2025-01-31', time: '15:00', title: "Let's Relax Onsen", type: 'spa', desc: '♨️ 日式溫泉+按摩 • J-Tip: Klook 已購票 🎫', location: 'Grande Centre Point', completed: false, travelTime: '🚗 20m', travelTip: 'Grab 前往' },
  { id: 504, date: '2025-01-31', time: '19:00', title: 'China Town', type: 'restaurant', desc: '🏮 T&K 海鮮 • 必吃爆漿炭烤吐司 🍞', location: 'Yaowarat', completed: false, travelTime: '🚆 25m', travelTip: 'MRT Wat Mangkon' },

  // Day 6: 2/1 (Sat) - Weekend Madness
  { id: 601, date: '2025-02-01', time: '10:00', title: 'Chatuchak 週末市集', type: 'storefront', desc: '🛍️ 全球最大市集 • 記得穿布鞋好走路 👟', location: 'Mo Chit', completed: false, travelTime: '🚆 35m', travelTip: 'BTS Mo Chit' },
  { id: 602, date: '2025-02-01', time: '14:00', title: 'MixT Mall 休息', type: 'coffee', desc: '❄️ 冷氣續命 • 腳底按摩 30min 🦶', location: 'Chatuchak', completed: false, travelTime: '🚶 1m', travelTip: '就在市集旁' },
  { id: 603, date: '2025-02-01', time: '17:00', title: 'Siam Square', type: 'music_note', desc: '🎸 步行街 Live Band • 年輕人聚集地 🔥', location: 'Siam', completed: false, travelTime: '🚆 20m', travelTip: 'BTS Siam' },
  { id: 604, date: '2025-02-01', time: '19:30', title: 'Somboon Seafood', type: 'restaurant', desc: '🦀 建興酒家 • 咖哩蟹收尾 (需訂位) 📝', location: 'Siam Square One', completed: false, travelTime: '🚶 5m', travelTip: 'Siam Square One 4F' },

  // Day 7: 2/2 (Sun) - Goodbye
  { id: 701, date: '2025-02-02', time: '11:00', title: 'Siam Paragon', type: 'shopping_bag', desc: '👑 Gourmet Market 最後採買 • 寄放行李 🧳', location: 'Siam', completed: false, travelTime: '🚆 15m', travelTip: 'BTS Siam' },
  { id: 702, date: '2025-02-02', time: '13:00', title: 'After You 甜點', type: 'icecream', desc: '🍯 招牌蜜糖吐司 • 完美的 Ending 🍰', location: 'Paragon GF', completed: false, travelTime: '🚶 0m', travelTip: '就在百貨內' },
  { id: 703, date: '2025-02-02', time: '15:00', title: '前往機場 (BKK)', type: 'flight_takeoff', desc: '✈️ 預留 3 小時辦理登機 • 回家囉 🏠', location: 'Suvarnabhumi', completed: false, travelTime: '🚗 45m', travelTip: 'Grab or Airport Rail' },
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
    { id: 'vickly', name: 'Vickly', role: '我', image: '/avatars/me.jpg' },
    { id: 'sherry', name: 'Sherry', role: '姊姊', image: '/avatars/sister.jpg' },
    { id: 'brother', name: 'wattbsttrrrog', role: '哥哥', image: '/avatars/brother.jpg' },
    { id: 'mom', name: 'Mom', role: '老媽', image: '/avatars/mom.jpg' },
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

// Export wrapped with ToastProvider and ErrorBoundary
export default function AppWithProviders() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  );
}
