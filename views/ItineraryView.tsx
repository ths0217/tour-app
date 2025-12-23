import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const days = [
  { id: 1, date: '1/27', label: '抵達' },
  { id: 2, date: '1/28', label: '文化' },
  { id: 3, date: '1/29', label: '購物' },
  { id: 4, date: '1/30', label: '網美' },
  { id: 5, date: '1/31', label: '文青' },
  { id: 6, date: '2/1', label: '市場' },
  { id: 7, date: '2/2', label: '返程' },
];

// Enhanced Initial Data with more items
const initialItineraryData = {
  1: [
    { id: 101, time: '15:00', title: '入住：阿瓦尼河畔酒店', type: 'king_bed', desc: '已確認河景套房，提供私人管家服務，稍作休息整理行李。', location: 'Avani+ Riverside Bangkok Hotel' },
    { id: 102, time: '17:00', title: 'Asiatique 河濱碼頭夜市', type: 'storefront', desc: '搭乘免費接駁船，河畔散步，參觀曼谷眼摩天輪。', location: 'Asiatique The Riverfront' },
    { id: 103, time: '19:00', title: 'Sirimahannop 晚餐', type: 'restaurant', desc: '已預訂古船甲板座位，享受昭披耶河絕美夜景。', location: 'Sirimahannop' },
    { id: 104, time: '21:30', title: '飯店頂樓 SEEN 酒吧', type: 'wine_bar', desc: '返回飯店，在頂樓高空酒吧小酌一杯，欣賞河畔夜色。', location: 'SEEN Restaurant & Bar Bangkok' },
  ],
  2: [
    { id: 201, time: '09:00', title: '鄭王廟 (Wat Arun)', type: 'temple_buddhist', desc: '建議穿著泰服拍攝，避開中午人潮，光線最佳。', location: 'Wat Arun', tag: '必拍' },
    { id: 202, time: '11:00', title: '藍鯨咖啡 Blue Whale', type: 'local_cafe', desc: '以蝶豆花拿鐵聞名的網美咖啡廳，內部裝潢全藍色調。', location: 'Blue Whale Cafe' },
    { id: 203, time: '12:30', title: 'Supanniga Eating Room', type: 'restaurant', desc: '米其林推薦，河畔景觀午餐，必點蟹肉烘蛋。', location: 'Supanniga Eating Room' },
    { id: 204, time: '15:00', title: '臥佛寺按摩學校', type: 'self_improvement', desc: '體驗最正宗的泰式古法按摩，放鬆早上的疲勞。', location: 'Wat Pho Massage School' },
    { id: 205, time: '18:00', title: 'IconSiam 購物中心', type: 'shopping_bag', desc: '觀賞水舞秀，室內水上市場享用晚餐。', location: 'ICONSIAM' },
  ],
  3: [
    { id: 301, time: '10:00', title: 'Central Embassy', type: 'storefront', desc: '參觀 Open House 書店，被譽為曼谷最美閱讀空間。', location: 'Central Embassy' },
    { id: 302, time: '13:00', title: 'Kub Kao Kub Pla', type: 'restaurant', desc: '吃飯吃魚，精緻泰式家常菜，適合家庭聚餐。', location: 'Kub Kao Kub Pla' },
    { id: 303, time: '15:00', title: 'Siam Paragon', type: 'shopping_bag', desc: '參觀海洋世界，購買精品伴手禮，如 ChaTraMue 手標茶。', location: 'Siam Paragon' },
    { id: 304, time: '17:30', title: 'Mango Tango 甜點', type: 'icecream', desc: '必吃芒果糯米飯與芒果冰沙，稍作休息。', location: 'Mango Tango' },
    { id: 305, time: '20:00', title: 'Red Sky Bar', type: 'wine_bar', desc: '高空酒吧小酌，俯瞰曼谷繁華夜景。', location: 'Red Sky Bar' },
  ],
  4: [
    { id: 401, time: '11:00', title: 'Bubble in the Forest', type: 'local_cafe', desc: '小紅書爆紅「曼谷馬爾地夫」，建議預訂圓形漂浮座位。', location: 'Bubble in the Forest Cafe', tag: '小紅書熱推 🔥' },
    { id: 402, time: '14:30', title: 'After the Rain Coffee', type: 'rowing', desc: '雨林系咖啡廳，可體驗手划船拍照，十分愜意。', location: 'After the Rain Coffee & Gallery', tag: 'IG 必拍 📷' },
    { id: 403, time: '17:00', title: 'The One Ratchada', type: 'festival', desc: '原拉差達火車夜市原址重生，乾淨整潔。', location: 'The One Ratchada' },
    { id: 404, time: '19:00', title: 'Jodd Fairs 喬德夜市', type: 'festival', desc: '必吃火山排骨與水果西施冰沙，氣氛熱鬧。', location: 'Jodd Fairs Rama 9', tag: '人氣 No.1' },
  ],
  5: [
    { id: 501, time: '10:30', title: 'Gump’s Ari 社區', type: 'photo_camera', desc: 'Threads 推薦：色彩繽紛的文青聚集地，好拍好逛。', location: "Gump's Ari", tag: '文青必去' },
    { id: 502, time: '13:00', title: 'Onggi 韓式早午餐', type: 'brunch_dining', desc: '隱藏在 Ari 巷弄內的質感小店，麵包非常好吃。', location: 'Onggi' },
    { id: 503, time: '15:30', title: 'BACC 藝術文化中心', type: 'palette', desc: '螺旋展場設計，當代藝術展覽與設計小店。', location: 'Bangkok Art and Culture Centre' },
    { id: 504, time: '18:00', title: '朱拉隆功大學周邊', type: 'school', desc: '探索學區平價米其林美食與甜點，如 Jeh O Chula 媽媽麵。', location: 'Chulalongkorn University' },
    { id: 505, time: '20:30', title: 'Lisa 推薦甜豆奶', type: 'local_drink', desc: '朱拉區排隊名店，豆腐花與油條。', location: 'Jae Wan Anyamanee' },
  ],
  6: [
    { id: 601, time: '09:00', title: '恰圖恰週末市集', type: 'storefront', desc: '全球最大週末市集，備好現金，盡情挖寶。', location: 'Chatuchak Weekend Market' },
    { id: 602, time: '13:00', title: 'Or Tor Kor 市場', type: 'restaurant_menu', desc: '世界十大生鮮市場之一，品嚐高品質榴槤與烤大頭蝦。', location: 'Or Tor Kor Market', tag: '美食天堂' },
    { id: 603, time: '16:00', title: 'Health Land 按摩', type: 'spa', desc: 'Sathorn 分店，預約精油按摩，舒緩逛街痠痛。', location: 'Health Land Sathorn' },
    { id: 604, time: '19:00', title: '建興酒家', type: 'restaurant', desc: '必吃咖哩螃蟹，經典老字號美味。', location: 'Somboon Seafood' },
  ],
  7: [
    { id: 701, time: '10:00', title: '退房', type: 'luggage', desc: '行李寄放飯店，前往最後採購。', location: 'Avani+ Riverside Bangkok Hotel' },
    { id: 702, time: '11:30', title: 'Big C Supercenter', type: 'shopping_cart', desc: '採買零食、藥妝伴手禮，可現場退稅。', location: 'Big C Supercenter Rajdamri' },
    { id: 703, time: '13:30', title: 'Central World 午餐', type: 'restaurant', desc: '享用最後一餐泰式料理，推薦 Nara Thai Cuisine。', location: 'Central World' },
    { id: 704, time: '15:00', title: '前往機場 (BKK)', type: 'flight_takeoff', desc: '預約 Grab Van 送機，需提早 3 小時抵達。', location: 'Suvarnabhumi Airport' },
  ]
};

const activityTypes = [
    { id: 'restaurant', icon: 'restaurant', label: '餐廳' },
    { id: 'storefront', icon: 'storefront', label: '逛街' },
    { id: 'photo_camera', icon: 'photo_camera', label: '拍照' },
    { id: 'spa', icon: 'spa', label: '按摩' },
    { id: 'local_cafe', icon: 'local_cafe', label: '咖啡' },
    { id: 'flight_takeoff', icon: 'flight_takeoff', label: '交通' },
];

export default function ItineraryView() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [itinerary, setItinerary] = useState(initialItineraryData);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Activity State
  const [newTime, setNewTime] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('restaurant');
  const [newLocation, setNewLocation] = useState('');

  const openMap = (location: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank');
  };

  const openTranslate = (text: string) => {
    window.open(`https://translate.google.com/?sl=auto&tl=th&text=${encodeURIComponent(text)}&op=translate`, '_blank');
  };

  const handleDelete = (dayId: number, itemId: number) => {
      const updatedDay = itinerary[dayId as keyof typeof itinerary].filter(item => item.id !== itemId);
      setItinerary({
          ...itinerary,
          [dayId]: updatedDay
      });
  };

  const handleAddActivity = () => {
      if (!newTime || !newTitle) return;
      const newItem = {
          id: Date.now(),
          time: newTime,
          title: newTitle,
          desc: newDesc,
          type: newType,
          location: newLocation
      };
      
      const currentDayItems = itinerary[selectedDay as keyof typeof itinerary] || [];
      // Simple sort by time logic could be added here, but for now append
      const updatedDay = [...currentDayItems, newItem].sort((a, b) => a.time.localeCompare(b.time));

      setItinerary({
          ...itinerary,
          [selectedDay]: updatedDay
      });
      setShowAddModal(false);
      setNewTime('');
      setNewTitle('');
      setNewDesc('');
      setNewLocation('');
  };

  return (
    <div className="pt-6 pb-20 relative min-h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md px-6 pt-4 pb-2 border-b border-black/5">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-light tracking-wide text-text-primary">行程規劃</h2>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <span className="material-symbols-outlined text-icon">calendar_month</span>
          </motion.button>
        </div>
        
        {/* Day Selector */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {days.map((day) => (
            <motion.button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-start min-w-[6rem] p-3 rounded-xl border transition-colors duration-300 ${
                selectedDay === day.id 
                  ? 'bg-text-primary border-text-primary text-ivory shadow-lg' 
                  : 'bg-white border-black/5 text-text-muted hover:border-gold/50'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{day.date}</span>
              <span className="text-sm font-medium mt-1">{day.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="px-6 pt-8 pb-10 min-h-[60vh]">
        <AnimatePresence mode='wait'>
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex flex-col"
          >
            {itinerary[selectedDay as keyof typeof itinerary]?.map((item, index) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-[48px_1fr] gap-x-4 relative group"
              >
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className={`relative flex items-center justify-center size-10 rounded-full border z-10 shadow-sm transition-transform duration-500 ${index === 0 ? 'bg-bone border-gold shadow-glow scale-110' : 'bg-ivory border-black/10'}`}>
                    <span className={`material-symbols-outlined text-lg ${index === 0 ? 'text-gold' : 'text-icon'}`}>{item.type}</span>
                  </div>
                  {index !== (itinerary[selectedDay as keyof typeof itinerary].length - 1) && (
                    <div className="w-[1px] bg-gradient-to-b from-black/10 to-transparent h-full min-h-[4rem] -mt-2"></div>
                  )}
                </div>

                {/* Content */}
                <div className="pb-10 pt-1 relative">
                  {/* Delete Button (Visible on hover or consistent) */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(selectedDay, item.id)}
                    className="absolute top-0 right-0 p-2 text-icon/50 hover:text-red-500 transition-colors z-10"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </motion.button>

                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gold text-[10px] font-bold tracking-widest uppercase">{item.time}</span>
                    {item.tag && (
                      <span className="bg-red-50 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-100/50 tracking-wider">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="text-text-primary text-lg font-normal mb-2 pr-8">{item.title}</h3>
                  <p className="text-text-secondary text-sm font-light leading-relaxed mb-4">{item.desc}</p>
                  
                  {item.image && (
                    <div className="rounded-xl overflow-hidden h-32 w-full relative shadow-soft border border-white mb-4">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Smart Actions */}
                  <div className="flex gap-2">
                     <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); openTranslate(item.location || item.title); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/5 shadow-sm transition-transform hover:bg-bone hover:border-gold/30"
                     >
                        <span className="material-symbols-outlined text-[14px] text-gold">translate</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">翻譯</span>
                     </motion.button>
                     <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); openMap(item.location || item.title); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/5 shadow-sm transition-transform hover:bg-bone hover:border-gold/30"
                     >
                        <span className="material-symbols-outlined text-[14px] text-icon">map</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">地圖</span>
                     </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Add Activity Button */}
             <motion.button
                layout
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(true)}
                className="ml-[64px] flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-icon/30 text-text-muted hover:border-gold hover:text-gold transition-colors"
            >
                <span className="material-symbols-outlined">add</span>
                <span className="text-sm font-medium">新增行程</span>
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

       {/* Add Activity Modal */}
       <AnimatePresence>
        {showAddModal && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowAddModal(false)}
                    className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 w-full bg-ivory rounded-t-3xl p-6 z-50 pb-safe h-[85vh] flex flex-col"
                >
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 shrink-0"></div>
                    <h3 className="text-xl font-medium text-text-primary mb-6 shrink-0">新增行程</h3>
                    
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                        <div className="flex gap-4">
                            <div className="w-1/3">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">時間</label>
                                <input 
                                    type="time" 
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl p-4 text-base outline-none focus:border-gold transition-colors"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">標題</label>
                                <input 
                                    type="text" 
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-xl p-4 text-base outline-none focus:border-gold transition-colors"
                                    placeholder="例如: 晚餐"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">類型</label>
                            <div className="grid grid-cols-3 gap-3">
                                {activityTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setNewType(type.id)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                            newType === type.id 
                                            ? 'bg-text-primary text-ivory border-text-primary shadow-lg' 
                                            : 'bg-white border-gray-200 text-text-secondary'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-[20px] mb-1">{type.icon}</span>
                                        <span className="text-[10px] font-medium">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                         <div>
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">地點 (用於地圖)</label>
                            <input 
                                type="text" 
                                value={newLocation}
                                onChange={(e) => setNewLocation(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-base outline-none focus:border-gold transition-colors"
                                placeholder="Google Maps 搜尋關鍵字"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">備註</label>
                            <textarea 
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-base outline-none focus:border-gold transition-colors h-24 resize-none"
                                placeholder="例如: 記得訂位、穿著要求..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 shrink-0">
                        <button 
                            onClick={handleAddActivity}
                            className="w-full bg-text-primary text-ivory font-medium p-4 rounded-xl active:scale-95 transition-transform shadow-lg"
                        >
                            確認新增
                        </button>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </div>
  );
}