# MudaConnect

Platform informasi dan partisipasi pemuda berbasis React, Vite, Supabase, n8n,
dan Vercel Functions. Halaman publik memakai layout editorial full-width;
portal admin dimuat terpisah melalui route-level code splitting.

## Menjalankan proyek

Prasyarat:

- Node.js 22.22 atau lebih baru
- npm 11

```bash
npm ci
npm run dev
```

Mode lokal tanpa Supabase menampilkan data contoh. Portal admin demo tetap
terkunci kecuali `VITE_ENABLE_DEMO_ADMIN=true` digunakan pada development
server.

## Pemeriksaan rilis

```bash
npm run check
npm audit
```

`npm run check` menjalankan ESLint, TypeScript, Vitest, dan production build.

## Environment variables

Salin `.env.example` menjadi `.env.local` untuk pengembangan. Pada Vercel,
pisahkan variabel browser dan variabel server berikut.

| Variabel | Lingkup | Kegunaan |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser + server | URL proyek Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser + server | Publishable/anon key Supabase; bukan service-role key |
| `VITE_API_PROXY_ENABLED` | Browser | Mengaktifkan pemanggilan same-origin `/api/*` |
| `N8N_CHAT_WEBHOOK_URL` | Server | Workflow MudaBot |
| `N8N_INTEREST_WEBHOOK_URL` | Server | Workflow formulir minat |
| `N8N_CONTACT_WEBHOOK_URL` | Server | Workflow formulir kontak |
| `N8N_INTEREST_DECISION_WEBHOOK_URL` | Server | Workflow keputusan peserta |
| `N8N_CONTACT_REPLY_WEBHOOK_URL` | Server | Workflow balasan kontak |
| `N8N_SHARED_SECRET` | Server | Secret acak kuat yang diverifikasi n8n |
| `VITE_ENABLE_DEMO_ADMIN` | Development | Mengaktifkan login admin data contoh |
| `VITE_APP_NAME` | Browser | Nama aplikasi |
| `VITE_APP_BASE_URL` | Browser | URL kanonis production |

Jangan memberi prefix `VITE_` pada URL webhook, shared secret, service-role key,
atau credential server lain. n8n wajib menolak permintaan bila header
`X-MudaConnect-Secret` tidak cocok. Proxy aplikasi juga fail-closed bila URL
webhook atau `N8N_SHARED_SECRET` belum dikonfigurasi.

## Supabase

Migration tersedia dalam urutan:

1. `supabase/migrations/202607260000_base_schema.sql`
2. `supabase/migrations/202607260001_harden_public_access.sql`
3. `supabase/migrations/202608230001_tighten_admin_privileges.sql`

Migration pertama membuat skema, index, trigger profil, dan bucket untuk proyek
baru. Migration kedua menambahkan field takarir/transkrip serta RLS dasar.
Migration ketiga memperketat privilege admin:

- anon hanya dapat membaca program, FAQ, dan konten berstatus `published`;
- data minat, kontak, chat, settings, profil, serta audit hanya dapat diakses
  admin aktif;
- admin aktif dapat membaca daftar profil, tetapi hanya `super_admin` aktif yang
  dapat membuat, mengubah, atau menghapus profil melalui client;
- audit log dapat dibaca admin dan ditambahkan untuk identitas admin yang sedang
  login, tetapi tidak dapat diubah atau dihapus dari dashboard;
- tidak ada kebijakan anon untuk menulis form/chat—workflow n8n menulis dengan
  service role di sisi server;
- media publik dapat dibaca siapa pun, tetapi mutasi storage hanya untuk admin.

Untuk database yang sudah berisi tabel, tinjau schema diff sebelum menjalankan
migration. Jangan menghapus policy lama tanpa memastikan nama dan tujuan
policy-nya. Setelah user admin pertama dibuat melalui Supabase Auth, promosikan
profilnya melalui SQL Editor dengan akses pemilik proyek:

```sql
update public.profiles
set role = 'super_admin', is_active = true
where email = 'email-admin@example.com';
```

Jangan menjalankan perintah promosi tersebut dari browser.

## Alur integrasi

Browser hanya memanggil endpoint same-origin:

- `/api/chat`
- `/api/interest`
- `/api/contact`
- `/api/interest-decision`
- `/api/contact-reply`

Vercel Functions memeriksa method, origin, ukuran JSON, field wajib, honeypot,
waktu pengisian form, dan rate limit best-effort. Dua endpoint admin juga
memverifikasi access token, status profil, dan role aktif melalui Supabase
sebelum meneruskan permintaan.

Semua request dari proxy ke n8n membawa `X-MudaConnect-Secret`. Webhook n8n
harus menggunakan Header Auth dengan nilai yang sama. Untuk endpoint admin,
proxy juga mengirim `X-MudaConnect-Admin-Id` yang berasal dari user Supabase
yang sudah diverifikasi. Bearer token browser tidak diteruskan ke n8n.

Dengan trust boundary ini, workflow admin n8n tidak perlu mengulang verifikasi
Supabase Auth dan lookup role. n8n tetap wajib melakukan validasi payload,
conditional reservation/idempotency sebelum mengirim email, penyimpanan dengan
credential Supabase yang sesuai, serta sanitasi output.

Rate limit in-memory pada proxy bukan pengganti rate limit pada Vercel
Firewall/n8n karena instance serverless dapat bertambah.

## Deployment Vercel + n8n

1. Gunakan Node.js 22.22+.
2. Atur seluruh environment variable production, termasuk `N8N_SHARED_SECRET`.
3. Di n8n buat Header Auth credential dengan nama header
   `X-MudaConnect-Secret` dan value yang sama dengan `N8N_SHARED_SECRET`.
4. Terapkan credential tersebut ke kelima Webhook workflow MudaConnect.
5. Jalankan ketiga migration Supabase dan verifikasi RLS menggunakan akun anon,
   admin, super-admin, serta user biasa.
6. Pastikan kelima production webhook URL dipasang sebagai `N8N_*_WEBHOOK_URL`,
   bukan `VITE_N8N_*`.
7. Jalankan `npm ci && npm run check`.
8. Deploy, lalu uji desktop/mobile, form minat, form kontak, MudaBot, login
   admin, keputusan peserta, dan balasan kontak.

`vercel.json` menyediakan SPA fallback melalui rewrite serta CSP, HSTS,
anti-framing, referrer policy, dan permissions policy. Production Express
server (`npm start`) memasang header keamanan yang setara. Bila domain media
atau API eksternal baru ditambahkan, perbarui CSP secara eksplisit.

## Struktur

- `api/` — Vercel Functions untuk proxy n8n
- `src/pages/public/` — halaman publik
- `src/pages/admin/` — portal pengelola
- `src/components/` — komponen UI, brand, media, legal, dan chatbot
- `src/services/supabase/` — data, autentikasi, storage, dan mode lokal
- `src/server/` — guard dan forwarder server
- `supabase/migrations/` — skema dan kebijakan produksi
- `public/` — robots, sitemap, dan web manifest
