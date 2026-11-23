import { ChangeEvent, useRef } from 'react';
import { ShoppingBag, CloudUpload, LogOut, Type, ImagePlus, Plus } from 'lucide-react';
import { BRAND_LOGO_PATH } from '../data/defaultStore';

interface HeaderProps {
  brandName: string;
  logoUrl: string;
  cartCount: number;
  isAdminMode: boolean;
  isSaving: boolean;
  onOpenCart: () => void;
  onPublish: () => void;
  onLogout: () => void;
  onOpenCopyEditor: () => void;
  onOpenAddProduct: () => void;
  onUploadLogo: (file: File) => void;
}

export function Header({
  brandName,
  logoUrl,
  cartCount,
  isAdminMode,
  isSaving,
  onOpenCart,
  onPublish,
  onLogout,
  onOpenCopyEditor,
  onOpenAddProduct,
  onUploadLogo,
}: HeaderProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const activeLogo = logoUrl || BRAND_LOGO_PATH;
  const isDefaultEmblem = !logoUrl;

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadLogo(file);
      e.target.value = '';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFF9FA]/92 backdrop-blur-md border-b border-[#F2D7DF]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Emblem & Single-line Wordmark */}
          <a
            href="#top"
            className="flex items-center gap-2.5 shrink-0 whitespace-nowrap group"
          >
            {isDefaultEmblem ? (
              <div className="relative h-10 w-10 shrink-0 isolate bg-white rounded-md overflow-hidden mix-blend-multiply">
                <img
                  src={activeLogo}
                  alt={brandName}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-contain"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[#8E244D] mix-blend-screen"
                />
              </div>
            ) : (
              <img
                src={activeLogo}
                alt={brandName}
                referrerPolicy="no-referrer"
                className="h-10 w-10 shrink-0 rounded-md object-cover border border-[#F2D7DF]"
              />
            )}
            <span className="font-editorial text-xl sm:text-2xl font-bold tracking-wide text-[#2A151D] group-hover:text-[#8E244D] transition-colors whitespace-nowrap shrink-0">
              {brandName}
            </span>
          </a>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav
            className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#6E4E5A]"
            aria-label="التنقل الرئيسي"
          >
            <a
              href="#studio-sec"
              className="hover:text-[#8E244D] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#8E244D]"
            >
              صمّم وشاحك
            </a>
            <a
              href="#catalog-sec"
              className="hover:text-[#8E244D] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#8E244D]"
            >
              المجموعة
            </a>
            <a
              href="#prices-sec"
              className="hover:text-[#8E244D] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#8E244D]"
            >
              الأسعار
            </a>
            <a
              href="#faq-sec"
              className="hover:text-[#8E244D] transition-colors whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#8E244D]"
            >
              الأسئلة
            </a>
          </nav>

          {/* Zone 3: Single primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8E244D] hover:bg-[#6D1839] text-white text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>الحقيبة</span>
              <span className="tabular-nums font-extrabold">({cartCount})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Atelier Bar (only visible when authenticated via Supabase Auth) */}
      {isAdminMode && (
        <div
          className="bg-white text-[#2A151D] border-b border-[#F2D7DF]"
          role="region"
          aria-label="لوحة إدارة المتجر"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs sm:text-sm">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FCE8EF] font-bold text-[#8E244D]">
                وضع الإدارة مفعّل
              </span>
              <span className="mx-2 text-[#F2D7DF]">·</span>
              <span className="text-[#6E4E5A]">
                احفظ التعديلات ليظهر التحديث لجميع الزوار
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FFF3F6] hover:bg-[#FCE8EF] border border-[#F2D7DF] text-xs font-semibold text-[#2A151D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ImagePlus className="w-3.5 h-3.5 text-[#8E244D]" />
                <span>تغيير الشعار</span>
              </button>
              <button
                type="button"
                onClick={onOpenCopyEditor}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FFF3F6] hover:bg-[#FCE8EF] border border-[#F2D7DF] text-xs font-semibold text-[#2A151D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Type className="w-3.5 h-3.5 text-[#8E244D]" />
                <span>تعديل النصوص</span>
              </button>
              <button
                type="button"
                onClick={onOpenAddProduct}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FFF3F6] hover:bg-[#FCE8EF] border border-[#F2D7DF] text-xs font-semibold text-[#2A151D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#8E244D]" />
                <span>إضافة موديل</span>
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={onPublish}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#8E244D] hover:bg-[#6D1839] text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>{isSaving ? 'جاري النشر...' : 'حفظ ونشر'}</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FFF9FA] hover:bg-[#FCE8EF] text-[#2A151D] border border-[#F2D7DF] text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-[#8E244D]" />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
