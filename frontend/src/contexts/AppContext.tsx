import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Pet, User, ScanResult, ChatSession, AppScreen, FoodProduct } from '../types';
import { petService, authService, scanService } from '../services';

interface AppContextType {
  // App state
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  isRTL: boolean;
  setIsRTL: (rtl: boolean) => void;
  
  // Loading states
  isLoading: boolean;
  isLoadingPets: boolean;
  isLoadingScan: boolean;
  
  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Pet state
  pets: Pet[];
  currentPet: Pet | null;
  addPet: (pet: Omit<Pet, 'id'>) => Promise<Pet>;
  updatePet: (pet: Pet) => Promise<void>;
  deletePet: (petId: string) => Promise<void>;
  setCurrentPet: (pet: Pet) => void;
  loadUserPets: () => Promise<void>;
  
  // Scan state
  scanHistory: ScanResult[];
  addScanResult: (result: ScanResult) => void;
  currentProduct: FoodProduct | null;
  setCurrentProduct: (product: FoodProduct | null) => void;
  loadScanHistory: (petId?: string) => Promise<void>;
  
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
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [isLoadingScan, setIsLoadingScan] = useState(false);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  
  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // Handle API errors
  const handleApiError = (err: any, fallbackMessage: string) => {
    console.error('API Error:', err);
    const message = err.response?.data?.message || err.message || fallbackMessage;
    setError(message);
  };
  
  // Load user pets when user changes
  useEffect(() => {
    if (user) {
      loadUserPets();
    } else {
      setPets([]);
      setCurrentPetState(null);
    }
  }, [user]);

  const loadUserPets = async () => {
    if (!user) return;
    
    try {
      setIsLoadingPets(true);
      const userPets = await petService.getUserPets();
      setPets(userPets);
      if (userPets.length > 0 && !currentPet) {
        setCurrentPetState(userPets[0]);
      }
    } catch (error) {
      handleApiError(error, 'Failed to load pets');
    } finally {
      setIsLoadingPets(false);
    }
  };

  const addPet = async (petData: Omit<Pet, 'id'>): Promise<Pet> => {
    try {
      const newPet = await petService.createPet(petData);
      setPets(prev => [...prev, newPet]);
      if (!currentPet) {
        setCurrentPetState(newPet);
      }
      return newPet;
    } catch (error) {
      handleApiError(error, 'Failed to create pet');
      throw error;
    }
  };

  const updatePet = async (pet: Pet): Promise<void> => {
    try {
      const updatedPet = await petService.updatePet(pet.id, pet);
      setPets(prev => prev.map(p => p.id === pet.id ? updatedPet : p));
      if (currentPet?.id === pet.id) {
        setCurrentPetState(updatedPet);
      }
    } catch (error) {
      handleApiError(error, 'Failed to update pet');
      throw error;
    }
  };
  
  const deletePet = async (petId: string): Promise<void> => {
    try {
      await petService.deletePet(petId);
      setPets(prev => prev.filter(p => p.id !== petId));
      if (currentPet?.id === petId) {
        const remainingPets = pets.filter(p => p.id !== petId);
        setCurrentPetState(remainingPets.length > 0 ? remainingPets[0] : null);
      }
    } catch (error) {
      handleApiError(error, 'Failed to delete pet');
      throw error;
    }
  };

  const setCurrentPet = (pet: Pet) => {
    setCurrentPetState(pet);
  };

  const loadScanHistory = async (petId?: string): Promise<void> => {
    try {
      setIsLoadingScan(true);
      const history = await scanService.getScanHistory(petId);
      setScanHistory(history);
    } catch (error) {
      handleApiError(error, 'Failed to load scan history');
    } finally {
      setIsLoadingScan(false);
    }
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
      isLoading,
      isLoadingPets,
      isLoadingScan,
      error,
      setError,
      user,
      setUser,
      pets,
      currentPet,
      addPet,
      updatePet,
      deletePet,
      setCurrentPet,
      loadUserPets,
      scanHistory,
      addScanResult,
      loadScanHistory,
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