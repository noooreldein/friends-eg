# دليل نشر FRIENDS على الاستضافة

## الخطوات السريعة

### 1. تحضير الملفات
- تم تحديث جميع مراجع `localhost` إلى API نسبي
- الآن يعمل مع أي domain تلقائياً

### 2. إعداد ملف .env
```bash
# انسخ الملف
cp .env.example .env

# عدّل القيم في .env:
PORT=3000
JWT_SECRET=your_strong_secret_key_here
NODE_ENV=production
```

### 3. توليد JWT Secret آمن
```bash
# على Linux/Mac:
openssl rand -hex 32

# على Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 4. تثبيت المكتبات
```bash
npm install
```

### 5. تشغيل السيرفر
```bash
# في الاستضافة:
npm start
# أو
node server.js
```

## ملفات مهمة

### ✅ تم تحديثها للإنتاج:
- ✔️ `js/app.js` - API نسبي
- ✔️ `js/auth.js` - API نسبي
- ✔️ `js/admin.js` - API نسبي
- ✔️ `js/review.js` - API نسبي
- ✔️ `js/track.js` - API نسبي
- ✔️ `server.js` - JWT Secret آمن + console.log محدث

### 📄 ملفات جديدة:
- `.env` - متغيرات البيئة
- `.env.example` - نموذج الإعدادات

---

## نصائح الأمان

### 1. **JWT_SECRET**
- ⚠️ غيّره فوراً في .env
- استخدم كلمة معقدة وعشوائية
- لا تنسخه في أي مكان عام

### 2. **Firebase Credentials**
- آمنة على الـ frontend (public API key في HTML)
- لا تعرّض private keys على الـ client

### 3. **.env File**
- أضفه إلى `.gitignore`
- لا تشاركه على الـ GitHub
- احفظه في مكان آمن

### 4. **HTTPS**
- استخدم HTTPS في الإنتاج (لا بد منه!)
- اطلب شهادة SSL مجانية من Let's Encrypt

---

## Deployment على Hosting شهيرة

### Vercel
```bash
# تثبيت Vercel CLI
npm install -g vercel

# Deploy
vercel
```
⚠️ يجب اختيار Node.js runtime

### Heroku
```bash
# تسجيل الدخول
heroku login

# إنشاء تطبيق
heroku create your-app-name

# إضافة متغيرات البيئة
heroku config:set JWT_SECRET="your_secret"

# Deploy
git push heroku main
```

### Render.com
1. اربط مستودع GitHub
2. أنشئ Web Service جديد
3. اختر Node
4. أضف `Start Command`: `npm start`
5. أضف Environment Variables

### DigitalOcean / AWS / GCP
1. أنشئ سيرفر Linux
2. ثبّت Node.js و npm
3. انسخ الملفات
4. ثبّت dependences: `npm install`
5. استخدم PM2 للتشغيل المستمر:
```bash
npm install -g pm2
pm2 start server.js --name friends
pm2 startup
pm2 save
```

---

## اختبار بعد النشر

### 1. فحص الصحة
```bash
curl https://yourdomain.com/api/health
# يجب أن ترد: {"status":"ok"}
```

### 2. تسجيل الدخول
```bash
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@friends.local","password":"admin123"}'
```

### 3. فحص المنتجات
```bash
curl https://yourdomain.com/api/products
```

---

## حل المشاكل الشائعة

### "Port is already in use"
```bash
# استخدم port آخر
PORT=3001 node server.js
```

### "Cannot find module"
```bash
npm install
```

### "JWT_SECRET undefined error"
تأكد من:
1. `.env` موجود
2. `JWT_SECRET=...` مضافة
3. أعدت تشغيل السيرفر

### CORS Errors
احرص على:
1. Domain صحيح
2. HTTPS في الإنتاج
3. Firebase CORS settings محدثة

---

## Monitoring في الإنتاج

### سجلات الأخطاء
```bash
# مع PM2
pm2 logs friends

# مع Docker
docker logs container_name
```

### متطلبات مساحة
- `data/` folder - قاعدة البيانات (JSON)
- `images/uploads/` - الصور المرفوعة
- احفظ نسخة backup يومياً!

---

## خطوات أمان إضافية (اختياري)

### 1. قاعدة بيانات حقيقية
- استبدل JSON بـ MongoDB أو PostgreSQL
- أكثر أماناً وقابلية للتوسع

### 2. Reverse Proxy (Nginx)
- استقبل الطلبات والتوزيع
- تفعيل HTTPS/SSL
- تخفيف الحمل

### 3. Rate Limiting
```javascript
// في server.js
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);
```

---

## Checklist قبل النشر

- [ ] تم تثبيت npm install
- [ ] تم تحديث .env بـ JWT_SECRET قوي
- [ ] تم اختبار locally: `node server.js`
- [ ] تم فحص جميع الـ endpoints بـ curl
- [ ] تم إضافة HTTPS على الاستضافة
- [ ] تم backup قاعدة البيانات
- [ ] تم تفعيل Firebase Security Rules
- [ ] تم إضافة domain في Firebase CORS

---

**آخر تحديث**: 16 أبريل، 2026
**الحالة**: جاهز للنشر
