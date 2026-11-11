// Data types
export interface UserProfile {
  walletAddress: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  university?: string;
  createdAt: string;
  isProfileComplete: boolean;
}

export interface LostItemReport {
  id: string;
  category: string;
  subcategory: string;
  itemType: string;
  brand: string;
  color: string;
  distinctFeatures: string;
  location: string;
  dateLost: string;
  rewardAmount: string;
  status: 'pending' | 'matched' | 'confirmed';
  timestamp: string;
  userAddress?: string;
  txHash?: string;
  contractReportId?: number;
}

export interface FoundItemReport {
  id: string;
  category: string;
  subcategory: string;
  itemType: string;
  brand: string;
  color: string;
  distinctFeatures: string;
  locationFound: string;
  dateFound: string;
  currentLocation: string;
  finderNotes?: string;
  status: 'pending' | 'matched' | 'confirmed';
  timestamp: string;
  reward?: string;
  userAddress?: string;
  txHash?: string;
  contractReportId?: number;
}

export interface Activity {
  id: string;
  type: 'match' | 'report' | 'confirmation' | 'reward';
  message: string;
  timestamp: string;
  txHash?: string;
}

export interface Match {
  id: string;
  itemName: string;
  matchDate: string;
  status: 'pending_confirmation' | 'confirmed';
  reward: string;
  otherParty: string;
  lostReportId?: string;
  foundReportId?: string;
  txHash?: string;
  contractMatchId?: number;
}

// Local storage keys - now user-specific
const getUserKey = (baseKey: string, userAddress?: string): string => {
  if (!userAddress) return baseKey; // Fallback for no user
  return `${baseKey}_${userAddress.toLowerCase()}`;
};

const LOST_ITEMS_KEY = 'lostchain_lost_items';
const FOUND_ITEMS_KEY = 'lostchain_found_items';
const ACTIVITY_KEY = 'lostchain_activity';
const MATCHES_KEY = 'lostchain_matches';
const USER_PROFILES_KEY = 'lostchain_user_profiles';

// Helper functions
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const setToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
};

// Check if two items match by category, itemType, brand and color
export const itemsMatch = (lost: LostItemReport, found: FoundItemReport): boolean => {
  if (lost.status === 'confirmed' || found.status === 'confirmed') return false;
  const norm = (s?: string) => (s || '').trim().toLowerCase();
  const catMatch = norm(lost.category) === norm(found.category);
  const typeMatch = norm(lost.itemType) === norm(found.itemType);
  const brandMatch = norm(lost.brand) === norm(found.brand);
  const colorMatch = !lost.color || !found.color || norm(lost.color) === norm(found.color);
  return catMatch && typeMatch && brandMatch && colorMatch;
};

// Lost Items
export const getLostItems = (userAddress?: string): LostItemReport[] => {
  const key = getUserKey(LOST_ITEMS_KEY, userAddress);
  return getFromStorage<LostItemReport[]>(key, []);
};

export const addLostItem = (report: Omit<LostItemReport, 'id' | 'timestamp' | 'status'>, userAddress?: string): LostItemReport => {
  const key = getUserKey(LOST_ITEMS_KEY, userAddress);
  const items = getLostItems(userAddress);
  const newReport: LostItemReport = {
    ...report,
    id: `lost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    status: 'pending',
    userAddress: userAddress,
  };
  items.push(newReport);
  setToStorage(key, items);
  
  // Add activity
  addActivity({
    type: 'report',
    message: `Reported lost item: ${report.itemType} (${report.brand})`,
    txHash: report.txHash,
  }, userAddress);
  
  return newReport;
};

export const updateLostItem = (id: string, updates: Partial<LostItemReport>, userAddress?: string): void => {
  const key = getUserKey(LOST_ITEMS_KEY, userAddress);
  const items = getLostItems(userAddress);
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    setToStorage(key, items);
  }
};

// Found Items
export const getFoundItems = (userAddress?: string): FoundItemReport[] => {
  const key = getUserKey(FOUND_ITEMS_KEY, userAddress);
  return getFromStorage<FoundItemReport[]>(key, []);
};

export const addFoundItem = (report: Omit<FoundItemReport, 'id' | 'timestamp' | 'status'>, userAddress?: string): FoundItemReport => {
  const key = getUserKey(FOUND_ITEMS_KEY, userAddress);
  const items = getFoundItems(userAddress);
  const newReport: FoundItemReport = {
    ...report,
    id: `found_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    status: 'pending',
    userAddress: userAddress,
  };
  items.push(newReport);
  setToStorage(key, items);
  
  // Add activity
  addActivity({
    type: 'report',
    message: `Reported found item: ${report.itemType} (${report.brand})`,
    txHash: report.txHash,
  }, userAddress);
  
  return newReport;
};

export const updateFoundItem = (id: string, updates: Partial<FoundItemReport>, userAddress?: string): void => {
  const key = getUserKey(FOUND_ITEMS_KEY, userAddress);
  const items = getFoundItems(userAddress);
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    setToStorage(key, items);
  }
};

// Activity
export const getActivity = (userAddress?: string): Activity[] => {
  const key = getUserKey(ACTIVITY_KEY, userAddress);
  return getFromStorage<Activity[]>(key, []);
};

export const addActivity = (activity: Omit<Activity, 'id' | 'timestamp'>, userAddress?: string): Activity => {
  const key = getUserKey(ACTIVITY_KEY, userAddress);
  const activities = getActivity(userAddress);
  const newActivity: Activity = {
    ...activity,
    id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toLocaleString(),
  };
  activities.unshift(newActivity);
  if (activities.length > 50) {
    activities.splice(50);
  }
  setToStorage(key, activities);
  return newActivity;
};

// Matches
export const getMatches = (userAddress?: string): Match[] => {
  const key = getUserKey(MATCHES_KEY, userAddress);
  let matches = getFromStorage<Match[]>(key, []);
  
  // Auto-detect matches between lost and found items
  const lostItems = getLostItems(userAddress);
  const foundItems = getFoundItems(userAddress);
  
  let newMatchFound = false;
  for (const lost of lostItems) {
    for (const found of foundItems) {
      const alreadyMatched = matches.some(m => m.lostReportId === lost.id || m.foundReportId === found.id);
      if (!alreadyMatched && itemsMatch(lost, found)) {
        const newMatch: Match = {
          id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          itemName: `${lost.itemType} - ${lost.brand}`,
          matchDate: new Date().toLocaleDateString(),
          status: 'pending_confirmation',
          reward: lost.rewardAmount || '0.001',
          otherParty: found.userAddress ? `${found.userAddress.slice(0, 6)}...${found.userAddress.slice(-4)}` : 'Finder (Campus Student)',
          lostReportId: lost.id,
          foundReportId: found.id,
          contractMatchId: 1,
        };
        matches.push(newMatch);
        newMatchFound = true;
        lost.status = 'matched';
        found.status = 'matched';
      }
    }
  }
  
  if (newMatchFound) {
    setToStorage(key, matches);
    setToStorage(getUserKey(LOST_ITEMS_KEY, userAddress), lostItems);
    setToStorage(getUserKey(FOUND_ITEMS_KEY, userAddress), foundItems);
  }
  
  return matches;
};

export const addMatch = (match: Omit<Match, 'id'>, userAddress?: string): Match => {
  const key = getUserKey(MATCHES_KEY, userAddress);
  const matches = getMatches(userAddress);
  const newMatch: Match = {
    ...match,
    id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  matches.push(newMatch);
  setToStorage(key, matches);
  
  addActivity({
    type: 'match',
    message: `Match found for ${match.itemName}`,
    txHash: match.txHash,
  }, userAddress);
  
  return newMatch;
};

export const updateMatch = (id: string, updates: Partial<Match>, userAddress?: string): void => {
  const key = getUserKey(MATCHES_KEY, userAddress);
  const matches = getMatches(userAddress);
  const index = matches.findIndex(match => match.id === id);
  if (index !== -1) {
    matches[index] = { ...matches[index], ...updates };
    setToStorage(key, matches);
  }
};

// Statistics
export const getStats = (userAddress?: string) => {
  const lostItems = getLostItems(userAddress);
  const foundItems = getFoundItems(userAddress);
  const matches = getMatches(userAddress);
  
  const rewardsEarned = foundItems
    .filter(item => item.reward && item.status === 'confirmed')
    .reduce((sum, item) => sum + parseFloat(item.reward || '0'), 0);
  
  const rewardsPaid = lostItems
    .filter(item => item.status === 'confirmed')
    .reduce((sum, item) => sum + parseFloat(item.rewardAmount || '0'), 0);
  
  return {
    itemsFound: foundItems.length,
    itemsLost: lostItems.length,
    activeMatches: matches.filter(m => m.status === 'pending_confirmation').length,
    rewardsEarned: rewardsEarned.toFixed(3),
    rewardsPaid: rewardsPaid.toFixed(3),
  };
};

// User Profile Management
export const getUserProfile = (walletAddress: string): UserProfile | null => {
  const profiles = getFromStorage<Record<string, UserProfile>>(USER_PROFILES_KEY, {});
  return profiles[walletAddress.toLowerCase()] || null;
};

export const createUserProfile = (profile: Omit<UserProfile, 'createdAt' | 'isProfileComplete'>): UserProfile => {
  const profiles = getFromStorage<Record<string, UserProfile>>(USER_PROFILES_KEY, {});
  const newProfile: UserProfile = {
    ...profile,
    walletAddress: profile.walletAddress.toLowerCase(),
    createdAt: new Date().toISOString(),
    isProfileComplete: true,
  };
  profiles[newProfile.walletAddress] = newProfile;
  setToStorage(USER_PROFILES_KEY, profiles);
  return newProfile;
};

export const updateUserProfile = (walletAddress: string, updates: Partial<UserProfile>): UserProfile | null => {
  const profiles = getFromStorage<Record<string, UserProfile>>(USER_PROFILES_KEY, {});
  const address = walletAddress.toLowerCase();
  if (profiles[address]) {
    profiles[address] = { ...profiles[address], ...updates };
    setToStorage(USER_PROFILES_KEY, profiles);
    return profiles[address];
  }
  return null;
};

export const isProfileComplete = (walletAddress: string): boolean => {
  const profile = getUserProfile(walletAddress);
  return profile?.isProfileComplete || false;
};

// Clear all data (for testing)
export const clearAllData = (userAddress?: string): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(getUserKey(LOST_ITEMS_KEY, userAddress));
  window.localStorage.removeItem(getUserKey(FOUND_ITEMS_KEY, userAddress));
  window.localStorage.removeItem(getUserKey(ACTIVITY_KEY, userAddress));
  window.localStorage.removeItem(getUserKey(MATCHES_KEY, userAddress));
};
