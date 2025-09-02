import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowRight, ArrowLeft, Phone, Mail } from 'lucide-react';
import { persian } from '../../constants/i18n';

export const Login: React.FC = () => {
  const { setCurrentScreen, isRTL } = useApp();
  
  const [step, setStep] = useState<'contact' | 'pin'>('contact');
  const [contactMethod, setContactMethod] = useState<'phone' | 'email'>('phone');
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    pin: ''
  });

  const handleBack = () => {
    if (step === 'pin') {
      setStep('contact');
    } else {
      setCurrentScreen('signup');
    }
  };

  const handleContinue = () => {
    if (step === 'contact') {
      const contactValue = contactMethod === 'phone' ? formData.phone : formData.email;
      if (contactValue.trim()) {
        setStep('pin');
      }
    } else if (step === 'pin') {
      if (formData.pin.length >= 4) {
        // Mock login success
        setCurrentScreen('home');
      }
    }
  };

  const handleContactMethodChange = (method: 'phone' | 'email') => {
    setContactMethod(method);
    setFormData({ ...formData, phone: '', email: '' });
  };

  const isContactValid = () => {
    if (contactMethod === 'phone') {
      return formData.phone.trim().length > 0;
    }
    return formData.email.trim().length > 0 && formData.email.includes('@');
  };

  const isPinValid = () => {
    return formData.pin.length >= 4 && formData.pin.length <= 6;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-6">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="p-2"
          >
            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Button>
          <h1 className="text-xl font-bold text-gray-900">{persian.loginTitle}</h1>
          <div className="w-9" />
        </div>

        <Card className="p-6">
          <div className="text-center mb-6">
            <img 
              src="https://images.unsplash.com/photo-1546516484-647ab6d7e7f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwZG9nJTIwbWFzY290JTIwY2FydG9vbnxlbnwxfHx8fDE3NTY3MTM4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Mascot"
              className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
            />
            <p className="text-sm text-gray-600">
              {step === 'contact' ? persian.enterLoginInfo : persian.enterPinToLogin}
            </p>
          </div>

          <div className="space-y-6">
            {step === 'contact' ? (
              <>
                {/* Contact Method Selection */}
                <div>
                  <Label>{persian.chooseContactMethod}</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={contactMethod === 'phone' ? 'default' : 'outline'}
                      onClick={() => handleContactMethodChange('phone')}
                      className="flex-1 gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      {persian.phone}
                    </Button>
                    <Button
                      type="button"
                      variant={contactMethod === 'email' ? 'default' : 'outline'}
                      onClick={() => handleContactMethodChange('email')}
                      className="flex-1 gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      {persian.email}
                    </Button>
                  </div>
                </div>

                {/* Contact Input */}
                <div>
                  <Label htmlFor="contact">
                    {contactMethod === 'phone' ? persian.phone : persian.email}
                  </Label>
                  <Input
                    id="contact"
                    type={contactMethod === 'phone' ? 'tel' : 'email'}
                    value={contactMethod === 'phone' ? formData.phone : formData.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      [contactMethod]: e.target.value
                    })}
                    placeholder={contactMethod === 'phone' ? '09123456789' : 'example@email.com'}
                    className="mt-1"
                    dir={contactMethod === 'email' ? 'ltr' : 'rtl'}
                  />
                </div>
              </>
            ) : (
              <div>
                <Label htmlFor="pin">{persian.pin}</Label>
                <Input
                  id="pin"
                  type="password"
                  value={formData.pin}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setFormData({ ...formData, pin: value });
                  }}
                  placeholder="••••"
                  className="mt-1 text-center text-lg tracking-widest"
                  maxLength={6}
                />
                <div className="text-center mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#F59E0B] hover:bg-orange-50"
                  >
                    {persian.forgotPin}
                  </Button>
                </div>
              </div>
            )}

            <Button 
              onClick={handleContinue}
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white py-6 rounded-xl"
              size="lg"
              disabled={step === 'contact' ? !isContactValid() : !isPinValid()}
            >
              <span>{persian.continue}</span>
              {isRTL ? <ArrowRight className="w-5 h-5 mr-2" /> : <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {persian.dontHaveAccount}{' '}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentScreen('signup')}
                  className="text-[#F59E0B] hover:bg-orange-50 p-0 h-auto"
                >
                  {persian.signupHere}
                </Button>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};