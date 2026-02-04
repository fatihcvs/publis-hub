# ThePublisher - İçerik Üreticisi Kişisel Web Sitesi

## Proje Açıklaması
Kick ve YouTube içerik üreticileri için Linktree tarzı kişisel web sitesi. Sosyal medya linkleri, sponsorlar ve oyun satın alma kodları içerir.

## Özellikler
- **Profil Bölümü**: Profil fotoğrafı, isim, başlık ve bio
- **Sosyal Medya Linkleri**: Kick, YouTube, Twitter/X, Instagram, Discord, TikTok
- **Sponsorlar**: Sponsor kartları ile açıklama ve web sitesi linki
- **Oyun Kodları**: Tek tıkla kopyalama, indirim yüzdesi gösterimi
- **Tema Değiştirme**: Koyu/açık mod desteği
- **Admin Paneli**: Replit Auth ile güvenli giriş, tüm içerikleri yönetme

## Sayfa Yapısı
- `/` - Ana sayfa (Linktree tarzı basit tasarım)
- `/admin` - Admin paneli (giriş yapılması gerekir)

## Admin Paneli
- Erişim: `/admin` adresinden giriş yaparak
- Güvenlik: Replit Auth ile korumalı
- Özellikler:
  - Profil düzenleme (logo dosya yüklemesi dahil)
  - Sosyal medya linkleri ekleme/düzenleme/silme/sıralama
  - Sponsor ekleme/düzenleme/silme/sıralama
  - Oyunlar (indirim kodları) ekleme/düzenleme/silme/sıralama
  - Manuel sıralama: Yukarı/aşağı butonları ile liste sırası değiştirilebilir

## Logo Yükleme
- Admin panelinden doğrudan dosya yüklemesi
- Desteklenen formatlar: JPG, PNG, GIF, WebP
- Maksimum boyut: 5MB
- Yüklenen dosyalar: `/client/public/uploads/` klasörüne kaydedilir

## Teknik Yapı

### Frontend (React + TypeScript)
- `/client/src/pages/home.tsx` - Ana sayfa
- `/client/src/pages/admin.tsx` - Admin paneli
- `/client/src/components/theme-provider.tsx` - Tema yönetimi
- `/client/src/components/theme-toggle.tsx` - Tema değiştirme butonu
- `/client/src/hooks/use-auth.ts` - Kimlik doğrulama hook

### Backend (Express + TypeScript)
- `/server/routes.ts` - API endpointleri
- `/server/storage.ts` - Veritabanı işlemleri
- `/server/db.ts` - PostgreSQL bağlantısı
- `/server/replit_integrations/auth/` - Replit Auth entegrasyonu

### Veritabanı (PostgreSQL + Drizzle ORM)
- `/shared/schema.ts` - Veri modelleri
  - `profile` - Profil bilgileri
  - `socialLinks` - Sosyal medya linkleri
  - `sponsors` - Sponsor bilgileri
  - `discountCodes` - İndirim kodları
  - `users` - Kullanıcılar (Replit Auth)
  - `sessions` - Oturumlar

### API Endpointleri
**Genel (Public):**
- `GET /api/profile` - Profil bilgilerini getir
- `GET /api/social-links` - Sosyal linkleri getir
- `GET /api/sponsors` - Sponsorları getir
- `GET /api/discount-codes` - İndirim kodlarını getir

**Admin (Korumalı):**
- `PUT /api/admin/profile` - Profil güncelle
- `POST/PUT/DELETE /api/admin/social-links` - Sosyal link CRUD
- `POST/PUT/DELETE /api/admin/sponsors` - Sponsor CRUD
- `POST/PUT/DELETE /api/admin/discount-codes` - İndirim kodu CRUD

## Tasarım
- **Renk Teması**: Yeşil (Gaming teması - HSL 145)
- **Font**: Inter
- **Animasyonlar**: Framer Motion ile smooth geçişler
- **Responsive**: Mobil uyumlu tasarım

## Başlatma
```bash
npm run dev
```

## Veritabanı
```bash
npm run db:push  # Schema'yı veritabanına uygula
```
