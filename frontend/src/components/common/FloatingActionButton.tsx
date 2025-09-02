import React from 'react';
import { Button } from '../ui/button';
import { MessageCircle } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-lg hover:scale-110 transition-all duration-300 z-50"
      size="sm"
    >
      <MessageCircle className="w-6 h-6" />
    </Button>
  );
};