import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Scan, Heart, BarChart3, MessageCircle } from 'lucide-react';
import { persian } from '../../constants/i18n';

export const BottomNavigation: React.FC = () => {
  const { currentScreen, setCurrentScreen } = useApp();

  const navItems = [
    { 
      id: 'scan', 
      label: persian.scan, 
      icon: Scan, 
      screen: 'home' as const 
    },
    { 
      id: 'pets', 
      label: persian.pets, 
      icon: Heart, 
      screen: 'pets' as const 
    },
    { 
      id: 'analyses', 
      label: persian.analyses, 
      icon: BarChart3, 
      screen: 'history' as const 
    },
    { 
      id: 'chat', 
      label: persian.chat, 
      icon: MessageCircle, 
      screen: 'chat' as const 
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.screen || 
            (item.screen === 'home' && ['scan', 'processing', 'results'].includes(currentScreen));
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setCurrentScreen(item.screen)}
              className={`flex flex-col items-center space-y-1 p-4 min-h-16 ${
                isActive 
                  ? 'text-[#F59E0B]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};