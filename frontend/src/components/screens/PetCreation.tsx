import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

import { ArrowRight, ArrowLeft, X } from 'lucide-react';
import { Pet } from '../../types';
import { persian } from '../../constants/i18n';
import { healthConditions, allergies } from '../../constants/healthData';

export const PetCreation: React.FC = () => {
  const { setCurrentScreen, addPet, isRTL } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    species: '' as 'cat' | 'dog',
    breed: '',
    age: '',
    weight: '',
    gender: '' as 'male' | 'female',
    activity_level: '' as 'low' | 'moderate' | 'high',
    health_conditions: [] as string[],
    dietary_restrictions: [] as string[]
  });

  const [customHealthCondition, setCustomHealthCondition] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.species) return;
    
    try {
      const petData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || 'مخلوط',
        age: parseInt(formData.age) || 1,
        weight: parseFloat(formData.weight) || 1,
        gender: formData.gender || 'male',
        activity_level: formData.activity_level || 'moderate',
        health_conditions: formData.health_conditions,
        dietary_restrictions: formData.dietary_restrictions,
        avatar_url: formData.species === 'cat' 
          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop&crop=face'
          : 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=face'
      };
      
      await addPet(petData);
      setCurrentScreen('home');
    } catch (error) {
      console.error('Failed to create pet:', error);
      // Error is handled by AppContext
    }
  };

  const handleBack = () => {
    setCurrentScreen('signup');
  };

  const handleHealthConditionChange = (condition: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        health_conditions: [...formData.health_conditions, condition]
      });
    } else {
      setFormData({
        ...formData,
        health_conditions: formData.health_conditions.filter(h => h !== condition),
        // Remove dietary restrictions if "آلرژی" is unchecked
        dietary_restrictions: condition === 'آلرژی' ? [] : formData.dietary_restrictions
      });
    }
  };

  const handleAddCustomHealthCondition = () => {
    if (customHealthCondition.trim() && !formData.health_conditions.includes(customHealthCondition.trim())) {
      setFormData({
        ...formData,
        health_conditions: [...formData.health_conditions, customHealthCondition.trim()]
      });
      setCustomHealthCondition('');
    }
  };

  const handleDietaryRestrictionChange = (restriction: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        dietary_restrictions: [...formData.dietary_restrictions, restriction]
      });
    } else {
      setFormData({
        ...formData,
        dietary_restrictions: formData.dietary_restrictions.filter(a => a !== restriction)
      });
    }
  };

  const handleAddCustomAllergy = () => {
    if (customAllergy.trim() && !formData.dietary_restrictions.includes(customAllergy.trim())) {
      setFormData({
        ...formData,
        dietary_restrictions: [...formData.dietary_restrictions, customAllergy.trim()]
      });
      setCustomAllergy('');
    }
  };

  const removeHealthCondition = (condition: string) => {
    setFormData({
      ...formData,
      health_conditions: formData.health_conditions.filter(h => h !== condition),
      // Also remove dietary restrictions if removing "آلرژی"
      dietary_restrictions: condition === 'آلرژی' ? [] : formData.dietary_restrictions
    });
  };

  const removeDietaryRestriction = (restriction: string) => {
    setFormData({
      ...formData,
      dietary_restrictions: formData.dietary_restrictions.filter(a => a !== restriction)
    });
  };

  const isAllergySelected = formData.health_conditions.includes('آلرژی');

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
          <h1 className="text-xl font-bold text-gray-900">ایجاد پروفایل حیوان خانگی</h1>
          <div className="w-9" />
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <img 
                src="https://images.unsplash.com/photo-1546516484-647ab6d7e7f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwZG9nJTIwbWFzY290JTIwY2FydG9vbnxlbnwxfHx8fDE3NTY3MTM4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Pet"
                className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
              />
              <p className="text-sm text-gray-600">اطلاعات حیوان خانگی خود را وارد کنید</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{persian.petName}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="نام حیوان خانگی"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="species">{persian.species}</Label>
                <Select onValueChange={(value: 'cat' | 'dog') => setFormData({...formData, species: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="انتخاب نوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cat">{persian.cat}</SelectItem>
                    <SelectItem value="dog">{persian.dog}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="breed">{persian.breed}</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({...formData, breed: e.target.value})}
                  placeholder="نژاد"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">{persian.age}</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    placeholder="سال"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">{persian.weight}</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="کیلوگرم"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gender">{persian.gender}</Label>
                <Select onValueChange={(value: 'male' | 'female') => setFormData({...formData, gender: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="انتخاب جنسیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{persian.male}</SelectItem>
                    <SelectItem value="female">{persian.female}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="activity">{persian.activityLevel}</Label>
                <Select onValueChange={(value: 'low' | 'moderate' | 'high') => setFormData({...formData, activity_level: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="سطح فعالیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{persian.low}</SelectItem>
                    <SelectItem value="moderate">{persian.moderate}</SelectItem>
                    <SelectItem value="high">{persian.high}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{persian.healthConditions}</Label>
                <div className="mt-2 space-y-2">
                  {/* Selected health conditions */}
                  {formData.health_conditions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
                      <p className="w-full text-xs font-medium text-orange-700 mb-1">وضعیت‌های انتخاب شده:</p>
                      {formData.health_conditions.map((condition) => (
                        <div
                          key={condition}
                          className="flex items-center gap-2 bg-[#F59E0B] text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm"
                        >
                          <span>{condition}</span>
                          <button
                            type="button"
                            onClick={() => removeHealthCondition(condition)}
                            className="hover:bg-[#D97706] rounded-full p-1 transition-colors duration-150"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Health conditions buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFormData({...formData, health_conditions: [], dietary_restrictions: []});
                      }}
                      className={`${
                        formData.health_conditions.length === 0
                          ? 'bg-[#F59E0B] border-[#F59E0B] text-white hover:bg-[#D97706] hover:border-[#D97706] shadow-md'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-200'
                      } transition-all duration-200 rounded-xl py-3 px-4 text-sm font-medium min-h-[44px] flex items-center justify-center`}
                    >
                      {persian.none}
                    </Button>
                    {healthConditions.map((condition) => (
                      <Button
                        key={condition}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleHealthConditionChange(condition, !formData.health_conditions.includes(condition))}
                        className={`${
                          formData.health_conditions.includes(condition)
                            ? 'bg-[#F59E0B] border-[#F59E0B] text-white hover:bg-[#D97706] hover:border-[#D97706] shadow-md transform scale-[1.02]'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-200 hover:shadow-sm'
                        } transition-all duration-200 rounded-xl py-3 px-4 text-sm font-medium min-h-[44px] flex items-center justify-center`}
                      >
                        {condition}
                      </Button>
                    ))}
                  </div>

                  {/* Custom health condition input */}
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="شرایط سلامتی دیگر"
                      value={customHealthCondition}
                      onChange={(e) => setCustomHealthCondition(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomHealthCondition();
                        }
                      }}
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCustomHealthCondition}
                      disabled={!customHealthCondition.trim()}
                    >
                      افزودن
                    </Button>
                  </div>
                </div>
              </div>

              {/* Allergies section - only show if "آلرژی" is selected */}
              {isAllergySelected && (
                <div>
                  <Label>{persian.allergies}</Label>
                  <div className="mt-2 space-y-2">
                    {/* Selected allergies */}
                    {formData.dietary_restrictions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4 p-3 bg-red-50 rounded-xl border border-red-100">
                        <p className="w-full text-xs font-medium text-red-700 mb-1">آلرژی‌های انتخاب شده:</p>
                        {formData.dietary_restrictions.map((allergy) => (
                          <div
                            key={allergy}
                            className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm"
                          >
                            <span>{allergy}</span>
                            <button
                              type="button"
                              onClick={() => removeDietaryRestriction(allergy)}
                              className="hover:bg-red-600 rounded-full p-1 transition-colors duration-150"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Allergies buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      {allergies.map((allergy) => (
                        <Button
                          key={allergy}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDietaryRestrictionChange(allergy, !formData.dietary_restrictions.includes(allergy))}
                          className={`${
                            formData.dietary_restrictions.includes(allergy)
                              ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600 shadow-md transform scale-[1.02]'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-200 hover:shadow-sm'
                          } transition-all duration-200 rounded-xl py-3 px-4 text-sm font-medium min-h-[44px] flex items-center justify-center`}
                        >
                          {allergy}
                        </Button>
                      ))}
                    </div>

                    {/* Custom allergy input */}
                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="آلرژی دیگر"
                        value={customAllergy}
                        onChange={(e) => setCustomAllergy(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomAllergy();
                          }
                        }}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddCustomAllergy}
                        disabled={!customAllergy.trim()}
                      >
                        افزودن
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button 
              type="submit"
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white py-6 rounded-xl"
              size="lg"
              disabled={!formData.name || !formData.species}
            >
              <span>{persian.continue}</span>
              {isRTL ? <ArrowRight className="w-5 h-5 mr-2" /> : <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};