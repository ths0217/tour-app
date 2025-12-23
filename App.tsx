import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tab } from './types';
import BottomNav from './components/BottomNav';
import HomeView from './views/HomeView';
import ItineraryView from './views/ItineraryView';
import WalletView from './views/WalletView';
import ChecklistView from './views/ChecklistView';
import ExploreView from './views/ExploreView';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const renderView = () => {
    switch (activeTab) {
      case 'home': return <HomeView />;
      case 'itinerary': return <ItineraryView />;
      case 'wallet': return <WalletView />;
      case 'checklist': return <ChecklistView />;
      case 'explore': return <ExploreView />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-ivory overflow-hidden shadow-2xl relative font-display selection:bg-gold/20">
      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="min-h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}