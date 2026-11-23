import { ColorSwatch, Product, StoreCopy, StoreState } from '../types/store';

export const WHATSAPP_NUMBER = '213673423172';

export const BRAND_LOGO_PATH = '/assets/aistudio/Messenger_creation_1E2398F0-575A-4054-A762-C6E5FA028C9C_533e43e0.jpeg';
export const HERO_IMAGE_PATH = '/src/assets/images/hero_graduation_atelier_1794839417274.jpg';
export const SHAWL_IMAGE_PATH = '/src/assets/images/product_shawl_miss_1794839418538.jpg';
export const ROBE_IMAGE_PATH = '/src/assets/images/product_graduation_robe_1794839418964.jpg';
export const CAP_IMAGE_PATH = '/src/assets/images/product_graduation_cap_1794839419964.jpg';
export const BOUQUET_IMAGE_PATH = '/src/assets/images/product_graduation_bouquet_1794839419713.jpg';

export const CATEGORY_LABELS: Record<string, string> = {
  all: 'جميع القطع',
  shawl: 'الوشاح والقبعة',
  robe: 'الروب الأكاديمي',
  cap: 'القبعة المنفردة',
  accessories: 'الورد والإكسسوارات',
};

export const CATEGORY_BRANCHES: Record<string, string[]> = {
  shawl: ['الكل', 'شال ميس', 'شال عادي', 'شال بالظهر'],
  robe: ['الكل', 'روب عادي', 'روب خليجي'],
  cap: ['الكل', 'Forme V', 'كلاسيكي'],
  accessories: ['الكل', 'ورد'],
};

export const STOLE_COLORS: ColorSwatch[] = [
  { name: 'أسود ملكي', hex: '#141212', defaultThreadHex: '#d4af37', defaultThreadName: 'ذهبي' },
  { name: 'بورغندي', hex: '#6c1e34', defaultThreadHex: '#d4af37', defaultThreadName: 'ذهبي' },
  { name: 'كحلي داكن', hex: '#172b59', defaultThreadHex: '#f5f2eb', defaultThreadName: 'أبيض لؤلؤي' },
  { name: 'أخضر ملكي', hex: '#0b4432', defaultThreadHex: '#d4af37', defaultThreadName: 'ذهبي' },
  { name: 'رمادي فحمي', hex: '#373534', defaultThreadHex: '#e5e0d8', defaultThreadName: 'فضي' },
  { name: 'أبيض عاجي', hex: '#f4efe6', defaultThreadHex: '#762b43', defaultThreadName: 'بورغندي' },
];

export const THREAD_COLORS = [
  { name: 'ذهبي ملكي', hex: '#d4af37' },
  { name: 'فضي لؤلؤي', hex: '#e2e8f0' },
  { name: 'أبيض ناصع', hex: '#ffffff' },
  { name: 'بورغندي', hex: '#762b43' },
  { name: 'أسود فحمي', hex: '#181514' },
];

export const CAP_SWATCHES = [
  { name: 'أسود ملكي', hex: '#141212' },
  { name: 'بورغندي', hex: '#762b43' },
  { name: 'أحمر ياقوتي', hex: '#991b1b' },
  { name: 'كحلي داكن', hex: '#1e3a8a' },
  { name: 'أزرق ملكي', hex: '#2563eb' },
  { name: 'أزرق سماوي', hex: '#38bdf8' },
  { name: 'أخضر ملكي', hex: '#064e3b' },
  { name: 'أخضر زمردي', hex: '#10b981' },
  { name: 'أبيض عاجي', hex: '#f5f5f4' },
  { name: 'بيج كريمي', hex: '#e7d8c9' },
  { name: 'ذهبي ملكي', hex: '#c89b3c' },
  { name: 'رمادي فضي', hex: '#9ca3af' },
  { name: 'وردي ناعم', hex: '#f472b6' },
  { name: 'فوشيا', hex: '#be185d' },
  { name: 'بنفسجي ملكي', hex: '#581c87' },
  { name: 'بني شوكولاتة', hex: '#451a03' },
];


export const STOLE_STUDIO_MODELS = [
  { id: 'miss-crepe', label: 'شال ميس · قماش كريب', price: 3800 },
  { id: 'miss-dan', label: 'شال ميس · قماش دان', price: 4300 },
  { id: 'plain-crepe', label: 'شال عادي بدون ظهر · كريب', price: 3900 },
  { id: 'plain-dan', label: 'شال عادي بدون ظهر · دان', price: 4400 },
  { id: 'back-crepe', label: 'شال بالظهر · قماش كريب', price: 4500 },
  { id: 'back-dan', label: 'شال بالظهر · قماش دان', price: 4900 },
];

export const DEFAULT_COPY: StoreCopy = {
  brandName: 'DG BY DOUAA',
  heroEyebrow: 'دار أزياء التخرج في الجزائر',
  heroTitle: 'طقم تخرجك، بتفصيل وتطريز يليق بيومك',
  heroSubtitle:
    'شال تخرج مع القبعة يُطرَّز عليه اسمك وشعار جامعتك بخط الثلث، وروب مفصّل بمقاسك بدقة. أرسل طلبك الآن دون دفع مسبق، ونؤكد معك كل التفاصيل عبر WhatsApp.',
  studioTitle: 'استوديو تصميم الوشاح',
  studioSubtitle:
    'اكتب اسمك أو دفعتك بخط الثلث، واختر لون القماش والتطريز لتشاهد النتيجة قبل تأكيد الطلب.',
  pricesTitle: 'جدول الأسعار الرسمية',
  pricesSubtitle:
    'تتوفر جميع الشالات بقماش الكريب الفاخر أو الدان المخملي، ويشمل السعر القبعة الأساسية والتطريز.',
};

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'shawl-miss-1',
    category: 'shawl',
    branch: 'شال ميس',
    name: 'شال ميس مع قبعة وتطريز مجاني',
    description:
      'تصميم انسيابي متوفر بقماش الكريب أو الدان مع قبعة دائرية أو مثلثة وتطريز الاسم والشعار.',
    basePrice: 3800,
    imageUrl: SHAWL_IMAGE_PATH,
    options: [
      { label: 'كريب', price: 3800 },
      { label: 'دان', price: 4300 },
    ],
    secondaryLabel: 'نوع القبعة',
    secondaryOptions: ['قبعة عادية (مشمولة)', 'توكسيدو (+100 دج)'],
  },
  {
    id: 'shawl-regular-1',
    category: 'shawl',
    branch: 'شال عادي',
    name: 'شال عادي بدون ظهر مع القبعة',
    description:
      'قصة كلاسيكية متوازنة على الكتفين مع مساحة واسعة للتطريز باللغة العربية أو الأجنبية.',
    basePrice: 3900,
    imageUrl: SHAWL_IMAGE_PATH,
    options: [
      { label: 'كريب', price: 3900 },
      { label: 'دان', price: 4400 },
    ],
    secondaryLabel: 'نوع القبعة',
    secondaryOptions: ['قبعة عادية (مشمولة)', 'توكسيدو (+100 دج)'],
  },
  {
    id: 'shawl-back-1',
    category: 'shawl',
    branch: 'شال بالظهر',
    name: 'شال بالظهر الفاخر مع القبعة',
    description:
      'ياقة خلفية متصلة تمنح ثباتاً مثالياً طوال حفل التخرج مع تطريز مزدوج الأطراف.',
    basePrice: 4500,
    imageUrl: HERO_IMAGE_PATH,
    options: [
      { label: 'كريب', price: 4500 },
      { label: 'دان', price: 4900 },
    ],
    secondaryLabel: 'نوع القبعة',
    secondaryOptions: ['قبعة عادية (مشمولة)', 'توكسيدو (+100 دج)'],
  },
  {
    id: 'robe-classic-1',
    category: 'robe',
    branch: 'روب عادي',
    name: 'روب التخرج الكلاسيكي',
    description:
      'تفصيل مريح بكسرات كتف متقنة، متوفر بستة ألوان ومقاسات من XS إلى XXL أو حسب القياس الخاص.',
    basePrice: 2500,
    imageUrl: ROBE_IMAGE_PATH,
    options: [
      { label: 'روب عادي', price: 2500 },
      { label: 'روب خليجي', price: 3200 },
    ],
    secondaryLabel: 'الفئة والمقاس',
    secondaryOptions: [
      'نسائي · S',
      'نسائي · M',
      'نسائي · L',
      'نسائي · XL',
      'رجالي · M',
      'رجالي · L',
      'رجالي · XL',
      'رجالي · XXL',
      'مقاس خاص',
    ],
  },
  {
    id: 'robe-gulf-1',
    category: 'robe',
    branch: 'روب خليجي',
    name: 'روب التخرج الخليجي الواسع',
    description:
      'أكمام واسعة وقصة احتفالية فخمة تمنح حضوراً مميزاً في جلسات التصوير وحفل التخرج.',
    basePrice: 3200,
    imageUrl: ROBE_IMAGE_PATH,
    options: [
      { label: 'روب خليجي', price: 3200 },
      { label: 'روب عادي', price: 2500 },
    ],
    secondaryLabel: 'الفئة والمقاس',
    secondaryOptions: [
      'نسائي · M',
      'نسائي · L',
      'نسائي · XL',
      'رجالي · L',
      'رجالي · XL',
      'مقاس خاص',
    ],
  },
  {
    id: 'cap-custom-1',
    category: 'cap',
    branch: 'Forme V',
    name: 'قبعة تخرج مخصصة (Forme V)',
    description:
      'قبعة محكمة الهيكل بشرابة حريرية متدلية؛ اختر اللون المناسب لطقمك وأدخل محيط الرأس بدقة.',
    basePrice: 1500,
    imageUrl: CAP_IMAGE_PATH,
    options: [
      { label: 'قبعة Forme V', price: 1500 },
      { label: 'قبعة توكسيدو', price: 1600 },
    ],
    supportsColorSwatches: true,
    supportsHeadCircumference: true,
  },
  {
    id: 'acc-bouquet-1',
    category: 'accessories',
    branch: 'ورد',
    name: 'باقة ورد التخرج المخصصة',
    description:
      'تنسيق فاخر من الورد الطبيعي أو الدائم بألوان متناغمة مع وشاحك وبطاقة تهنئة مخصصة.',
    basePrice: 1500,
    imageUrl: BOUQUET_IMAGE_PATH,
    options: [
      { label: 'تنسيق كلاسيكي', price: 1500 },
      { label: 'تنسيق ملكي مع بطاقة', price: 2200 },
    ],
    secondaryLabel: 'نوع الورد',
    secondaryOptions: ['ورد دائم فاخر', 'ورد طبيعي موسمي'],
  },
];

export const DEFAULT_STORE_STATE: StoreState = {
  version: 2,
  logoUrl: '',
  studioBgUrl: '',
  copy: DEFAULT_COPY,
  products: DEFAULT_PRODUCTS,
  sectionOrder: ['catalog', 'studio', 'pricing'],
  customTexts: {},
  customImages: {},
};

export const PRICING_TABLE_ROWS = [
  { name: 'شال ميس مع القبعة', crepe: 3800, dan: 4300 },
  { name: 'شال عادي بدون ظهر مع القبعة', crepe: 3900, dan: 4400 },
  { name: 'شال بالظهر مع القبعة', crepe: 4500, dan: 4900 },
  { name: 'روب التخرج (عادي / خليجي)', crepe: 2500, dan: 3200 },
  { name: 'قبعة منفردة / باقة ورد التخرج', crepe: 1500, dan: 2200 },
];

export const FAQ_ITEMS = [
  {
    q: 'كم سعر شال التخرج مع القبعة؟',
    a: 'تبدأ أسعار الشالات مع القبعة الأساسية والتطريز المجاني من 3,800 دج (شال ميس كريب) وتصل إلى 4,900 دج (شال بالظهر قماش دان). أما الروب العادي فسعره 2,500 دج.',
  },
  {
    q: 'هل أدفع أي مبلغ عند إرسال الطلب من الموقع؟',
    a: 'لا. ترسل طلبك مجاناً دون دفع إلكتروني، ونتواصل معك عبر WhatsApp لمراجعة المقاس والخط والألوان. يتم تأكيد الطلب بدفع عربون 30% فقط والباقي عند التسليم.',
  },
  {
    q: 'كم تستغرق مدة التجهيز وهل التوصيل متاح لكل الولايات؟',
    a: 'مدة التجهيز والتطريز 7 أيام على الأقل حسب الضغط وموعد الحفل الذي تختاره. التوصيل متاح لجميع الولايات الـ 58 في الجزائر سواء إلى المنزل أو إلى مكتب شركة التوصيل.',
  },
  {
    q: 'هل يمكن إضافة شعار الجامعة أو تطريز مخصص على الظهر؟',
    a: 'نعم بالتأكيد، يمكنك إرفاق شعار جامعتك أو تخصصك أثناء تأكيد الطلب عبر WhatsApp بعد إرساله من السلة، وسنرسل لك معاينة واضحة قبل التنفيذ.',
  },
];

export const ALGERIA_WILAYAS = [
  '01 - أدرار',
  '02 - الشلف',
  '03 - الأغواط',
  '04 - أم البواقي',
  '05 - باتنة',
  '06 - بجاية',
  '07 - بسكرة',
  '08 - بشار',
  '09 - البليدة',
  '10 - البويرة',
  '11 - تمنراست',
  '12 - تبسة',
  '13 - تلمسان',
  '14 - تيارت',
  '15 - تيزي وزو',
  '16 - الجزائر',
  '17 - الجلفة',
  '18 - جيجل',
  '19 - سطيف',
  '20 - سعيدة',
  '21 - سكيكدة',
  '22 - سيدي بلعباس',
  '23 - عنابة',
  '24 - قالمة',
  '25 - قسنطينة',
  '26 - المدية',
  '27 - مستغانم',
  '28 - المسيلة',
  '29 - معسكر',
  '30 - ورقلة',
  '31 - وهران',
  '32 - البيض',
  '33 - إليزي',
  '34 - برج بوعريريج',
  '35 - بومرداس',
  '36 - الطارف',
  '37 - تندوف',
  '38 - تيسمسيلت',
  '39 - الوادي',
  '40 - خنشلة',
  '41 - سوق أهراس',
  '42 - تيبازة',
  '43 - ميلة',
  '44 - عين الدفلى',
  '45 - النعامة',
  '46 - عين تموشنت',
  '47 - غرداية',
  '48 - غليزان',
  '49 - تيميمون',
  '50 - برج باجي مختار',
  '51 - أولاد جلال',
  '52 - بني عباس',
  '53 - عين صالح',
  '54 - عين قزام',
  '55 - تقرت',
  '56 - جانت',
  '57 - المغير',
  '58 - المنيعة',
];
