# QR Menü Web Sitesi – Gereksinim Analizi

## 1. Projenin Amacı
Restoran, lokanta, kafe gibi işletmelerin müşterilerine **QR kod** üzerinden mobil uyumlu dijital menü sunabildiği ve işletme tarafının menü içeriklerini yönetebildiği bir web uygulaması.

**Temel Hedef:**
- Müşteri QR okutup menüyü hızlı açsın.
- İşletme ürün, kategori, fiyat, görsel gibi içerikleri panelden yönetsin.
- Kurulum ve kullanım basit olsun.

---

## 2. Hedef Kullanıcılar

### 2.1 İşletme Sahibi / Yönetici
Sisteme giriş yapar, kendi restoranını ve menüsünü yönetir.

**Yapmak istedikleri:**
- Kategoriler ve ürünler eklemek.
- Fiyat güncellemek.
- Ürün görünürlüğünü açıp kapatmak.
- Görsel yüklemek.
- QR linkini almak.

### 2.2 Restoran Personeli
Bazı durumlarda sadece menü güncelleme yetkisi olabilir.

**Yapmak istedikleri:**
- Stokta olmayan ürünü gizlemek.
- Açıklama ve fiyat değiştirmek.
- Yeni ürün eklemek.

### 2.3 Müşteri
QR kodu okutup menüye erişir.

**Beklentileri:**
- Hızlı açılma.
- Sade ve okunaklı arayüz.
- Kategoriye göre ürünleri görme.
- Ürün açıklaması, fiyatı, görseli inceleme.
- Mobilde sorunsuz kullanım.

---

## 3. Problem Tanımı

**Klasik Basılı Menüler:**
- Güncellemesi zor.
- Maliyetli.
- Hijyen açısından tercih edilmeyebilir.
- Fiyat değişimlerinde tekrar basım gerektirir.

**Dijital QR Menü:**
- Anlık güncellenebilir.
- Daha düşük maliyetlidir.
- Çok daha pratik yönetilir.
- Kampanya, görsel ve dil desteği eklenebilir.

---

## 4. MVP (Minimum Viable Product) Kapsamı
İlk sürümde sadece en gerekli işlevleri yapalım. Böylece proje hızlı ilerler.

### 4.1 MVP'de Olacaklar
- Restoran hesabı oluşturma / giriş.
- Restoran profili oluşturma.
- Kategori yönetimi.
- Ürün yönetimi.
- Ürün görseli ekleme.
- Menüyü public (herkese açık) sayfada gösterme.
- Mobil uyumlu menü tasarımı.
- Restoran bazlı QR linki.
- Aktif/pasif ürün ve kategori yönetimi.

### 4.2 MVP'de Olmayabilecekler
*Bunları sonraya bırakmak geliştirmeyi hızlandırır:*
- Online sipariş.
- Ödeme sistemi.
- Masa bazlı sipariş takibi.
- Garson çağırma.
- Çok şubeli gelişmiş yönetim.
- Detaylı rol/yetki sistemi.
- Kampanya motoru.
- Varyant sistemi.
- Çoklu dil.
- Gelişmiş analitik.

---

## 5. Fonksiyonel Gereksinimler

### 5.1 Kimlik Doğrulama ve Hesap
Sistem şunları desteklemeli:
- Kullanıcı kayıt olabilmeli, giriş yapabilmeli, çıkış yapabilmeli ve şifresini sıfırlayabilmeli.
- Kendi restoran verilerine erişebilmeli.

> **Kurallar:**
> - Her kullanıcı sadece kendi restoran verisini görmeli.
> - Oturum açılmadan yönetim paneline erişilememeli.

### 5.2 Restoran Yönetimi
İşletme sahibi aşağıdaki bilgileri düzenleyebilmeli:
- Restoran adı, açıklama, adres, telefon, çalışma saatleri.
- Slug veya benzersiz URL (Örn: `/menu/[slug]`).
- Logo ve kapak görseli.
- Sosyal medya linkleri ve tema rengi.

### 5.3 Kategori Yönetimi
İşletme sahibi; kategori oluşturabilmeli, adını düzenleyebilmeli, sırasını değiştirebilmeli ve aktif/pasif yapabilmeli. *(Örn: Çorbalar, Ana Yemekler, Tatlılar, İçecekler)*

> **Kurallar:**
> - Pasif kategori public menüde görünmemeli.
> - Kategori sırası menüde korunmalı.

### 5.4 Ürün Yönetimi
İşletme sahibi; ürün ekleyebilmeli, adı/açıklama/fiyat bilgisi girebilmeli, kategori seçebilmeli, görsel ekleyebilmeli, sırasını belirleyebilmeli, görünürlüğü ayarlayabilmeli ve "önerilen ürün" işaretleyebilmeli.

**Ürün Alanları:**
- Ad, açıklama, fiyat, görsel, kategori.
- Görünürlük durumu, sıralama, etiketler (opsiyonel), alerjen bilgisi (opsiyonel), içerik bilgisi (opsiyonel).

> **Kurallar:**
> - Pasif ürün müşteriye görünmemeli.
> - Fiyat boş geçilememeli.
> - Ürün en az bir kategoriye bağlı olmalı.

### 5.5 Public Menü Görüntüleme
Müşteri menüyü link üzerinden açarak, ürünleri kategori bazlı inceleyebilmeli, ürün detayında görsel, açıklama ve fiyatı görebilmeli.

> **Beklenen Davranış:**
> - Sayfa mobil öncelikli ve hızlı olmalı.
> - Restoran kapalı olsa bile menü açılabilir; çalışma durumu bilgi amaçlı gösterilebilir.
> - Menü SEO açısından temel düzeyde erişilebilir olmalı.

### 5.6 QR Kod Kullanımı
Sistem restoran için bir public menü linki üretmeli ve bu link QR'a çevrilebilmeli.

- **İlk Sürüm:** Her restoranın tek bir QR menü linki olsun, QR doğrudan restoran menü sayfasına gitsin.
- **Sonraki Aşama:** Masa bazlı QR, şube bazlı QR, kampanya linkli QR, izleme parametreleri eklenebilir.

### 5.7 Medya Yönetimi
İşletme logo, ürün görseli ve kapak görseli yükleyebilmeli.

> **Kurallar:**
> - Sadece görsel dosya tipleri kabul edilmeli.
> - Dosya boyutu sınırı olmalı.
> - Optimize edilmiş görseller kullanılmalı.

---

## 6. Fonksiyonel Olmayan Gereksinimler

### 6.1 Performans
- Public menü çok hızlı açılmalı.
- Mobil cihazlarda akıcı çalışmalı.
- Görseller optimize edilmeli.
- Gereksiz büyük veri çekilmemeli.

### 6.2 Güvenlik
- Kullanıcı sadece kendi verisine erişebilmeli.
- Admin panel route'ları korunmalı.
- Form doğrulamaları yapılmalı.
- Dosya yükleme güvenli olmalı.

### 6.3 Kullanılabilirlik
- Panel basit olmalı.
- Teknik bilgisi az olan işletme sahibi bile rahatça kullanabilmeli.
- Ürün ekleme akışı kısa olmalı.
- Mobil menü çok okunaklı olmalı.

### 6.4 Ölçeklenebilirlik & 6.5 Bakım Kolaylığı
- İlerleyen aşamalarda çok şubeli yapı, çoklu kullanıcı rolü, çoklu dil, online sipariş ve kampanya sistemine uygun şekilde genişleyebilmeli.
- Component bazlı yapı, temiz klasörleme, tip güvenliği ve tekrar kullanılabilir UI parçaları dikkate alınmalı.

---

## 7. Kullanıcı Senaryoları
1. **Senaryo 1:** İşletme kayıt olur, restoranını oluşturur, kategorilerini ve ürünlerini girer, QR linkini alır.
2. **Senaryo 2:** Müşteri masadaki QR'ı okutur, menü sayfası açılır, ürünleri inceler.
3. **Senaryo 3:** İşletme fiyat değiştirir, müşteri menüyü yenilediğinde güncel fiyatı anında görür.
4. **Senaryo 4:** Stokta kalmayan ürün panelden pasif yapılır ve anında public menüden gizlenir.

---

## 8. Sayfa ve Modül Listesi

**Public Taraf:**
- Ana menü sayfası: `/menu/[slug]`
- Ürün detay modalı veya kart detay görünümü
- Restoran bilgisi alanı

**Admin Taraf (Yönetim):**
- Giriş Sayfası / Kayıt Sayfası
- Dashboard (Ana sayfa)
- Restoran ayarları
- Kategori yönetimi
- Ürün yönetimi
- Medya yükleme alanı
- QR sayfası

---

## 9. Veri Modeli İhtiyacı
*İlk aşama için temel tablolar aşağıdaki gibi olabilir:*

- **users:** Kimlik doğrulama kullanıcıları.
- **restaurants:** `id`, `owner_user_id`, `name`, `slug`, `description`, `logo_url`, `cover_image_url`, `phone`, `address`, `theme_color`, `is_active`, `created_at`.
- **categories:** `id`, `restaurant_id`, `name`, `sort_order`, `is_active`.
- **menu_items:** `id`, `restaurant_id`, `category_id`, `name`, `description`, `price`, `image_url`, `is_active`, `is_featured`, `sort_order`.

> *İleri aşamada eklenebilir: branches, tables, allergens, item_translations, restaurant_staff, qr_codes vb.*

---

## 10. Yetki ve Erişim Modeli
- **MVP (İlk Aşama):** Sadece `owner` (Kullanıcı sadece sahibi olduğu restoranı yönetir).
- **İleride (Gelecek Vizyonu):** `manager`, `editor`, `staff` rolleri eklenebilir.

---

## 11. UI/UX Beklentileri

**Public Menü:**
- Temiz, mobil öncelikli (mobile-first) ve hızlı.
- Büyük ve okunaklı metin, kolay kategori geçişi.
- Görseller varsa, son derece şık görünüm.

**Admin Panel:**
- Form ağırlıklı arayüz.
- Sade ve karmaşık olmayan navigasyon.
- Tablo ve form kombinasyonu.
- Ürün ve kategori sıralama kolaylığı.

---

## 12. Başarı Kriterleri
Proje başarılı sayıldığında:
1. Bir restoran 15–20 dakikada menüsünü sisteme komple girebilmeli.
2. Müşteri QR okuttuktan sonra menü saniyeler içinde açılmalı.
3. Ürün ekleme ve fiyat güncelleme çok kolay ve hatasız olmalı.
4. Teknik bilgi gerektirmeden panel herkes tarafından kullanılabilmeli.

---

## 13. Riskler
- Kapsamın hızlı büyümesi ve erken aşamada çok fazla özellik ekleme isteği projenin süresini uzatabilir.
- Medya yükleme ve yetki yönetiminde çıkabilecek karmaşalar süreci zorlayabilir.
- Çok şubeli / masa bazlı bir sistem yapmaya çalışmak MVP geliştirmesini yavaşlatabilir.
- **Odak Noktası:** *Bu yüzden ilk sürümde kapsamı dar tutmak oldukça önemli.*

---

## 14. Önerilen MVP Sınırı
**İlk Versiyon Sınırı (Şu anki hedef):**
Tek restoran, tek owner kullanıcı hesabı, kategori yönetimi, ürün yönetimi, public menü yayını ve tek bir QR link. *Bunu bitirelim.*

**İkinci Faz:**
Çoklu restoran, çoklu kullanıcı, masa bazlı QR, çoklu dil, ve sipariş özellikleri.

---

## 15. Next.js İçin Teknik Yönlendirme
Bu analiz doğrultusunda teknik tercih şu şekilde netleşiyor:

- **Next.js App Router**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **Supabase** (Kimlik Doğrulama / Yetkilendirme / Veritabanı)
- **Zod** (Form doğrulama kütüphanesi)
- **React Hook Form** (Form yönetimi)
- **Next Image** (Image optimization)