import { FoodProduct, Pet } from '../types';

export const mockProducts: FoodProduct[] = [
  {
    id: '1',
    name: 'غذای خشک گربه بالغ پرمیوم',
    brand: 'پرفکت فیت',
    category: 'خشک',
    ingredients: ['گوشت مرغ', 'برنج', 'جو دو سر', 'چربی مرغ', 'روغن ماهی', 'ویتامین E'],
    nutritionalInfo: {
      protein: 32,
      fat: 12,
      carbs: 35,
      fiber: 3.5,
      moisture: 8
    },
    allergens: ['مرغ'],
    lifeStage: ['بالغ'],
    speciesSuitable: ['cat'],
    priceRange: '100,000 - 200,000 تومان',
    imageUrl: 'https://images.unsplash.com/photo-1684882726821-2999db517441?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBmb29kJTIwcGFja2FnaW5nJTIwa2liYmxlfGVufDF8fHx8MTc1NjcxMzgxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: '2',
    name: 'غذای خشک سگ نژاد بزرگ',
    brand: 'رویال کنین',
    category: 'خشک',
    ingredients: ['گوشت بره', 'برنج قهوه‌ای', 'جو دو سر', 'چربی حیوانی', 'تخم‌مرغ خشک'],
    nutritionalInfo: {
      protein: 28,
      fat: 14,
      carbs: 40,
      fiber: 4,
      moisture: 9
    },
    allergens: ['تخم‌مرغ'],
    lifeStage: ['بالغ'],
    speciesSuitable: ['dog'],
    priceRange: '150,000 - 250,000 تومان',
    imageUrl: 'https://images.unsplash.com/photo-1684882726821-2999db517441?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBmb29kJTIwcGFja2FnaW5nJTIwa2liYmxlfGVufDF8fHx8MTc1NjcxMzgxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  }
];

export const mockPets: Pet[] = [
  {
    id: '1',
    name: 'میمی',
    species: 'cat',
    breed: 'پرشین',
    age: 3,
    weight: 4.2,
    gender: 'female',
    healthConditions: [],
    allergies: ['لاکتوز'],
    dietaryRestrictions: ['لاکتوز'],
    activityLevel: 'moderate',
    avatarUrl: 'https://images.unsplash.com/photo-1599907370836-939f2d59b897?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzaWFuJTIwY2F0JTIwZmx1ZmZ5fGVufDF8fHx8MTc1NjY1NTI1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: '2',
    name: 'رکس',
    species: 'dog',
    breed: 'گلدن رتریور',
    age: 5,
    weight: 25,
    gender: 'male',
    healthConditions: ['آلرژی'],
    allergies: ['گاو'],
    dietaryRestrictions: ['گاو'],
    activityLevel: 'high',
    avatarUrl: 'https://images.unsplash.com/photo-1719292606971-0916fc62f5b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjByZXRyaWV2ZXIlMjBkb2clMjBoYXBweXxlbnwxfHx8fDE3NTY3MTM4MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  }
];

// Health conditions data
export const healthConditions = [
  'آلرژی',
  'دیابت',
  'مشکلات کلیه',
  'مشکلات قلبی',
  'آرتریت',
  'مشکلات گوارشی',
  'اضافه وزن',
  'مشکلات پوستی',
  'مشکلات تیروئید',
  'مشکلات کبدی'
];

export const allergies = [
  'مرغ',
  'گاو',
  'ماهی',
  'تخم‌مرغ',
  'لاکتوز',
  'گندم',
  'سویا',
  'ذرت',
  'برنج',
  'گردو'
];

// Countries and cities data
export const countries = [
  { code: 'IR', name: 'ایران', cities: [
    'تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'کرج', 'اهواز', 'قم', 'کرمانشاه', 'ارومیه',
    'رشت', 'زاهدان', 'همدان', 'کرمان', 'یزد', 'اردبیل', 'بندرعباس', 'اراک', 'اسان', 'زنجان'
  ]},
  { code: 'AF', name: 'افغانستان', cities: [
    'کابل', 'هرات', 'قندهار', 'مزار شریف', 'جلال‌آباد'
  ]},
  { code: 'TR', name: 'ترکیه', cities: [
    'استانبول', 'آنکارا', 'ازمیر', 'بورسا', 'آدانا'
  ]},
  { code: 'IQ', name: 'عراق', cities: [
    'بغداد', 'بصره', 'اربیل', 'موصل', 'نجف'
  ]}
];

export const persian = {
  // Navigation
  scan: 'اسکن',
  pets: 'حیوانات',
  analyses: 'تحلیل‌ها',
  chat: 'گفتگو',
  
  // Onboarding
  languageSelection: 'انتخاب زبان',
  continueAsGuest: 'ادامه به عنوان مهمان',
  signUp: 'ثبت نام',
  login: 'ورود',
  
  // Pet form
  petName: 'نام حیوان',
  species: 'نوع',
  cat: 'گربه',
  dog: 'سگ',
  breed: 'نژاد',
  age: 'سن',
  weight: 'وزن',
  gender: 'جنسیت',
  male: 'نر',
  female: 'ماده',
  activityLevel: 'سطح فعالیت',
  low: 'کم',
  moderate: 'متوسط',
  high: 'زیاد',
  healthConditions: 'شرایط سلامتی',
  allergies: 'آلرژی‌ها',
  selectHealthCondition: 'انتخاب شرایط سلامتی',
  selectAllergies: 'انتخاب آلرژی‌ها',
  other: 'سایر',
  none: 'هیچ کدام',
  continue: 'ادامه',
  
  // Auth
  name: 'نام و نام خانوادگی',
  phone: 'شماره تلفن',
  email: 'ایمیل',
  country: 'کشور',
  city: 'شهر',
  pin: 'رمز عبور (۴-۶ رقم)',
  chooseContactMethod: 'روش تماس را انتخاب کنید',
  phoneRequired: 'شماره تلفن الزامی است',
  emailRequired: 'ایمیل الزامی است',
  createAccount: 'ایجاد حساب کاربری',
  alreadyHaveAccount: 'حساب کاربری دارید؟',
  dontHaveAccount: 'حساب کاربری ندارید؟',
  loginHere: 'وارد شوید',
  signupHere: 'ثبت نام کنید',
  loginTitle: 'ورود به حساب کاربری',
  enterLoginInfo: 'اطلاعات ورود خود را وارد کنید',
  enterPinToLogin: 'رمز عبور خود را وارد کنید',
  forgotPin: 'رمز عبور را فراموش کرده‌اید؟',
  selectCountry: 'انتخاب کشور',
  selectCity: 'انتخاب شهر',
  
  // Home
  scanNow: 'اسکن کنید',
  
  // Results
  overallResult: 'نتیجه کلی',
  goodIngredients: 'مواد مفید',
  badIngredients: 'مواد مضر',
  save: 'ذخیره',
  compare: 'مقایسه',
  
  // Common
  back: 'بازگشت',
  cancel: 'انصراف',
  ok: 'باشه',
  processing: 'در حال پردازش...',
  
  // Mascot messages
  mascotGreeting: 'سلام! من دستیار تغذیه حیوان خانگی شما هستم 🐾',
  scanSuccess: 'عالی! تحلیل کامل شد 🎉',
  goodChoice: 'انتخاب خوبی است! 👍',
  needsAttention: 'این محصول نیاز به توجه دارد ⚠️'
};