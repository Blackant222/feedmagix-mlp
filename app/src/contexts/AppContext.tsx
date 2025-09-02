import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Pet, User, ScanResult, ChatSession, AppScreen, FoodProduct } from '../types';

interface AppContextType {
  // App state
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  isRTL: boolean;
  setIsRTL: (rtl: boolean) => void;
  
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Pet state
  pets: Pet[];
  currentPet: Pet | null;
  addPet: (pet: Pet) => void;
  updatePet: (pet: Pet) => void;
  setCurrentPet: (pet: Pet) => void;
  
  // Scan state
  scanHistory: ScanResult[];
  addScanResult: (result: ScanResult) => void;
  currentProduct: FoodProduct | null;
  setCurrentProduct: (product: FoodProduct | null) => void;
  
  // Chat state
  chatSessions: ChatSession[];
  currentChatSession: ChatSession | null;
  addChatSession: (session: ChatSession) => void;
  updateChatSession: (session: ChatSession) => void;
  setCurrentChatSession: (session: ChatSession | null) => void;
  
  // Comparison state
  comparisonProducts: FoodProduct[];
  addToComparison: (product: FoodProduct) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('language-select');
  const [isRTL, setIsRTL] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentPet, setCurrentPetState] = useState<Pet | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [currentProduct, setCurrentProduct] = useState<FoodProduct | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatSession, setCurrentChatSession] = useState<ChatSession | null>(null);
  const [comparisonProducts, setComparisonProducts] = useState<FoodProduct[]>([]);

  const addPet = (pet: Pet) => {
    setPets(prev => [...prev, pet]);
    if (!currentPet) {
      setCurrentPetState(pet);
    }
  };

  const updatePet = (pet: Pet) => {
    setPets(prev => prev.map(p => p.id === pet.id ? pet : p));
    if (currentPet?.id === pet.id) {
      setCurrentPetState(pet);
    }
  };

  const setCurrentPet = (pet: Pet) => {
    setCurrentPetState(pet);
  };

  const addScanResult = (result: ScanResult) => {
    setScanHistory(prev => [result, ...prev]);
  };

  const addChatSession = (session: ChatSession) => {
    setChatSessions(prev => [session, ...prev]);
  };

  const updateChatSession = (session: ChatSession) => {
    setChatSessions(prev => prev.map(s => s.id === session.id ? session : s));
  };

  const addToComparison = (product: FoodProduct) => {
    if (comparisonProducts.length < 5 && !comparisonProducts.find(p => p.id === product.id)) {
      setComparisonProducts(prev => [...prev, product]);
    }
  };

  const removeFromComparison = (productId: string) => {
    setComparisonProducts(prev => prev.filter(p => p.id !== productId));
  };

  const clearComparison = () => {
    setComparisonProducts([]);
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      isRTL,
      setIsRTL,
      user,
      setUser,
      pets,
      currentPet,
      addPet,
      updatePet,
      setCurrentPet,
      scanHistory,
      addScanResult,
      currentProduct,
      setCurrentProduct,
      chatSessions,
      currentChatSession,
      addChatSession,
      updateChatSession,
      setCurrentChatSession,
      comparisonProducts,
      addToComparison,
      removeFromComparison,
      clearComparison
    }}>
      {children}
    </AppContext.Provider>
  );
};