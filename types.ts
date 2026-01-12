export type Tab = 'home' | 'itinerary' | 'map' | 'wallet' | 'checklist' | 'explore';

export interface User {
  id: string;
  name: string;
  role: string;
  image: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  image: string;
}

export interface Traveler {
  name: string;
  role: string;
  image: string;
  status?: string;
  battery?: number;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  cat: string;
  time: string;
  payer: string;
}

export type ChecklistCategory = 'Documents' | 'Wardrobe' | 'Tech' | 'Medical' | 'Gadgets' | 'Toiletries' | 'Other';

export interface ChecklistItem {
  id: string;
  text: string;
  subtext?: string;
  sub?: string; // Alternative subtext field
  checked: boolean;
  category: ChecklistCategory;
  assigneeImage?: string;
  assigneeId?: string; // Family member ID
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

export interface ScheduleItem {
  id: number;
  title: string;
  time: string; // HH:mm
  date: string; // YYYY-MM-DD or MM/DD
  completed: boolean;
  type: string;
  desc?: string;
  location?: string;
  notificationOffset?: number; // Minutes before event
  tag?: string;
  image?: string;
  travelTime?: string; // e.g. "15m"
  travelTip?: string; // e.g. "Grab XL"
  // Deep travel features
  notes?: string; // Personal notes, booking refs, etc.
  bookingRef?: string; // Reservation/booking reference
  openHours?: string; // e.g. "09:00-18:00"
  closedDays?: string; // e.g. "週一休"
  estimatedCost?: number; // Estimated cost in THB
}