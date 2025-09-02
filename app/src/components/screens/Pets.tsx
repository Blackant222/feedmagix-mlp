import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { ArrowLeft, ArrowRight, Plus, Edit2, Crown, Heart } from 'lucide-react';
import { persian } from '../../data/mockData';
import { BottomNavigation } from '../common/BottomNavigation';

export const Pets: React.FC = () => {
  const { 
    setCurrentScreen, 
    pets, 
    currentPet,
    setCurrentPet,
    isRTL 
  } = useApp();

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const handleAddPet = () => {
    setCurrentScreen('pet-creation');
  };

  const handleSelectPet = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    if (pet) {
      setCurrentPet(pet);
      setCurrentScreen('home');
    }
  };

  const getAgeText = (age: number) => {
    if (age === 1) return '۱ ساله';
    if (age < 10) return `${age} ساله`;
    return `${age} ساله`;
  };

  const getActivityLevelText = (level: string) => {
    switch (level) {
      case 'low': return 'کم';
      case 'moderate': return 'متوسط';
      case 'high': return 'زیاد';
      default: return 'متوسط';
    }
  };

  const getActivityLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'moderate': return 'bg-green-100 text-green-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        <h1 className="text-xl font-bold text-gray-900">حیوانات خانگی</h1>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleAddPet}
          className="p-2"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Add Pet Card */}
      <div className="px-6 mb-6">
        <Card 
          className="p-6 border-dashed border-2 border-[#F59E0B] bg-orange-50/50 cursor-pointer hover:bg-orange-50 transition-colors"
          onClick={handleAddPet}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#F59E0B] flex items-center justify-center">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">اضافه کردن حیوان خانگی جدید</h3>
              <p className="text-sm text-gray-600">پروفایل حیوان خانگی جدیدی ایجاد کنید</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pets List */}
      <div className="px-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          حیوانات خانگی شما ({pets.length})
        </h2>
        
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {pets.map((pet) => (
              <Card 
                key={pet.id} 
                className={`p-4 cursor-pointer hover:shadow-md transition-all ${
                  currentPet?.id === pet.id 
                    ? 'ring-2 ring-[#F59E0B] bg-orange-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSelectPet(pet.id)}
              >
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={pet.avatarUrl} alt={pet.name} />
                      <AvatarFallback className="text-lg">
                        {pet.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {currentPet?.id === pet.id && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#F59E0B] rounded-full flex items-center justify-center">
                        <Crown className="w-3 h-3 text-white fill-current" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center">
                          {pet.name}
                          {currentPet?.id === pet.id && (
                            <Badge className="mr-2 bg-[#F59E0B] hover:bg-[#D97706]">
                              فعال
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {pet.species === 'cat' ? '🐱 گربه' : '🐶 سگ'} • {pet.breed}
                        </p>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Would navigate to edit pet
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {getAgeText(pet.age)}
                      </Badge>
                      <Badge variant="outline">
                        {pet.weight} کیلوگرم
                      </Badge>
                      <Badge className={getActivityLevelColor(pet.activityLevel)}>
                        فعالیت {getActivityLevelText(pet.activityLevel)}
                      </Badge>
                    </div>
                    
                    {pet.healthConditions && pet.healthConditions.length > 0 && (
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-600">
                          {pet.healthConditions.join('، ')}
                        </span>
                      </div>
                    )}
                    
                    {pet.dietaryRestrictions && pet.dietaryRestrictions.length > 0 && (
                      <div className="text-xs text-gray-500">
                        محدودیت غذایی: {pet.dietaryRestrictions.join('، ')}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            
            {pets.length === 0 && (
              <Card className="p-8 text-center">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">هیچ حیوان خانگی‌ای اضافه نشده</h3>
                <p className="text-gray-600 mb-4">
                  اولین حیوان خانگی خود را اضافه کنید تا شروع کنیم
                </p>
                <Button 
                  onClick={handleAddPet}
                  className="bg-[#F59E0B] hover:bg-[#D97706]"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  اضافه کردن حیوان خانگی
                </Button>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      <BottomNavigation />
    </div>
  );
};