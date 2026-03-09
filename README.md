# 🍽️ QR Menü

Restoranlar için modern, mobil öncelikli dijital QR menü yönetim sistemi. Restoranlar kendi kategorilerini ve ürünlerini yönetebilir; müşteriler herhangi bir uygulama indirmeden QR kod veya link üzerinden menüye erişebilir.

---

## ✨ Özellikler

### Restoran Sahibi (Dashboard)
- 🔐 E-posta / şifre ile güvenli giriş ve kayıt
- 🏪 Restoran profili oluşturma (ad, slug, açıklama, telefon, adres, tema rengi)
- 📂 Kategori yönetimi — ekleme, düzenleme, silme, aktif/pasif, sıralama
- 🍕 Ürün yönetimi — ekleme, düzenleme, silme, aktif/pasif, öne çıkan toggle
- 🖥️ Sidebar + mobil drawer ile responsive dashboard navigasyonu

### Müşteri (Public Menü)
- 📱 QR kod veya link ile uygumasız erişim (`/menu/[slug]`)
- 🔎 Sadece aktif restoran, kategori ve ürünler gösterilir
- ⭐ "Öne Çıkan" ürünler için özel rozet
- 🎨 Restorana özel tema rengi ile kişiselleştirilmiş görünüm
- 🔍 SEO uyumlu metadata (title, description)

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) — App Router |
| Dil | TypeScript (strict) |
| Veritabanı & Auth | [Supabase](https://supabase.com/) (PostgreSQL + RLS) |
| UI Bileşenleri | [shadcn/ui](https://ui.shadcn.com/) |
| Stil | Tailwind CSS v4 |
| Form Yönetimi | React Hook Form + Zod |
| HTTP Client | Supabase JS SDK (`@supabase/ssr`) |

---

## 📁 Klasör Yapısı

```
src/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx                  # Ortak dashboard layout + navigasyon
│   │   ├── page.tsx                    # Ana sayfa / onboarding
│   │   ├── create-restaurant-form.tsx  # Restoran oluşturma formu
│   │   ├── restaurant-summary.tsx      # Restoran özet kartı
│   │   ├── categories/
│   │   │   ├── page.tsx                # Kategori yönetimi (Server)
│   │   │   └── categories-client.tsx   # Kategori CRUD (Client)
│   │   └── menu-items/
│   │       ├── page.tsx                # Ürün yönetimi (Server)
│   │       └── menu-items-client.tsx   # Ürün CRUD (Client)
│   ├── menu/
│   │   └── [slug]/
│   │       ├── page.tsx                # Public menü sayfası
│   │       └── not-found.tsx           # Özel 404 sayfası
│   ├── login/page.tsx
│   └── signup/page.tsx
├── components/
│   ├── dashboard-nav.tsx               # Sidebar + mobil navigasyon
│   └── ui/                             # shadcn/ui bileşenleri
├── lib/
│   └── supabase/
│       ├── client.ts                   # Browser client
│       ├── server.ts                   # Server client (SSR)
│       ├── middleware.ts               # Route protection
│       └── env.ts                      # Çevre değişkeni doğrulama
├── middleware.ts                       # Next.js middleware
└── types/
    ├── database.ts                     # Supabase Database tipi
    ├── restaurant.ts                   # Restaurant domain tipi
    └── menu.ts                         # Category, MenuItem, CategoryWithItems
```

---

## 🗄️ Veritabanı Şeması

```sql
restaurants   -- Restoran profilleri (auth.users ile ilişkili)
categories    -- Kategoriler (restaurant_id FK)
menu_items    -- Ürünler (restaurant_id + category_id FK)
```

Tüm tablolarda **Row Level Security (RLS)** aktif:
- Restoran sahibi yalnızca kendi verilerini CRUD yapabilir
- Public okuma yalnızca `is_active = true` kayıtlar için

---

## 🚀 Kurulum

### 1. Repoyu Klonla

```bash
git clone https://github.com/C1H4N/qr-menu.git
cd qr-menu
```

### 2. Bağımlılıkları Yükle

```bash
npm install
```

### 3. Çevre Değişkenlerini Ayarla

```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenle:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Supabase Veritabanını Hazırla

Supabase Dashboard → SQL Editor'e aşağıdaki şemayı yapıştır ve çalıştır:

<details>
<summary>SQL Şeması (tıkla)</summary>

```sql
-- updated_at trigger fonksiyonu
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tablolar
CREATE TABLE public.restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    phone TEXT,
    address TEXT,
    theme_color TEXT DEFAULT '#000000',
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(restaurant_id, name)
);

CREATE TABLE public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- İndeksler
CREATE INDEX idx_restaurants_owner_user_id ON public.restaurants(owner_user_id);
CREATE INDEX idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX idx_categories_restaurant_id ON public.categories(restaurant_id);
CREATE INDEX idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category_id ON public.menu_items(category_id);

-- Triggerlar
CREATE TRIGGER set_updated_at_restaurants BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_categories BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER set_updated_at_menu_items BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Restaurants politikaları
CREATE POLICY "Public can view active restaurants" ON public.restaurants FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can view own restaurants" ON public.restaurants FOR SELECT USING (auth.uid() = owner_user_id);
CREATE POLICY "Owners can insert own restaurants" ON public.restaurants FOR INSERT WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Owners can update own restaurants" ON public.restaurants FOR UPDATE USING (auth.uid() = owner_user_id);
CREATE POLICY "Owners can delete own restaurants" ON public.restaurants FOR DELETE USING (auth.uid() = owner_user_id);

-- Categories politikaları
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = true AND EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.is_active = true));
CREATE POLICY "Owners can view own categories" ON public.categories FOR SELECT USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));
CREATE POLICY "Owners can insert own categories" ON public.categories FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));
CREATE POLICY "Owners can update own categories" ON public.categories FOR UPDATE USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));
CREATE POLICY "Owners can delete own categories" ON public.categories FOR DELETE USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));

-- Menu Items politikaları
CREATE POLICY "Public can view active menu items" ON public.menu_items FOR SELECT USING (is_active = true AND EXISTS (SELECT 1 FROM public.categories c JOIN public.restaurants r ON r.id = c.restaurant_id WHERE c.id = category_id AND c.is_active = true AND r.is_active = true));
CREATE POLICY "Owners can view own menu items" ON public.menu_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));
CREATE POLICY "Owners can insert own menu items" ON public.menu_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));
CREATE POLICY "Owners can update own menu items" ON public.menu_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));
CREATE POLICY "Owners can delete own menu items" ON public.menu_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.restaurants r WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()));
```

</details>

### 5. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışır.

---

## 📱 Kullanım

### Restoran Sahibi Akışı

```
/signup        → Hesap oluştur
/login         → Giriş yap
/dashboard     → Restoran oluştur (onboarding)
/dashboard/categories   → Kategorileri yönet
/dashboard/menu-items   → Ürünleri yönet
```

### Müşteri Akışı

```
/menu/[slug]   → QR kod ile menüye eriş (uygulama gerekmez)
```

Örnek: `https://yourdomain.com/menu/pizza-house`

---

## 🔒 Güvenlik

- **Middleware**: `/dashboard/*` rotaları giriş yapılmadan erişilemez
- **RLS**: Veritabanı seviyesinde sahip doğrulaması — yanlış bir istek API'ye bile ulaşsa veri sızdırmaz
- **Server-side auth**: Her sayfa yüklemesinde `getUser()` ile oturum doğrulanır

---

## 📄 Lisans

© 2026 Cihan Bayram. Tüm hakları saklıdır.

Bu yazılım ve ilgili belgeler özel ve gizlidir. Telif hakkı sahibinin önceden yazılı izni olmaksızın hiçbir bölümü kopyalanamaz, çoğaltılamaz, dağıtılamaz veya herhangi bir biçimde iletilemez.


