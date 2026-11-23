import { useState } from 'react';
import { ArrowDownLeft, Sparkles } from 'lucide-react';
import { HERO_IMAGE_PATH } from '../data/defaultStore';
import { StoreCopy } from '../types/store';

interface HeroSectionProps {
  copy: StoreCopy;
}

const TRUST_HIGHLIGHTS = [
  {
    title: 'لا تدفع شيئاً عند الطلب',
    desc: 'نراجع معك كل تفاصيل التطريز والمقاس عبر WhatsApp أولاً.',
  },
  {
    title: 'عربون 30% فقط بعد التأكيد',
    desc: 'يدفع الباقي عند استلام طقم تخرجك جاهزاً.',
  },
  {
    title: 'موعد تسليم من اختيارك',
    desc: 'تجهيز متقن يبدأ من 7 أيام حسب جدول حفلك.',
  },
  {
    title: 'توصيل لـ 58 ولاية',
    desc: 'شحن إلى باب المنزل أو الاستلام من مكتب التوصيل.',
  },
];

export function HeroSection({ copy }: HeroSectionProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="top" className="relative border-b border-[#F2D7DF] bg-[#FFF9FA]/85">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-10 sm:pt-12 sm:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Editorial Copy Column */}
          <div className="lg:col-span-6 flex flex-col justify-center py-2 lg:py-6">
            <p className="inline-block self-start px-3 py-1 rounded-full bg-[#FCE8EF] border border-[#F2D7DF] text-xs sm:text-sm font-bold tracking-wide text-[#8E244D] mb-3.5">
              {copy.heroEyebrow} · الجزائر
            </p>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[2.85rem] font-bold leading-[1.25] text-[#2A151D] max-w-xl [text-wrap:balance] mb-4">
              {copy.heroTitle}
            </h1>

            <p className="text-sm sm:text-base text-[#6E4E5A] leading-relaxed max-w-lg mb-7">
              {copy.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-7">
              <a
                href="#studio-sec"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#8E244D] hover:bg-[#6D1839] text-white text-sm font-bold transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                <span>صمّم وشاحك الآن</span>
                <ArrowDownLeft className="w-4 h-4" />
              </a>
              <a
                href="#catalog-sec"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white hover:bg-[#FCE8EF] text-[#2A151D] border border-[#F2D7DF] text-sm font-bold transition-colors whitespace-nowrap shrink-0"
              >
                <span>تصفح المجموعة</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-[#6E4E5A] pt-4 border-t border-[#F2D7DF]">
              <span>
                الشال مع القبعة من{' '}
                <strong className="text-[#8E244D] tabular-nums">3,800 دج</strong>
              </span>
              <span aria-hidden="true" className="text-[#F2D7DF]">·</span>
              <span>
                الروب الأكاديمي{' '}
                <strong className="text-[#8E244D] tabular-nums">2,500 دج</strong>
              </span>
              <span aria-hidden="true" className="text-[#F2D7DF]">·</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FCE8EF] text-[#8E244D] font-bold text-xs">
                التطريز مجاني
              </span>
            </div>
          </div>

          {/* Editorial Photography Column */}
          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[300px] sm:min-h-[380px] rounded-2xl overflow-hidden border border-[#F2D7DF] bg-white shadow-lg">
              {!imgError ? (
                <>
                  <img
                    src={HERO_IMAGE_PATH}
                    alt="طقم تخرج فاخر من DG by Douaa باللون العنابي والذهبي يشمل روباً ووشاحاً مطرزاً وقبعة"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full lg:h-full object-cover"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2A151D]/20 via-transparent to-transparent"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#FFF3F6] to-[#FCE8EF]">
                  <Sparkles className="w-8 h-8 text-[#8E244D] mb-3" />
                  <span className="font-editorial text-xl font-bold text-[#2A151D]">
                    DG by Douaa Atelier
                  </span>
                  <span className="text-xs text-[#6E4E5A] mt-1">
                    أزياء التخرج المصممة خصيصاً في الجزائر
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Atelier Trust Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[#F2D7DF]">
          {TRUST_HIGHLIGHTS.map((item, idx) => (
            <div
              key={item.title}
              className="bg-white border border-[#F2D7DF] rounded-xl p-4 sm:p-5 hover:border-[#8E244D]/45 transition-colors shadow-xs"
            >
              <div className="inline-block px-2 py-0.5 rounded-md bg-[#FCE8EF] text-xs font-bold text-[#8E244D] tabular-nums mb-2">
                0{idx + 1}.
              </div>
              <h2 className="text-sm font-bold text-[#2A151D] mb-1">
                {item.title}
              </h2>
              <p className="text-xs text-[#6E4E5A] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
