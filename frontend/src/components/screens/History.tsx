import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, ArrowRight, Calendar, Filter, Search } from 'lucide-react';
import { persian } from '../../constants/i18n';
import { BottomNavigation } from '../common/BottomNavigation';
import { ScanResult } from '../../types';

export const History: React.FC = () => {
  const { 
    setCurrentScreen, 
    scanHistory, 
    pets,
    currentPet,
    isRTL 
  } = useApp();
  
  const [selectedPet, setSelectedPet] = useState<string>(currentPet?.id || 'all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const filteredHistory = scanHistory.filter(scan => {
    const petMatch = selectedPet === 'all' || scan.petId === selectedPet;
    
    let dateMatch = true;
    if (dateFilter !== 'all') {
      const scanDate = new Date(scan.scannedAt);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          dateMatch = scanDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateMatch = scanDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateMatch = scanDate >= monthAgo;
          break;
      }
    }
    
    return petMatch && dateMatch;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPetName = (petId: string) => {
    const pet = pets.find(p => p.id === petId);
    return pet?.name || 'حیوان خانگی';
  };

  const handleScanClick = (scan: ScanResult) => {
    // Would normally navigate to detailed view
    console.log('View scan details:', scan);
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
        <h1 className="text-xl font-bold text-gray-900">تاریخچه تحلیل‌ها</h1>
        <div className="w-9" />
      </div>

      {/* Filters */}
      <div className="px-6 mb-4">
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                حیوان خانگی
              </label>
              <Select value={selectedPet} onValueChange={setSelectedPet}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  {pets.map(pet => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                بازه زمانی
              </label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه</SelectItem>
                  <SelectItem value="today">امروز</SelectItem>
                  <SelectItem value="week">هفته گذشته</SelectItem>
                  <SelectItem value="month">ماه گذشته</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>

      {/* Results Count */}
      <div className="px-6 mb-4">
        <p className="text-sm text-gray-600">
          {filteredHistory.length} تحلیل پیدا شد
        </p>
      </div>

      {/* History List */}
      <ScrollArea className="flex-1 px-6">
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <Card className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">هیچ تحلیلی یافت نشد</h3>
              <p className="text-gray-600">
                {scanHistory.length === 0 
                  ? 'هنوز هیچ محصولی اسکن نکرده‌اید'
                  : 'فیلترهای انتخابی را تغییر دهید'
                }
              </p>
              {scanHistory.length === 0 && (
                <Button 
                  onClick={() => setCurrentScreen('home')}
                  className="mt-4 bg-[#F59E0B] hover:bg-[#D97706]"
                >
                  اولین اسکن
                </Button>
              )}
            </Card>
          ) : (
            filteredHistory.map((scan) => (
              <Card 
                key={scan.id} 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleScanClick(scan)}
              >
                <div className="flex items-start space-x-4 space-x-reverse">
                  <img
                    src={scan.scanImageUrl}
                    alt="Scanned product"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          محصول اسکن شده
                        </h3>
                        <p className="text-sm text-gray-600">
                          برای {getPetName(scan.petId)}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <Badge 
                          variant={getScoreBadgeVariant(scan.compatibilityScore)}
                          className="mb-1"
                        >
                          {scan.compatibilityScore}/100
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700">
                      {scan.verdict}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {formatDate(scan.scannedAt)}
                      </p>
                      
                      {scan.warnings.length > 0 && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {scan.warnings.length} هشدار
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {scan.recommendations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {scan.recommendations[0]}
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      <BottomNavigation />
    </div>
  );
};