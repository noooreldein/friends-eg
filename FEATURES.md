# FRIENDS - Updates Documentation

## Overview
نم تحديث الموقع بميزات متقدمة للمصادقة والبحث الذكي والتصفية. يمكن للمستخدمين الآن تسجيل الدخول عبر البريد أو رقم الهاتف مع دعم Firebase OAuth.

---

## ✨ الميزات الجديدة

### 1️⃣ **نظام المصادقة المتقدم (Authentication)**

#### 1.1 تسجيل الدخول والتسجيل عبر البريد الإلكتروني
- **نموذج تقليدي**: بريد + كلمة مرور
- **الحد الأدنى لكلمة المرور**: 6 أحرف
- **التحقق من وجود البريد**: منع البريد المكرر
- **Endpoint**: `POST /api/auth/login` و `POST /api/auth/register`

#### 1.2 تسجيل الدخول والتسجيل عبر رقم الهاتف
- **المدخل**: رقم هاتف بصيغة دولية (`+20...`) أو محلية (`010...`)
- **التحقق عبر Firebase**: إرسال رمز SMS
- **العملية**:
  1. أدخل رقم الهاتف
  2. اضغط "أرسل رمز التعبئة"
  3. أدخل الرمز المستلم
  4. يتم تحويل البيانات الموثقة من Firebase للخادم
- **Endpoint**: `POST /api/auth/phone`

#### 1.3 دعم OAuth (Google و Facebook)
- **أزرار اجتماعية**: في نموذج الدخول والتسجيل
- **التكامل مع Firebase**: مصادقة آمنة
- **الحساب التلقائي**: ينشئ حسابًا تلقائيًا عند أول دخول
- **Endpoint**: `POST /api/auth/oauth`

#### 1.4 صفحة الحساب الشخصي
- **عرض المعلومات**: الاسم والبريد/الهاتف
- **قائمة الطلبات السابقة**: جميع الطلبات المرتبطة بحسابك
- **زر تسجيل الخروج**: حذف التوكن المحفوظ

#### 1.5 البيانات المحفوظة
في قاعدة البيانات، يتم حفظ: `email`, `phone`, `passwordHash`, `name`, `role`, `id`

---

### 2️⃣ **البحث الذكي والتصفية المتقدمة**

#### 2.1 شريط البحث بـ Autocomplete
- **اقتراحات ديناميكية**: يظهر أسماء المنتجات المطابقة أثناء الكتابة
- **البحث السريع**: ينقص الوقت بـ 150ms قبل البحث
- **القائمة**: HTML `<datalist>` مدعومة من المتصفحات الحديثة

#### 2.2 نظام الفلاتر
أزرار التصفية تتيح:
- **حسب القسم** (Category): قائمة منسدلة
- **حسب السعر**: الحد الأدنى والأقصى
- **حسب التقييم**: 1⭐ إلى 5⭐
- **التطبيق الفوري**: زر "تطبيق" يدمج جميع الفلاتر

#### 2.3 البحث الموحد
- **البحث النصي**: في الاسم والوصف والقسم والماركة
- **تطبيع النصوص العربية**: يزيل التشكيل للمطابقة الدقيقة
- **النتائج الحية**: تحديث عدد النتائج على الفور

#### 2.4 Endpoints
- `GET /api/products` - جلب المنتجات (مع البحث الأساسي)
- `GET /api/categories` - جلب الأقسام

---

## 🛠️ **إعداد Firebase**

### خطوات التكوين:

1. **انشئ مشروع Firebase**:
   - اذهب إلى [Firebase Console](https://console.firebase.google.com/)
   - انقر "Create Project"
   - اختر التطبيق "Web"

2. **نسخ بيانات المشروع**:
   - اذهب إلى Project Settings
   - ابحث عن "Your apps" > "Web"
   - انسخ `firebaseConfig`

3. **عدّل الملف `js/firebase-config.js`**:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "SENDER_ID",
     appId: "APP_ID"
   };
   ```

4. **فعّل طرق المصادقة**:
   - في Firebase Console، اذهب إلى Authentication > Sign-in method
   - فعّل: **Phone**, **Google**, **Facebook**

5. **نطاقات مسموح بها** (Authorized domains):
   - أضف: `localhost:3000` و `yourdomain.com`

---

## 📡 **API Endpoints الجديدة**

### المصادقة:

```
POST /api/auth/login
Body: { email, password }
Response: { token, user }

POST /api/auth/register
Body: { name, email, password, phone (optional) }
Response: { token, user }

POST /api/auth/phone
Body: { phone, name }
Response: { token, user }

POST /api/auth/oauth
Body: { email, name }
Response: { token, user }

GET /api/auth/me
Headers: { Authorization: "Bearer TOKEN" }
Response: { id, name, email, phone, role, permissions }
```

### الطلبات الخاصة بالمستخدم:

```
GET /api/orders/my
Headers: { Authorization: "Bearer TOKEN" }
Response: [ { id, status, items, totals, ... } ]
```

---

## 📂 **الملفات المعدلة والجديدة**

### ملفات جديدة:
- `js/firebase-config.js` - إعدادات Firebase
- `css/auth-search.css` - أنماط الحقول الجديدة

### ملفات معدلة:
- `server.js` - إضافة endpoints المصادقة والطلبات
- `auth.html` - إضافة نماذج OAuth والهاتف وصفحة الحساب
- `js/auth.js` - منطق المصادقة المتقدم مع Firebase
- `index.html` - إضافة شريط البحث والفلاتر
- `category.html` - إضافة الاقتراحات للبحث
- `js/app.js` - منطق البحث والتصفية
- `css/style.css` - تحسينات بسيطة للبحث

---

## 🚀 **كيفية الاستخدام**

### من جانب المستخدم:

#### تسجيل دخول العميل:
1. اذهب إلى `auth.html`
2. اختر طريقة:
   - **بريد**: أدخل بريد + كلمة مرور
   - **هاتف**: أدخل رقم الهاتف، اضغط "أرسل رمز"، أدخل الرمز
   - **OAuth**: اضغط Google أو Facebook

#### البحث والتصفية:
1. في الصفحة الرئيسية، اكتب في شريط البحث
2. اضغط "فلاتر" لتظهر خيارات التصفية
3. اختر القسم والسعر والتقييم
4. اضغط "تطبيق"

#### عرض الطلبات السابقة:
1. سجّل الدخول
2. في صفحة `auth.html`، ستظهر قائمة بجميع طلباتك السابقة

---

## 🔐 **الأمان والممارسات الجيدة**

### توكن المصادقة (JWT):
- **صلاحية التوكن**: 7 أيام (قابل للتعديل في `TOKEN_EXPIRES`)
- **التخزين**: `localStorage.friends_user_token`
- **الحماية**: استخدم HTTPS في الإنتاج

### Firebase:
- **رموز التحقق (SMS)**: تنتهي صلاحيتها بعد 5 دقائق
- **OAuth**: آمن تمامًا - لا تُحفظ كلمات المرور

### قاعدة البيانات:
- **بيانات المستخدم**: محفوظة بشكل آمن في `data/users.json`
- **ربط الطلبات**: الطلبات مرتبطة بـ email أو phone

---

## 🐛 **استكشاف الأخطاء**

### المشاكل الشائعة:

**1. "Firebase is not defined"**
```
الحل: تأكد من أن Firebase SDK محمل قبل auth.js
في auth.html:
<script src="https://www.gstatic.com/firebasejs/..."></script>
```

**2. "رموز التحقق لا تصل"**
```
الحل: تحقق من:
- Firebase Console > Authentication > Phone
- أرقام الهاتف بصيغة صحيحة: +201xxxxxxxxx أو 010xxxxxxxxx
```

**3. "البحث لا يعمل بشكل صحيح"**
```
الحل:
- افتح أدوات المطور (F12)
- تأكد من أن المنتجات محملة من API
- تحقق من console.log للأخطاء
```

---

## 📈 **التطويرات المستقبلية**

- [ ] نظام إشعارات البريد الإلكتروني (Email Notifications)
- [ ] توثيق ثنائي (2FA)
- [ ] ربط ملفات تعريف اجتماعية متعددة
- [ ] سجل تسجيل الدخول (Login History)
- [ ] تعديل كلمة المرور مباشرة من الحساب

---

## 📞 **التواصل والدعم**

للمزيد من المساعدة:
- البريد: support@friends.store
- واتساب: 01094708407

---

**آخر تحديث**: فبراير 26، 2026
**الإصدار**: 2.0.0
