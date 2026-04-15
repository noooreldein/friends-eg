# FRIENDS Store

## تشغيل الباك اند
1) افتح طرفية داخل مجلد المشروع.
2) نفّذ:

```bash
npm install
npm start
```

السيرفر سيعمل على `http://localhost:3000`.

## الصفحات
- `index.html`
- `category.html`
- `product.html`
- `cart.html`
- `auth.html`
- `admin.html`
- `review.html`
- `track.html`

## بيانات الأدمن الافتراضية
- مشرف: `admin@friends.local` / `admin123`
- شحن: `shipping@friends.local` / `admin123`
- خدمة عملاء: `support@friends.local` / `admin123`

> يفضل تغييرها بتعديل `data/users.json` بعد أول تشغيل.

## API (مختصر)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `GET /api/categories`
- `GET /api/hero`
- `POST /api/orders`
- `POST /api/orders/track`
- `GET /api/review/:token`
- `POST /api/review/:token`
- `GET /api/admin/orders` (محمي)
- `GET /api/admin/orders/access/:token` (محمي)
- `PATCH /api/admin/orders/:id/status` (محمي)
- `PATCH /api/admin/orders/:id/delivered` (محمي)
- `GET /api/admin/reviews` (محمي)
- `PATCH /api/admin/reviews/:reviewId/products/:productReviewId` (محمي)
- `GET /api/admin/staff` (محمي)
- `PATCH /api/admin/staff/:id/role` (محمي)
- `GET /api/admin/products` (محمي)
- `POST /api/admin/products` (محمي)
- `PUT /api/admin/products/:id` (محمي)
- `DELETE /api/admin/products/:id` (محمي)
- `GET /api/admin/hero` (محمي)
- `POST /api/admin/hero` (محمي)
- `PUT /api/admin/hero/:id` (محمي)
- `DELETE /api/admin/hero/:id` (محمي)
- `GET /api/products/:id/reviews`

## ملاحظات
- صور التحويل وصور إثبات التسليم تُحفظ كملفات داخل `images/uploads/`.
- رابط الطلب المميز للأدمن لا يعمل بدون تسجيل دخول حساب إداري بصلاحية مناسبة.

الفرونت سيعمل حتى لو السيرفر مش شغال (fallback على بيانات داخلية).
