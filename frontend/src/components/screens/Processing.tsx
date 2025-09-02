import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { persian } from '../../constants/i18n';
import { scanService } from '../../services';

export const Processing: React.FC = () => {
  const { setCurrentScreen, setCurrentProduct, currentPet, addScanResult, setError } = useApp();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  
  const steps = [
    'تشخیص تصویر...',
    'شناسایی محصول...',
    'دریافت اطلاعات...',
    'تحلیل تغذیه‌ای...',
    'آماده‌سازی نتایج...'
  ];

  useEffect(() => {
    const performAnalysis = async () => {
      if (!currentPet) {
        setError('هیچ حیوانی انتخاب نشده است');
        setCurrentScreen('pets');
        return;
      }

      try {
        // Get scan image URL from session/state (this would typically be passed from scan screen)
        const scanImageUrl = sessionStorage.getItem('scanImageUrl');
        if (!scanImageUrl) {
          throw new Error('تصویر اسکن یافت نشد');
        }

        // Start progress animation
        const progressTimer = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + Math.random() * 10 + 2;
            const stepIndex = Math.floor((newProgress / 100) * steps.length);
            setCurrentStep(Math.min(stepIndex, steps.length - 1));
            return Math.min(newProgress, 95); // Cap at 95% until API response
          });
        }, 500);

        // Perform actual analysis
        const result = await scanService.analyzeImage(scanImageUrl, currentPet.id);
        
        // Complete progress
        setProgress(100);
        clearInterval(progressTimer);
        
        // Set results and navigate
        setCurrentProduct(result.product);
        addScanResult(result.analysis);
        
        // Small delay for UX
        setTimeout(() => {
          setCurrentScreen('results');
        }, 500);
        
      } catch (error) {
        console.error('Analysis failed:', error);
        setError('تحلیل ناموفق بود. لطفا دوباره تلاش کنید.');
        setCurrentScreen('scan');
      } finally {
        setIsProcessing(false);
      }
    };

    if (isProcessing) {
      performAnalysis();
    }
  }, [currentPet, setCurrentScreen, setCurrentProduct, addScanResult, setError, isProcessing]);

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