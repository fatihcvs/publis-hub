# İçerik Üreticisi Kişisel Web Sitesi

## Proje Açıklaması
Kick ve YouTube içerik üreticileri için kişisel web sitesi. Sosyal medya linkleri, sponsorlar ve özel indirim kodları içerir.

## Özellikler
- **Hero Bölümü**: Profil fotoğrafı, isim, başlık ve bio
- **Sosyal Medya Linkleri**: Kick, YouTube, Twitter/X, Instagram, Discord, TikTok
- **Sponsorlar**: Sponsor kartları ile logo, açıklama ve web sitesi linki
- **İndirim Kodları**: Tek tıkla kopyalama, indirim yüzdesi gösterimi
- **Tema Değiştirme**: Koyu/açık mod desteği

## Teknik Yapı

### Frontend (React + TypeScript)
- `/client/src/pages/home.tsx` - Ana sayfa
- `/client/src/components/hero-section.tsx` - Hero bölümü
- `/client/src/components/social-links-section.tsx` - Sosyal linkler
- `/client/src/components/sponsors-section.tsx` - Sponsorlar
- `/client/src/components/discount-codes-section.tsx` - İndirim kodları
- `/client/src/components/theme-provider.tsx` - Tema yönetimi
- `/client/src/components/theme-toggle.tsx` - Tema değiştirme butonu

### Backend (Express + TypeScript)
- `/server/routes.ts` - API endpointleri
- `/server/storage.ts` - Veritabanı işlemleri
- `/server/db.ts` - PostgreSQL bağlantısı
- `/server/seed.ts` - Örnek veri ekleme

### Veritabanı (PostgreSQL + Drizzle ORM)
- `/shared/schema.ts` - Veri modelleri
  - `profile` - Profil bilgileri
  - `socialLinks` - Sosyal medya linkleri
  - `sponsors` - Sponsor bilgileri
  - `discountCodes` - İndirim kodları

### API Endpointleri
- `GET /api/profile` - Profil bilgilerini getir
- `GET /api/social-links` - Sosyal linkleri getir
- `GET /api/sponsors` - Sponsorları getir
- `GET /api/discount-codes` - İndirim kodlarını getir

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
