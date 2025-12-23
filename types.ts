export type Tab = 'home' | 'itinerary' | 'wallet' | 'checklist' | 'explore';

export interface Traveler {
  name: string;
  role: string;
  image: string;
  status?: string;
  battery?: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'Dining' | 'Transport' | 'Retail' | 'Lodging';
  time: string;
  payer: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  subtext?: string;
  checked: boolean;
  category: 'Documents' | 'Wardrobe' | 'Tech';
  assigneeImage?: string;
}

export interface ItineraryItem {
  id: string;
  timeStart: string;
  timeEnd?: string;
  title: string;
  description: string;
  type: 'transport' | 'accommodation' | 'dining' | 'activity' | 'shopping';
  image?: string;
  location?: string;
}