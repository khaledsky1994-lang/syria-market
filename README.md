# سوق سوريا | Syria Market

منصة بيع وشراء المستعملات (على غرار eBay/OpenSooq) — تطبيق جوال بلغتين (عربي/إنكليزي) لسوق سوريا.
A full-stack marketplace app for buying/selling used goods — bilingual (Arabic/English) mobile app for Syria.

## المكونات / What's included

- **`backend/`** — Node.js + Express REST API, SQLite database (via Prisma ORM), JWT authentication, real-time chat (Socket.IO), image uploads.
- **`mobile/`** — React Native (Expo) app: browsing, search & filters, categories, post-a-listing with photos, buyer↔seller chat, ratings/reviews, favorites, admin dashboard, full Arabic (RTL) / English support.

## الميزات المطبقة / Implemented features

✅ تسجيل حساب / تسجيل دخول (JWT) — Register / Login
✅ قاعدة بيانات دائمة (SQLite, قابلة للترقية لـ PostgreSQL) — Persistent database
✅ عرض المنتجات + الأقسام + البحث والفلاتر (سعر، حالة، مدينة، ترتيب) — Browse, categories, search & filters
✅ نشر إعلان جديد مع صور متعددة — Post new listing with multiple photos
✅ رسائل مباشرة بين البائع والمشتري (Real-time via Socket.IO) — Buyer↔seller messaging
✅ المفضلة — Favorites
✅ تقييمات ومراجعات البائعين — Seller ratings & reviews
✅ الإبلاغ عن إعلان — Report a listing
✅ لوحة تحكم إدارية (إحصائيات، حظر مستخدمين، مراجعة إعلانات، بلاغات) — Admin dashboard
✅ دعم كامل للعربية (RTL) والإنكليزية — Full Arabic RTL + English support
✅ تسجيل دخول بجوجل — Google sign-in (يحتاج إعداد بسيط، انظر أدناه)
✅ تأكيد البريد الإلكتروني عند التسجيل — Email verification on signup
✅ تعديل وحذف الإعلانات (لصاحبها) — Edit & delete your own listings
✅ دعم اللغة التركية بالكامل (بالإضافة للعربية والإنكليزية) — Full Turkish support (alongside Arabic & English)
✅ شجرة أقسام وفروع مفصّلة (على غرار صاحبندان) — Deep category tree with subcategories (Sahibinden-style)

### الأقسام والفروع / Categories & subcategories
النظام يستخدم بنية أقسام رئيسية + فروع (مثل صاحبندان): كل قسم رئيسي (سيارات، عقارات، إلكترونيات...) له عدة فروع دقيقة (سيارات → سيارات، دراجات نارية، قطع غيار...). بالصفحة الرئيسية، اضغط على أي قسم رئيسي ليظهر فروعه مباشرة دون مغادرة الصفحة. صفحة البحث فيها زر تبديل بين عرض شبكي وعرض قائمة، تماماً متل صاحبندان.
The system uses a top-category + subcategory structure (like Sahibinden): each top category (Vehicles, Real Estate, Electronics...) has several precise subcategories. On the home page, clicking a top category reveals its subcategories inline without leaving the page. The search page has a grid/list view toggle, just like Sahibinden.

يمكنك تعديل شجرة الأقسام من `backend/prisma/seed.js` وإعادة تشغيل `npm run seed`.
You can edit the category tree in `backend/prisma/seed.js` and re-run `npm run seed`.

### تسجيل الدخول بجوجل / Google Sign-In setup
1. روح لـ https://console.cloud.google.com/apis/credentials وأنشئ مشروع (مجاني)
2. Create Credentials → OAuth client ID → Web application
3. أضف `http://localhost:5173` تحت Authorized JavaScript origins
4. انسخ الـ Client ID وحطّه بمكانين:
   - `backend/.env` → `GOOGLE_CLIENT_ID="..."`
   - `web/.env` (أنشئه من `web/.env.example`) → `VITE_GOOGLE_CLIENT_ID="..."`
5. أعد تشغيل الـ backend والويب

بدون هذا الإعداد، التطبيق يعمل بشكل طبيعي بالتسجيل العادي فقط — زر جوجل يظهر رسالة توضح إنه غير مُفعّل بدل ما يتعطل.
Without this setup, the app works fine with regular email/password registration — the Google button just shows a note that it's not configured yet, instead of breaking.

### تأكيد البريد الإلكتروني / Email verification setup
افتراضياً (بدون إعداد)، رابط التأكيد يُطبع في طرفية الـ backend مباشرة — جرّبه فوراً بدون أي حساب بريد.
By default, the verification link is printed directly in the backend terminal — test it immediately with no email account needed.

لإرسال إيميلات حقيقية لاحقاً، عبّي هذي القيم في `backend/.env`:
To send real emails later, fill these into `backend/.env`:
```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="youraddress@gmail.com"
SMTP_PASS="your-16-character-app-password"   # Google Account → Security → App Passwords
SMTP_FROM="Syria Market <youraddress@gmail.com>"
```
(أو استخدم خدمة مجانية مثل Resend/SendGrid ببيانات SMTP الخاصة فيها)
(or use a free service like Resend/SendGrid with their SMTP credentials)

### تسجيل الدخول بآبل / Apple Sign-In
يحتاج حساب Apple Developer مدفوع (99$/سنة). البنية الأساسية بالـ backend جاهزة (`POST /api/auth/apple`) لحد ما تصير جاهز تربطها بحسابك.
Requires a paid Apple Developer account ($99/year). The backend scaffolding (`POST /api/auth/apple`) is ready to wire up once you have one.

### ملاحظة حول الدفع / Payment note
لم يتم دمج بوابة دفع إلكتروني لأن معظم البوابات العالمية (Stripe, PayPal...) لا تعمل في سوريا بسبب العقوبات.
بدلاً من ذلك، التطبيق يعتمد على نموذج **"الدفع عند الاستلام / التواصل المباشر"** وهو المعتمد فعلياً في منصات مشابهة بالمنطقة.
إذا توفرت لديك بوابة دفع محلية تعمل فعلياً في سوريا، يمكن دمجها لاحقاً.

Payment gateways like Stripe/PayPal generally don't operate in Syria due to sanctions, so this app uses a **cash-on-delivery / direct-contact** model instead — the same approach used by comparable regional platforms. A real local payment gateway can be integrated later if you have one available.

---

## 1) تشغيل الـ Backend / Running the backend

**المتطلبات / Requirements:** Node.js 18+

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev --name init   # creates the SQLite database + tables
npm run seed                          # adds categories + an admin account
npm run dev                           # starts the API on http://localhost:4000
```

**حساب المشرف الافتراضي / Default admin account:**
- Email: `admin@syriamarket.sy`
- Password: `Admin123!`
(غيّر كلمة المرور فوراً في بيئة الإنتاج / change this immediately in production)

**فحص أن الخادم يعمل / Verify it's running:**
```bash
curl http://localhost:4000/api/health
```

## 2) تشغيل تطبيق الويب / Running the web app

**المتطلبات / Requirements:** Node.js 18+ (تأكد إن الـ backend شغّال أولاً من الخطوة السابقة)

```bash
cd web
npm install
npm run dev
```

سيفتح التطبيق تلقائياً على `http://localhost:5173` — افتحه في أي متصفح.
This opens automatically at `http://localhost:5173` — open it in any browser.

يشمل: الرئيسية، البحث والفلاتر، تفاصيل الإعلان، نشر إعلان بصور، الرسائل المباشرة (Real-time)، الملف الشخصي، ولوحة تحكم المشرف — بنفس الـ backend تماماً.
Includes: home feed, search & filters, listing details, post-a-listing with photos, real-time messaging, profile, and admin dashboard — all powered by the same backend.

**لبناء نسخة جاهزة للنشر / To build a production bundle:**
```bash
npm run build
```
الملفات الناتجة في `web/dist/` جاهزة للرفع على أي استضافة ثابتة (Vercel, Netlify, GitHub Pages, أو أي خادم ويب عادي).
Output files land in `web/dist/` — ready to deploy to any static host (Vercel, Netlify, GitHub Pages, or a plain web server).

## 3) تشغيل تطبيق الجوال / Running the mobile app

**المتطلبات / Requirements:** Node.js 18+, Expo Go app on your phone (or an emulator)

```bash
cd mobile
npm install
```

**مهم جداً / IMPORTANT:** افتح `mobile/src/api/client.js` وعدّل `BASE_URL` ليشير إلى عنوان جهازك على الشبكة المحلية:
Open `mobile/src/api/client.js` and set `BASE_URL` to your computer's address:
- Android emulator → `http://10.0.2.2:4000/api` (already set)
- iOS simulator → `http://localhost:4000/api`
- هاتف حقيقي / physical phone → `http://<YOUR_COMPUTER_LAN_IP>:4000/api` (e.g. `http://192.168.1.5:4000/api`)

```bash
npx expo start
```
ثم امسح رمز QR بتطبيق Expo Go على هاتفك، أو اضغط `a` لتشغيل محاكي أندرويد، أو `i` لمحاكي iOS.
Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

---

## هيكل قاعدة البيانات / Database schema (highlights)

- **User** — الاسم، البريد، الهاتف، كلمة المرور المشفرة، الدور (مستخدم/مشرف)
- **Category** — أقسام رئيسية وفرعية بلغتين
- **Listing** — الإعلان (عنوان، وصف، سعر، حالة، مدينة، صور)
- **Conversation / Message** — محادثات ورسائل بين المستخدمين
- **Review** — تقييمات المستخدمين لبعضهم
- **Favorite / Report** — المفضلة والبلاغات

راجع `backend/prisma/schema.prisma` للتفاصيل الكاملة.
See `backend/prisma/schema.prisma` for full details.

## للنشر في الإنتاج / Moving to production

1. **قاعدة البيانات / Database:** بدّل `provider` في `schema.prisma` من `sqlite` إلى `postgresql` واستخدم خدمة استضافة مثل Railway أو Supabase أو خادمك الخاص.
2. **الاستضافة / Hosting:** انشر الـ backend على خدمة مثل Railway, Render, أو VPS. انشر تخزين الصور على خدمة سحابية (S3-compatible) بدلاً من القرص المحلي.
3. **الأمان / Security:** غيّر `JWT_SECRET`، فعّل HTTPS، وأضف Rate limiting.
4. **متجر التطبيقات / App stores:** استخدم `eas build` (Expo Application Services) لبناء نسخة قابلة للنشر على Google Play / App Store.
5. **multer:** تم استخدام الإصدار 1.x للتوافق السريع؛ يُنصح بالترقية إلى multer 2.x قبل الإنتاج لأسباب أمنية.

---

## هيكل المشروع / Project structure

```
syria-market/
├── backend/
│   ├── prisma/schema.prisma      # database schema
│   ├── prisma/seed.js            # initial categories + admin
│   └── src/
│       ├── index.js              # server entry point
│       ├── middleware/auth.js    # JWT auth
│       └── routes/               # auth, listings, categories, messages, reviews, admin, reports
├── web/                            # React (Vite) web app — same backend, browser-based
│   └── src/
│       ├── pages/                  # Home, Search, ListingDetail, CreateListing, Login, Register, Messages, Profile, Admin
│       ├── components/             # Header, Footer, ListingCard
│       ├── context/AuthContext.jsx
│       ├── api/client.js
│       └── i18n/                   # ar.json, en.json translations
└── mobile/                         # React Native (Expo) app — for later, once you're ready to go mobile
    ├── App.js
    └── src/
        ├── screens/               # all app screens
        ├── navigation/            # tab + stack navigation
        ├── context/               # auth + language (RTL) state
        ├── api/client.js          # axios API client
        ├── i18n/                  # ar.json, en.json translations
        └── theme/colors.js
```

## من الويب إلى الجوال / Web → Mobile later

الاثنان (`web/` و `mobile/`) يستخدمان بالضبط نفس الـ backend ونفس نقاط الـ API. لما تصير جاهز للانتقال لتطبيق جوال حقيقي، مجلد `mobile/` جاهز أصلاً بنفس الميزات — فقط اتبع خطوات التشغيل في القسم رقم 3 أدناه.

Both `web/` and `mobile/` talk to the exact same backend and API endpoints. When you're ready to move to a real mobile app, the `mobile/` folder is already built with the same features — just follow the setup steps in section 3 below.
