# Firebase Setup Guide - دليل إعداد Firebase

## 📋 المتطلبات
- حساب Google
- متصفح ويب حديث
- احتياجات الموقع الأساسية (Node.js، npm)

---

## 🎯 خطوات الإعداد السريعة

### الخطوة 1: إنشاء مشروع Firebase

1. اذهب إلى https://console.firebase.google.com/
2. اضغط **"Create Project"** أو **"Add project"**
3. أدخل اسم المشروع (مثلاً: `friends-store`)
4. اختر:
   - ☑️ Enable Google Analytics (اختياري)
   - ☑️ Accept terms
5. اضغط **"Create project"**

---

### الخطوة 2: إضافة تطبيق ويب (Web App)

1. في الصفحة الرئيسية للمشروع، ابحث عن **"Add an app"**
2. اختر **"Web"** (الأيقونة `</>`)
3. أدخل اسم التطبيق (مثلاً: `FRIENDS Store`)
4. ☑️ اختر "Also set up Firebase Hosting" (اختياري)
5. اضغط **"Register app"**

---

### الخطوة 3: نسخ بيانات المشروع

بعد تسجيل التطبيق، ستظهر نافذة تحتوي على الكود:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "friends-store.firebaseapp.com",
  projectId: "friends-store",
  storageBucket: "friends-store.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

**انسخ هذه البيانات بالكامل**

---

### الخطوة 4: لصق البيانات في الموقع

1. افتح `js/firebase-config.js` في محرر الأكواد
2. ابحث عن `const firebaseConfig = {`
3. اح​ذف الجزء `// ...` واستبدله بالبيانات المنسوخة
4. احفظ الملف

**مثال**:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "friends-store.firebaseapp.com",
  projectId: "friends-store",
  storageBucket: "friends-store.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

---

### الخطوة 5: تفعيل طرق المصادقة

في Firebase Console:

1. اذهب إلى **"Authentication"** (في القائمة اليسرى)
2. اضغط على تبويب **"Sign-in method"**
3. فعّل كل من:

#### 1️⃣ **Phone** (الهاتف)
- اضغط **"Phone"**
- اختر **"Enable"**
- (اختياري) أضف API Key إذا طُلب

#### 2️⃣ **Google**
- اضغط **"Google"**
- اختر **"Enable"**
- تأكد من اختيار البريد الإلكتروني كمعرّف
- اضغط **"Save"**

#### 4️⃣ **Apple (iCloud / Sign in with Apple)**
- يلزمك حساب Apple Developer فعال لأن Apple تطلب مفتاحًا خاصًا وخدمة (Service ID).
- في https://developer.apple.com/account/ ادخل إلى Certificates, Identifiers & Profiles > Identifiers ثم اختر Services IDs وأنشئ معرفًا مثل `com.friends.store.web`.
- فعّل Sign In with Apple لهذا المعرف، وأضف المجال (`friends-store.netlify.app` أو دومينك الإنتاجي) ورابط إعادة التوجيه `https://[YOUR_DOMAIN]/__/auth/handler`.
- بعد الحفظ، اذهب إلى Keys وأنشئ مفتاحًا جديدًا (Sign In with Apple)، واحتفظ بالملف `.p8`، ودوّن Key ID وTeam ID.
- في Firebase Console > Authentication > Sign-in method > Apple فعل الخدمة، ثم ادخل Service ID، Key ID، Team ID، وحمّل ملف `.p8`.
- أضف هذه الدومينات إلى Authorized domains:
```
localhost:3000
friends-store.netlify.app
your-production-domain.com
```
- تأكد من أن الموقع يعمل على HTTPS لأن Apple لا تسمح بتسجيل الدخول من HTTP.

#### 3️⃣ **Facebook**
- اضغط **"Facebook"**
- اختر **"Enable"**
- ستحتاج إلى:
  - **Facebook App ID**: من https://developers.facebook.com/
  - **Facebook App Secret**: من نفس الموقع
- اضغط **"Save"**

---

### الخطوة 6: إضافة نطاقات مسموح بها (Authorized Domains)

في نفس صفحة **Sign in methods**:

1. قم بالتمرير لأسفل إلى **"Authorized domains"**
2. اضغط **"Add domain"**
3. أضف:
   ```
   localhost:3000
   yourdomain.com
   yoursubdomain.yourdomain.com
   ```

---

## 🔑 تفاصيل إعدادات المصادقة

### البريد الإلكتروني:
- ✅ مفعّل افتراضيًا في الموقع
- لا يحتاج تكوين إضافي

### رقم الهاتف (Phone):
- يتطلب التحقق عبر reCAPTCHA
- يُعيّن تلقائيًا في الموقع
- لا يحتاج مفتاح API إضافي

### Google OAuth:
- يستخدم بيانات المشروع افتراضيًا
- لا يحتاج مفاتيح إضافية

### Facebook OAuth:
1. اذهب إلى https://developers.facebook.com/
2. اعمل تطبيق جديد:
   - **Platform**: Facebook Login
   - **Type**: Website
3. في التطبيق، اذهب إلى **Settings > Basis**
   - انسخ **App ID** و **App Secret**
3. عد إلى Firebase وأدخلهما

---

## ✅ اختبار الإعداد

### اختبر الهاتف:
```
1. افتح auth.html
2. في "تسجيل الدخول"، أدخل: +201011223344
3. اضغط "أرسل رمز التعبئة"
4. يجب أن تظهر نافذة reCAPTCHA
5. بعد تحقق البشري، سيأتي رمز (في البيئة التجريبية يظهر في Console)
```

### اختبر Google:
```
1. افتح auth.html
2. اضغط "دخول بـ Google"
3. اختر حسابك
4. يجب أن تُعاد إلى الصفحة الرئيسية مع تسجيل الدخول
```

### اختبر البريد:
```
1. افتح auth.html
2. أدخل: test@example.com
3. أدخل كلمة مرور: Test123456
4. اضغط "تسجيل الدخول" أو "إنشاء الحساب"
5. يجب أن تُعاد إلى الصفحة الرئيسية
```

---

## 🐛 استكشاف الأخطاء الشائعة

### خطأ: "Firebase is not defined"
**السبب**: Firebase SDK لم يُحمّل بعد
**الحل**: تأكد من ترتيب الـ script:
```html
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="js/firebase-config.js"></script>
<script src="js/auth.js"></script>
```

### خطأ: "Auth Code Sent But Can't Verify"
**السبب**: رقم الهاتف غير صحيح أو في بيئة غير مدعومة
**الحل**:
- تأكد من البادئة: +20 أو 0
- تأكد من 10-11 رقم بعد البادئة
- في التجريب: استخدم رقم حقيقي

### خطأ: "Facebook App Not Setup"
**السبب**: لم تكمل إعدادات Facebook OAuth
**الحل**:
- تأكد من رقم التطبيق والسر صحيح
- تأكد من تفعيل Facebook Login في الإعدادات
- أضف النطاق في إعدادات التطبيق: https://yourdomain.com

### خطأ: "Domain Not Authorized"
**السبب**: النطاق الحالي ليس مصرح
**الحل**: أضفه في Firebase > Authentication > Authorized Domains

---

## 📱 اختبار رموز الهاتف (Testing Codes)

في بيئة التطوير، Firebase توفر أرقام اختبار:

**Firebase Console > Authentication > Phone > Test phone numbers**

أضف:
```
+201011223344 → Code: 123456
+201022334455 → Code: 654321
```

ثم استخدمها في الاختبار دون الحاجة لـ SMS حقيقي.

---

## 🚀 النشر على الإنتاج (Production)

عند نشر الموقع على خادم حقيقي:

1. **تحديث النطاقات المسموح بها**:
   ```
   yourdomain.com
   www.yourdomain.com
   api.yourdomain.com
   ```

2. **استخدام HTTPS**:
   - Firebase يتطلب HTTPS في الإنتاج
   - استخدم Let's Encrypt أو أي جهة أخرى

3. **تحديث متغيرات البيئة**:
   ```
   - تأكد من JWT_SECRET قوي في server.js
   - غيّر PORT إذا و فى الحاجة
   ```

4. **حذف بيانات الاختبار**:
   ```
   - احذف أرقام الاختبار من Firebase
   - احذف بيانات الاختبار من data/users.json
   ```

---

## 📞 الدعم والمساعدة

- **Firebase Docs**: https://firebase.google.com/docs/auth
- **مشاكل شائعة**: https://stackoverflow.com/questions/tagged/firebase-authentication
- **الدردشة المباشرة**: https://firebase.google.com/support/contact/

---

**آخر تحديث**: فبراير 26، 2026
