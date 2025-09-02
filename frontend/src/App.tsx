import React, { useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { LanguageSelect } from './components/screens/LanguageSelect';
import { Signup } from './components/screens/Signup';
import { Login } from './components/screens/Login';
import { PetCreation } from './components/screens/PetCreation';
import { Home } from './components/screens/Home';
import { Scan } from './components/screens/Scan';
import { Processing } from './components/screens/Processing';
import { Results } from './components/screens/Results';
import { Chat } from './components/screens/Chat';
import { History } from './components/screens/History';
import { Pets } from './components/screens/Pets';
import { Comparison } from './components/screens/Comparison';
import { Settings } from './components/screens/Settings';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { currentScreen, isRTL } = useApp();

  // Remove mock pet initialization - pets are now loaded from API

  useEffect(() => {
    // Set document direction
    document.dir = isRTL ? 'rtl' : 'ltr';
    
    // Set document language
    document.documentElement.lang = isRTL ? 'fa' : 'en';
    
    // Add RTL class to body for additional styling if needed
    if (isRTL) {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [isRTL]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'language-select':
        return <LanguageSelect />;
      case 'signup':
        return <Signup />;
      case 'login':
        return <Login />;
      case 'pet-creation':
        return <PetCreation />;
      case 'home':
        return <Home />;
      case 'scan':
        return <Scan />;
      case 'processing':
        return <Processing />;
      case 'results':
        return <Results />;
      case 'chat':
        return <Chat />;
      case 'history':
        return <History />;
      case 'pets':
        return <Pets />;
      case 'comparison':
        return <Comparison />;
      case 'settings':
        return <Settings />;
      default:
        return <LanguageSelect />;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background font-sans antialiased">
        {renderScreen()}
      </div>
      <Toaster 
        position={isRTL ? "bottom-left" : "bottom-right"}
        dir={isRTL ? "rtl" : "ltr"}
      />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}