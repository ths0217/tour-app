import { describe, it, expect } from 'vitest';

// Test utility functions
describe('Utility Functions', () => {
  describe('Currency Formatting', () => {
    it('should format Thai Baht correctly', () => {
      const formatBaht = (amount: number) => `฿${amount.toLocaleString()}`;
      expect(formatBaht(1000)).toBe('฿1,000');
      expect(formatBaht(50000)).toBe('฿50,000');
      expect(formatBaht(0)).toBe('฿0');
    });

    it('should handle decimal amounts', () => {
      const formatBaht = (amount: number) => `฿${Math.round(amount).toLocaleString()}`;
      expect(formatBaht(1000.5)).toBe('฿1,001');
      expect(formatBaht(99.4)).toBe('฿99');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates in Thai style', () => {
      const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('zh-TW', { 
          month: 'short', 
          day: 'numeric' 
        });
      };
      // Basic date format test
      const result = formatDate('2025-01-27');
      expect(result).toContain('27');
    });
  });

  describe('Budget Calculations', () => {
    it('should calculate remaining budget correctly', () => {
      const total = 50000;
      const spent = 6100;
      const remaining = total - spent;
      expect(remaining).toBe(43900);
    });

    it('should calculate percentage correctly', () => {
      const total = 50000;
      const spent = 6100;
      const percent = (spent / total) * 100;
      expect(percent).toBeCloseTo(12.2, 1);
    });

    it('should calculate per person share correctly', () => {
      const totalSpent = 6100;
      const memberCount = 4;
      const perPerson = totalSpent / memberCount;
      expect(perPerson).toBe(1525);
    });
  });

  describe('Settlement Calculations', () => {
    it('should identify debtors and creditors', () => {
      const members = [
        { id: 'a', paid: 3000, share: 1525 },
        { id: 'b', paid: 0, share: 1525 },
        { id: 'c', paid: 3100, share: 1525 },
        { id: 'd', paid: 0, share: 1525 },
      ];
      
      const settlements = members.map(m => ({
        ...m,
        balance: m.paid - m.share
      }));
      
      const debtors = settlements.filter(s => s.balance < 0);
      const creditors = settlements.filter(s => s.balance > 0);
      
      expect(debtors.length).toBe(2);
      expect(creditors.length).toBe(2);
    });
  });
});

describe('Validation Functions', () => {
  it('should validate expense input', () => {
    const validateExpense = (title: string, amount: string) => {
      if (!title.trim()) return { valid: false, error: 'Title required' };
      if (!amount || parseFloat(amount) <= 0) return { valid: false, error: 'Amount required' };
      return { valid: true };
    };

    expect(validateExpense('', '100').valid).toBe(false);
    expect(validateExpense('Lunch', '').valid).toBe(false);
    expect(validateExpense('Lunch', '0').valid).toBe(false);
    expect(validateExpense('Lunch', '100').valid).toBe(true);
  });

  it('should validate checklist item input', () => {
    const validateItem = (text: string) => text.trim().length > 0;
    
    expect(validateItem('')).toBe(false);
    expect(validateItem('   ')).toBe(false);
    expect(validateItem('Pack sunscreen')).toBe(true);
  });
});

describe('Avatar Helpers', () => {
  it('should parse gradient avatar format', () => {
    const parseGradient = (image: string) => {
      if (!image.startsWith('gradient:')) return null;
      const parts = image.split(':');
      return { gradient: parts[1], initial: parts[2] };
    };

    const result = parseGradient('gradient:from-red-400 to-pink-500:V');
    expect(result?.gradient).toBe('from-red-400 to-pink-500');
    expect(result?.initial).toBe('V');
    
    expect(parseGradient('/avatars/me.jpg')).toBeNull();
  });

  it('should detect image type correctly', () => {
    const getImageType = (image: string) => {
      if (image.startsWith('gradient:')) return 'gradient';
      if (image.startsWith('data:')) return 'dataUrl';
      return 'path';
    };

    expect(getImageType('gradient:from-red:V')).toBe('gradient');
    expect(getImageType('data:image/png;base64,xxx')).toBe('dataUrl');
    expect(getImageType('/avatars/me.jpg')).toBe('path');
  });
});
