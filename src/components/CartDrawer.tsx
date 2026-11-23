import { FormEvent, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { ALGERIA_WILAYAS, WHATSAPP_NUMBER } from '../data/defaultStore';
import { CartItem } from '../types/store';
import { supabase } from '../lib/supabase';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

export function CartDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNotify,
}: CartDrawerProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('16 - الجزائر');
  const [commune, setCommune] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'home' | 'office'>('home');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [generatedOrderText, setGeneratedOrderText] = useState('');
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const minDateString = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }, []);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const deposit30 = Math.round(subtotal * 0.3);

  const buildOrderMessage = (savedOrderNum?: number | null) => {
    const lines = items
      .map((it, idx) => {
        const extraParts = [
          it.fabricType ? `القماش: ${it.fabricType}` : null,
          it.shawlColor ? `لون الشال: ${it.shawlColor}` : null,
          it.threadColor ? `لون التطريز: ${it.threadColor}` : null,
          it.embroideredText ? `التطريز: ${it.embroideredText}` : null,
          it.size ? `المقاس: ${it.size}` : null,
        ].filter(Boolean);
        const desc = it.details || extraParts.join(' · ');
        return `${idx + 1}. ${it.title}${desc ? ` [${desc}]` : ''} × ${
          it.quantity
        } — ${(it.unitPrice * it.quantity).toLocaleString('en-US')} دج`;
      })
      .join('\n');

    const methodText =
      deliveryMethod === 'home' ? 'توصيل إلى المنزل' : 'استلام من مكتب التوصيل';

    return [
      `*طلب جديد عبر متجر DG by Douaa 🎓*${savedOrderNum ? ` (#${savedOrderNum})` : ''}`,
      `👤 *الاسم:* ${fullName.trim()}`,
      `📱 *الهاتف:* ${phone.trim()}`,
      `📍 *الولاية:* ${wilaya}${commune.trim() ? ` - ${commune.trim()}` : ''}`,
      `🚚 *طريقة الاستلام:* ${methodText}`,
      `📅 *موعد التسليم المطلوب:* ${deliveryDate || 'أقرب موعد متاح'}`,
      `🛒 *الطلبات:*\n${lines}`,
      `💰 *المجموع التقديري:* ${subtotal.toLocaleString('en-US')} دج`,
      `💳 *العربون التقريبي (30% عند التأكيد):* ${deposit30.toLocaleString('en-US')} دج`,
      notes.trim() ? `📝 *ملاحظات:* ${notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join('\n');
  };

  const whatsappUrl = generatedOrderText
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(generatedOrderText)}`
    : '';

  const handlePrepareOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      onNotify('error', 'الحقيبة فارغة حالياً.');
      return;
    }
    if (!fullName.trim()) {
      setNameError('يرجى إدخال الاسم الكامل لتأكيد الطلب.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setPhoneError('يرجى إدخال رقم هاتف صحيح للتواصل والتوصيل.');
      return;
    }

    setNameError('');
    setPhoneError('');
    setIsSubmitting(true);

    try {
      let savedNumber: number | null = null;

      const richItems = items.map((i) => ({
        product_id: i.productId || null,
        title: i.title,
        category: i.category,
        fabric_type: i.fabricType || null,
        shawl_color: i.shawlColor || null,
        thread_color: i.threadColor || null,
        embroidered_text: i.embroideredText || null,
        size: i.size || null,
        details: i.details || '',
        quantity: i.quantity,
        unit_price: i.unitPrice,
        unitPrice: i.unitPrice,
        unit_cost: i.costPrice || 0,
      }));

      const totalCostPrice = items.reduce(
        (sum, item) => sum + (item.costPrice || 0) * item.quantity,
        0
      );

      if (supabase) {
        const { data, error } = await supabase
          .from('orders')
          .insert([
            {
              customer_name: fullName.trim(),
              phone: phone.trim(),
              wilaya,
              commune: commune.trim() || 'غير محددة',
              delivery_type: deliveryMethod,
              order_items: richItems,
              product_details: {
                items: richItems,
                deliveryDate: deliveryDate || null,
                notes: notes.trim() || null,
              },
              total_sell_price: subtotal,
              total_cost_price: totalCostPrice,
              status: 'جديد',
            },
          ])
          .select('order_number')
          .single();

        if (error) {
          console.error('Supabase order insert error:', error);
          onNotify('error', `فشل في حفظ الطلب: ${error.message}`);
          setIsSubmitting(false);
          return;
        } else if (data?.order_number) {
          savedNumber = data.order_number;
          setOrderNumber(savedNumber);
        }
      }

      const message = buildOrderMessage(savedNumber);
      setGeneratedOrderText(message);
      onNotify(
        'success',
        savedNumber
          ? `تم تسجيل طلبك رقم #${savedNumber} بنجاح! يمكنك متابعته عبر WhatsApp.`
          : 'تم تجهيز طلبك بنجاح. اضغطي على زر المتابعة عبر WhatsApp.'
      );
    } catch (err) {
      console.error(err);
      const message = buildOrderMessage(null);
      setGeneratedOrderText(message);
      onNotify('success', 'تم تجهيز طلبك. اضغطي على زر المتابعة عبر WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOrder = async () => {
    if (!generatedOrderText) return;
    try {
      await navigator.clipboard.writeText(generatedOrderText);
      setCopied(true);
      onNotify('success', 'تم نسخ تفاصيل الطلب بنجاح.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify('error', 'تعذر النسخ التلقائي. يمكنك تحديد النص ونسخه يدوياً.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#2A151D]/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="حقيبة التسوق وإرسال الطلب"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className="relative z-10 w-full max-w-md bg-[#FFF9FA] h-full flex flex-col border-r border-[#F2D7DF] shadow-2xl text-[#2A151D]">
        {/* Drawer Header */}
        <div className="px-5 py-4 bg-white border-b border-[#F2D7DF] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#8E244D]" />
            <h2 className="text-base font-bold text-[#2A151D]">
              حقيبة الطلب ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6E4E5A] hover:text-[#2A151D] hover:bg-[#FCE8EF] transition-colors cursor-pointer"
            aria-label="إغلاق الحقيبة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {items.length === 0 ? (
            <div className="bg-white border border-[#F2D7DF] rounded-2xl p-8 text-center">
              <ShoppingBag className="w-8 h-8 text-[#8E244D] mx-auto mb-3 opacity-80" />
              <p className="text-sm font-bold text-[#2A151D] mb-1">
                حقيبة الطلب فارغة
              </p>
              <p className="text-xs text-[#6E4E5A]">
                صمّمي وشاحك أو اختاري قطعك من المجموعة لإضافتها هنا.
              </p>
            </div>
          ) : (
            <>
              {/* Itemized List */}
              <div className="bg-white border border-[#F2D7DF] rounded-2xl divide-y divide-[#F2D7DF]">
                {items.map((item) => (
                  <div key={item.id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#2A151D] leading-snug">
                          {item.title}
                        </h3>
                        {item.details && (
                          <p className="text-xs text-[#6E4E5A] mt-1 leading-relaxed">
                            {item.details}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setGeneratedOrderText('');
                          onRemoveItem(item.id);
                        }}
                        className="p-1 text-[#6E4E5A] hover:text-[#BE123C] transition-colors shrink-0 cursor-pointer"
                        aria-label="حذف القطعة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="inline-flex items-center border border-[#F2D7DF] rounded-lg bg-[#FFF9FA]">
                        <button
                          type="button"
                          onClick={() => {
                            setGeneratedOrderText('');
                            onUpdateQuantity(item.id, -1);
                          }}
                          className="p-1.5 text-[#2A151D] hover:bg-[#FCE8EF] rounded-r-lg cursor-pointer"
                          aria-label="إنقاص الكمية"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold tabular-nums text-[#2A151D]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setGeneratedOrderText('');
                            onUpdateQuantity(item.id, 1);
                          }}
                          className="p-1.5 text-[#2A151D] hover:bg-[#FCE8EF] rounded-l-lg cursor-pointer"
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-extrabold text-[#8E244D] tabular-nums">
                        {(item.unitPrice * item.quantity).toLocaleString('en-US')} دج
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Summary */}
              <div className="bg-white border border-[#F2D7DF] rounded-2xl p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#6E4E5A]">المجموع التقديري</span>
                  <span className="text-lg font-extrabold text-[#2A151D] tabular-nums">
                    {subtotal.toLocaleString('en-US')} دج
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F2D7DF]">
                  <span className="text-[#6E4E5A]">
                    عربون التأكيد (30% بعد المراجعة)
                  </span>
                  <span className="font-bold text-[#8E244D] tabular-nums">
                    {deposit30.toLocaleString('en-US')} دج
                  </span>
                </div>
              </div>

              {/* Customer Checkout Form */}
              <form onSubmit={handlePrepareOrder} className="space-y-3">
                <h3 className="text-sm font-bold text-[#8E244D]">
                  بيانات التوصيل والتأكيد
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (nameError) setNameError('');
                      setGeneratedOrderText('');
                    }}
                    placeholder="الاسم واللقب"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#F2D7DF] bg-white text-sm text-[#2A151D] placeholder:text-[#9E7D89]"
                  />
                  {nameError && (
                    <p className="text-xs text-[#BE123C] font-semibold mt-1">
                      {nameError}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) setPhoneError('');
                        setGeneratedOrderText('');
                      }}
                      placeholder="05 / 06 / 07..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#F2D7DF] bg-white text-sm text-[#2A151D] placeholder:text-[#9E7D89]"
                    />
                    {phoneError && (
                      <p className="text-xs text-[#BE123C] font-semibold mt-1">
                        {phoneError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
                      موعد التسليم المطلوب
                    </label>
                    <input
                      type="date"
                      min={minDateString}
                      value={deliveryDate}
                      onChange={(e) => {
                        setDeliveryDate(e.target.value);
                        setGeneratedOrderText('');
                      }}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#F2D7DF] bg-white text-xs text-[#2A151D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
                      الولاية
                    </label>
                    <select
                      value={wilaya}
                      onChange={(e) => {
                        setWilaya(e.target.value);
                        setGeneratedOrderText('');
                      }}
                      className="w-full px-3 py-2.5 rounded-lg border border-[#F2D7DF] bg-white text-xs font-semibold text-[#2A151D]"
                    >
                      {ALGERIA_WILAYAS.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
                      البلدية
                    </label>
                    <input
                      type="text"
                      value={commune}
                      onChange={(e) => {
                        setCommune(e.target.value);
                        setGeneratedOrderText('');
                      }}
                      placeholder="اسم البلدية"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#F2D7DF] bg-white text-sm text-[#2A151D] placeholder:text-[#9E7D89]"
                    />
                  </div>
                </div>

                {/* Delivery Method Segmented Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryMethod('home');
                      setGeneratedOrderText('');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      deliveryMethod === 'home'
                        ? 'bg-[#8E244D] text-white border-[#8E244D]'
                        : 'bg-white text-[#6E4E5A] border-[#F2D7DF] hover:text-[#2A151D]'
                    }`}
                  >
                    توصيل للمنزل
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryMethod('office');
                      setGeneratedOrderText('');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      deliveryMethod === 'office'
                        ? 'bg-[#8E244D] text-white border-[#8E244D]'
                        : 'bg-white text-[#6E4E5A] border-[#F2D7DF] hover:text-[#2A151D]'
                    }`}
                  >
                    استلام من المكتب
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
                    ملاحظات المقاس أو التطريز
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      setGeneratedOrderText('');
                    }}
                    placeholder="تفاصيل المقاس (XS-XXL)، اللون، أو طلبات إضافية..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#F2D7DF] bg-white text-sm text-[#2A151D] placeholder:text-[#9E7D89]"
                  />
                </div>

                {!generatedOrderText ? (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-lg bg-[#8E244D] hover:bg-[#6D1839] disabled:opacity-60 text-white text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري حفظ الطلب...</span>
                      </>
                    ) : (
                      <span>تأكيد الطلب وإرساله</span>
                    )}
                  </button>
                ) : (
                  <div className="bg-[#FCE8EF]/60 border border-[#8E244D]/30 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-[#8E244D]">
                      {orderNumber
                        ? `تم حفظ طلبك رقم #${orderNumber} في النظام بنجاح!`
                        : 'ملخص طلبك جاهز للإرسال عبر WhatsApp:'}
                    </p>
                    <pre className="text-[11px] text-[#2A151D] bg-white p-2.5 rounded-lg border border-[#F2D7DF] whitespace-pre-wrap font-sans leading-relaxed max-h-36 overflow-y-auto">
                      {generatedOrderText}
                    </pre>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg bg-[#8E244D] hover:bg-[#6D1839] text-white text-xs font-bold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>متابعة عبر WhatsApp</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyOrder}
                        className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-lg bg-white border border-[#F2D7DF] text-[#2A151D] text-xs font-bold hover:bg-[#FCE8EF] transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-[#8E244D]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[#8E244D]" />
                        )}
                        <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setGeneratedOrderText('');
                    setOrderNumber(null);
                    onClearCart();
                  }}
                  className="text-xs font-semibold text-[#6E4E5A] hover:text-[#BE123C] transition-colors cursor-pointer"
                >
                  تفريغ الحقيبة
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
