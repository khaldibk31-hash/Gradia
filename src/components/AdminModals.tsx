import { FormEvent, useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Download,
  Loader2,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Send,
  Settings,
  ShoppingBag,
  TrendingUp,
  X,
} from 'lucide-react';
import { CATEGORY_LABELS } from '../data/defaultStore';
import { CategoryId, Product, ProductOption, StoreCopy } from '../types/store';
import { supabase } from '../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
}

export function AdminLoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState('khaldibk31@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('أدخلي البريد الإلكتروني وكلمة المرور.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onLogin(email.trim(), password);
      setPassword('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر تسجيل الدخول.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A151D]/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="دخول الإدارة"
    >
      <div className="bg-white border border-[#F2D7DF] rounded-2xl w-full max-w-sm p-6 shadow-2xl text-[#2A151D]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#8E244D]">دخول الإدارة</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#6E4E5A] hover:text-[#2A151D] cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#6E4E5A] mb-4">
          دخول خاص بالإدارة لمتابعة الطلبات والأرباح وتعديل المنتجات.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني للإدارة"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-sm text-[#2A151D]"
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-sm text-[#2A151D]"
          />

          {error && <p className="text-xs font-semibold text-[#BE123C]">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#8E244D] hover:bg-[#6D1839] text-white text-sm font-bold disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'جاري التحقق...' : 'دخول'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-lg bg-[#FCE8EF] hover:bg-[#F5D6E1] text-[#2A151D] text-sm font-semibold cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ProductModalProps {
  isOpen: boolean;
  initialCategory: CategoryId;
  editingProduct: Product | null;
  onClose: () => void;
  onSave: (payload: {
    id?: string;
    category: CategoryId;
    branch: string;
    name: string;
    description: string;
    basePrice: number;
    options: ProductOption[];
    imageFile?: File;
    existingImageUrl?: string;
  }) => Promise<void>;
}

export function ProductEditorModal({
  isOpen,
  initialCategory,
  editingProduct,
  onClose,
  onSave,
}: ProductModalProps) {
  const [category, setCategory] = useState<CategoryId>(initialCategory);
  const [branch, setBranch] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setImageFile(undefined);
    if (editingProduct) {
      setCategory(editingProduct.category);
      setBranch(editingProduct.branch);
      setName(editingProduct.name);
      setDescription(editingProduct.description);
      setBasePrice(String(editingProduct.basePrice));
      setOptionsText(
        editingProduct.options.map((o) => `${o.label}|${o.price}`).join('\n')
      );
    } else {
      setCategory(initialCategory);
      setBranch('');
      setName('');
      setDescription('');
      setBasePrice('3800');
      setOptionsText('كريب|3800\nدان|4300');
    }
  }, [isOpen, editingProduct, initialCategory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى إدخال اسم المنتج.');
      return;
    }

    const parsedOptions: ProductOption[] = optionsText
      .split('\n')
      .map((line) => line.split('|'))
      .filter(
        (parts) =>
          parts.length >= 2 &&
          parts[0].trim() &&
          Number.isFinite(Number(parts[1].trim()))
      )
      .map((parts) => ({
        label: parts[0].trim(),
        price: Math.max(0, Number(parts[1].trim())),
      }));

    const numericBase = Math.max(
      0,
      Number(basePrice) || (parsedOptions[0]?.price ?? 0)
    );

    setSaving(true);
    setError('');
    try {
      await onSave({
        id: editingProduct?.id,
        category,
        branch: branch.trim() || 'عام',
        name: name.trim(),
        description: description.trim() || 'تفصيل وتطريز متقن حسب الطلب.',
        basePrice: parsedOptions.length > 0 ? parsedOptions[0].price : numericBase,
        options: parsedOptions,
        imageFile,
        existingImageUrl: editingProduct?.imageUrl,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر حفظ المنتج.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A151D]/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={editingProduct ? 'تعديل المنتج' : 'إضافة موديل جديد'}
    >
      <div className="bg-white border border-[#F2D7DF] rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-[#2A151D]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#8E244D]">
            {editingProduct ? 'تعديل الموديل' : 'إضافة موديل جديد'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#6E4E5A] hover:text-[#2A151D] cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
              القسم
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryId)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-sm text-[#2A151D]"
            >
              {(['shawl', 'robe', 'cap', 'accessories'] as CategoryId[]).map(
                (cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
              صورة المنتج (اختياري)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0])}
              className="w-full text-xs text-[#6E4E5A] file:mr-0 file:ml-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-[#F2D7DF] file:bg-[#FCE8EF] file:text-[#8E244D] file:font-bold"
            />
          </div>

          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="اسم الفرع (مثال: شال ميس)"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-sm text-[#2A151D]"
          />

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم المنتج"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-sm text-[#2A151D]"
          />

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف قصير"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-sm text-[#2A151D]"
          />

          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            placeholder="السعر الأساسي بالدينار الجزائري"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-sm text-[#2A151D]"
          />

          <div>
            <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
              خيارات إضافية (كل خيار في سطر: الاسم|السعر)
            </label>
            <textarea
              rows={3}
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              placeholder={'كريب|3800\nدان|4300'}
              className="w-full px-3.5 py-2 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-xs text-[#2A151D]"
            />
          </div>

          {error && <p className="text-xs font-semibold text-[#BE123C]">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#8E244D] hover:bg-[#6D1839] text-white text-sm font-bold disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'جاري الحفظ...' : editingProduct ? 'تحديث' : 'إضافة'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-lg bg-[#FCE8EF] hover:bg-[#F5D6E1] text-[#2A151D] text-sm font-semibold cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CopyModalProps {
  isOpen: boolean;
  copy: StoreCopy;
  onClose: () => void;
  onSaveCopy: (next: StoreCopy) => void;
}

export function CopyEditorModal({
  isOpen,
  copy,
  onClose,
  onSaveCopy,
}: CopyModalProps) {
  const [draft, setDraft] = useState<StoreCopy>(copy);

  useEffect(() => {
    if (isOpen) setDraft(copy);
  }, [isOpen, copy]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveCopy(draft);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A151D]/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="تعديل نصوص المتجر"
    >
      <div className="bg-white border border-[#F2D7DF] rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-[#2A151D]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#8E244D]">تعديل نصوص الواجهة</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#6E4E5A] hover:text-[#2A151D] cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
              اسم العلامة
            </label>
            <input
              type="text"
              value={draft.brandName}
              onChange={(e) => setDraft({ ...draft, brandName: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-sm text-[#2A151D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
              العنوان الرئيسي (Hero)
            </label>
            <input
              type="text"
              value={draft.heroTitle}
              onChange={(e) => setDraft({ ...draft, heroTitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-sm text-[#2A151D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
              الوصف التعريفي
            </label>
            <textarea
              rows={3}
              value={draft.heroSubtitle}
              onChange={(e) => setDraft({ ...draft, heroSubtitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-sm text-[#2A151D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
              عنوان الاستوديو
            </label>
            <input
              type="text"
              value={draft.studioTitle}
              onChange={(e) => setDraft({ ...draft, studioTitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-sm text-[#2A151D]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
              عنوان جدول الأسعار
            </label>
            <input
              type="text"
              value={draft.pricesTitle}
              onChange={(e) => setDraft({ ...draft, pricesTitle: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-sm text-[#2A151D]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-lg bg-[#8E244D] hover:bg-[#6D1839] text-white text-sm font-bold cursor-pointer"
            >
              تطبيق التعديلات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-lg bg-[#FCE8EF] hover:bg-[#F5D6E1] text-[#2A151D] text-sm font-semibold cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface OrderLineItem {
  title?: string;
  name?: string;
  fabric_type?: string | null;
  shawl_color?: string | null;
  thread_color?: string | null;
  embroidered_text?: string | null;
  size?: string | null;
  details?: string;
  quantity?: number;
  unit_price?: number;
  unitPrice?: number;
}

interface OrderRecord {
  id: string;
  order_number: number;
  customer_name: string;
  phone?: string;
  customer_phone?: string;
  wilaya: string;
  commune: string;
  delivery_type: string;
  order_items?: OrderLineItem[];
  product_details?: {
    items?: OrderLineItem[];
    deliveryDate?: string | null;
    notes?: string | null;
  };
  total_sell_price: number;
  total_cost_price: number;
  delivery_price?: number;
  net_profit?: number;
  status: string;
  created_at: string;
}

interface InventoryItem {
  id: string;
  name: string;
  cost_price: number;
  sell_price: number;
  stock_quantity: number;
}

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify: (type: 'success' | 'error' | 'info', text: string) => void;
}

function getOrderItems(order: OrderRecord): OrderLineItem[] {
  if (Array.isArray(order.product_details?.items) && order.product_details.items.length > 0) {
    return order.product_details.items;
  }
  if (Array.isArray(order.order_items) && order.order_items.length > 0) {
    return order.order_items;
  }
  return [];
}

function getOrderNetProfit(order: OrderRecord): number {
  if (typeof order.net_profit === 'number' && Number.isFinite(order.net_profit)) {
    return order.net_profit;
  }
  return Number(order.total_sell_price || 0) - Number(order.total_cost_price || 0);
}

export function AdminDashboardModal({
  isOpen,
  onClose,
  onNotify,
}: DashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'delivery'>('orders');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [prodName, setProdName] = useState('');
  const [prodCost, setProdCost] = useState('');
  const [prodSell, setProdSell] = useState('');
  const [prodQty, setProdQty] = useState('');

  const [deliveryCompany, setDeliveryCompany] = useState('Yalidine');
  const [apiId, setApiId] = useState('');
  const [apiToken, setApiToken] = useState('');

  const fetchData = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const [ordersRes, invRes, settingsRes] = await Promise.all([
        supabase.from('orders').select('*').order('order_number', { ascending: false }),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('store_settings').select('*').eq('id', 1).maybeSingle(),
      ]);

      if (ordersRes.data) setOrders(ordersRes.data as OrderRecord[]);
      if (invRes.data) setInventory(invRes.data as InventoryItem[]);
      if (settingsRes.data) {
        setDeliveryCompany(settingsRes.data.delivery_company || 'Yalidine');
        setApiId(settingsRes.data.delivery_api_id || '');
        setApiToken(settingsRes.data.delivery_api_token || '');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      onNotify('error', 'تعذر تحديث حالة الطلب.');
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      onNotify('success', `تم تغيير الحالة إلى: ${newStatus}`);
    }
  };

  const handleUpdateOrderCost = async (orderId: string, costValue: number) => {
    if (!supabase) return;
    const safeCost = Math.max(0, costValue);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              total_cost_price: safeCost,
              net_profit: Number(o.total_sell_price || 0) - safeCost,
            }
          : o
      )
    );

    const { error } = await supabase
      .from('orders')
      .update({ total_cost_price: safeCost })
      .eq('id', orderId);

    if (error) {
      onNotify('error', 'تعذر تحديث التكلفة.');
    } else {
      onNotify('success', 'تم تحديث التكلفة وحساب الفائدة الصافية.');
    }
  };

  const handleAddInventory = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase || !prodName.trim()) return;
    const { error } = await supabase.from('products').insert([
      {
        name: prodName.trim(),
        cost_price: Number(prodCost) || 0,
        sell_price: Number(prodSell) || 0,
        stock_quantity: Number(prodQty) || 0,
      },
    ]);
    if (error) {
      onNotify('error', 'تعذر إضافة السلعة.');
    } else {
      setProdName('');
      setProdCost('');
      setProdSell('');
      setProdQty('');
      fetchData();
      onNotify('success', 'تمت إضافة السلعة إلى المخزون.');
    }
  };

  const handleSaveDeliverySettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.from('store_settings').upsert({
      id: 1,
      delivery_company: deliveryCompany,
      delivery_api_id: apiId.trim(),
      delivery_api_token: apiToken.trim(),
      updated_at: new Date().toISOString(),
    });
    if (error) {
      onNotify('error', 'تعذر حفظ إعدادات التوصيل.');
    } else {
      onNotify('success', 'تم حفظ إعدادات شركة التوصيل بنجاح.');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'رقم الطلب',
      'الاسم',
      'الهاتف',
      'الولاية',
      'البلدية',
      'التوصيل',
      'موعد التسليم',
      'تفاصيل القطع',
      'ملاحظات',
      'المبلغ',
      'التكلفة',
      'الفائدة',
      'الحالة',
    ];
    const rows = orders.map((o) => {
      const phoneVal = o.phone || o.customer_phone || '';
      const itemsSummary = getOrderItems(o)
        .map(
          (it) =>
            `${it.title || it.name || 'منتج'} ×${it.quantity || 1}${
              it.details ? ` (${it.details})` : ''
            }`
        )
        .join(' | ');
      const deliveryDateVal = o.product_details?.deliveryDate || '';
      const notesVal = o.product_details?.notes || '';
      return [
        o.order_number,
        `"${(o.customer_name || '').replace(/"/g, '""')}"`,
        `"${phoneVal.replace(/"/g, '""')}"`,
        `"${(o.wilaya || '').replace(/"/g, '""')}"`,
        `"${(o.commune || '').replace(/"/g, '""')}"`,
        `"${o.delivery_type === 'office' ? 'مكتب التوصيل' : 'توصيل للمنزل'}"`,
        `"${deliveryDateVal}"`,
        `"${itemsSummary.replace(/"/g, '""')}"`,
        `"${notesVal.replace(/"/g, '""')}"`,
        o.total_sell_price,
        o.total_cost_price,
        getOrderNetProfit(o),
        `"${o.status}"`,
      ];
    });
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeOrders = orders.filter((o) => o.status !== 'ملغى');
  const totalSales = activeOrders.reduce((s, o) => s + Number(o.total_sell_price || 0), 0);
  const totalProfit = activeOrders.reduce((s, o) => s + getOrderNetProfit(o), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#2A151D]/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FFF9FA] border border-[#F2D7DF] rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#2A151D]">
        <div className="px-4 py-3.5 bg-white border-b border-[#F2D7DF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#8E244D]" />
            <h2 className="text-base font-bold text-[#2A151D]">
              لوحة إدارة الطلبات والأرباح
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchData}
              className="p-1.5 rounded-lg bg-[#FCE8EF] text-[#8E244D] hover:bg-[#F5D6E1] cursor-pointer"
              title="تحديث"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6E4E5A] hover:text-[#2A151D] hover:bg-[#FCE8EF] cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-4 py-2.5 bg-white border-b border-[#F2D7DF] flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'orders'
                ? 'bg-[#8E244D] text-white'
                : 'bg-[#FFF3F6] text-[#6E4E5A] hover:text-[#2A151D]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>الطلبات ({orders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-[#8E244D] text-white'
                : 'bg-[#FFF3F6] text-[#6E4E5A] hover:text-[#2A151D]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>السلعة والفائدة</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('delivery')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'delivery'
                ? 'bg-[#8E244D] text-white'
                : 'bg-[#FFF3F6] text-[#6E4E5A] hover:text-[#2A151D]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>مكتب التوصيل</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#8E244D]" />
            </div>
          ) : activeTab === 'orders' ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3.5 rounded-xl border border-[#F2D7DF]">
                <div className="text-xs font-bold text-[#2A151D]">
                  إجمالي المبيعات النشطة:{' '}
                  <span className="text-[#8E244D] tabular-nums">
                    {totalSales.toLocaleString('en-US')} دج
                  </span>
                  <span className="mx-2 text-[#F2D7DF]">|</span>
                  صافي الفائدة:{' '}
                  <span className="text-[#147A53] tabular-nums">
                    {totalProfit.toLocaleString('en-US')} دج
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8E244D] hover:bg-[#6D1839] text-white text-xs font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير Excel</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-center text-sm text-[#6E4E5A] py-10">
                  لا توجد طلبات مسجلة في القاعدة بعد.
                </p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const rawItems = getOrderItems(order);
                    const displayNotes = order.product_details?.notes || '';
                    const deliveryDate = order.product_details?.deliveryDate || '';
                    const customerPhone = order.phone || order.customer_phone || '';
                    const netProfit = getOrderNetProfit(order);

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-xl border border-[#F2D7DF] p-4 space-y-3 shadow-xs"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 pb-2.5 border-b border-[#F2D7DF]">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded-md bg-[#FCE8EF] text-xs font-extrabold text-[#8E244D] tabular-nums">
                                #{order.order_number}
                              </span>
                              <span className="text-sm font-bold text-[#2A151D]">
                                {order.customer_name}
                              </span>
                              {customerPhone && (
                                <a
                                  href={`tel:${customerPhone}`}
                                  dir="ltr"
                                  className="inline-flex items-center gap-1 text-xs font-bold text-[#8E244D] hover:underline"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{customerPhone}</span>
                                </a>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6E4E5A]">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#8E244D]" />
                                {order.wilaya}
                                {order.commune && order.commune !== 'غير محددة'
                                  ? ` - ${order.commune}`
                                  : ''}
                                {' · '}
                                {order.delivery_type === 'office'
                                  ? 'استلام من المكتب'
                                  : 'توصيل للمنزل'}
                              </span>

                              {deliveryDate && (
                                <span className="inline-flex items-center gap-1 text-[#2A151D]">
                                  <Calendar className="w-3 h-3 text-[#8E244D]" />
                                  موعد التسليم: {deliveryDate}
                                </span>
                              )}
                            </div>
                          </div>

                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(order.id, e.target.value)
                            }
                            className="px-2.5 py-1 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-xs font-bold text-[#2A151D]"
                          >
                            <option value="جديد">جديد</option>
                            <option value="قيد التحضير">قيد التحضير</option>
                            <option value="مؤكد">مؤكد</option>
                            <option value="تم الإرسال">تم الإرسال</option>
                            <option value="مكتمل">مكتمل</option>
                            <option value="ملغى">ملغى</option>
                          </select>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="bg-[#FFF9FA] border border-[#F2D7DF] rounded-lg p-3 space-y-2">
                            <p className="font-bold text-[#8E244D]">
                              اختيارات الزبون والقطع المطلوبة:
                            </p>
                            {rawItems.length > 0 ? (
                              rawItems.map((item, idx) => {
                                const unitPrice = Number(
                                  item.unit_price ?? item.unitPrice ?? 0
                                );
                                const structuredSpecs = [
                                  item.fabric_type ? `القماش: ${item.fabric_type}` : null,
                                  item.shawl_color ? `اللون: ${item.shawl_color}` : null,
                                  item.thread_color ? `التطريز: ${item.thread_color}` : null,
                                  item.embroidered_text
                                    ? `النص: ${item.embroidered_text}`
                                    : null,
                                  item.size ? `المقاس: ${item.size}` : null,
                                ].filter(Boolean);

                                return (
                                  <div
                                    key={idx}
                                    className="text-[#2A151D] leading-relaxed pb-1.5 border-b border-[#F2D7DF]/60 last:border-0 last:pb-0"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span>
                                        • <strong>{item.title || item.name || 'منتج'}</strong> ×{' '}
                                        <span className="tabular-nums">{item.quantity || 1}</span>
                                      </span>
                                      {unitPrice > 0 && (
                                        <span className="text-[#8E244D] font-bold tabular-nums">
                                          {(unitPrice * (item.quantity || 1)).toLocaleString(
                                            'en-US'
                                          )}{' '}
                                          دج
                                        </span>
                                      )}
                                    </div>
                                    {item.details ? (
                                      <p className="text-[11px] text-[#6E4E5A] mt-0.5 pr-3">
                                        {item.details}
                                      </p>
                                    ) : structuredSpecs.length > 0 ? (
                                      <p className="text-[11px] text-[#6E4E5A] mt-0.5 pr-3">
                                        {structuredSpecs.join(' · ')}
                                      </p>
                                    ) : null}
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-[#6E4E5A]">لا توجد تفاصيل إضافية مسجلة.</p>
                            )}
                          </div>

                          {displayNotes && (
                            <p className="text-[#7C4A15] bg-[#FFF8EB] p-2.5 rounded-lg border border-[#F5D69E]">
                              <strong>ملاحظات الزبون:</strong> {displayNotes}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F2D7DF] text-xs">
                          <div className="flex flex-wrap items-center gap-3">
                            <span>
                              البيع:{' '}
                              <strong className="text-[#2A151D] tabular-nums">
                                {Number(order.total_sell_price).toLocaleString('en-US')} دج
                              </strong>
                            </span>
                            <label className="inline-flex items-center gap-1.5">
                              <span className="text-[#6E4E5A]">التكلفة:</span>
                              <input
                                type="number"
                                defaultValue={order.total_cost_price}
                                onBlur={(e) =>
                                  handleUpdateOrderCost(
                                    order.id,
                                    Number(e.target.value) || 0
                                  )
                                }
                                className="w-24 px-2 py-1 border border-[#F2D7DF] rounded bg-[#FFF9FA] text-[#2A151D] font-bold tabular-nums"
                              />
                            </label>
                            <span className="text-[#147A53] font-bold tabular-nums">
                              الفائدة: {netProfit.toLocaleString('en-US')} دج
                            </span>
                          </div>

                          {order.status === 'مؤكد' && (
                            <button
                              type="button"
                              onClick={() =>
                                onNotify(
                                  'info',
                                  `جاهز للإرسال عبر ${deliveryCompany} (تأكد من إدخال مفاتيح API في تبويب مكتب التوصيل).`
                                )
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8E244D] hover:bg-[#6D1839] text-white font-bold cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>إرسال للتوصيل</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : activeTab === 'inventory' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl border border-[#F2D7DF]">
                  <p className="text-xs text-[#6E4E5A]">إجمالي المبيعات</p>
                  <p className="text-lg font-extrabold text-[#8E244D] mt-1 tabular-nums">
                    {totalSales.toLocaleString('en-US')} دج
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#F2D7DF]">
                  <p className="text-xs text-[#6E4E5A]">صافي الفائدة المحققة</p>
                  <p className="text-lg font-extrabold text-[#147A53] mt-1 tabular-nums">
                    {totalProfit.toLocaleString('en-US')} دج
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleAddInventory}
                className="bg-white p-4 rounded-xl border border-[#F2D7DF] space-y-3"
              >
                <h3 className="text-sm font-bold text-[#2A151D] flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#8E244D]" />
                  <span>إضافة سلعة ورأس مال للمخزون</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="اسم السلعة (مثلاً: قماش كريب)"
                    className="px-3 py-2 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-xs text-[#2A151D]"
                  />
                  <input
                    type="number"
                    value={prodCost}
                    onChange={(e) => setProdCost(e.target.value)}
                    placeholder="سعر التكلفة (دج)"
                    className="px-3 py-2 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-xs text-[#2A151D]"
                  />
                  <input
                    type="number"
                    value={prodSell}
                    onChange={(e) => setProdSell(e.target.value)}
                    placeholder="سعر البيع (دج)"
                    className="px-3 py-2 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-xs text-[#2A151D]"
                  />
                  <input
                    type="number"
                    value={prodQty}
                    onChange={(e) => setProdQty(e.target.value)}
                    placeholder="الكمية المتوفرة"
                    className="px-3 py-2 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-xs text-[#2A151D]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#8E244D] hover:bg-[#6D1839] text-white text-xs font-bold cursor-pointer"
                >
                  حفظ في المخزون
                </button>
              </form>

              <div className="bg-white rounded-xl border border-[#F2D7DF] divide-y divide-[#F2D7DF]">
                {inventory.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#2A151D]">{item.name}</p>
                      <p className="text-[#6E4E5A] tabular-nums">
                        التكلفة: {item.cost_price} دج | البيع: {item.sell_price} دج | الفائدة للقطعة:{' '}
                        <span className="text-[#147A53] font-bold">
                          {item.sell_price - item.cost_price} دج
                        </span>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#FCE8EF] border border-[#F2D7DF] font-bold text-[#8E244D] tabular-nums">
                      الكمية: {item.stock_quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSaveDeliverySettings}
              className="bg-white p-4 rounded-xl border border-[#F2D7DF] space-y-3"
            >
              <h3 className="text-sm font-bold text-[#8E244D]">
                ربط حساب مكتب التوصيل (API)
              </h3>
              <div>
                <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
                  شركة التوصيل
                </label>
                <select
                  value={deliveryCompany}
                  onChange={(e) => setDeliveryCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-sm text-[#2A151D]"
                >
                  <option value="Yalidine">Yalidine Express</option>
                  <option value="ZR Express">ZR Express</option>
                  <option value="Noest">Noest Express</option>
                  <option value="Maystro">Maystro Delivery</option>
                  <option value="Anderson">Anderson Logistics</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
                  API ID (المعرّف من حسابك في شركة التوصيل)
                </label>
                <input
                  type="text"
                  value={apiId}
                  onChange={(e) => setApiId(e.target.value)}
                  placeholder="أدخل API ID"
                  className="w-full px-3 py-2 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-sm text-[#2A151D]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6E4E5A] mb-1">
                  API Token (الرمز السري من حسابك)
                </label>
                <input
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="أدخل API Token"
                  className="w-full px-3 py-2 rounded-lg border border-[#F2D7DF] bg-[#FFF9FA] text-sm text-[#2A151D]"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#8E244D] hover:bg-[#6D1839] text-white text-xs font-bold cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ بيانات الربط</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
