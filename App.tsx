import React, { useEffect, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tab, Expense, ScheduleItem, User } from './types';
import BottomNav from './components/BottomNav';
import { ToastProvider } from './components/Toast';
import { HomePageSkeleton } from './components/Skeleton';
import ErrorBoundary from './components/ErrorBoundary';
import AddToHomeScreenPrompt from './components/AddToHomeScreenPrompt';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import OfflineBanner from './components/OfflineBanner';
import { FamilyModeProvider } from './contexts/FamilyModeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TripProvider, useTrip } from './contexts/TripContext';

// Lazy load views for code splitting
const HomeView = lazy(() => import('./views/HomeView'));
const ItineraryView = lazy(() => import('./views/ItineraryView'));
const WalletView = lazy(() => import('./views/WalletView'));
const ChecklistView = lazy(() => import('./views/ChecklistView'));
const ExploreView = lazy(() => import('./views/ExploreView'));
const MapTimelineView = lazy(() => import('./views/MapTimelineView'));
const LoginView = lazy(() => import('./views/LoginView'));
const Onboarding = lazy(() => import('./components/Onboarding'));

// Main App Component using Contexts
function AppContent() {
  const { user, signIn, signOut } = useAuth();
  const { schedule, expenses, currentTrip } = useTrip();

  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('onboarding_complete');
  });

  // Local state for UI-only things (Family Avatars, Hotel Info) - kept here for now
  // In a full migration, FamilyMembers would likely be in TripContext too
  const initialFamily = [
    { id: 'vickly', name: 'Vickly', role: '我', image: './avatars/me.jpg' },
    { id: 'sherry', name: 'Sherry', role: '姊姊', image: './avatars/sister.jpg' },
    { id: 'brother', name: 'wattbsttrrrog', role: '哥哥', image: './avatars/brother.jpg' },
    { id: 'mom', name: 'Mom', role: '老媽', image: './avatars/mom.jpg' },
  ];

  const [familyMembers, setFamilyMembers] = useState(() => {
    try {
      if (typeof window === 'undefined') return initialFamily;
      const stored = localStorage.getItem('tourapp_family');
      const parsed = stored ? JSON.parse(stored) : null;
      if (Array.isArray(parsed)) {
        return initialFamily.map(init => {
          const storedMember = parsed.find((s: any) => s.id === init.id);
          return { ...init, image: storedMember?.image || init.image };
        });
      }
    } catch (e) { }
    return initialFamily;
  });

  const handleUpdateFamilyMember = (id: string, newImage: string) => {
    setFamilyMembers(members => {
      const updated = members.map(m => m.id === id ? { ...m, image: newImage } : m);
      localStorage.setItem('tourapp_family', JSON.stringify(updated));
      return updated;
    });
  };

  const [hotelInfo, setHotelInfo] = useState({
    name: 'Avani+ Riverside',
    bookingId: 'KV-8829',
    location: 'Avani+ Riverside Bangkok Hotel'
  });

  // Budget calculations
  const [budgetGoal, setBudgetGoal] = useState(50000);
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const familyMemberCount = 4;
  const personalBudget = budgetGoal / familyMemberCount;
  const myShareOfSpent = totalSpent / familyMemberCount;
  const myRemaining = personalBudget - myShareOfSpent;

  // Sync budget goal to local storage for now (mix model)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tourapp_budget', String(budgetGoal));
    }
  }, [budgetGoal]);

  const renderView = () => {
    const noop = () => { };

    switch (activeTab) {
      case 'home': return <HomeView
        user={user}
        budget={{ total: personalBudget, remaining: myRemaining, spent: myShareOfSpent }}
        schedule={schedule}
        setSchedule={noop as any} // TripContext handles updates now via addScheduleItem etc.
        onLogout={signOut}
        familyMembers={familyMembers}
        onUpdateFamilyMember={handleUpdateFamilyMember}
      />;
      case 'itinerary': return <ItineraryView
        schedule={schedule}
        setSchedule={noop as any}
      />;
      case 'wallet': return <WalletView
        user={user}
        expenses={expenses}
        setExpenses={noop as any}
        budgetGoal={budgetGoal}
        setBudgetGoal={setBudgetGoal}
        hotelInfo={hotelInfo}
        setHotelInfo={setHotelInfo}
        familyMembers={familyMembers}
      />;
      case 'checklist': return <ChecklistView currentUser={user} familyMembers={familyMembers} />;
      case 'explore': return <ExploreView hotelInfo={hotelInfo} />;
      case 'map': return <MapTimelineView schedule={schedule} familyMembers={familyMembers} />;
      default: return null;
    }
  };

  if (!user) {
    return (
      <Suspense fallback={<HomePageSkeleton />}>
        {/* Pass dummy props if LoginView expects them, or update LoginView */}
        <LoginView onLogin={signIn} familyMembers={familyMembers} />
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
      <Onboarding isOpen={showOnboarding && user !== null} onComplete={() => setShowOnboarding(false)} />
      <AddToHomeScreenPrompt />
    </div>
  );
}

export default function AppWithProviders() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <TripProvider>
              <FamilyModeProvider>
                <OfflineBanner />
                <ToastProvider>
                  <AppContent />
                </ToastProvider>
              </FamilyModeProvider>
            </TripProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
