import React, { useRef, useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { ArrowLeft, ArrowRight, Camera, Image, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const Scan: React.FC = () => {
  const { setCurrentScreen, isRTL } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('UNSUPPORTED');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
      setHasPermission(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setIsLoading(false);
      setHasPermission(false);
      
      // Set specific error messages based on error type
      if (err instanceof Error) {
        switch (err.name) {
          case 'NotAllowedError':
            setErrorMessage('دسترسی به دوربین توسط کاربر رد شده است');
            break;
          case 'NotFoundError':
            setErrorMessage('دوربین پیدا نشد');
            break;
          case 'NotReadableError':
            setErrorMessage('دوربین توسط برنامه دیگری استفاده می‌شود');
            break;
          case 'OverconstrainedError':
            setErrorMessage('تنظیمات دوربین پشتیبانی نمی‌شود');
            break;
          case 'SecurityError':
            setErrorMessage('دسترسی امن به دوربین امکان‌پذیر نیست');
            break;
          default:
            if (err.message === 'UNSUPPORTED') {
              setErrorMessage('مرورگر شما از دوربین پشتیبانی نمی‌کند');
            } else {
              setErrorMessage('خطای ناشناخته در دسترسی به دوربین');
            }
        }
      }
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        // Stop camera
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        // Navigate to processing screen
        setCurrentScreen('processing');
      }
    }
  };

  const handleBack = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setCurrentScreen('home');
  };

  const handleGalleryImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Stop camera if it's running
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      toast.success('تصویر با موفقیت انتخاب شد');
      // Navigate to processing screen with the selected image
      setCurrentScreen('processing');
    } else if (file) {
      toast.error('لطفاً یک فایل تصویری انتخاب کنید');
    }
  };

  // Loading state
  if (hasPermission === null && isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-[#F59E0B] border-t-transparent rounded-full mx-auto" />
          <h3 className="text-lg font-semibold">راه‌اندازی دوربین...</h3>
          <p className="text-gray-400 text-sm">لطفاً دسترسی به دوربین را تایید کنید</p>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-6">
        <div className="max-w-sm w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="p-2 text-white hover:bg-white/10"
            >
              {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </Button>
            <h1 className="text-white text-lg font-semibold">اسکن بسته‌بندی</h1>
            <div className="w-9" />
          </div>

          {/* Error Content */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <X className="w-10 h-10 text-red-400" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">دسترسی به دوربین مسدود است</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  برای اسکن بسته‌بندی غذای حیوان خانگی‌تان، نیاز به دسترسی به دوربین داریم
                </p>
                {errorMessage && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-3">
                    <p className="text-red-300 text-sm font-medium">{errorMessage}</p>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-right">
                <h4 className="font-semibold text-orange-300 mb-3">راهنمای فعال‌سازی دوربین:</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold mt-0.5">۱.</span>
                    <span>روی آیکون قفل یا دوربین در نوار آدرس مرورگر کلیک کنید</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold mt-0.5">۲.</span>
                    <span>گزینه "اجازه دادن" یا "Allow" را برای دوربین انتخاب کنید</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold mt-0.5">۳.</span>
                    <span>صفحه را مجدد بارگذاری کنید و دوباره تلاش کنید</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button 
                  onClick={startCamera} 
                  disabled={isLoading}
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white py-3 rounded-xl font-medium disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full ml-2" />
                  ) : (
                    <Camera className="w-5 h-5 ml-2" />
                  )}
                  {isLoading ? 'در حال تلاش...' : 'تلاش مجدد برای دسترسی'}
                </Button>
                
                <Button 
                  onClick={handleGalleryImport}
                  variant="outline" 
                  className="w-full border-white/20 text-white hover:bg-white/10 py-3 rounded-xl font-medium"
                >
                  <Image className="w-5 h-5 ml-2" />
                  انتخاب از گالری تصاویر
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={handleBack} 
                  className="w-full text-gray-400 hover:text-white hover:bg-white/5 py-3 rounded-xl"
                >
                  بازگشت به صفحه اصلی
                </Button>
              </div>

              {/* Additional Help */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400 text-center">
                  اگر همچنان مشکل دارید، مرورگر را بسته و مجدد باز کنید
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Camera Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-6 text-white">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="p-2 bg-black/30 hover:bg-black/50 text-white"
          >
            {isRTL ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
          </Button>
          
          <div className="text-center">
            <h2 className="font-semibold">اسکن بسته‌بندی</h2>
            <p className="text-sm text-gray-300">بسته‌بندی را در مرکز قرار دهید</p>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGalleryImport}
            className="p-2 bg-black/30 hover:bg-black/50 text-white"
          >
            <Image className="w-6 h-6" />
          </Button>
        </div>

        {/* Center Focus Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="relative">
            <div className="w-64 h-64 border-2 border-[#F59E0B] rounded-2xl bg-transparent relative">
              {/* Corner indicators */}
              <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-[#F59E0B] rounded-tl-2xl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-[#F59E0B] rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-[#F59E0B] rounded-bl-2xl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-[#F59E0B] rounded-br-2xl"></div>
              
              {/* Center crosshair */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-0.5 bg-[#F59E0B] absolute"></div>
                <div className="h-8 w-0.5 bg-[#F59E0B] absolute"></div>
              </div>
            </div>
            
            <p className="text-white text-center mt-4">
              بسته‌بندی غذا را در این قاب قرار دهید
            </p>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="p-6 pb-12">
          <div className="flex items-center justify-center">
            <Button
              onClick={handleCapture}
              className="w-20 h-20 rounded-full bg-[#F59E0B] hover:bg-[#D97706] border-4 border-white shadow-2xl hover:scale-105 transition-all duration-300"
              disabled={!hasPermission}
            >
              <Camera className="w-8 h-8 text-white" />
            </Button>
          </div>
          
          <p className="text-white text-center mt-4 text-sm">
            دکمه را فشار دهید یا ضربه بزنید
          </p>
        </div>
      </div>
    </div>
  );
};