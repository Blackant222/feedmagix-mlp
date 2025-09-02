import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { ArrowLeft, ArrowRight, Trophy, Star, X, Plus } from 'lucide-react';
import { persian } from '../../constants/i18n';
import { BottomNavigation } from '../common/BottomNavigation';

export const Comparison: React.FC = () => {
  const { 
    setCurrentScreen, 
    comparisonProducts, 
    removeFromComparison,
    clearComparison,
    currentPet,
    isRTL 
  } = useApp();

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const handleAddMore = () => {
    setCurrentScreen('home');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Trophy className="w-5 h-5" />;
    return <Star className="w-5 h-5" />;
  };

  // Mock comparison data
  const comparisonData = comparisonProducts.map((product, index) => ({
    ...product,
    compatibilityScore: 85 - (index * 5), // Mock decreasing scores
    verdict: index === 0 ? 'بهترین انتخاب' : `انتخاب ${index === 1 ? 'خوب' : 'متوسط'}`,
    pros: [
      'پروتئین بالا',
      'بدون مواد نگهدارنده',
      'مناسب سن'
    ].slice(0, 3 - index),
    cons: [
      'قیمت بالا',
      'رنگ مصنوعی'
    ].slice(0, index)
  }));

  // Add sample data if comparison is empty (for demo purposes)
  const displayData = comparisonData.length > 0 ? comparisonData : [];

  const winner = displayData.length > 0 ? displayData.reduce((prev, current) => 
    prev.compatibilityScore > current.compatibilityScore ? prev : current
  ) : null;

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
        <h1 className="text-xl font-bold text-gray-900">مقایسه محصولات</h1>
        {comparisonProducts.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearComparison}
            className="p-2 text-red-600"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Pet Context */}
      {currentPet && (
        <div className="px-6 mb-4">
          <Card className="p-3 bg-orange-50">
            <p className="text-sm text-orange-800 text-center">
              مقایسه برای {currentPet.name} ({currentPet.species === 'cat' ? 'گربه' : 'سگ'})
            </p>
          </Card>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="px-6">
          {/* Winner Card */}
          {displayData.length > 1 && winner && (
            <Card className="p-4 mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-[#F59E0B]">
              <div className="flex items-center space-x-3 space-x-reverse mb-3">
                <div className="w-12 h-12 rounded-full bg-[#F59E0B] flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white fill-current" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">برنده مقایسه</h3>
                  <p className="text-sm text-gray-600">بر اساس نیازهای {currentPet?.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 space-x-reverse">
                <img
                  src={winner.imageUrl}
                  alt={winner.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{winner.name}</h4>
                  <p className="text-sm text-gray-600">{winner.brand}</p>
                  <Badge className="mt-1 bg-[#F59E0B] hover:bg-[#D97706]">
                    {winner.compatibilityScore}/100
                  </Badge>
                </div>
                
                <div className="text-center">
                  <img 
                    src="https://images.unsplash.com/photo-1546516484-647ab6d7e7f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwZG9nJTIwbWFzY290JTIwY2FydG9vbnxlbnwxfHx8fDE3NTY3MTM4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="Mascot thumbs up"
                    className="w-12 h-12 rounded-full object-cover animate-bounce"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Comparison Cards */}
          <div className="space-y-4">
            {displayData.map((product, index) => (
              <Card 
                key={product.id} 
                className={`p-4 ${winner && product.id === winner.id ? 'ring-2 ring-[#F59E0B] bg-orange-50/30' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.brand}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {winner && product.id === winner.id && (
                      <Trophy className="w-5 h-5 text-[#F59E0B] fill-current" />
                    )}
                    <Badge className={getScoreColor(product.compatibilityScore)}>
                      {product.compatibilityScore}
                    </Badge>
                    {comparisonProducts.find(p => p.id === product.id) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeFromComparison(product.id)}
                        className="p-1"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    {product.verdict}
                  </p>
                  
                  {/* Nutritional Comparison */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">پروتئین:</span>
                        <span className="font-medium">{product.nutritionalInfo.protein}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">چربی:</span>
                        <span className="font-medium">{product.nutritionalInfo.fat}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">کربوهیدرات:</span>
                        <span className="font-medium">{product.nutritionalInfo.carbs}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">فیبر:</span>
                        <span className="font-medium">{product.nutritionalInfo.fiber}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pros and Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.pros && product.pros.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium text-green-700 mb-1">نکات مثبت:</h5>
                        <ul className="text-xs text-green-600 space-y-0.5">
                          {product.pros.map((pro, idx) => (
                            <li key={idx}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {product.cons && product.cons.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium text-red-700 mb-1">نکات منفی:</h5>
                        <ul className="text-xs text-red-600 space-y-0.5">
                          {product.cons.map((con, idx) => (
                            <li key={idx}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Add More Button */}
          {comparisonProducts.length < 5 && comparisonProducts.length > 0 && (
            <Card 
              className="p-4 mt-4 border-dashed border-2 border-gray-300 bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleAddMore}
            >
              <div className="flex items-center justify-center space-x-3 space-x-reverse">
                <Plus className="w-6 h-6 text-gray-400" />
                <span className="text-gray-600">اضافه کردن محصول دیگر</span>
              </div>
            </Card>
          )}

          {/* Empty State */}
          {comparisonProducts.length === 0 && (
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex -space-x-2">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Star className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gray-300 flex items-center justify-center">
                    <Star className="w-6 h-6 text-gray-500" />
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">هیچ محصولی برای مقایسه نیست</h3>
              <p className="text-gray-600 mb-4">
                محصولات مختلف را اسکن کنید تا بتوانید آن‌ها را مقایسه کنید
              </p>
              <Button 
                onClick={handleAddMore}
                className="bg-[#F59E0B] hover:bg-[#D97706]"
              >
                شروع اسکن
              </Button>
            </Card>
          )}
        </div>
      </ScrollArea>

      <BottomNavigation />
    </div>
  );
};