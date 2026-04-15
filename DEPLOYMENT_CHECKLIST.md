# 🚀 DEPLOYMENT CHECKLIST - قائمة الفحص

## ✅ تم إنجازه

- [x] تحديث جميع مراجع localhost إلى API نسبي
  - ✔️ js/app.js
  - ✔️ js/auth.js
  - ✔️ js/admin.js
  - ✔️ js/review.js
  - ✔️ js/track.js

- [x] تأمين المفاتيح والسرات
  - ✔️ JWT_SECRET محدث
  - ✔️ dotenv مثبت وموصول
  - ✔️ .env و .env.example منشأة

- [x] تحديث server.js
  - ✔️ dotenv import مضاف
  - ✔️ JWT_SECRET محدث
  - ✔️ CORS منضبط للإنتاج
  - ✔️ console.log محدث

- [x] تحديث package.json
  - ✔️ dotenv مضافة
  - ✔️ scripts جديدة (start, dev, prod)

- [x] ملفات التوثيق
  - ✔️ PRODUCTION_SETUP.md الشامل
  - ✔️ README-Production.md محدث
  - ✔️ .gitignore لحماية الملفات الحساسة

---

## 📋 خطوات ما قبل النشر

### 1. اختبار محلي ✅
```bash
cd "c:\Users\T.B\Desktop\فريندز"
npm install
npm start
```
ثم قم بفحص:
- [ ] الإنتاجات تحمل بسهولة
- [ ] API تعمل (localhost:3000/api/products)
- [ ] المصادقة تعمل
- [ ] السلة تعمل
- [ ] البحث يعمل

### 2. إعداد البيئة 🔐
```bash
# تحديث .env بقيم الإنتاج
PORT=3000
JWT_SECRET=استخدم كلمة معقدة جداً هنا!
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### 3. اختبار البناء 🔨
```bash
npm audit          # فحص الثغرات
npm start         # تشغيل محلي
```

### 4. إعداد الاستضافة ☁️

#### اختيار الاستضافة:
- [ ] Vercel (سهل جداً للـ Node.js)
- [ ] Heroku (كلاسيكي وموثوق)
- [ ] DigitalOcean (VPS مجدي)
- [ ] AWS/GCP/Azure (مؤسسي)
- [ ] استضافة محلية (cPanel/VPS)

#### الخطوات العامة:
1. أنشئ تطبيق جديد
2. اربط مستودع GitHub أو انسخ الملفات
3. ثبّت Node.js و npm
4. أضف متغيرات البيئة (.env)
5. شغّل `npm install`
6. شغّل `npm start` أو استخدم PM2

### 5. تفعيل HTTPS 🔒
- [ ] احصل على شهادة SSL (Let's Encrypt مجاني)
- [ ] فعّل HTTPS على الاستضافة
- [ ] حدّث الـ domain في Firebase

### 6. فحص النشر 🧪

بعد النشر، اختبر:
```bash
# 1. فحص الصحة
curl https://yourdomain.com/api/health

# 2. الحصول على المنتجات
curl https://yourdomain.com/api/products

# 3. اختبار تسجيل الدخول
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@friends.local","password":"admin123"}'
```

### 7. Backup 💾
- [ ] احفظ قاعدة البيانات (data/ folder)
- [ ] احفظ الصور المرفوعة (images/uploads/)
- [ ] احفظ الملفات المهمة

---

## 🔐 متغيرات البيئة المطلوبة

```env
# إلزامي
PORT=3000
JWT_SECRET=use-strong-random-string-here
NODE_ENV=production

# اختياري لكن موصى
CORS_ORIGIN=https://yourdomain.com
FIREBASE_API_KEY=...
ADMIN_WHATSAPP=201094708407
```

---

## 📱 اختبارات يدوية

### 1. الدخول بـ Email
```
استخدم: admin@friends.local / admin123
النتيجة: يجب أن تتمكن من الدخول ورؤية الصفحة الرئيسية
```

### 2. البحث والتصفية
```
النتيجة: يجب أن تظهر المنتجات بسرعة
```

### 3. السلة
```
أضف منتج → تحقق من localStorage
النتيجة: يجب أن يبقى الكارت بعد التحديث
```

### 4. Checkout
```
أتمم الطلب
النتيجة: يجب أن يعود رقم الطلب وحالة pending
```

### 5. التقييمات
```
أكمل طلب → اضغط على review
النتيجة: يجب أن تتمكن من التقييم
```

---

## 🚨 الأخطاء الشائعة

### Error: "Cannot find module 'dotenv'"
**الحل:**
```bash
npm install dotenv
```

### Error: "JWT_SECRET is undefined"
**الحل:**
1. تأكد من وجود `.env`
2. أضف `JWT_SECRET=...`
3. أعد تشغيل السيرفر

### CORS Error: "Access to XMLHttpRequest blocked"
**الحل:**
```env
# في .env
CORS_ORIGIN=https://yourdomain.com
```

### Port 3000 already in use
**الحل:**
```bash
PORT=3001 npm start
```

### Firebase Errors
**الحل:**
- تحقق من firebase-config.js
- تأكد من API keys الصحيحة
- فعّل الخدمات المطلوبة في Firebase Console

---

## 📞 الدعم والمساعدة

### فحوصات سريعة
1. افتح DevTools (F12)
2. اذهب إلى Console و Network
3. ابحث عن أخطاء حمراء
4. افحص طلبات API

### Logs
```bash
# مع PM2
pm2 logs friends

# مع Docker
docker logs container_id

# مع Heroku
heroku logs --tail
```

---

## ✨ نصائح الإنتاج

### 1. Monitoring
```bash
# استخدم PM2 لإعادة التشغيل التلقائي
npm install -g pm2
pm2 start server.js --name friends
pm2 startup
pm2 save
```

### 2. Database Backup
```bash
# نسخ احتياطي يومي من data/
cp -r data/ data.backup.$(date +%Y%m%d)
```

### 3. Logs والـ Error Tracking
```bash
# استخدم خدمة مثل Sentry أو LogRocket
# لتتبع الأخطاء في الإنتاج
```

### 4. Performance
```bash
# استخدم Nginx كـ reverse proxy
# CDN للصور
# Compression للردود
```

---

## 📊 Checklist النشر النهائي

- [ ] npm install تم
- [ ] .env محدث بـ secrets قوية
- [ ] اختبار محلي ناجح (npm start)
- [ ] جميع الـ endpoints تعمل بـ curl
- [ ] HTTPS مفعل
- [ ] Domain يشير إلى السيرفر
- [ ] Firebase authorized domains محدثة
- [ ] Backup من data/ موجود
- [ ] .gitignore يحمي الملفات الحساسة
- [ ] README-Production.md مقروء ومفهوم

---

## 🎉 تم!

**الحالة:** جاهز للنشر  
**الملفات المحدثة:** 8 ملفات  
**الملفات الجديدة:** 5 ملفات  
**آخر تحديث:** 16 أبريل، 2026

---

## الخطوة التالية

اختر واحدة من الخيارات وابدأ النشر:

1. **Vercel** (الأسهل)
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Heroku** (الموثوق)
   ```bash
   heroku create friends-app
   heroku config:set JWT_SECRET="..."
   git push heroku main
   ```

3. **DigitalOcean** (المجدي)
   - أنشئ droplet
   - ثبّت Node
   - انسخ الملفات
   - استخدم PM2

4. **استضافة عادية** (VPS/cPanel)
   - SSH وانسخ
   - npm install
   - pm2 start
   - nginx proxy

**Good luck! 🚀**
