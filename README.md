# Automation Create Account & OTP For GPT Account

Alat otomasi untuk membuat akun ChatGPT secara massal. Setiap siklus membuat email sementara via API, membuka browser, melakukan registrasi, membaca OTP dari inbox, lalu menyimpan hasilnya ke file.

---

## Tech Stack

| Komponen | Teknologi |
|---|---|
| Runtime | Node.js v20+ (via `tsx`) |
| Package Manager | Bun |
| Browser Automation | Playwright (Chromium) |
| Bahasa | TypeScript |
| CLI | `@clack/prompts` + `picocolors` |

---

## Prasyarat

- [Bun](https://bun.sh) — untuk install dependencies
- [Node.js](https://nodejs.org) v20+ — untuk menjalankan script
- Chromium Playwright (install via `bun run install:browser`)

---

## Instalasi

```bash
# 1. Install dependencies
bun install

# 2. Install browser Playwright
bun run install:browser

# 3. Salin dan isi konfigurasi
cp .env.example .env
```

---

## Konfigurasi (`.env`)

```env
# URL target yang akan di-test
TARGET_URL=https://chatgpt.com

# ── Email API ──────────────────────────────────────────────────────
# Base URL API email (tanpa trailing slash)
EMAIL_API_BASE_URL=https://api.qemail.web.id/api/v1/email

# Path endpoint untuk membuat akun email baru
EMAIL_REGISTER_PATH=/generate

# Path untuk membaca inbox — {token} diganti email address secara otomatis
EMAIL_INBOX_PATH=/inbox/{token}

# Domain ID yang tersedia, dipilih acak setiap siklus
EMAIL_DOMAIN_IDS=4,5,7,8,9

# Email tujuan forward (opsional)
EMAIL_FORWARD_TO=your-email@gmail.com

# ── Browser ────────────────────────────────────────────────────────
HEADLESS=false                  # false = browser tampil, true = background
BROWSER_SLOW_MO=0               # Jeda (ms) antar aksi, 0 = secepat mungkin
BROWSER_CHANNEL=                # Kosong = pakai Chromium bundled Playwright
BROWSER_LAUNCH_TIMEOUT_MS=30000 # Timeout launch browser (ms)

# ── OTP ────────────────────────────────────────────────────────────
OTP_BATCH1_RETRIES=6            # Percobaan polling sebelum klik "Resend Email"
OTP_BATCH2_RETRIES=12           # Percobaan polling setelah klik "Resend Email"
OTP_POLL_INTERVAL_MS=5000       # Jeda antar polling (ms)

# ── Output ─────────────────────────────────────────────────────────
OUTPUT_FILE=results/results     # Prefix path — timestamp ditambahkan otomatis
OUTPUT_FORMAT=csv               # csv | txt | json
```

> **Catatan browser:** Secara default menggunakan Chromium bundled dari Playwright (folder `ms-playwright`). Jika ingin pakai Chrome/Edge yang sudah terinstall, set `BROWSER_CHANNEL=chrome` atau `BROWSER_CHANNEL=msedge`.

---

## Menjalankan

```bash
bun run start
```

Script akan menampilkan prompt interaktif:

```
┌  Automation Create Account & OTP For GPT Account
│
◆  Berapa tes yang ingin dijalankan?
│  1
│
◆  Mode headless?
│  ● Ya (background)  ○ Tidak (tampilkan browser)
│
◆  Format output?
│  ● CSV  ○ TXT  ○ JSON
│
└  Memulai 1 test...
```

---

## Alur Kerja

```
bun run start
    │
    ├─ Prompt: jumlah tes, headless, format output
    ├─ Load konfigurasi dari .env
    ├─ Launch Chromium (stealth mode)
    │
    └─ UNTUK SETIAP TES:
         │
         ├─ 1. Generate email      POST /generate → email + password
         ├─ 2. Buka browser        goto(TARGET_URL) → klik Login
         ├─ 3. Isi form            email → Enter → password → Enter
         │
         ├─ 4. Polling OTP Batch 1  (6x, interval 5s = 30 detik)
         │       └─ GET /inbox/{email} → cari kode 6 digit
         │
         ├─ 5. Jika tidak ada:     klik "Resend Email"
         │
         ├─ 6. Polling OTP Batch 2  (12x, interval 5s = 60 detik)
         │
         ├─ 7. Input OTP           per digit atau satu field
         ├─ 8. Isi profil          nama + tanggal lahir → Submit
         ├─ 9. Verifikasi          tunggu redirect ke /chat
         │
         └─ 10. Simpan hasil       email, password, status, durasi
```

Total waktu tunggu OTP maksimal: **90 detik** (batch 1 + batch 2).

---

## Output

Hasil disimpan otomatis di folder `results/` dengan timestamp:

```
results/results-2026-02-20T10-30-45.csv
```

### Format CSV

```csv
no,email,password,status,fail_reason,started_at,finished_at,duration_ms
1,user@domain.com,miawstoreidd,success,,2026-02-20 10:30:45,2026-02-20 10:35:12,267000
2,user2@domain.com,miawstoreidd,failed,OTP tidak diterima,2026-02-20 10:35:15,...
```

### Ringkasan di Terminal

```
┌─────────────────────────────────
│  Total   : 5
│  Berhasil: 4  (80%)
│  Gagal   : 1
│  File    : results/results-....csv
└─────────────────────────────────
```

---

## Struktur Project

```
src/
├── index.ts                        # Entry point
├── types/index.ts                  # TypeScript interfaces
├── config/index.ts                 # Load & validasi .env
│
├── cli/
│   ├── prompts.ts                  # Input interaktif
│   └── display.ts                  # Progress bar & ringkasan
│
├── core/
│   ├── runner.ts                   # Satu siklus tes
│   └── loop.ts                     # Loop N tes
│
├── services/
│   ├── email/
│   │   ├── adapter.ts              # Interface IEmailService
│   │   └── impl/custom.ts         # Implementasi qemail API
│   │
│   ├── browser/
│   │   ├── automation.ts           # Browser wrapper + stealth
│   │   └── steps/register.ts      # Langkah-langkah registrasi
│   │
│   └── storage/writer.ts           # Tulis hasil ke file
│
└── utils/
    ├── names.ts                    # Generator nama Korea
    ├── logger.ts                   # Log berwarna dengan timestamp
    ├── delay.ts                    # async sleep
    └── retry.ts                    # Generic retry helper

results/                            # Output tes (gitignored)
reference/                          # Script Python referensi
```

---

## Anti-Detection

Browser dikonfigurasi agar tidak terdeteksi sebagai bot:

- Flag `--disable-blink-features=AutomationControlled`
- Override `navigator.webdriver` → `undefined`
- Fake `navigator.plugins` (5 item)
- Inject `window.chrome` object
- User-Agent acak (Windows Chrome / Mac Chrome / Edge)
- Locale `en-US`, timezone `America/New_York`

---

## Screenshot Debug

Jika terjadi error pada tahap kritis, screenshot disimpan otomatis:

| File | Kondisi |
|---|---|
| `results/debug_login_fail.png` | Tombol login tidak ditemukan |
| `results/debug_challenge.png` | Captcha / challenge terdeteksi |

---

## Troubleshooting

**Browser tidak terbuka / hang**
> Pastikan menjalankan dengan `bun run start` (bukan `bun run src/index.ts` langsung). Script menggunakan Node.js via `tsx` karena Playwright tidak kompatibel dengan runtime Bun pada Windows.

**`.env` tidak terbaca**
> File `.env` harus ada di root project. Salin dari `.env.example`: `cp .env.example .env`

**OTP tidak diterima**
> Cek `EMAIL_INBOX_PATH` di `.env` — pastikan `{token}` ada sebagai placeholder dan URL endpoint sudah benar.

**Timeout saat launch browser**
> Naikkan nilai `BROWSER_LAUNCH_TIMEOUT_MS` di `.env` (default: `30000`).
