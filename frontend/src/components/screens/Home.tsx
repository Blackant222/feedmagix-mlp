import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Camera, MessageCircle, Scan, ChevronDown, Settings } from 'lucide-react';
import { persian } from '../../constants/i18n';
import { BottomNavigation } from '../common/BottomNavigation';
import { FloatingActionButton } from '../common/FloatingActionButton';

export const Home: React.FC = () => {
  const { setCurrentScreen, currentPet, pets } = useApp();

  const handleScanClick = () => {
    setCurrentScreen('scan');
  };

  const handleChatClick = () => {
    setCurrentScreen('chat');
  };

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-6">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">ابتدا یک حیوان خانگی اضافه کنید</p>
          <Button onClick={() => setCurrentScreen('pet-creation')}>
            اضافه کردن حیوان خانگی
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12">
        <h1 className="text-xl font-bold text-gray-900">FeedMagix</h1>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setCurrentScreen('settings')}
          className="p-2"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Pet Selector */}
      <div className="px-6 mb-6">
        <Card 
          className="p-4 bg-white/80 backdrop-blur-sm cursor-pointer hover:bg-white/90 transition-colors"
          onClick={() => setCurrentScreen('pets')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Avatar className="w-12 h-12">
                <AvatarImage src={currentPet.avatarUrl} alt={currentPet.name} />
                <AvatarFallback>{currentPet.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-gray-900">{currentPet.name}</h2>
                <p className="text-sm text-gray-600">
                  {currentPet.species === 'cat' ? 'گربه' : 'سگ'} • {currentPet.breed}
                </p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Main Scan Button */}
      <div className="flex-1 flex items-center justify-center px-6 -mt-6">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              سلام! آماده تحلیل غذای {currentPet.name} هستم 🐾
            </h1>
            <p className="text-gray-600">
              بسته‌بندی غذای حیوان خانگی خود را اسکن کنید تا تحلیل مفصل دریافت کنید
            </p>
          </div>

          <Button
            onClick={handleScanClick}
            className="w-48 h-48 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-2xl hover:scale-105 transition-all duration-300"
            size="lg"
          >
            <div className="flex flex-col items-center space-y-4">
              <Camera className="w-16 h-16" />
              <span className="text-xl font-bold">{persian.scanNow}</span>
            </div>
          </Button>

          <div className="flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1546516484-647ab6d7e7f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwZG9nJTIwbWFzY290JTIwY2FydG9vbnxlbnwxfHx8fDE3NTY3MTM4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Mascot"
              className="w-20 h-20 rounded-full object-cover animate-bounce"
            />
          </div>
        </div>
      </div>

      <BottomNavigation />
      <FloatingActionButton onClick={handleChatClick} />
    </div>
  );
};