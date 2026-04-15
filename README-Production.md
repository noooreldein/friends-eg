# نسخة محدثة من README - للاستضافة

# FRIENDS STORE 📱

متجر إلكتروني عربي احترافي مع عربية كاملة وميزات متقدمة.

## ✨ الميزات الرئيسية

- ✅ واجهة عربية كاملة RTL
- ✅ مصادقة متعددة (Email, Phone, Google, Facebook)
- ✅ سلة تسوق محلية
- ✅ نظام إدارة منتجات وطلبات
- ✅ بحث وتصفية متقدمة
- ✅ تقييمات المنتجات
- ✅ تتبع الطلبات
- ✅ لوحة تحكم إدارية

---

## 🚀 التثبيت والتشغيل السريع

### المتطلبات
- Node.js 14+ و npm
- متصفح حديث

### خطوات التثبيت

1. **استنساخ المشروع**
```bash
git clone <repository_url>
cd friends
```

2. **تثبيت المكتبات**
```bash
npm install
```

3. **إعداد متغيرات البيئة**
```bash
# انسخ الملف
cp .env.example .env

# عدّل القيم (خاصة JWT_SECRET)
nano .env
```

4. **تشغيل السيرفر**
```bash
# للتطوير
npm run dev

# للإنتاج
npm run prod
```

5. **فتح المتجر**
```
http://localhost:3000
```

---

## 📋 الملفات المهمة

```
├─ server.js              - السيرفر الرئيسي (Express)
├─ package.json           - المكتبات والـ scripts
├─ .env                   - متغيرات البيئة (سري)
├─ .env.example           - نموذج الإعدادات
│
├─ data/
│  ├─ products.json       - المنتجات
│  ├─ orders.json         - الطلبات
│  ├─ users.json          - المستخدمين
│  ├─ reviews.json        - التقييمات
│  └─ seed.json           - بيانات أولية
│
├─ images/uploads/        - الصور المرفوعة
│
├─ js/
│  ├─ app.js              - منطق البحث والتصفية
│  ├─ auth.js             - المصادقة والدخول
│  ├─ admin.js            - لوحة التحكم
│  ├─ firebase-config.js  - إعدادات Firebase
│  ├─ i18n.js             - اللغات
│  ├─ review.js           - التقييمات
│  ├─ track.js            - تتبع الطلبات
│  └─ ui.js               - وظائف الواجهة
│
├─ css/
│  ├─ style.css           - الأنماط الرئيسية
│  └─ auth-search.css     - أنماط إضافية
│
└─ *.html                 - الصفحات (index, auth, cart, etc)
```

---

## 🔐 أمان

### متغيرات البيئة الحساسة
```
JWT_SECRET          - مفتاح التوقيع (يجب تغييره!)
FIREBASE_API_KEY    - مفتاح Firebase
NODE_ENV            - بيئة التشغيل (development/production)
```

### نصائح الأمان
1. لا تنشر `.env` على GitHub
2. استخدم كلمات سر قوية
3. فعّل HTTPS في الإنتاج
4. احفظ نسخة backup يومية
5. حدّث المكتبات بانتظام

---

## 📱 API Endpoints

### المصادقة
```bash
POST   /api/auth/register      - تسجيل حساب جديد
POST   /api/auth/login         - دخول
GET    /api/auth/me            - بيانات المستخدم الحالي
POST   /api/auth/logout        - خروج
```

### المنتجات
```bash
GET    /api/products           - قائمة المنتجات
GET    /api/products/:id      - تفاصيل منتج
GET    /api/categories         - الفئات
GET    /api/hero              - شريط البداية
```

### الطلبات
```bash
GET    /api/orders/my         - طلبات المستخدم
POST   /api/orders            - إنشاء طلب
GET    /api/orders/:id        - تفاصيل طلب
PUT    /api/orders/:id        - تحديث الحالة
```

### التقييمات
```bash
POST   /api/reviews           - إضافة تقييم
GET    /api/orders/:id/reviews - تقييمات الطلب
```

---

## 🌐 النشر على الاستضافة

اتبع [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) للتعليمات الكاملة.

### نشر سريع على Vercel
```bash
npm install -g vercel
vercel
```

### نشر على Heroku
```bash
heroku create your-app-name
heroku config:set JWT_SECRET="your-strong-secret"
git push heroku main
```

---

## 🧪 الاختبار

استخدم حسابات التجربة:
```
Email: admin@friends.local
Password: admin123
```

### اختبار API
```bash
curl http://localhost:3000/api/products
```

---

## 🐛 استكشاف الأخطاء

### "Cannot find module"
```bash
npm install
```

### "Port already in use"
```bash
PORT=3001 npm start
```

### Firebase errors
- تحقق من `js/firebase-config.js`
- تأكد من تفعيل الخدمات في Firebase Console

---

## 📞 الدعم

- تقييمات المستخدمين: ✅
- تتبع الطلبات: ✅
- تواصل مع الإدارة: ✅

---

## 📄 الترخيص

تم إنشاؤه بـ ❤️ لـ متجر FRIENDS

**آخر تحديث**: 16 أبريل، 2026
