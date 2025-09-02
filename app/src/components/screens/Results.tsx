import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { ArrowLeft, ArrowRight, Save, BarChart3, MessageCircle, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import { persian } from '../../data/mockData';
import { ScanResult } from '../../types';

export const Results: React.FC = () => {
  const { 
    setCurrentScreen, 
    currentProduct, 
    currentPet, 
    addScanResult, 
    addToComparison,
    isRTL 
  } = useApp();

  if (!currentProduct || !currentPet) {
    setCurrentScreen('home');
    return null;
  }

  // Mock analysis results
  const compatibilityScore = 78;
  const verdict = "انتخاب مناسب";
  const goodIngredients = ["گوشت مرغ", "روغن ماهی", "ویتامین E"];
  const badIngredients = ["رنگ مصنوعی"];
  const recommendations = [
    "مناسب برای گربه‌های بالغ",
    "حاوی پروتئین کافی",
    "غنی از اسیدهای چرب امگا ۳"
  ];
  const warnings = ["حاوی رنگ مصنوعی"];

  const handleSave = () => {
    const scanResult: ScanResult = {
      id: Date.now().toString(),
      petId: currentPet.id,
      productId: currentProduct.id,
      scanImageUrl: currentProduct.imageUrl,
      compatibilityScore,
      recommendations,
      warnings,
      verdict,
      goodIngredients,
      badIngredients,
      scannedAt: new Date().toISOString()
    };
    
    addScanResult(scanResult);
    setCurrentScreen('home');
  };

  const handleCompare = () => {
    addToComparison(currentProduct);
    setCurrentScreen('comparison');
  };

  const handleChat = () => {
    setCurrentScreen('chat');
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-white" />;
    if (score >= 60) return <Star className="w-5 h-5 text-white" />;
    return <AlertTriangle className="w-5 h-5 text-white" />;
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
        <h1 className="text-xl font-bold text-gray-900">نتایج تحلیل</h1>
        <div className="w-9" />
      </div>

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-6">
          {/* Product Header */}
          <Card className="p-4">
            <div className="flex items-start space-x-4 space-x-reverse">
              <img
                src={currentProduct.imageUrl}
                alt={currentProduct.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900">{currentProduct.name}</h2>
                <p className="text-sm text-gray-600">{currentProduct.brand}</p>
                <p className="text-xs text-gray-500 mt-1">{currentProduct.category}</p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full ${getScoreColor(compatibilityScore)} flex items-center justify-center`}>
                  {getScoreIcon(compatibilityScore)}
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{compatibilityScore}</div>
                <div className="text-xs text-gray-600">از ۱۰۰</div>
              </div>
            </div>
          </Card>

          {/* Mascot Message */}
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-start space-x-3 space-x-reverse">
              <img 
                src="https://images.unsplash.com/photo-1546516484-647ab6d7e7f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwZG9nJTIwbWFzY290JTIwY2FydG9vbnxlbnwxfHx8fDE3NTY3MTM4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Mascot"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">{persian.overallResult}</h3>
                <p className="text-orange-800 mt-1">{verdict} برای {currentPet.name} 👍</p>
              </div>
            </div>
          </Card>

          {/* Good Ingredients */}
          {goodIngredients.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                {persian.goodIngredients}
              </h3>
              <div className="flex flex-wrap gap-2">
                {goodIngredients.map((ingredient, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Bad Ingredients */}
          {badIngredients.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 ml-2" />
                {persian.badIngredients}
              </h3>
              <div className="flex flex-wrap gap-2">
                {badIngredients.map((ingredient, index) => (
                  <Badge key={index} className="bg-red-100 text-red-800 hover:bg-red-200">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">توصیه‌ها</h3>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2 space-x-reverse">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <Card className="p-4 border-yellow-200 bg-yellow-50">
              <h3 className="font-semibold text-yellow-900 mb-3">نکات مهم</h3>
              <ul className="space-y-2">
                {warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-2 space-x-reverse">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <span className="text-sm text-yellow-800">{warning}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Nutritional Info */}
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">اطلاعات تغذیه‌ای</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">پروتئین:</span>
                <span className="font-medium">{currentProduct.nutritionalInfo.protein}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">چربی:</span>
                <span className="font-medium">{currentProduct.nutritionalInfo.fat}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">کربوهیدرات:</span>
                <span className="font-medium">{currentProduct.nutritionalInfo.carbs}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">فیبر:</span>
                <span className="font-medium">{currentProduct.nutritionalInfo.fiber}%</span>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="fixed bottom-20 left-0 right-0 p-6 bg-white border-t">
        <div className="flex space-x-3 space-x-reverse">
          <Button onClick={handleSave} className="flex-1 bg-[#F59E0B] hover:bg-[#D97706]">
            <Save className="w-4 h-4 ml-2" />
            {persian.save}
          </Button>
          <Button onClick={handleCompare} variant="outline" className="flex-1">
            <BarChart3 className="w-4 h-4 ml-2" />
            {persian.compare}
          </Button>
          <Button onClick={handleChat} variant="outline" size="icon">
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};