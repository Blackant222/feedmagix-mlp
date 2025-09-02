import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowRight, ArrowLeft, Phone, Mail } from 'lucide-react';
import { persian } from '../../constants/i18n';
import { countries } from '../../constants/geographic';

export const Signup: React.FC = () => {
  const { setCurrentScreen, isRTL } = useApp();
  
  const [showForm, setShowForm] = useState(false);
  const [contactMethod, setContactMethod] = useState<'phone' | 'email'>('phone');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    country: '',
    city: '',
    pin: ''
  });

  const handleContinueAsGuest = () => {
    setCurrentScreen('pet-creation');
  };

  const handleShowSignupForm = () => {
    setShowForm(true);
  };

  const handleBack = () => {
    if (showForm) {
      setShowForm(false);
    } else {
      setCurrentScreen('language-select');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      // Mock signup success - in real app would call API
      setCurrentScreen('pet-creation');
    }
  };

  const handleContactMethodChange = (method: 'phone' | 'email') => {
    setContactMethod(method);
    setFormData({ ...formData, phone: '', email: '' });
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setFormData({ ...formData, country: countryCode, city: '' });
  };

  const isFormValid = () => {
    const requiredFields = [formData.name, formData.country, formData.city, formData.pin];
    const contactValid = contactMethod === 'phone' ? formData.phone : formData.email;
    const pinValid = formData.pin.length >= 4 && formData.pin.length <= 6;
    
    return requiredFields.every(field => field.trim() !== '') && 
           contactValid.trim() !== '' && 
           pinValid;
  };

  const selectedCountryData = countries.find(c => c.code === selectedCountry);

  if (!showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-6">
        <Card className="w-full max-w-sm p-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">FeedMagix</h1>
            <p className="text-gray-600">به جمع والدین حیوانات خانگی بپیوندید</p>
            
            <div className="flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1546516484-647ab6d7e7f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwZG9nJTIwbWFzY290JTIwY2FydG9vbnxlbnwxfHx8fDE3NTY3MTM4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Mascot"
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleContinueAsGuest}
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white py-6 rounded-xl"
              size="lg"
            >
              <span>{persian.continueAsGuest}</span>
              {isRTL ? <ArrowRight className="w-5 h-5 mr-2" /> : <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
            
            <div className="text-center space-y-2">
              <Button 
                variant="ghost" 
                onClick={handleShowSignupForm}
                className="text-[#F59E0B] hover:bg-orange-50"
              >
                {persian.signUp}
              </Button>
              <p className="text-sm text-gray-600">
                {persian.alreadyHaveAccount}{' '}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentScreen('login')}
                  className="text-[#F59E0B] hover:bg-orange-50 p-0 h-auto"
                >
                  {persian.loginHere}
                </Button>
              </p>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>با ادامه، شما با قوانین و مقررات موافقت می‌کنید</p>
          </div>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-gray-900">{persian.createAccount}</h1>
          <div className="w-9" />
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <img 
                src="https://images.unsplash.com/photo-1546516484-647ab6d7e7f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwZG9nJTIwbWFzY290JTIwY2FydG9vbnxlbnwxfHx8fDE3NTY3MTM4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Mascot"
                className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
              />
              <p className="text-sm text-gray-600">اطلاعات خود را وارد کنید</p>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="name">{persian.name}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="نام و نام خانوادگی"
                  className="mt-1"
                  required
                />
              </div>

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
                  <span className="text-red-500 mr-1">*</span>
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
                  required
                />
              </div>

              {/* Optional Contact Input */}
              <div>
                <Label htmlFor="optional-contact">
                  {contactMethod === 'phone' ? persian.email : persian.phone}
                  <span className="text-gray-400 text-sm mr-2">(اختیاری)</span>
                </Label>
                <Input
                  id="optional-contact"
                  type={contactMethod === 'phone' ? 'email' : 'tel'}
                  value={contactMethod === 'phone' ? formData.email : formData.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    [contactMethod === 'phone' ? 'email' : 'phone']: e.target.value
                  })}
                  placeholder={contactMethod === 'phone' ? 'example@email.com' : '09123456789'}
                  className="mt-1"
                  dir={contactMethod === 'phone' ? 'ltr' : 'rtl'}
                />
              </div>

              {/* Country */}
              <div>
                <Label htmlFor="country">{persian.country}</Label>
                <Select onValueChange={handleCountryChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={persian.selectCountry} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div>
                <Label htmlFor="city">{persian.city}</Label>
                <Select 
                  onValueChange={(value) => setFormData({...formData, city: value})}
                  disabled={!selectedCountry}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={persian.selectCity} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedCountryData?.cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* PIN */}
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
                  placeholder="۱۲۳۴"
                  className="mt-1 text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  ۴ تا ۶ رقم
                </p>
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white py-6 rounded-xl"
              size="lg"
              disabled={!isFormValid()}
            >
              <span>{persian.createAccount}</span>
              {isRTL ? <ArrowRight className="w-5 h-5 mr-2" /> : <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {persian.alreadyHaveAccount}{' '}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentScreen('login')}
                  className="text-[#F59E0B] hover:bg-orange-50 p-0 h-auto"
                >
                  {persian.loginHere}
                </Button>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};