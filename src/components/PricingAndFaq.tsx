import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS, PRICING_TABLE_ROWS } from '../data/defaultStore';

interface PricingAndFaqProps {
  pricesTitle: string;
  pricesSubtitle: string;
}

export function PricingAndFaq({ pricesTitle, pricesSubtitle }: PricingAndFaqProps) {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Official Pricing Matrix */}
        <div id="prices-sec" className="lg:col-span-7">
          <p className="inline-block px-3 py-0.5 rounded-full bg-[#FCE8EF] border border-[#F2D7DF] text-xs font-bold text-[#8E244D] mb-2">
            شفافية الأسعار
          </p>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2A151D] mb-2">
            {pricesTitle}
          </h2>
          <p className="text-sm text-[#6E4E5A] mb-6">{pricesSubtitle}</p>

          <div className="bg-white border border-[#F2D7DF] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FCE8EF] border-b border-[#F2D7DF] text-[#8E244D]">
                    <th className="py-3.5 px-4 font-bold">القطعة / الموديل</th>
                    <th className="py-3.5 px-4 font-bold">كريب / عادي</th>
                    <th className="py-3.5 px-4 font-bold">دان / خليجي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2D7DF]">
                  {PRICING_TABLE_ROWS.map((row) => (
                    <tr key={row.name} className="hover:bg-[#FFF9FA] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#2A151D]">
                        {row.name}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#8E244D] tabular-nums whitespace-nowrap">
                        {row.crepe.toLocaleString('en-US')} دج
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#8E244D] tabular-nums whitespace-nowrap">
                        {row.dan.toLocaleString('en-US')} دج
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 bg-[#FFF9FA] border-t border-[#F2D7DF] text-xs text-[#6E4E5A]">
              تطريز الاسم والدفعة مشمول مجاناً في جميع الشالات · قبعة التوكسيدو +100 دج.
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div id="faq-sec" className="lg:col-span-5">
          <p className="inline-block px-3 py-0.5 rounded-full bg-[#FCE8EF] border border-[#F2D7DF] text-xs font-bold text-[#8E244D] mb-2">
            تفاصيل الطلب والتوصيل
          </p>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#2A151D] mb-2">
            الأسئلة الشائعة
          </h2>
          <p className="text-sm text-[#6E4E5A] mb-6">
            كل ما تحتاج معرفته عن التجهيز، العربون، والتوصيل في الجزائر.
          </p>

          <div className="bg-white border border-[#F2D7DF] rounded-2xl divide-y divide-[#F2D7DF] shadow-sm">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-right text-sm font-bold text-[#2A151D] hover:bg-[#FFF9FA] transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#8E244D] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-[#6E4E5A] leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
