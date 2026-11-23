import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ImageOff,
  ImagePlus,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import {
  BOUQUET_IMAGE_PATH,
  CAP_SWATCHES,
  CATEGORY_BRANCHES,
  ROBE_IMAGE_PATH,
  SHAWL_IMAGE_PATH,
  THREAD_COLORS,
} from '../data/defaultStore';
import { CartItem, CategoryId, Product } from '../types/store';
import capRoundImg from '../assets/images/round.webp';
import capTriangleImg from '../assets/images/triangle.webp';
import capTuxedoImg from '../assets/images/tuxedo.webp';

interface ProductCatalogProps {
  products: Product[];
  isAdminMode: boolean;
  onAddToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  onOpenAddProduct: (defaultCategory?: CategoryId) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onReplaceProductImage: (productId: string, file: File) => void;
  onSetProductColorImage?: (productId: string, colorName: string, file: File | null) => void;
  onToggleProductField?: (
    productId: string,
    field: 'hideSizing' | 'hideCapDetails' | 'hideAmericanShawl'
  ) => void;
  onRemoveProductImage?: (productId: string) => void;
}

const MAIN_SECTIONS = [
  {
    id: 'shawl' as CategoryId,
    title: 'الوشاح',
    subtitle: 'شال ميس أو عادي أو بالظهر مع القبعة، بقماش الكريب أو الدان، وتصمّمه باسمك وشعارك.',
    priceLabel: 'من 3,800 دج مع القبعة',
    buttonText: 'صمّم وشاحك',
    fallbackImg: SHAWL_IMAGE_PATH,
  },
  {
    id: 'robe' as CategoryId,
    title: 'الروب',
    subtitle: 'روب التخرج بألوان ملكية ومقاس رجالي أو نسائي أو بقياساتك الخاصة بدقة.',
    priceLabel: 'من 2,500 دج',
    buttonText: 'اختر روبك',
    fallbackImg: ROBE_IMAGE_PATH,
  },
  {
    id: 'accessories' as CategoryId,
    title: 'ورد وإكسسوارات',
    subtitle: 'باقات ورد التخرج الفاخرة والقبعات المنفردة لإكمال إطلالة تخرجك.',
    priceLabel: 'تشكيلة مميزة',
    buttonText: 'تصفح الإكسسوارات',
    fallbackImg: BOUQUET_IMAGE_PATH,
  },
];

const CAP_STYLES = [
  { id: 'round', label: 'القبعة الدائرية', extraPrice: 0, priceText: 'مشمولة', image: capRoundImg },
  { id: 'triangle', label: 'القبعة المثلثة', extraPrice: 0, priceText: 'مشمولة', image: capTriangleImg },
  { id: 'tuxedo', label: 'قبعة توكسيدو', extraPrice: 100, priceText: '+100 دج', image: capTuxedoImg },
];

function withViewTransition(update: () => void, cleanup?: () => void) {
  if (typeof document === 'undefined' || !('startViewTransition' in document)) {
    update();
    cleanup?.();
    return;
  }
  document
    .startViewTransition(() => {
      flushSync(update);
    })
    .finished.finally(() => cleanup?.());
}

const MORPH_STYLE = { viewTransitionName: 'product-hero' } as React.CSSProperties;

function ProductDetailView({
  product,
  sectionTitle,
  isAdminMode,
  onBackToHome,
  onBackToSection,
  onAddToCart,
  onSetColorImage,
  onToggleField,
  onEdit,
  onDelete,
  onReplaceImage,
  isMorphing,
}: {
  product: Product;
  sectionTitle: string;
  isAdminMode: boolean;
  onBackToHome: () => void;
  onBackToSection: () => void;
  onAddToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  onSetColorImage?: (colorName: string, file: File | null) => void;
  onToggleField?: (field: 'hideSizing' | 'hideCapDetails' | 'hideAmericanShawl') => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReplaceImage?: (file: File) => void;
  isMorphing?: boolean;
}) {
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(0);
  const [selectedSecondary, setSelectedSecondary] = useState(
    product.secondaryOptions?.at(0) || ''
  );
  const [selectedColor, setSelectedColor] = useState(CAP_SWATCHES.at(0)!);
  const [selectedThreadColor, setSelectedThreadColor] = useState(THREAD_COLORS.at(0)!);
  const [embroideredText, setEmbroideredText] = useState('');

  const [customColorText, setCustomColorText] = useState('');

  const [selectedCapStyle, setSelectedCapStyle] = useState(CAP_STYLES.at(0)!);
  const [customCapImages, setCustomCapImages] = useState<Record<string, string>>({});

  const [gender, setGender] = useState<'نسائي' | 'رجالي'>('نسائي');
  const [standardSize, setStandardSize] = useState('M');
  const [numericSize, setNumericSize] = useState('');
  const [fullLength, setFullLength] = useState('');
  const [shoulderAndSleeve, setShoulderAndSleeve] = useState('');

  const [capSameColor, setCapSameColor] = useState(true);
  const [capCustomColor, setCapCustomColor] = useState(CAP_SWATCHES.at(0)!);
  const [headSize, setHeadSize] = useState('');
  const [capEmbroideryPos, setCapEmbroideryPos] = useState<'سطح القبعة' | 'جبهة القبعة'>('سطح القبعة');
  const [capNotes, setCapNotes] = useState('');

  const [customNotes, setCustomNotes] = useState('');
  const colorFileRef = useRef<HTMLInputElement>(null);

  const isAmericanShawl = product.name.includes('امريكي') || product.branch.includes('امريكي');

  const handleCapImageUpload = (capId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomCapImages((prev) => ({ ...prev, [capId]: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const activeOption = product.options[selectedOptionIdx];
  const basePrice = activeOption ? activeOption.price : product.basePrice;
  const showCapSection =
    product.category !== 'accessories' &&
    product.category !== 'cap' &&
    !product.hideCapDetails;
  const capStyleSurcharge = showCapSection ? selectedCapStyle.extraPrice : 0;
  const tuxedoSurcharge = selectedSecondary.includes('+100') ? 100 : 0;
  const displayPrice = basePrice + capStyleSurcharge + tuxedoSurcharge;

  const activeImageUrl = isAmericanShawl
    ? product.imageUrl
    : product.colorImages?.[selectedColor.name] || product.imageUrl;

  const hasDedicatedColorImg = Boolean(product.colorImages?.[selectedColor.name]);

  const handleColorFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (file && onSetColorImage) {
      onSetColorImage(selectedColor.name, file);
      e.target.value = '';
    }
  };

  const handleAdd = () => {
    const detailParts: string[] = [];
    const fabricType = activeOption?.label || '';
    const shawlColor =
      isAmericanShawl && customColorText.trim()
        ? customColorText.trim()
        : selectedColor.name;
    const threadColor = product.category === 'shawl' ? selectedThreadColor.name : undefined;
    const customEmbroider = embroideredText.trim() || undefined;
    const sizeText = !product.hideSizing
      ? `${gender} · ${numericSize.trim() || standardSize}${
          fullLength.trim() ? ` (${fullLength.trim()} سم)` : ''
        }`
      : undefined;

    if (activeOption) detailParts.push(activeOption.label);
    if (selectedSecondary) detailParts.push(selectedSecondary);

    if (isAmericanShawl && customColorText.trim()) {
      detailParts.push(`الألوان: ${customColorText.trim()}`);
    } else if (!isAmericanShawl) {
      detailParts.push(`اللون: ${selectedColor.name}`);
    }

    if (product.category === 'shawl') {
      detailParts.push(`خيط التطريز: ${selectedThreadColor.name}`);
      if (customEmbroider) {
        detailParts.push(`النص المطرز: ${customEmbroider}`);
      }
    }

    if (!product.hideSizing) {
      detailParts.push(`الفئة: ${gender}`);
      if (numericSize.trim()) {
        detailParts.push(`المقاس: ${numericSize.trim()}`);
      } else {
        detailParts.push(`المقاس: ${standardSize}`);
      }
      if (fullLength.trim()) detailParts.push(`الطول: ${fullLength.trim()} سم`);
      if (shoulderAndSleeve.trim()) detailParts.push(`الكتف/الكم: ${shoulderAndSleeve.trim()}`);
    }

    if (showCapSection) {
      detailParts.push(`شكل القبعة: ${selectedCapStyle.label}`);
      const finalCapColor = capSameColor
        ? isAmericanShawl
          ? 'نفس الألوان'
          : selectedColor.name
        : capCustomColor.name;
      detailParts.push(`لون القبعة: ${finalCapColor}`);
      if (headSize.trim()) detailParts.push(`محيط الرأس: ${headSize.trim()} سم`);
      detailParts.push(`تطريز القبعة: ${capEmbroideryPos}`);
      if (capNotes.trim()) detailParts.push(`ملاحظة القبعة: ${capNotes.trim()}`);
    }

    if (customNotes.trim()) detailParts.push(`ملاحظة: ${customNotes.trim()}`);

    onAddToCart({
      productId: product.id,
      category: product.category,
      title: product.name,
      details: detailParts.join(' · '),
      unitPrice: displayPrice,
      fabricType,
      shawlColor,
      threadColor,
      embroideredText: customEmbroider,
      size: sizeText,
    });
  };

  return (
    <div className="bg-white border border-[#F2D7DF] rounded-3xl overflow-hidden shadow-xl">
      <div className="px-5 py-3.5 bg-[#FFF9FA] border-b border-[#F2D7DF] flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#6E4E5A]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onBackToHome}
            className="hover:text-[#8E244D] underline cursor-pointer"
          >
            الرئيسية
          </button>
          <ChevronLeft className="w-3.5 h-3.5 text-[#8E244D]/60" />
          <button
            type="button"
            onClick={onBackToSection}
            className="hover:text-[#8E244D] underline cursor-pointer"
          >
            {sectionTitle}
          </button>
          <ChevronLeft className="w-3.5 h-3.5 text-[#8E244D]/60" />
          <span className="text-[#2A151D]">{product.name}</span>
        </div>

        <div className="flex items-center gap-3">
          {isAdminMode && onEdit && onDelete && (
            <div className="flex items-center gap-2 border-l border-[#F2D7DF] pl-3">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1 text-[#8E244D] hover:underline cursor-pointer font-bold"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('هل أنت متأكد من حذف هذا الموديل نهائياً؟')) {
                    onDelete();
                  }
                }}
                className="inline-flex items-center gap-1 text-[#BE123C] hover:underline cursor-pointer font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onBackToSection}
            className="inline-flex items-center gap-1 text-[#8E244D] hover:underline cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>رجوع للقسم</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 sm:p-8 items-start">
        <div className="relative aspect-[3/4] min-w-0 rounded-2xl bg-[#FFF3F6] overflow-hidden border border-[#F2D7DF] flex items-center justify-center">
          {isAdminMode && (
            <div className="absolute top-3 left-3 z-10">
              <label className="cursor-pointer bg-white/95 backdrop-blur-md text-[#2A151D] px-3 py-1.5 rounded-lg border border-[#F2D7DF] text-xs font-bold shadow-sm hover:bg-[#FCE8EF] flex items-center gap-1.5">
                <ImagePlus className="w-4 h-4 text-[#8E244D]" />
                تغيير الصورة
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.item(0);
                    if (file && onReplaceImage) {
                      onReplaceImage(file);
                    }
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
          )}

          {activeImageUrl ? (
            <>
              <img
                src={activeImageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                style={isMorphing ? MORPH_STYLE : undefined}
                className="w-full h-full object-contain p-4 transition-all duration-300"
              />
              {!isAmericanShawl && (
                <div className="absolute bottom-3 right-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-[#F2D7DF] shadow-sm text-xs font-bold text-[#2A151D]">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-[#2A151D]/20"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  <span>اللون: {selectedColor.name}</span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <ShoppingBag className="w-10 h-10 text-[#8E244D] mb-2 opacity-75" />
              <span className="font-editorial text-lg font-bold text-[#2A151D]">
                {product.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between space-y-5 min-w-0">
          <div className="space-y-4">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FCE8EF] border border-[#F2D7DF] text-xs font-bold text-[#8E244D] mb-1.5">
                {product.branch}
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2A151D]">
                {product.name}
              </h3>
              <p className="text-xl font-extrabold text-[#8E244D] mt-1.5 tabular-nums">
                {displayPrice.toLocaleString('en-US')} دج
              </p>
              <p className="text-sm text-[#6E4E5A] leading-relaxed mt-2">
                {product.description}
              </p>
            </div>

            {product.options.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#2A151D] mb-2">
                  اختر القماش أو المقاس:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {product.options.map((opt, idx) => {
                    const active = idx === selectedOptionIdx;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setSelectedOptionIdx(idx)}
                        className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                          active
                            ? 'border-[#8E244D] bg-[#FCE8EF]/65'
                            : 'border-[#F2D7DF] bg-white hover:border-[#8E244D]/45'
                        }`}
                      >
                        <span className="block text-xs font-bold text-[#2A151D]">{opt.label}</span>
                        <span className="text-[11px] font-extrabold text-[#8E244D] tabular-nums">
                          {opt.price.toLocaleString('en-US')} دج
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.secondaryOptions && product.secondaryOptions.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#2A151D] mb-2">خيار إضافي:</label>
                <div className="flex flex-wrap gap-2">
                  {product.secondaryOptions.map((sec) => {
                    const active = sec === selectedSecondary;
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setSelectedSecondary(sec)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          active
                            ? 'bg-[#8E244D] text-white border-[#8E244D]'
                            : 'bg-white text-[#2A151D] border-[#F2D7DF] hover:border-[#8E244D]/50'
                        }`}
                      >
                        {sec}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {isAmericanShawl ? (
              <div>
                <label className="block text-xs font-bold text-[#2A151D] mb-2">
                  اكتب لون الشال (لونين):
                </label>
                <input
                  type="text"
                  value={customColorText}
                  onChange={(e) => setCustomColorText(e.target.value)}
                  placeholder="مثال: أسود وذهبي، أو كحلي وأبيض..."
                  className="w-full px-3.5 py-3 rounded-xl border border-[#F2D7DF] bg-[#FFF9FA] text-sm font-semibold text-[#2A151D] placeholder:text-[#9E7D89] focus:outline-none focus:border-[#8E244D]"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#2A151D] mb-2">
                  اختر اللون: <span className="text-[#8E244D]">{selectedColor.name}</span>
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {CAP_SWATCHES.map((swatch) => {
                    const isActive = swatch.name === selectedColor.name;
                    const hasPhoto = Boolean(product.colorImages?.[swatch.name]);
                    return (
                      <button
                        key={swatch.name}
                        type="button"
                        title={swatch.name}
                        onClick={() => setSelectedColor(swatch)}
                        className={`relative w-8 h-8 rounded-full border flex items-center justify-center transition-transform cursor-pointer ${
                          isActive
                            ? 'ring-2 ring-[#8E244D] ring-offset-2 ring-offset-white scale-110 border-[#8E244D]'
                            : 'border-[#F2D7DF]'
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                      >
                        {isActive && (
                          <Check
                            className={`w-4 h-4 ${
                              swatch.hex === '#f5f5f4' || swatch.hex === '#e7d8c9' || swatch.hex === '#9ca3af'
                                ? 'text-[#2A151D]'
                                : 'text-white'
                            }`}
                          />
                        )}
                        {hasPhoto && !isActive && (
                          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#8E244D] border border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isAdminMode && (
                  <div className="mt-3 p-3 rounded-xl bg-[#FFF9FA] border border-[#F2D7DF] flex flex-wrap items-center justify-between gap-2">
                    <input
                      ref={colorFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleColorFileChange}
                    />
                    <span className="text-xs font-bold text-[#2A151D]">
                      صورة لون "{selectedColor.name}":
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => colorFileRef.current?.click()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8E244D] hover:bg-[#6D1839] text-white text-xs font-bold cursor-pointer"
                      >
                        <ImagePlus className="w-3.5 h-3.5" />
                        <span>{hasDedicatedColorImg ? 'تغيير صورة اللون' : 'رفع صورة لهذا اللون'}</span>
                      </button>
                      {hasDedicatedColorImg && (
                        <button
                          type="button"
                          onClick={() => onSetColorImage?.(selectedColor.name, null)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3] text-xs font-bold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {product.category === 'shawl' && (
              <div className="pt-3 border-t border-[#F2D7DF] space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#2A151D] mb-2">
                    لون خيط التطريز: <span className="text-[#8E244D]">{selectedThreadColor.name}</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {THREAD_COLORS.map((t) => {
                      const active = t.hex === selectedThreadColor.hex;
                      return (
                        <button
                          key={t.hex}
                          type="button"
                          title={t.name}
                          onClick={() => setSelectedThreadColor(t)}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center cursor-pointer transition-transform ${
                            active
                              ? 'ring-2 ring-[#8E244D] ring-offset-2 ring-offset-white scale-110 border-[#8E244D]'
                              : 'border-[#F2D7DF]'
                          }`}
                          style={{ backgroundColor: t.hex }}
                        >
                          {active && (
                            <Check
                              className={`w-3.5 h-3.5 ${
                                t.hex === '#ffffff' || t.hex === '#e2e8f0'
                                  ? 'text-[#2A151D]'
                                  : 'text-white'
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A151D] mb-1.5">
                    الاسم والعبارة المطلوب تطريزها على الوشاح:
                  </label>
                  <input
                    type="text"
                    value={embroideredText}
                    onChange={(e) => setEmbroideredText(e.target.value)}
                    placeholder="مثال: دعاء بن خالد · دفعة 2026 / جامعة الجزائر"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F2D7DF] bg-[#FFF9FA] text-xs text-[#2A151D] placeholder:text-[#9E7D89]"
                  />
                </div>
              </div>
            )}

            {(isAdminMode || !product.hideSizing) && (
              <div className={`pt-3 border-t border-[#F2D7DF] space-y-3 ${product.hideSizing ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#2A151D]">المقاس:</label>
                  {isAdminMode && onToggleField && (
                    <button
                      type="button"
                      onClick={() => onToggleField('hideSizing')}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                        product.hideSizing
                          ? 'bg-[#EBF9F2] text-[#147A53] border border-[#BEEBD4]'
                          : 'bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]'
                      }`}
                    >
                      {product.hideSizing ? '+ إظهار للزبائن' : '✕ حذف وإخفاء'}
                    </button>
                  )}
                </div>
                {!product.hideSizing && (
                  <>
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-[#FFF3F6] border border-[#F2D7DF]">
                      {(['نسائي', 'رجالي'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGender(g)}
                          className={`py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            gender === g
                              ? 'bg-[#8E244D] text-white shadow-sm'
                              : 'text-[#6E4E5A] hover:text-[#2A151D]'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {['XS', 'S', 'M', 'L', 'XL'].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            setStandardSize(sz);
                            setNumericSize('');
                          }}
                          className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                            !numericSize && standardSize === sz
                              ? 'bg-[#8E244D] text-white border-[#8E244D]'
                              : 'bg-white text-[#2A151D] border-[#F2D7DF] hover:border-[#8E244D]/50'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#6E4E5A] mb-1">
                          أو رقم مقاسك (34 - 70):
                        </label>
                        <input
                          type="number"
                          min={34}
                          max={70}
                          value={numericSize}
                          onChange={(e) => setNumericSize(e.target.value)}
                          placeholder="44 - 70"
                          className="w-full px-3 py-2 rounded-xl border border-[#F2D7DF] bg-[#FFF9FA] text-xs text-[#2A151D] placeholder:text-[#9E7D89]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#6E4E5A] mb-1">
                          الطول الكامل (80 - 200 سم):
                        </label>
                        <input
                          type="number"
                          min={80}
                          max={200}
                          value={fullLength}
                          onChange={(e) => setFullLength(e.target.value)}
                          placeholder="سم"
                          className="w-full px-3 py-2 rounded-xl border border-[#F2D7DF] bg-[#FFF9FA] text-xs text-[#2A151D] placeholder:text-[#9E7D89]"
                        />
                      </div>
                    </div>

                    <input
                      type="text"
                      value={shoulderAndSleeve}
                      onChange={(e) => setShoulderAndSleeve(e.target.value)}
                      placeholder="عرض الكتفين وطول الكم (اختياري)..."
                      className="w-full px-3 py-2 rounded-xl border border-[#F2D7DF] bg-[#FFF9FA] text-xs text-[#2A151D] placeholder:text-[#9E7D89]"
                    />
                  </>
                )}
              </div>
            )}

            {product.category !== 'accessories' &&
              product.category !== 'cap' &&
              (isAdminMode || !product.hideCapDetails) && (
                <div className={`pt-3 border-t border-[#F2D7DF] space-y-3 ${product.hideCapDetails ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#2A151D]">القبعة وتفاصيلها:</label>
                    {isAdminMode && onToggleField && (
                      <button
                        type="button"
                        onClick={() => onToggleField('hideCapDetails')}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer ${
                          product.hideCapDetails
                            ? 'bg-[#EBF9F2] text-[#147A53] border border-[#BEEBD4]'
                            : 'bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]'
                        }`}
                      >
                        {product.hideCapDetails ? '+ إظهار للزبائن' : '✕ حذف وإخفاء'}
                      </button>
                    )}
                  </div>

                  {!product.hideCapDetails && (
                    <>
                      <div className="grid grid-cols-3 items-stretch gap-2 min-w-0">
                        {CAP_STYLES.map((cap) => {
                          const active = selectedCapStyle.id === cap.id;
                          const capImgSrc = customCapImages[cap.id] || cap.image;
                          return (
                            <button
                              key={cap.id}
                              type="button"
                              onClick={() => setSelectedCapStyle(cap)}
                              className={`min-w-0 w-full p-1.5 sm:p-2 rounded-2xl border text-center cursor-pointer flex flex-col items-center overflow-hidden transition-colors ${
                                active
                                  ? 'border-[#8E244D] ring-2 ring-[#8E244D]/20 bg-[#FCE8EF]/50'
                                  : 'border-[#F2D7DF] bg-white hover:border-[#8E244D]/45'
                              }`}
                            >
                              <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden bg-[#FFF9FA] flex items-center justify-center">
                                <img
                                  src={capImgSrc}
                                  alt={cap.label}
                                  loading="lazy"
                                  className="block w-full h-full object-contain p-1.5"
                                />
                              </div>

                              <div className="mt-2 w-full min-w-0 flex flex-col items-center">
                                <span className="block w-full text-[10px] sm:text-[11px] font-extrabold text-[#2A151D] leading-tight text-center break-words">
                                  {cap.label}
                                </span>
                                <span className="text-[10px] sm:text-[11px] font-bold text-[#8E244D] mt-0.5 tabular-nums">
                                  {cap.priceText}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {isAdminMode && (
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          {CAP_STYLES.map((cap) => (
                            <label
                              key={cap.id + '-upload'}
                              className="cursor-pointer flex items-center justify-center gap-1 py-1.5 px-1 rounded-lg bg-[#FFF9FA] border border-[#F2D7DF] hover:border-[#8E244D] text-[10px] font-bold text-[#2A151D] text-center"
                            >
                              <ImagePlus className="w-3 h-3 text-[#8E244D] shrink-0" />
                              <span className="truncate">
                                صورة {cap.label.replace('القبعة ', '').replace('قبعة ', '')}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleCapImageUpload(cap.id, e)}
                              />
                            </label>
                          ))}
                        </div>
                      )}

                      <label className="block text-xs font-bold text-[#2A151D] pt-1">لون القبعة:</label>
                      <div className="grid grid-cols-2 gap-2 p-1 rounded-full bg-[#FFF3F6] border border-[#F2D7DF]">
                        <button
                          type="button"
                          onClick={() => setCapSameColor(true)}
                          className={`py-2 rounded-full text-xs font-bold cursor-pointer ${
                            capSameColor
                              ? 'bg-[#8E244D] text-white shadow-sm'
                              : 'text-[#6E4E5A]'
                          }`}
                        >
                          نفس لون الوشاح
                        </button>
                        <button
                          type="button"
                          onClick={() => setCapSameColor(false)}
                          className={`py-2 rounded-full text-xs font-bold cursor-pointer ${
                            !capSameColor
                              ? 'bg-[#8E244D] text-white shadow-sm'
                              : 'text-[#6E4E5A]'
                          }`}
                        >
                          لون آخر
                        </button>
                      </div>

                      {!capSameColor && (
                        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#FFF9FA] border border-[#F2D7DF]">
                          {CAP_SWATCHES.map((sw) => (
                            <button
                              key={sw.name}
                              type="button"
                              title={sw.name}
                              onClick={() => setCapCustomColor(sw)}
                              className={`w-6 h-6 rounded-full border cursor-pointer ${
                                capCustomColor.name === sw.name
                                  ? 'ring-2 ring-[#8E244D] ring-offset-1 ring-offset-white scale-110'
                                  : 'border-[#F2D7DF]'
                              }`}
                              style={{ backgroundColor: sw.hex }}
                            />
                          ))}
                          <span className="text-[11px] font-bold text-[#8E244D] mr-1">
                            {capCustomColor.name}
                          </span>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-[#2A151D] mb-1">
                          محيط الرأس (اختياري، 45 - 70 سم):
                        </label>
                        <input
                          type="number"
                          min={45}
                          max={70}
                          value={headSize}
                          onChange={(e) => setHeadSize(e.target.value)}
                          placeholder="45 - 70 سم"
                          className="w-full px-3 py-2 rounded-xl border border-[#F2D7DF] bg-[#FFF9FA] text-xs text-[#2A151D] placeholder:text-[#9E7D89]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {(['سطح القبعة', 'جبهة القبعة'] as const).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => setCapEmbroideryPos(pos)}
                            className={`py-2 px-2.5 rounded-full border text-xs font-bold cursor-pointer ${
                              capEmbroideryPos === pos
                                ? 'bg-[#8E244D] text-white border-[#8E244D]'
                                : 'bg-white text-[#2A151D] border-[#F2D7DF]'
                            }`}
                          >
                            طرّز على {pos}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={capNotes}
                        onChange={(e) => setCapNotes(e.target.value)}
                        placeholder="ملاحظات للقبعة (مثلاً: الاسم على الجبهة بخيط ذهبي)..."
                        className="w-full px-3 py-2 rounded-xl border border-[#F2D7DF] bg-[#FFF9FA] text-xs text-[#2A151D] placeholder:text-[#9E7D89]"
                      />
                    </>
                  )}
                </div>
              )}

            <div className="pt-3 border-t border-[#F2D7DF] space-y-2.5">
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="ملاحظات إضافية للوشاح أو التطريز (اختياري)..."
                className="w-full px-3 py-2.5 rounded-xl border border-[#F2D7DF] bg-[#FFF9FA] text-xs text-[#2A151D] placeholder:text-[#9E7D89]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#F2D7DF] flex items-center justify-between gap-4">
            <div>
              <span className="block text-xs text-[#6E4E5A]">الإجمالي</span>
              <span className="text-2xl font-extrabold text-[#8E244D] tabular-nums">
                {displayPrice.toLocaleString('en-US')} دج
              </span>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 max-w-xs inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#8E244D] hover:bg-[#6D1839] text-white text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>أضف إلى السلة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  product,
  isAdminMode,
  onSelect,
  onEdit,
  onDelete,
  onReplaceImage,
  onRemoveImage,
  isMorphing,
}: {
  product: Product;
  isAdminMode: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReplaceImage: (file: File) => void;
  onRemoveImage: () => void;
  isMorphing?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (file) {
      setImgError(false);
      onReplaceImage(file);
      e.target.value = '';
    }
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`هل أنت متأكد من حذف هذا الموديل نهائياً؟\n\n"${product.name}"`)) {
      onDelete();
    }
  };

  const hasValidImage = Boolean(product.imageUrl) && !imgError;

  return (
    <article
      onClick={onSelect}
      className="group bg-white border border-[#F2D7DF] rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-[#8E244D]/50 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full bg-[#FFF3F6] overflow-hidden">
        {hasValidImage ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            style={isMorphing ? MORPH_STYLE : undefined}
            className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center bg-gradient-to-br from-[#FFF3F6] to-[#FCE8EF]">
            <ShoppingBag className="w-7 h-7 text-[#8E244D] mb-2 opacity-80" />
            <span className="font-editorial text-sm font-bold text-[#2A151D]">
              {product.name}
            </span>
            {isAdminMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-2.5 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8E244D] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                <ImagePlus className="w-3.5 h-3.5" />
                <span>إضافة صورة</span>
              </button>
            )}
          </div>
        )}

        {isAdminMode && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 left-2 right-2 flex flex-wrap items-center justify-between gap-1 z-10"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/95 text-[#2A151D] border border-[#F2D7DF] text-[11px] font-bold shadow-sm hover:bg-[#FCE8EF] cursor-pointer"
              >
                <ImagePlus className="w-3 h-3 text-[#8E244D]" />
                <span>{hasValidImage ? 'تغيير' : 'إضافة'}</span>
              </button>

              {hasValidImage && (
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/95 text-[#9F580A] border border-[#F5D69E] text-[11px] font-bold shadow-sm hover:bg-[#FFF8EB] cursor-pointer"
                >
                  <ImageOff className="w-3 h-3" />
                  <span>حذف الصورة</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/95 text-[#2A151D] border border-[#F2D7DF] text-[11px] font-bold shadow-sm hover:bg-[#FCE8EF] cursor-pointer"
              >
                <Pencil className="w-3 h-3 text-[#8E244D]" />
                <span>تعديل</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#BE123C] text-white text-[11px] font-bold shadow-sm hover:bg-[#9F1239] cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>حذف</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 text-center flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-editorial text-lg font-bold text-[#2A151D] leading-snug">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm font-extrabold text-[#8E244D] mt-1 tabular-nums">
            من {product.basePrice.toLocaleString('en-US')} دج
          </p>
          <p className="text-[11px] text-[#6E4E5A] mt-0.5">{product.branch}</p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#F2D7DF]">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8E244D] group-hover:underline">
            <span>اختيار اللون والمقاس</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

export function ProductCatalog({
  products,
  isAdminMode,
  onAddToCart,
  onOpenAddProduct,
  onEditProduct,
  onDeleteProduct,
  onReplaceProductImage,
  onRemoveProductImage,
  onSetProductColorImage,
  onToggleProductField,
}: ProductCatalogProps) {
  const [selectedSection, setSelectedSection] = useState<CategoryId | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeBranch, setActiveBranch] = useState<string>('الكل');
  const [morphProductId, setMorphProductId] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      withViewTransition(() => {
        const state = event.state;
        if (state && state.catalogLevel === 'product') {
          setSelectedSection(state.section || null);
          setSelectedProductId(state.productId || null);
        } else if (state && state.catalogLevel === 'section') {
          setSelectedSection(state.section || null);
          setSelectedProductId(null);
        } else {
          setSelectedSection(null);
          setSelectedProductId(null);
        }
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenSection = (cat: CategoryId) => {
    withViewTransition(() => {
      window.history.pushState({ catalogLevel: 'section', section: cat }, '');
      setSelectedSection(cat);
      setSelectedProductId(null);
      setActiveBranch('الكل');
    });
  };

  const handleOpenProduct = (productId: string) => {
    flushSync(() => setMorphProductId(productId));

    withViewTransition(
      () => {
        window.history.pushState(
          { catalogLevel: 'product', section: selectedSection, productId },
          ''
        );
        setSelectedProductId(productId);
      },
      () => setMorphProductId(null)
    );
  };

  const handleBackToHome = () => {
    withViewTransition(() => {
      setSelectedSection(null);
      setSelectedProductId(null);
      setActiveBranch('الكل');
    });
  };

  const handleBackToSection = () => {
    const pid = selectedProductId;
    if (pid) {
      flushSync(() => setMorphProductId(pid));
    }
    withViewTransition(
      () => setSelectedProductId(null),
      () => setMorphProductId(null)
    );
  };

  const activeSectionMeta = MAIN_SECTIONS.find((s) => s.id === selectedSection);
  const selectedProduct = products.find((p) => p.id === selectedProductId) || null;

  const sectionProducts = products.filter((p) => {
    if (!selectedSection) return false;
    if (selectedSection === 'accessories') {
      return p.category === 'accessories' || p.category === 'cap';
    }
    return p.category === selectedSection;
  });

  const branches =
    selectedSection && CATEGORY_BRANCHES[selectedSection]
      ? CATEGORY_BRANCHES[selectedSection]
      : [];

  const filteredProducts = sectionProducts.filter((p) => {
    if (activeBranch !== 'الكل' && p.branch !== activeBranch) return false;
    return true;
  });

  return (
    <div key={selectedProductId || selectedSection || 'home'} className="catalog-enter">
      <section id="catalog-sec" className="py-12 sm:py-16 border-b border-[#F2D7DF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {selectedProduct && activeSectionMeta ? (
            <ProductDetailView
              product={selectedProduct}
              sectionTitle={activeSectionMeta.title}
              onBackToHome={handleBackToHome}
              onBackToSection={handleBackToSection}
              onAddToCart={onAddToCart}
              isAdminMode={isAdminMode}
              isMorphing={morphProductId === selectedProduct.id}
              onSetColorImage={(colorName, file) =>
                onSetProductColorImage?.(selectedProduct.id, colorName, file)
              }
              onToggleField={(field) => onToggleProductField?.(selectedProduct.id, field)}
              onEdit={() => onEditProduct(selectedProduct)}
              onDelete={() => {
                onDeleteProduct(selectedProduct.id);
                handleBackToHome();
              }}
              onReplaceImage={(file) => onReplaceProductImage(selectedProduct.id, file)}
            />
          ) : selectedSection && activeSectionMeta ? (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#6E4E5A]">
                  <button
                    type="button"
                    onClick={handleBackToHome}
                    className="hover:text-[#8E244D] underline cursor-pointer"
                  >
                    الرئيسية
                  </button>
                  <ChevronLeft className="w-3.5 h-3.5 text-[#8E244D]/60" />
                  <span className="text-[#2A151D]">{activeSectionMeta.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBackToHome}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#F2D7DF] text-xs font-bold text-[#2A151D] hover:bg-[#FCE8EF] cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-[#8E244D]" />
                    <span>كل الأقسام</span>
                  </button>

                  {isAdminMode && (
                    <button
                      type="button"
                      onClick={() => onOpenAddProduct(selectedSection)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#8E244D] hover:bg-[#6D1839] text-white text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة قطعة للقسم</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#2A151D]">
                  {activeSectionMeta.title}
                </h2>
                <p className="text-sm text-[#6E4E5A] mt-1.5 max-w-xl">
                  {activeSectionMeta.subtitle}
                </p>
              </div>

              {branches.length > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-6 pb-3 border-b border-[#F2D7DF]">
                  {branches.map((branch) => {
                    const active = activeBranch === branch;
                    return (
                      <button
                        key={branch}
                        type="button"
                        onClick={() => setActiveBranch(branch)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#8E244D] text-white'
                            : 'bg-white border border-[#F2D7DF] text-[#6E4E5A] hover:text-[#2A151D] hover:bg-[#FCE8EF]/60'
                        }`}
                      >
                        {branch}
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredProducts.length === 0 ? (
                <div className="bg-white border border-[#F2D7DF] rounded-2xl p-10 text-center">
                  <p className="text-sm font-semibold text-[#6E4E5A]">
                    لا توجد قطع في هذا القسم حالياً.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <SectionCard
                      key={product.id}
                      product={product}
                      isAdminMode={isAdminMode}
                      isMorphing={morphProductId === product.id}
                      onSelect={() => handleOpenProduct(product.id)}
                      onEdit={() => onEditProduct(product)}
                      onDelete={() => onDeleteProduct(product.id)}
                      onReplaceImage={(file) => onReplaceProductImage(product.id, file)}
                      onRemoveImage={() => onRemoveProductImage?.(product.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <p className="inline-block px-3 py-0.5 rounded-full bg-[#FCE8EF] border border-[#F2D7DF] text-xs font-bold text-[#8E244D] mb-2">
                    اختر القسم المناسب
                  </p>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2A151D]">
                    أقسام دار الأزياء
                  </h2>
                </div>

                {isAdminMode && (
                  <button
                    type="button"
                    onClick={() => onOpenAddProduct('shawl')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8E244D] hover:bg-[#6D1839] text-white text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة موديل جديد</span>
                  </button>
                )}
              </div>

              <div className="space-y-5">
                {MAIN_SECTIONS.map((sec) => {
                  const firstProdWithImg = products.find(
                    (p) =>
                      (sec.id === 'accessories'
                        ? p.category === 'accessories' || p.category === 'cap'
                        : p.category === sec.id) && p.imageUrl
                  );
                  const coverImg = firstProdWithImg?.imageUrl || sec.fallbackImg;

                  return (
                    <div
                      key={sec.id}
                      onClick={() => handleOpenSection(sec.id)}
                      className="group bg-white border border-[#F2D7DF] rounded-3xl overflow-hidden grid grid-cols-1 sm:grid-cols-12 cursor-pointer transition-all duration-200 hover:shadow-xl hover:border-[#8E244D]/50"
                    >
                      <div className="sm:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                        <div>
                          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2A151D]">
                            {sec.title}
                          </h3>
                          <p className="text-sm text-[#6E4E5A] leading-relaxed mt-2">
                            {sec.subtitle}
                          </p>
                          <p className="inline-block px-3 py-1 rounded-full bg-[#FCE8EF] text-sm font-extrabold text-[#8E244D] mt-3 tabular-nums">
                            {sec.priceLabel}
                          </p>
                        </div>

                        <div className="mt-5">
                          <span className="inline-flex items-center justify-center w-full sm:w-auto px-7 py-3 rounded-full bg-[#8E244D] group-hover:bg-[#6D1839] text-white text-sm font-bold transition-colors">
                            {sec.buttonText}
                          </span>
                        </div>
                      </div>

                      <div className="sm:col-span-5 aspect-[4/3] sm:aspect-auto bg-[#FFF3F6] overflow-hidden">
                        <img
                          src={coverImg}
                          alt={sec.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
