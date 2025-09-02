import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const LanguageSelect: React.FC = () => {
  const { setCurrentScreen, setIsRTL } = useApp();

  const handleLanguageSelect = (language: string) => {
    if (language === 'fa') {
      setIsRTL(true);
      document.dir = 'rtl';
    } else {
      setIsRTL(false);
      document.dir = 'ltr';
    }
    setCurrentScreen('signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-sm p-8 text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">FeedMagix</h1>
          <p className="text-gray-600">دستیار تغذیه حیوان خانگی شما</p>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">انتخاب زبان</h2>
          <Select onValueChange={handleLanguageSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="زبان خود را انتخاب کنید" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fa">فارسی</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center justify-center">
          <img 
            src="https://images.unsplash.com/photo-1546516484-647ab6d7e7f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwZG9nJTIwbWFzY290JTIwY2FydG9vbnxlbnwxfHx8fDE3NTY3MTM4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Mascot"
            className="w-16 h-16 rounded-full object-cover"
          />
        </div>
      </Card>
    </div>
  );
};