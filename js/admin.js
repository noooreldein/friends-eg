const API_BASE = "http://localhost:3000/api";
let token = localStorage.getItem("friends_admin_token") || localStorage.getItem("friends_user_token") || "";
let me = null;
let imageDataList = [];
let heroImageData = "";

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const ordersSection = document.getElementById("ordersSection");
const reviewsSection = document.getElementById("reviewsSection");
const staffSection = document.getElementById("staffSection");
const usersSection = document.getElementById("usersSection");

const loginMsg = document.getElementById("loginMsg");
const productMsg = document.getElementById("productMsg");
const heroMsg = document.getElementById("heroMsg");
const productsList = document.getElementById("productsList");
const heroList = document.getElementById("heroList");
const ordersList = document.getElementById("ordersList");
const reviewsList = document.getElementById("reviewsList");
const staffList = document.getElementById("staffList");
const usersList = document.getElementById("usersList");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");

const staffNameInput = document.getElementById("staffName");
const staffEmailInput = document.getElementById("staffEmail");
const staffPasswordInput = document.getElementById("staffPassword");
const staffRoleInput = document.getElementById("staffRole");
const staffCreateMsg = document.getElementById("staffCreateMsg");
const createStaffBtn = document.getElementById("createStaffBtn");

const statusLabels = {
  pending: "قيد المراجعة",
  confirmed: "تم التأكيد",
  packed: "تم التغليف",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "تم الإلغاء"
};

const getInitials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "؟";
  return parts.slice(0, 2).map(part => part[0]).join("");
};

const csvEscape = (value) => {
  const str = String(value ?? "");
  return `"${str.replace(/"/g, "\"\"")}"`;
};

const downloadCsv = (filename, rows) => {
  const csvBody = rows.map(row => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csvBody}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const orderTokenFromUrl = new URLSearchParams(window.location.search).get("orderToken");

const formFields = {
  id: document.getElementById("pId"),
  name: document.getElementById("pName"),
  price: document.getElementById("pPrice"),
  category: document.getElementById("pCategory"),
  short: document.getElementById("pShort"),
  details: document.getElementById("pDetails"),
  usage: document.getElementById("pUsage"),
  discount: document.getElementById("pDiscount"),
  stock: document.getElementById("pStock"),
  brand: document.getElementById("pBrand"),
  sku: document.getElementById("pSku"),
  imageFile: document.getElementById("pImageFile"),
  imagePreview: document.getElementById("pImagePreview"),
  nameEn: document.getElementById("pNameEn"),
  categoryEn: document.getElementById("pCategoryEn"),
  shortEn: document.getElementById("pShortEn"),
  detailsEn: document.getElementById("pDetailsEn"),
  usageEn: document.getElementById("pUsageEn"),
  brandEn: document.getElementById("pBrandEn")
};

const heroFields = {
  id: document.getElementById("heroId"),
  title: document.getElementById("heroTitle"),
  text: document.getElementById("heroText"),
  badge: document.getElementById("heroBadge"),
  imageFile: document.getElementById("heroImageFile"),
  imagePreview: document.getElementById("heroImagePreview")
};

const productFormTitle = document.getElementById("productFormTitle");
const heroFormTitle = document.getElementById("heroFormTitle");
const enFieldsWrap = document.getElementById("productEnFields");
const toggleEnFieldsBtn = document.getElementById("toggleEnFields");

const hasPermission = (perm) => Array.isArray(me?.permissions) && me.permissions.includes(perm);

const api = async (path, options = {}) => {
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "request_failed");
  return data;
};

const showLogin = () => {
  loginSection.style.display = "block";
  dashboardSection.style.display = "none";
  ordersSection.style.display = "none";
  reviewsSection.style.display = "none";
  staffSection.style.display = "none";
  usersSection.style.display = "none";
  adminLogoutBtn.style.display = "none";
};

const showSectionsByPermissions = () => {
  loginSection.style.display = "none";
  adminLogoutBtn.style.display = "inline-flex";

  dashboardSection.style.display = hasPermission("catalog.manage") ? "block" : "none";
  ordersSection.style.display = hasPermission("orders.read") ? "block" : "none";
  reviewsSection.style.display = hasPermission("reviews.read") ? "block" : "none";
  staffSection.style.display = hasPermission("staff.manage") ? "block" : "none";
  usersSection.style.display = hasPermission("users.read") ? "block" : "none";
};

const getOrderFiltersQuery = () => {
  const status = document.getElementById("filterStatus")?.value || "";
  const dateFrom = document.getElementById("filterDateFrom")?.value || "";
  const dateTo = document.getElementById("filterDateTo")?.value || "";
  const q = document.getElementById("filterOrderQuery")?.value?.trim() || "";
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  if (q) params.set("q", q);
  return params.toString() ? `?${params.toString()}` : "";
};

const getUserFiltersQuery = () => {
  const country = document.getElementById("filterUserCountry")?.value || "";
  const type = document.getElementById("filterUserType")?.value || "";
  const phoneKey = document.getElementById("filterUserPhoneKey")?.value?.trim() || "";
  const letter = document.getElementById("filterUserLetter")?.value?.trim() || "";
  const q = document.getElementById("filterUserQuery")?.value?.trim() || "";
  const params = new URLSearchParams();
  if (country) params.set("country", country);
  if (type) params.set("roleType", type);
  if (phoneKey) params.set("phoneKey", phoneKey);
  if (letter) params.set("letter", letter);
  if (q) params.set("q", q);
  return params.toString() ? `?${params.toString()}` : "";
};

const loadImageFile = async (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const setPreviewList = (container, images = []) => {
  if (!container) return;
  const list = Array.isArray(images) ? images.filter(Boolean) : [];
  container.innerHTML = list.map(src => `<img src="${src}" alt="preview" />`).join("");
};

const getPreviewListSrc = (container) => {
  if (!container) return [];
  return Array.from(container.querySelectorAll("img"))
    .map(img => img.getAttribute("src"))
    .filter(Boolean);
};

const collectProductPayload = () => {
  const images = imageDataList.length ? imageDataList : getPreviewListSrc(formFields.imagePreview);
  const enPayload = {
    name: formFields.nameEn?.value.trim(),
    category: formFields.categoryEn?.value.trim(),
    short: formFields.shortEn?.value.trim(),
    details: formFields.detailsEn?.value.trim(),
    usage: formFields.usageEn?.value.trim(),
    brand: formFields.brandEn?.value.trim()
  };
  const hasEn = Object.values(enPayload).some(val => val);

  return {
    name: formFields.name.value.trim(),
    price: Number(formFields.price.value || 0),
    category: formFields.category.value.trim(),
    short: formFields.short.value.trim(),
    details: formFields.details.value.trim(),
    usage: formFields.usage.value.trim(),
    discount: formFields.discount.value.trim() || "لا يوجد",
    stock: Number(formFields.stock.value || 0),
    brand: formFields.brand.value.trim(),
    sku: formFields.sku.value.trim(),
    images,
    image: images[0] || "",
    i18n: hasEn ? { en: enPayload } : undefined
  };
};

const collectHeroPayload = () => ({
  title: heroFields.title.value.trim(),
  text: heroFields.text.value.trim(),
  badge: heroFields.badge.value.trim() || "عرض خاص",
  image: heroImageData || getPreviewSrc(heroFields.imagePreview)
});

const resetProductForm = () => {
  formFields.id.value = "";
  formFields.name.value = "";
  formFields.price.value = "";
  formFields.category.value = "";
  formFields.short.value = "";
  formFields.details.value = "";
  formFields.usage.value = "";
  formFields.discount.value = "";
  formFields.stock.value = "";
  formFields.brand.value = "";
  formFields.sku.value = "";
  formFields.imageFile.value = "";
  setPreviewList(formFields.imagePreview, []);
  imageDataList = [];
  if (formFields.nameEn) formFields.nameEn.value = "";
  if (formFields.categoryEn) formFields.categoryEn.value = "";
  if (formFields.shortEn) formFields.shortEn.value = "";
  if (formFields.detailsEn) formFields.detailsEn.value = "";
  if (formFields.usageEn) formFields.usageEn.value = "";
  if (formFields.brandEn) formFields.brandEn.value = "";
  if (enFieldsWrap) enFieldsWrap.style.display = "none";
  productFormTitle.textContent = "إضافة منتج جديد";
};

const resetHeroForm = () => {
  heroFields.id.value = "";
  heroFields.title.value = "";
  heroFields.text.value = "";
  heroFields.badge.value = "";
  heroFields.imageFile.value = "";
  setPreview(heroFields.imagePreview, "");
  heroImageData = "";
  heroFormTitle.textContent = "إضافة سلايد جديد";
};

const renderProducts = async () => {
  if (!hasPermission("catalog.manage")) return;
  const products = await api("/admin/products");
  productsList.innerHTML = products.map(product => {
    const imageBlock = product.image
      ? `<img src="${product.image}" alt="${product.name}" />`
      : `<div class="admin-thumb-empty">بدون صورة</div>`;
    const hasEn = product.i18n && product.i18n.en && product.i18n.en.name;
    const enBadge = hasEn ? `<span class="status-chip" style="margin-top:4px;">EN</span>` : "";
    return `
      <div class="admin-row">
        ${imageBlock}
        <div>
          <strong>${product.name}</strong>
          <p class="note">${product.category} | ${product.price} ج.م | مخزون: ${product.stock}</p>
          ${enBadge}
        </div>
        <div class="admin-row-actions">
          <button class="btn ghost" data-action="edit" data-id="${product.id}">تعديل</button>
          <button class="btn ghost" data-action="edit-en" data-id="${product.id}">إضافة EN</button>
          <button class="btn ghost" data-action="delete" data-id="${product.id}">حذف</button>
        </div>
      </div>
    `;
  }).join("") || "<p class='note'>لا توجد منتجات.</p>";
};

const renderHero = async () => {
  if (!hasPermission("catalog.manage")) return;
  const slides = await api("/admin/hero");
  heroList.innerHTML = slides.map(slide => {
    const imageBlock = slide.image
      ? `<img src="${slide.image}" alt="${slide.title}" />`
      : `<div class="admin-thumb-empty">بدون صورة</div>`;
    return `
      <div class="admin-row">
        ${imageBlock}
        <div>
          <strong>${slide.title}</strong>
          <p class="note">${slide.badge}</p>
        </div>
        <div class="admin-row-actions">
          <button class="btn ghost" data-hero-action="edit" data-id="${slide.id}">تعديل</button>
          <button class="btn ghost" data-hero-action="delete" data-id="${slide.id}">حذف</button>
        </div>
      </div>
    `;
  }).join("") || "<p class='note'>لا توجد سلايدات.</p>";
};

const buildStatusButtons = (orderId) => {
  const buttons = [];
  if (hasPermission("orders.support") || hasPermission("orders.shipping") || hasPermission("orders.delivered")) {
    buttons.push(`<button class="btn ghost" data-order-action="status" data-id="${orderId}" data-status="confirmed">تأكيد</button>`);
    buttons.push(`<button class="btn ghost" data-order-action="status" data-id="${orderId}" data-status="cancelled">إلغاء</button>`);
  }
  if (hasPermission("orders.shipping") || hasPermission("orders.delivered")) {
    buttons.push(`<button class="btn ghost" data-order-action="status" data-id="${orderId}" data-status="packed">تغليف</button>`);
    buttons.push(`<button class="btn ghost" data-order-action="status" data-id="${orderId}" data-status="shipped">شحن</button>`);
  }
  return `<div class="status-actions">${buttons.join("")}</div>`;
};

const renderOrders = async () => {
  if (!hasPermission("orders.read")) return;

  let orders = await api(`/admin/orders${getOrderFiltersQuery()}`);
  if (orderTokenFromUrl) {
    try {
      const focused = await api(`/admin/orders/access/${orderTokenFromUrl}`);
      orders = [focused, ...orders.filter(o => o.id !== focused.id)];
    } catch {
      // ignore bad token
    }
  }

  if (!orders.length) {
    ordersList.innerHTML = "<p class='note'>لا يوجد طلبات.</p>";
    return;
  }

  ordersList.innerHTML = orders.map(order => {
    const mark = orderTokenFromUrl && order.adminAccessToken === orderTokenFromUrl ? "style='border-color:#1b4fb8;'" : "";
    return `
      <div class="order-card" ${mark}>
        <div class="order-head">
          <strong>طلب #${order.id.slice(0, 8)}</strong>
          <span class="status-chip">${statusLabels[order.status] || order.status}</span>
        </div>
        <p class="note">${new Date(order.createdAt).toLocaleString("ar-EG")}</p>
        <p><strong>العميل:</strong> ${order.customer?.name || "-"} | ${order.customer?.phone || "-"}</p>
        <p><strong>العنوان:</strong> ${order.customer?.address || "-"}</p>
        <p><strong>الدفع:</strong> ${order.payment?.provider || "-"} | ${order.payment?.transferTo || "-"}</p>
        <p><strong>الإجمالي:</strong> ${order.totals?.total || 0} ج.م</p>
        <p><strong>المنتجات:</strong> ${(order.items || []).map(i => `${i.name} x${i.qty}`).join("، ")}</p>
        ${order.payment?.transferProofImage ? `<a class="btn ghost" href="${order.payment.transferProofImage}" target="_blank">إثبات التحويل</a>` : ""}
        ${buildStatusButtons(order.id)}
        ${hasPermission("orders.delivered") ? `
          <div class="admin-actions" style="margin-top:10px;">
            <input type="file" id="proof-${order.id}" accept="image/*" />
            <input type="text" id="note-${order.id}" placeholder="ملاحظة المندوب" />
            <button class="btn primary" data-order-action="delivered" data-id="${order.id}">تأكيد التوصيل + رابط تقييم</button>
          </div>
        ` : ""}
      </div>
    `;
  }).join("");
};

const notifyCustomerWhatsApp = (order) => {
  const phone = String(order.customer?.phone || "").replace(/\D/g, "");
  if (!phone || !order.lastNotification?.message) return;
  const fullMsg = String(order.lastNotification.message).replace(
    "/review.html?token=",
    `${window.location.origin}/review.html?token=`
  );
  window.open(`https://wa.me/2${phone}?text=${encodeURIComponent(fullMsg)}`, "_blank");
};

const updateOrderStatus = async (orderId, status) => {
  const order = await api(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  notifyCustomerWhatsApp(order);
  await renderOrders();
};

const markDelivered = async (orderId) => {
  const form = new FormData();
  form.append("courierNote", document.getElementById(`note-${orderId}`)?.value?.trim() || "");
  const file = document.getElementById(`proof-${orderId}`)?.files?.[0];
  if (file) form.append("deliveryProofImage", file);

  const order = await api(`/admin/orders/${orderId}/delivered`, {
    method: "PATCH",
    body: form
  });

  notifyCustomerWhatsApp(order);
  await renderOrders();
};

const renderReviews = async () => {
  if (!hasPermission("reviews.read")) return;
  const reviews = await api("/admin/reviews");
  if (!reviews.length) {
    reviewsList.innerHTML = "<p class='note'>لا توجد تقييمات.</p>";
    return;
  }

  reviewsList.innerHTML = reviews.map(review => `
    <div class="order-card">
      <div class="order-head">
        <strong>طلب #${review.orderId.slice(0, 8)}</strong>
        <span class="status-chip">تقييم المندوب: ${review.courierRating}/5</span>
      </div>
      <p><strong>العميل:</strong> ${review.customerName}</p>
      <p><strong>تعليق المندوب:</strong> ${review.courierComment || "بدون"}</p>
      ${(review.products || []).map(item => `
        <div class="order-card">
          <p><strong>${item.productName}</strong></p>
          <p>نجوم: ${item.stars}</p>
          <p>${item.comment || "بدون تعليق"}</p>
          ${hasPermission("reviews.manage") ? `
            <div class="admin-row-actions">
              <button class="btn ghost" data-review-action="show" data-review-id="${review.id}" data-product-review-id="${item.id}">عرض</button>
              <button class="btn ghost" data-review-action="hide" data-review-id="${review.id}" data-product-review-id="${item.id}">إخفاء</button>
              <span class="status-chip">${item.visible ? "معروض" : "مخفي"}</span>
            </div>
          ` : `<span class="status-chip">${item.visible ? "معروض" : "مخفي"}</span>`}
        </div>
      `).join("")}
    </div>
  `).join("");
};

const renderStaff = async () => {
  if (!hasPermission("staff.manage")) return;
  const staff = await api("/admin/staff");
  staffList.innerHTML = staff.map(user => `
    <div class="admin-row">
      <div>
        <strong>${user.name}</strong>
        <p class="note">${user.email}</p>
      </div>
      <div>
        <select data-staff-id="${user.id}" class="select-input">
          <option value="supervisor" ${user.role === "supervisor" ? "selected" : ""}>مشرف</option>
          <option value="shipping" ${user.role === "shipping" ? "selected" : ""}>موظف شحن</option>
          <option value="support" ${user.role === "support" ? "selected" : ""}>خدمة عملاء</option>
        </select>
      </div>
      <div class="admin-row-actions">
        <button class="btn primary" data-staff-action="save" data-staff-id="${user.id}">حفظ</button>
      </div>
    </div>
  `).join("") || "<p class='note'>لا يوجد موظفون.</p>";
};

const renderUsers = async () => {
  if (!hasPermission("users.read") || !usersList) return;
  const users = await api(`/admin/users${getUserFiltersQuery()}`);
  if (!users.length) {
    usersList.innerHTML = "<p class='note'>لا يوجد مستخدمون.</p>";
    return;
  }

  usersList.innerHTML = users.map(user => {
    const roleMap = {
      supervisor: "مشرف",
      shipping: "شحن",
      support: "خدمة عملاء"
    };
    const roleLabel = user.role && user.role !== "user" ? (roleMap[user.role] || "موظف") : "عميل";
    const roleClass = "status-chip";
    return `
      <div class="admin-row user-row">
        <div class="user-avatar">${getInitials(user.name)}</div>
        <div>
          <strong>${user.name || "بدون اسم"}</strong>
          <p class="note">البريد: ${user.email || "-"} | الهاتف: ${user.phone || "-"}</p>
          <p class="note">هاتف إضافي: ${user.altPhone || "-"} | الدولة: ${user.country || "-"}</p>
          <p class="note">العنوان: ${user.address || "-"}</p>
        </div>
        <div class="user-tags">
          <span class="${roleClass}">${roleLabel}</span>
        </div>
      </div>
    `;
  }).join("");
};

const exportUsersCsv = async () => {
  if (!hasPermission("users.read")) return;
  const users = await api(`/admin/users${getUserFiltersQuery()}`);
  const headers = ["الاسم", "البريد", "الهاتف", "هاتف إضافي", "الدولة", "العنوان", "النوع/الدور"];
  const rows = users.map(user => {
    const roleMap = {
      supervisor: "مشرف",
      shipping: "شحن",
      support: "خدمة عملاء",
      user: "عميل"
    };
    const roleLabel = roleMap[user.role] || "عميل";
    return [
      user.name || "",
      user.email || "",
      user.phone || "",
      user.altPhone || "",
      user.country || "",
      user.address || "",
      roleLabel
    ];
  });
  const today = new Date().toISOString().slice(0, 10);
  downloadCsv(`friends-users-${today}.csv`, [headers, ...rows]);
};

const saveProduct = async () => {
  const payload = collectProductPayload();
  if (!payload.name || !payload.category || payload.price <= 0) {
    productMsg.textContent = "الاسم والسعر والتصنيف مطلوبين.";
    return;
  }

  const id = Number(formFields.id.value || 0);
  if (id) {
    await api(`/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } else {
    await api("/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }
  productMsg.textContent = id ? "تم تحديث المنتج." : "تم إضافة المنتج.";
  resetProductForm();
  await renderProducts();
};

const saveHeroSlide = async () => {
  const payload = collectHeroPayload();
  if (!payload.title || !payload.text) {
    heroMsg.textContent = "عنوان السلايد والنص مطلوبين.";
    return;
  }

  const id = Number(heroFields.id.value || 0);
  if (id) {
    await api(`/admin/hero/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } else {
    await api("/admin/hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }
  heroMsg.textContent = id ? "تم تحديث السلايد." : "تم إضافة السلايد.";
  resetHeroForm();
  await renderHero();
};

const setReviewVisibility = async (reviewId, productReviewId, visible) => {
  await api(`/admin/reviews/${reviewId}/products/${productReviewId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visible })
  });
  await renderReviews();
};

const updateStaffRole = async (staffId) => {
  const select = document.querySelector(`select[data-staff-id="${staffId}"]`);
  const role = select?.value;
  if (!role) return;
  await api(`/admin/staff/${staffId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role })
  });
  await renderStaff();
};

const createStaffAccount = async () => {
  if (!staffNameInput || !staffEmailInput || !staffPasswordInput || !staffRoleInput) return;
  staffCreateMsg.textContent = "";
  const name = staffNameInput.value.trim();
  const email = staffEmailInput.value.trim();
  const password = staffPasswordInput.value;
  const role = staffRoleInput.value;

  if (!name || !email || !password) {
    staffCreateMsg.textContent = "الاسم والبريد وكلمة المرور مطلوبة.";
    return;
  }
  if (password.length < 6) {
    staffCreateMsg.textContent = "كلمة المرور يجب أن تكون 6 أحرف أو أكثر.";
    return;
  }

  try {
    await api("/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });
    staffCreateMsg.textContent = "تم إنشاء حساب الموظف.";
    staffNameInput.value = "";
    staffEmailInput.value = "";
    staffPasswordInput.value = "";
    staffRoleInput.value = "supervisor";
    await renderStaff();
    await renderUsers();
  } catch (err) {
    if (err.message === "email_exists") {
      staffCreateMsg.textContent = "هذا البريد مستخدم بالفعل.";
      return;
    }
    if (err.message === "invalid_role") {
      staffCreateMsg.textContent = "الرجاء اختيار صلاحية صحيحة.";
      return;
    }
    staffCreateMsg.textContent = "تعذر إنشاء الحساب.";
  }
};

const loadDashboard = async () => {
  showSectionsByPermissions();
  await Promise.all([
    renderProducts(),
    renderHero(),
    renderOrders(),
    renderReviews(),
    renderStaff(),
    renderUsers()
  ]);
};

const login = async () => {
  loginMsg.textContent = "";
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;
  const data = await api("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!Array.isArray(data.user.permissions) || !data.user.permissions.length) {
    loginMsg.textContent = "هذا الحساب ليس ضمن فريق الإدارة.";
    return;
  }

  token = data.token;
  me = data.user;
  localStorage.setItem("friends_admin_token", token);
  localStorage.setItem("friends_user_token", token);
  localStorage.setItem("friends_user", JSON.stringify(data.user));
  await loadDashboard();
};

const verifyExistingToken = async () => {
  if (!token) {
    showLogin();
    return;
  }

  try {
    me = await api("/auth/me");
    if (!Array.isArray(me.permissions) || !me.permissions.length) throw new Error("forbidden");
    await loadDashboard();
  } catch {
    token = "";
    me = null;
    localStorage.removeItem("friends_admin_token");
    localStorage.removeItem("friends_user_token");
    localStorage.removeItem("friends_user");
    showLogin();
  }
};

document.getElementById("adminLoginBtn").addEventListener("click", () => {
  login().catch(() => {
    loginMsg.textContent = "تعذر تسجيل الدخول.";
  });
});

if (document.getElementById("applyOrderFilters")) {
  document.getElementById("applyOrderFilters").addEventListener("click", () => {
    renderOrders().catch(() => {
      alert("تعذر تطبيق الفلترة");
    });
  });
}

if (document.getElementById("applyUserFilters")) {
  document.getElementById("applyUserFilters").addEventListener("click", () => {
    renderUsers().catch(() => {
      alert("تعذر تطبيق فلترة المستخدمين");
    });
  });
}

if (document.getElementById("clearUserFilters")) {
  document.getElementById("clearUserFilters").addEventListener("click", () => {
    const country = document.getElementById("filterUserCountry");
    const type = document.getElementById("filterUserType");
    const phoneKey = document.getElementById("filterUserPhoneKey");
    const letter = document.getElementById("filterUserLetter");
    const q = document.getElementById("filterUserQuery");
    if (country) country.value = "";
    if (type) type.value = "";
    if (phoneKey) phoneKey.value = "";
    if (letter) letter.value = "";
    if (q) q.value = "";
    renderUsers().catch(() => {
      alert("تعذر تحديث القائمة");
    });
  });
}

if (document.getElementById("exportUsersBtn")) {
  document.getElementById("exportUsersBtn").addEventListener("click", () => {
    exportUsersCsv().catch(() => {
      alert("تعذر تصدير القائمة");
    });
  });
}

if (createStaffBtn) {
  createStaffBtn.addEventListener("click", () => {
    createStaffAccount().catch(() => {
      if (staffCreateMsg) staffCreateMsg.textContent = "تعذر إنشاء الحساب.";
    });
  });
}

document.getElementById("saveProductBtn")?.addEventListener("click", () => {
  saveProduct().catch(() => {
    productMsg.textContent = "تعذر حفظ المنتج.";
  });
});

document.getElementById("saveHeroBtn")?.addEventListener("click", () => {
  saveHeroSlide().catch(() => {
    heroMsg.textContent = "تعذر حفظ السلايد.";
  });
});

document.getElementById("resetProductBtn")?.addEventListener("click", resetProductForm);
document.getElementById("resetHeroBtn")?.addEventListener("click", resetHeroForm);

toggleEnFieldsBtn?.addEventListener("click", () => {
  if (!enFieldsWrap) return;
  enFieldsWrap.style.display = enFieldsWrap.style.display === "none" ? "block" : "none";
});

formFields.imageFile?.addEventListener("change", async (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  imageDataList = await Promise.all(files.map(loadImageFile));
  setPreviewList(formFields.imagePreview, imageDataList);
});

heroFields.imageFile?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  heroImageData = await loadImageFile(file);
  setPreview(heroFields.imagePreview, heroImageData);
});

productsList?.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;

  const fillProductForm = (p, focusEn = false) => {
    formFields.id.value = p.id;
    formFields.name.value = p.name || "";
    formFields.price.value = p.price || 0;
    formFields.category.value = p.category || "";
    formFields.short.value = p.short || "";
    formFields.details.value = p.details || "";
    formFields.usage.value = p.usage || "";
    formFields.discount.value = p.discount || "لا يوجد";
    formFields.stock.value = p.stock || 0;
    formFields.brand.value = p.brand || "";
    formFields.sku.value = p.sku || "";
    const images = Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []);
    setPreviewList(formFields.imagePreview, images);
    imageDataList = [];

    const en = p.i18n?.en || {};
    if (formFields.nameEn) formFields.nameEn.value = en.name || "";
    if (formFields.categoryEn) formFields.categoryEn.value = en.category || "";
    if (formFields.shortEn) formFields.shortEn.value = en.short || "";
    if (formFields.detailsEn) formFields.detailsEn.value = en.details || "";
    if (formFields.usageEn) formFields.usageEn.value = en.usage || "";
    if (formFields.brandEn) formFields.brandEn.value = en.brand || "";

    if (focusEn && enFieldsWrap) {
      enFieldsWrap.style.display = "block";
    }
    productFormTitle.textContent = focusEn
      ? `إضافة/تعديل EN للمنتج #${p.id}`
      : `تعديل المنتج #${p.id}`;
  };

  if (action === "edit" || action === "edit-en") {
    api("/admin/products").then(products => {
      const p = products.find(item => item.id === id);
      if (!p) return;
      fillProductForm(p, action === "edit-en");
    });
    return;
  }

  if (action === "delete") {
    api(`/admin/products/${id}`, { method: "DELETE" })
      .then(() => renderProducts())
      .catch(() => { productMsg.textContent = "تعذر حذف المنتج."; });
  }
});

heroList?.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const action = btn.dataset.heroAction;

  if (action === "edit") {
    api("/admin/hero").then(slides => {
      const s = slides.find(item => Number(item.id) === id);
      if (!s) return;
      heroFields.id.value = s.id;
      heroFields.title.value = s.title || "";
      heroFields.text.value = s.text || "";
      heroFields.badge.value = s.badge || "";
      setPreview(heroFields.imagePreview, s.image || "");
      heroImageData = s.image || "";
      heroFormTitle.textContent = `تعديل السلايد #${s.id}`;
    });
    return;
  }

  if (action === "delete") {
    api(`/admin/hero/${id}`, { method: "DELETE" })
      .then(() => renderHero())
      .catch(() => { heroMsg.textContent = "تعذر حذف السلايد."; });
  }
});

ordersList?.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;
  const action = btn.dataset.orderAction;
  const orderId = btn.dataset.id;

  if (action === "status") {
    updateOrderStatus(orderId, btn.dataset.status).catch(() => alert("تعذر تحديث الحالة"));
    return;
  }

  if (action === "delivered") {
    markDelivered(orderId).catch(() => alert("تعذر تأكيد التوصيل"));
  }
});

reviewsList?.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;
  const action = btn.dataset.reviewAction;
  if (!action) return;
  const reviewId = btn.dataset.reviewId;
  const productReviewId = btn.dataset.productReviewId;
  setReviewVisibility(reviewId, productReviewId, action === "show").catch(() => alert("تعذر تحديث التعليق"));
});

staffList?.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;
  if (btn.dataset.staffAction !== "save") return;
  updateStaffRole(btn.dataset.staffId).catch(() => alert("تعذر حفظ الدور"));
});

adminLogoutBtn.addEventListener("click", () => {
  token = "";
  me = null;
  localStorage.removeItem("friends_admin_token");
  localStorage.removeItem("friends_user_token");
  localStorage.removeItem("friends_user");
  showLogin();
});

verifyExistingToken().catch(() => showLogin());
