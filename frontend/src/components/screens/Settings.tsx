import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Heart, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  HelpCircle,
  LogOut,
  Star
} from 'lucide-react';
import { BottomNavigation } from '../common/BottomNavigation';

export const Settings: React.FC = () => {
  const { setCurrentScreen, currentPet, isRTL } = useApp();

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const settingSections = [
    {
      title: 'پروفایل',
      items: [
        {
          id: 'profile',
          label: 'اطلاعات حساب کاربری',
          icon: User,
          action: () => console.log('Profile settings')
        },
        {
          id: 'pets',
          label: 'مدیریت حیوانات خانگی',
          icon: Heart,
          action: () => setCurrentScreen('pets')
        }
      ]
    },
    {
      title: 'تنظیمات',
      items: [
        {
          id: 'notifications',
          label: 'اعلان‌ها و یادآوری‌ها',
          icon: Bell,
          hasSwitch: true,
          switchValue: true,
          action: (value: boolean) => console.log('Notifications:', value)
        },
        {
          id: 'allergens',
          label: 'فیلتر آلرژن‌ها',
          icon: Shield,
          action: () => console.log('Allergen filters')
        },
        {
          id: 'theme',
          label: 'تم و نمایش',
          icon: Palette,
          action: () => console.log('Theme settings')
        },
        {
          id: 'language',
          label: 'زبان',
          icon: Globe,
          value: 'فارسی',
          action: () => setCurrentScreen('language-select')
        }
      ]
    },
    {
      title: 'پشتیبانی',
      items: [
        {
          id: 'help',
          label: 'راهنما و پشتیبانی',
          icon: HelpCircle,
          action: () => console.log('Help & Support')
        },
        {
          id: 'rate',
          label: 'امتیاز به اپلیکیشن',
          icon: Star,
          action: () => console.log('Rate app')
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="p-2"
        >
          {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
        </Button>
        <h1 className="text-xl font-bold text-gray-900">تنظیمات</h1>
        <div className="w-9" />
      </div>

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="p-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Avatar className="w-16 h-16">
                <AvatarImage src="https://images.unsplash.com/photo-1546516484-647ab6d7e7f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwZG9nJTIwbWFzY290JTIwY2FydG9vbnxlbnwxfHx8fDE3NTY3MTM4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
                <AvatarFallback>کاربر</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">کاربر مهمان</h3>
                <p className="text-sm text-gray-600">feedmagix@example.com</p>
                {currentPet && (
                  <p className="text-xs text-[#F59E0B] mt-1">
                    حیوان فعال: {currentPet.name}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Premium Banner */}
          <Card className="p-4 bg-gradient-to-r from-orange-100 to-yellow-100 border-[#F59E0B]">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 rounded-full bg-[#F59E0B] flex items-center justify-center">
                <Star className="w-6 h-6 text-white fill-current" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">FeedMagix Premium</h3>
                <p className="text-sm text-gray-600">دسترسی نامحدود به همه امکانات</p>
              </div>
              <Button 
                className="bg-[#F59E0B] hover:bg-[#D97706]"
                size="sm"
              >
                ارتقا
              </Button>
            </div>
          </Card>

          {/* Settings Sections */}
          {settingSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="font-semibold text-gray-900">{section.title}</h3>
              <Card className="divide-y divide-gray-100">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={item.id}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => !item.hasSwitch && item.action && item.action()}
                    >
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <Icon className="w-5 h-5 text-gray-500" />
                        <div>
                          <span className="font-medium text-gray-900">{item.label}</span>
                          {item.value && (
                            <p className="text-sm text-gray-500">{item.value}</p>
                          )}
                        </div>
                      </div>
                      
                      {item.hasSwitch ? (
                        <Switch 
                          checked={item.switchValue}
                          onCheckedChange={(checked) => item.action && item.action(checked)}
                        />
                      ) : (
                        <ArrowLeft className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </Card>
            </div>
          ))}

          {/* App Info */}
          <Card className="p-4">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-gray-900">FeedMagix</h3>
              <p className="text-sm text-gray-600">نسخه ۱.۰.۰</p>
              <p className="text-xs text-gray-500">
                دستیار هوشمند تغذیه حیوانات خانگی
              </p>
            </div>
          </Card>

          {/* Logout */}
          <Card className="p-4">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                // Would handle logout
                console.log('Logout');
              }}
            >
              <LogOut className="w-5 h-5 ml-3" />
              خروج از حساب
            </Button>
          </Card>
        </div>
      </ScrollArea>

      <BottomNavigation />
    </div>
  );
};