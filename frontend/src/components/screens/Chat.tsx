import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { ArrowLeft, ArrowRight, Send, Mic } from 'lucide-react';
import { ChatMessage, ChatSession } from '../../types';
import { persian } from '../../constants/i18n';
import { BottomNavigation } from '../common/BottomNavigation';

export const Chat: React.FC = () => {
  const { 
    setCurrentScreen, 
    currentPet, 
    currentChatSession, 
    setCurrentChatSession,
    addChatSession,
    updateChatSession,
    isRTL 
  } = useApp();
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `${persian.mascotGreeting} چطور می‌تونم درباره تغذیه ${currentPet?.name} کمکتون کنم؟`,
      timestamp: new Date().toISOString()
    }
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentPet) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(inputText),
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      `درباره ${currentPet?.name} بیشتر بگید. چه سنی دارد و چه نوع فعالیتی انجام می‌دهد؟`,
      'بر اساس سن و وزن حیوان خانگی‌تون، میتونم غذاهای مناسب رو پیشنهاد بدم. آیا حساسیت خاصی دارد؟',
      'پروتئین کیفیت بالا برای سلامت عضلات مهمه. آیا تاکنون محصولات بر پایه گوشت مرغ امتحان کردید؟',
      'مهم اینه که غذا متعادل باشه. آیا سوال خاصی درباره مواد تشکیل دهنده دارید؟',
      'بر اساس اطلاعاتی که ازتون دارم، این نوع غذا مناسب خواهد بود. نیاز به توضیح بیشتری دارید؟'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12 bg-white border-b">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="p-2"
        >
          {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
        </Button>
        
        <div className="flex items-center space-x-3 space-x-reverse">
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://images.unsplash.com/photo-1546516484-647ab6d7e7f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwZG9nJTIwbWFzY290JTIwY2FydG9vbnxlbnwxfHx8fDE3NTY3MTM4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-900">دستیار تغذیه</h2>
            <p className="text-xs text-gray-600">آنلاین</p>
          </div>
        </div>
        
        <div className="w-9" />
      </div>

      {/* Pet Context Banner */}
      {currentPet && (
        <div className="p-4 bg-orange-100 border-b border-orange-200">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Avatar className="w-6 h-6">
              <AvatarImage src={currentPet.avatarUrl} alt={currentPet.name} />
              <AvatarFallback>{currentPet.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-orange-800">
              درباره {currentPet.name} ({currentPet.species === 'cat' ? 'گربه' : 'سگ'})
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 h-[calc(100vh-240px)] px-4 py-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 space-x-reverse max-w-xs lg:max-w-md ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}>
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1546516484-647ab6d7e7f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwZG9nJTIwbWFzY290JTIwY2FydG9vbnxlbnwxfHx8fDE3NTY3MTM4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                
                <Card className={`p-3 ${
                  message.role === 'user'
                    ? 'bg-[#F59E0B] text-white'
                    : 'bg-white border-gray-200'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-orange-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString('fa-IR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </Card>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 space-x-reverse">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1546516484-647ab6d7e7f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwZG9nJTIwbWFzY290JTIwY2FydG9vbnxlbnwxfHx8fDE3NTY3MTM4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <Card className="p-3 bg-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-500 hover:text-[#F59E0B]"
          >
            <Mic className="w-5 h-5" />
          </Button>
          
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="سوال خود را بپرسید..."
            className="flex-1"
          />
          
          <Button 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="bg-[#F59E0B] hover:bg-[#D97706]"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};