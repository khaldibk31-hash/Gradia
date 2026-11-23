import { createClient, Session } from '@supabase/supabase-js';
import { DEFAULT_STORE_STATE } from '../data/defaultStore';
import { StoreState } from '../types/store';

const SB_URL = 'https://gzkllcoypsldbdixeact.supabase.co';
// Publishable client key
const SB_KEY = 'sb_publishable_s2ccw-Z-ipZd3cuxMM-VoQ_8kxW0MRE';
export const supabase = createClient(SB_URL, SB_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function loadStoreState(): Promise<{
  state: StoreState;
  session: Session | null;
  error?: string;
}> {
  try {
    const [{ data: store, error: storeError }, { data: authData }] = await Promise.all([
      supabase.from('store_data').select('html_content, logo_url').eq('id', 1).maybeSingle(),
      supabase.auth.getSession(),
    ]);

    let state: StoreState = structuredClone(DEFAULT_STORE_STATE);

    if (store) {
      if (store.logo_url) {
        state.logoUrl = store.logo_url;
      }

      if (store.html_content && store.html_content.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(store.html_content) as Partial<StoreState>;
          if (parsed && parsed.version === 2) {
            state = {
              ...DEFAULT_STORE_STATE,
              ...parsed,
              copy: { ...DEFAULT_STORE_STATE.copy, ...(parsed.copy || {}) },
              products:
                Array.isArray(parsed.products) && parsed.products.length > 0
                  ? parsed.products
                  : DEFAULT_STORE_STATE.products,
              logoUrl: store.logo_url || parsed.logoUrl || '',
            };
          }
        } catch {
          // Legacy HTML content from previous site version — preserve defaults cleanly
        }
      }
    }

    return {
      state,
      session: authData?.session ?? null,
      error: storeError ? storeError.message : undefined,
    };
  } catch (err) {
    return {
      state: structuredClone(DEFAULT_STORE_STATE),
      session: null,
      error: err instanceof Error ? err.message : 'تعذر الاتصال بقاعدة البيانات.',
    };
  }
}

export async function saveStoreState(state: StoreState): Promise<void> {

  const serialized = JSON.stringify(state);
  const { error } = await supabase.from('store_data').upsert(
    {
      id: 1,
      html_content: serialized,
      logo_url: state.logoUrl || '',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function signInAdmin(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(error.message);
  }
  if (!data?.session) {
    throw new Error('لم يتم إنشاء جلسة دخول.');
  }
  return data.session;
}

export async function signOutAdmin(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function uploadStoreImage(file: File, maxWidth = 900): Promise<string> {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    throw new Error('اختاري ملف صورة صالحاً.');
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('حجم الصورة كبير. اختاري صورة أقل من 12 ميغابايت.');
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('تعذر قراءة الصورة.'));
    reader.onload = (ev) => resolve(String(ev.target?.result || ''));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('صيغة الصورة غير مدعومة.'));
    img.src = dataUrl;
  });

  const ratio = Math.min(1, maxWidth / image.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * ratio));
  canvas.height = Math.max(1, Math.round(image.height * ratio));

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('تعذر تجهيز الصورة على هذا الجهاز.');
  }

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('تعذر ضغط الصورة.'))),
      'image/jpeg',
      0.8
    );
  });

  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.jpg`;
  const path = `store/${safeName}`;

  const { error } = await supabase.storage
    .from('store-images')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: false });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from('store-images').getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('تم رفع الصورة لكن تعذر إنشاء رابطها.');
  }

  return data.publicUrl;
}
