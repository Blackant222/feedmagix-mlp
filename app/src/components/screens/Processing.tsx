import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { persian, mockProducts } from '../../data/mockData';

export const Processing: React.FC = () => {
  const { setCurrentScreen, setCurrentProduct, currentPet } = useApp();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    'تشخیص تصویر...',
    'شناسایی محصول...',
    'دریافت اطلاعات...',
    'تحلیل تغذیه‌ای...',
    'آماده‌سازی نتایج...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Set a mock product and navigate to results
          setCurrentProduct(mockProducts[0]);
          setCurrentScreen('results');
          return prev;
        }
        
        const newProgress = prev + Math.random() * 15 + 5;
        const stepIndex = Math.floor((newProgress / 100) * steps.length);
        setCurrentStep(Math.min(stepIndex, steps.length - 1));
        
        return Math.min(newProgress, 100);
      });
    }, 800);

    return () => clearInterval(timer);
  }, [setCurrentScreen, setCurrentProduct]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-sm p-8 text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <img 
              src="https://images.unsplash.com/photo-1546516484-647ab6d7e7f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwZG9nJTIwbWFzY290JTIwY2FydG9vbnxlbnwxfHx8fDE3NTY3MTM4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Processing"
              className="w-20 h-20 rounded-full object-cover animate-spin"
              style={{ animationDuration: '3s' }}
            />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {persian.processing}
          </h2>
          
          <p className="text-gray-600">
            در حال تحلیل غذای {currentPet?.name}
          </p>
        </div>

        <div className="space-y-4">
          <Progress value={progress} className="w-full h-2" />
          
          <div className="text-sm text-gray-600 min-h-6">
            {steps[currentStep]}
          </div>
          
          <div className="text-xs text-gray-500">
            {Math.round(progress)}% تکمیل شده
          </div>
        </div>

        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center justify-center space-x-2 space-x-reverse">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-[#F59E0B] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
          <p>هوش مصنوعی در حال تحلیل...</p>
        </div>
      </Card>
    </div>
  );
};