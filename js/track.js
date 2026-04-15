const API_BASE = "http://localhost:3000/api";
const t = (key, fallback = "") => (window.t ? window.t(key, fallback) : (fallback || key));
const trackBtn = document.getElementById("trackBtn");
const trackMsg = document.getElementById("trackMsg");
const trackResult = document.getElementById("trackResult");

let pollTimer = null;

const formatTemplate = (template, vars = {}) => String(template)
  .replace(/\{(\w+)\}/g, (_, key) => (key in vars ? vars[key] : ""));
const getStatusLabel = (status) => t(`status.${status}`, status || "");

const renderOrder = (order) => {
  const orderCode = order.id.slice(0, 8);
  const locale = (window.i18n?.getLang?.() || "ar") === "ar" ? "ar-EG" : "en-US";
  trackResult.style.display = "block";
  trackResult.innerHTML = `
    <h4>${formatTemplate(t("track.order_number", "طلب #{code}"), { code: orderCode })}</h4>
    <p><strong>${t("track.current_status", "الحالة الحالية:")}</strong> ${getStatusLabel(order.status)}</p>
    <p><strong>${t("track.total_label", "الإجمالي:")}</strong> ${order.totals.total} ${t("label.currency", "ج.م")}</p>
    <h4>${t("track.products_title", "المنتجات")}</h4>
    ${(order.items || []).map(item => `<p>${item.name} x${item.qty}</p>`).join("")}
    <h4>${t("track.status_history_title", "تاريخ الحالة")}</h4>
    ${(order.statusHistory || []).map(s => `<p>${new Date(s.at).toLocaleString(locale)} - ${getStatusLabel(s.status)}</p>`).join("")}
  `;
};

const fetchOrder = async (orderCode, phone) => {
  const res = await fetch(`${API_BASE}/orders/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderCode, phone })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "request_failed");
  return data;
};

const startTracking = async () => {
  const orderCode = document.getElementById("trackOrderCode").value.trim();
  const phone = document.getElementById("trackPhone").value.trim();
  if (!orderCode || !phone) {
    trackMsg.textContent = t("track.msg.missing_fields", "أدخل رقم الطلب والهاتف.");
    return;
  }

  const load = async () => {
    try {
      const order = await fetchOrder(orderCode, phone);
      renderOrder(order);
      trackMsg.textContent = t("track.msg.updated", "تم تحديث الحالة.");
    } catch {
      trackMsg.textContent = t("track.msg.not_found", "تعذر العثور على الطلب.");
      trackResult.style.display = "none";
    }
  };

  clearInterval(pollTimer);
  await load();
  pollTimer = setInterval(load, 10000);
};

trackBtn.addEventListener("click", () => {
  startTracking().catch(() => {
    trackMsg.textContent = t("track.msg.failed", "تعذر التتبع الآن.");
  });
});
