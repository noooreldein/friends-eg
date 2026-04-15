
const API_BASE = `${window.location.origin}/api`;
const t = (key, fallback = "") => (window.t ? window.t(key, fallback) : (fallback || key));

// messages
const loginMsg = document.getElementById("loginMsg");
const registerMsg = document.getElementById("registerMsg");

const setNote = (el, text = "", type = "info") => {
  if (!el) return;
  el.textContent = text;
  el.dataset.type = type;
};

// elements used later
const loginEmailEl = document.getElementById("loginEmail");
const loginPasswordEl = document.getElementById("loginPassword");
const loginPasswordLabel = document.getElementById("loginPasswordLabel");
const loginPhoneSection = document.getElementById("loginPhoneSection");
const loginPhoneCodeEl = document.getElementById("loginPhoneCode");
const sendLoginPhoneCodeBtn = document.getElementById("sendLoginPhoneCode");

const registerNameEl = document.getElementById("registerName");
const registerAddressEl = document.getElementById("registerAddress");
const registerCountryEl = document.getElementById("registerCountry");
const registerAltPhoneEl = document.getElementById("registerAltPhone");
const termsAgreeEl = document.getElementById("termsAgree");
const registerEmailEl = document.getElementById("registerEmail");
const registerPasswordEl = document.getElementById("registerPassword");
const registerPasswordLabel = document.getElementById("registerPasswordLabel");
const registerPhoneSection = document.getElementById("registerPhoneSection");
const registerPhoneCodeEl = document.getElementById("registerPhoneCode");
const sendRegisterPhoneCodeBtn = document.getElementById("sendRegisterPhoneCode");

const googleLoginBtn = document.getElementById("googleLogin");
const facebookLoginBtn = document.getElementById("facebookLogin");
const appleLoginBtn = document.getElementById("appleLogin");
const googleRegisterBtn = document.getElementById("googleRegister");
const facebookRegisterBtn = document.getElementById("facebookRegister");
const appleRegisterBtn = document.getElementById("appleRegister");

const profileBox = document.getElementById("profileBox");
const loginBox = document.getElementById("loginBox");
const registerBox = document.getElementById("registerBox");
const profileNameEl = document.getElementById("profileName");
const profileContactEl = document.getElementById("profileContact");
const logoutBtn = document.getElementById("logoutBtn");
const myOrdersList = document.getElementById("myOrdersList");

let phoneConfirmation = null; // firebase confirmation result object
let myOrders = [];

const getStatusLabel = (status) => t(`status.${status}`, status || "");

const countries = [
  { value: "مصر", ar: "مصر", en: "Egypt" },
  { value: "السعودية", ar: "السعودية", en: "Saudi Arabia" },
  { value: "الإمارات", ar: "الإمارات", en: "United Arab Emirates" },
  { value: "الكويت", ar: "الكويت", en: "Kuwait" },
  { value: "قطر", ar: "قطر", en: "Qatar" },
  { value: "البحرين", ar: "البحرين", en: "Bahrain" },
  { value: "عمان", ar: "عمان", en: "Oman" },
  { value: "الأردن", ar: "الأردن", en: "Jordan" },
  { value: "لبنان", ar: "لبنان", en: "Lebanon" },
  { value: "العراق", ar: "العراق", en: "Iraq" },
  { value: "ليبيا", ar: "ليبيا", en: "Libya" },
  { value: "تونس", ar: "تونس", en: "Tunisia" },
  { value: "الجزائر", ar: "الجزائر", en: "Algeria" },
  { value: "المغرب", ar: "المغرب", en: "Morocco" },
  { value: "السودان", ar: "السودان", en: "Sudan" },
  { value: "اليمن", ar: "اليمن", en: "Yemen" },
  { value: "سوريا", ar: "سوريا", en: "Syria" },
  { value: "فلسطين", ar: "فلسطين", en: "Palestine" },
  { value: "تركيا", ar: "تركيا", en: "Turkey" },
  { value: "الهند", ar: "الهند", en: "India" },
  { value: "باكستان", ar: "باكستان", en: "Pakistan" },
  { value: "إندونيسيا", ar: "إندونيسيا", en: "Indonesia" },
  { value: "ماليزيا", ar: "ماليزيا", en: "Malaysia" },
  { value: "الولايات المتحدة", ar: "الولايات المتحدة", en: "United States" },
  { value: "المملكة المتحدة", ar: "المملكة المتحدة", en: "United Kingdom" },
  { value: "ألمانيا", ar: "ألمانيا", en: "Germany" },
  { value: "فرنسا", ar: "فرنسا", en: "France" },
  { value: "إسبانيا", ar: "إسبانيا", en: "Spain" },
  { value: "إيطاليا", ar: "إيطاليا", en: "Italy" },
  { value: "الصين", ar: "الصين", en: "China" },
  { value: "اليابان", ar: "اليابان", en: "Japan" },
  { value: "كوريا الجنوبية", ar: "كوريا الجنوبية", en: "South Korea" },
  { value: "البرازيل", ar: "البرازيل", en: "Brazil" },
  { value: "أستراليا", ar: "أستراليا", en: "Australia" },
  { value: "كندا", ar: "كندا", en: "Canada" },
  { value: "أخرى", ar: "أخرى", en: "Other" }
];

const renderCountryOptions = () => {
  if (!registerCountryEl) return;
  const lang = window.i18n?.getLang?.() || "ar";
  const current = registerCountryEl.value;
  registerCountryEl.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = t("auth.country_select", "اختر الدولة");
  registerCountryEl.appendChild(placeholder);

  countries.forEach((country) => {
    const option = document.createElement("option");
    option.value = country.value;
    option.textContent = lang === "en" ? country.en : country.ar;
    registerCountryEl.appendChild(option);
  });

  if (current) registerCountryEl.value = current;
};

const renderMyOrders = () => {
  if (!myOrdersList) return;
  myOrdersList.innerHTML = "";
  myOrders.forEach((order) => {
    const li = document.createElement("li");
    li.textContent = `#${order.id.slice(0, 8)} - ${getStatusLabel(order.status)}`;
    myOrdersList.appendChild(li);
  });
};

const setToken = (token, user) => {
  localStorage.setItem("friends_user_token", token);
  localStorage.setItem("friends_user", JSON.stringify(user));
  if (user.role === "admin") {
    localStorage.setItem("friends_admin_token", token);
  }
};

const api = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "request_failed");
  }
  return data;
};

// decide whether input string is phone
const looksLikePhone = (s) => /^\+?\d{8,}$/.test(s);
const normalizePhone = (s = "") => String(s).replace(/[^\d+]/g, "");
const isValidPhone = (s) => looksLikePhone(normalizePhone(s));
const hasTripleName = (name = "") => name.trim().split(/\s+/).filter(Boolean).length >= 3;

// normal login using our backend
const normalLogin = async (email, password) => {
  const data = await api("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  setToken(data.token, data.user);
  window.location.href = data.user.role === "admin" ? "admin.html" : "index.html";
};

// backend call when phone verified via Firebase
const phoneLogin = async (phone, profile = null) => {
  const payload = { phone };
  if (profile) Object.assign(payload, profile);
  const data = await api("/auth/phone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  setToken(data.token, data.user);
  window.location.href = "index.html";
};

// oauth login/register backend call using email obtained from firebase
const oauthLogin = async (email, name) => {
  const data = await api("/auth/oauth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name })
  });
  setToken(data.token, data.user);
  window.location.href = data.user.role === "admin" ? "admin.html" : "index.html";
};

async function login() {
  setNote(loginMsg, "");
  const raw = loginEmailEl.value.trim();

  if (looksLikePhone(raw)) {
    // phone flow: require code
    if (!phoneConfirmation) {
      setNote(loginMsg, t("auth.msg.send_code_prompt", "اضغط على إرسال رمز ثم أدخل الرمز."), "info");
      return;
    }
    const code = loginPhoneCodeEl.value.trim();
    if (!code) {
      setNote(loginMsg, t("auth.msg.enter_code", "أدخل رمز التحقق."), "error");
      return;
    }
    try {
      const userCred = await phoneConfirmation.confirm(code);
      await phoneLogin(userCred.user.phoneNumber);
    } catch (err) {
      if (err.message === "missing_profile_fields" || err.message === "name_required") {
        setNote(loginMsg, t("auth.msg.account_missing", "الحساب غير موجود، من فضلك أنشئ حسابًا جديدًا."), "error");
        return;
      }
      setNote(loginMsg, t("auth.msg.invalid_code", "رمز غير صحيح أو تعذر تسجيل الدخول."), "error");
    }
    return;
  }

  const password = loginPasswordEl.value;
  if (!raw || !password) {
    setNote(loginMsg, t("auth.msg.enter_email_password", "من فضلك أدخل البريد وكلمة المرور."), "error");
    return;
  }
  try {
    await normalLogin(raw, password);
  } catch (error) {
    setNote(loginMsg, t("auth.msg.invalid_credentials", "بيانات الدخول غير صحيحة."), "error");
  }
}

async function register() {
  setNote(registerMsg, "");
  const name = registerNameEl.value.trim();
  const address = registerAddressEl.value.trim();
  const country = registerCountryEl.value.trim();
  const altPhoneRaw = registerAltPhoneEl.value.trim();
  const altPhone = normalizePhone(altPhoneRaw);
  const termsAccepted = !!termsAgreeEl?.checked;
  const raw = registerEmailEl.value.trim();

  if (!hasTripleName(name)) {
    setNote(registerMsg, t("auth.msg.triple_name_required", "من فضلك اكتب الاسم الثلاثي الكامل بدون اختصارات."), "error");
    return;
  }
  if (!address || address.length < 12) {
    setNote(registerMsg, t("auth.msg.address_required", "من فضلك اكتب العنوان التفصيلي بشكل واضح."), "error");
    return;
  }
  if (!country) {
    setNote(registerMsg, t("auth.msg.country_required", "من فضلك اختر الدولة."), "error");
    return;
  }
  if (!isValidPhone(altPhone)) {
    setNote(registerMsg, t("auth.msg.alt_phone_required", "أدخل رقم تواصل إضافي صحيح."), "error");
    return;
  }
  if (!termsAccepted) {
    setNote(registerMsg, t("auth.msg.terms_required", "يجب الموافقة على الشروط والأحكام وسياسة الاسترجاع."), "error");
    return;
  }

  if (looksLikePhone(raw)) {
    if (!phoneConfirmation) {
      setNote(registerMsg, t("auth.msg.send_code_prompt", "اضغط على إرسال رمز ثم أدخل الرمز."), "info");
      return;
    }
    const code = registerPhoneCodeEl.value.trim();
    if (!code) {
      setNote(registerMsg, t("auth.msg.enter_code", "أدخل رمز التحقق."), "error");
      return;
    }
    try {
      const userCred = await phoneConfirmation.confirm(code);
      await phoneLogin(userCred.user.phoneNumber, {
        name,
        address,
        country,
        altPhone,
        termsAccepted: true
      });
    } catch (err) {
      if (err.message === "invalid_alt_phone") {
        setNote(registerMsg, t("auth.msg.alt_phone_invalid", "رقم التواصل الإضافي غير صحيح."), "error");
        return;
      }
      if (err.message === "missing_profile_fields" || err.message === "terms_required") {
        setNote(registerMsg, t("auth.msg.complete_profile", "من فضلك أكمل البيانات ووافق على الشروط."), "error");
        return;
      }
      if (err.message === "phone_exists") {
        setNote(registerMsg, t("auth.msg.phone_exists", "رقم الهاتف مستخدم بالفعل."), "error");
        return;
      }
      setNote(registerMsg, t("auth.msg.phone_register_failed", "تعذر إنشاء الحساب بالهاتف."), "error");
    }
    return;
  }

  const email = raw;
  const password = registerPasswordEl.value;
  if (!email || !password) {
    setNote(registerMsg, t("auth.msg.fill_all_fields", "من فضلك املأ كل الحقول."), "error");
    return;
  }

  try {
    const data = await api("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        address,
        country,
        altPhone,
        termsAccepted: true
      })
    });
    setToken(data.token, data.user);
    window.location.href = "index.html";
  } catch (error) {
    if (error.message === "email_exists") {
      setNote(registerMsg, t("auth.msg.email_exists", "هذا البريد مستخدم بالفعل."), "error");
      return;
    }
    if (error.message === "weak_password") {
      setNote(registerMsg, t("auth.msg.weak_password", "كلمة المرور يجب أن تكون 6 أحرف أو أكثر."), "error");
      return;
    }
    if (error.message === "invalid_alt_phone") {
      setNote(registerMsg, t("auth.msg.alt_phone_invalid", "رقم التواصل الإضافي غير صحيح."), "error");
      return;
    }
    if (error.message === "missing_profile_fields" || error.message === "terms_required") {
      setNote(registerMsg, t("auth.msg.complete_profile", "من فضلك املأ البيانات المطلوبة ووافق على الشروط."), "error");
      return;
    }
    setNote(registerMsg, t("auth.msg.register_failed", "تعذر إنشاء الحساب."), "error");
  }
}

document.getElementById("loginBtn").addEventListener("click", () => {
  login().catch(err => {
    setNote(loginMsg, t("auth.msg.login_error", "حدث خطأ أثناء تسجيل الدخول."), "error");
  });
});

document.getElementById("registerBtn").addEventListener("click", () => {
  register().catch(err => {
    setNote(registerMsg, t("auth.msg.register_error", "حدث خطأ أثناء إنشاء الحساب."), "error");
  });
});

// helper to send sms code via firebase
async function startPhoneFlow(isLogin) {
  const input = isLogin ? loginEmailEl : registerEmailEl;
  const msgEl = isLogin ? loginMsg : registerMsg;
  const raw = input.value.trim();
  if (!looksLikePhone(raw)) {
    setNote(msgEl, t("auth.msg.invalid_phone_input", "أدخل رقم هاتف صالحًا (ابدأ بـ + أو 0)."), "error");
    return;
  }
  try {
    phoneConfirmation = await sendPhoneCode(raw);
    setNote(msgEl, t("auth.msg.phone_code_sent", "تم إرسال رمز التحقق إلى الهاتف."), "success");
  } catch (err) {
    setNote(msgEl, t("auth.msg.phone_code_failed", "فشل إرسال الرمز، حاول مرة أخرى."), "error");
  }
}

sendLoginPhoneCodeBtn?.addEventListener("click", () => startPhoneFlow(true));
sendRegisterPhoneCodeBtn?.addEventListener("click", () => startPhoneFlow(false));

// switch visibility when user types phone/email
function updateInputMode() {
  const rawL = loginEmailEl.value.trim();
  if (looksLikePhone(rawL)) {
    loginPhoneSection.style.display = "block";
    loginPasswordEl.style.display = "none";
    loginPasswordLabel.style.display = "none";
  } else {
    loginPhoneSection.style.display = "none";
    loginPasswordEl.style.display = "block";
    loginPasswordLabel.style.display = "block";
  }
  const rawR = registerEmailEl.value.trim();
  if (looksLikePhone(rawR)) {
    registerPhoneSection.style.display = "block";
    registerPasswordEl.style.display = "none";
    registerPasswordLabel.style.display = "none";
  } else {
    registerPhoneSection.style.display = "none";
    registerPasswordEl.style.display = "block";
    registerPasswordLabel.style.display = "block";
  }
}

loginEmailEl.addEventListener("input", updateInputMode);
registerEmailEl.addEventListener("input", updateInputMode);
updateInputMode();

// social buttons
const getOAuthNoteEl = (loginOrRegister) => (loginOrRegister === "login" ? loginMsg : registerMsg);
const appleRedirectErrorCodes = new Set([
  "auth/operation-not-supported-in-this-environment",
  "auth/operation-not-allowed",
  "auth/popup-blocked",
  "auth/cancelled-popup-request"
]);

const shouldUseAppleRedirect = () => {
  const ua = navigator.userAgent || "";
  const isiOS = /\b(iPhone|iPad|iPod)\b/i.test(ua);
  const isSafari = /\bSafari\b/.test(ua) && !/\b(Chrome|Chromium|CriOS|FxiOS|OPR|Edg)\b/.test(ua);
  return isiOS || isSafari;
};

const notifyAppleRedirect = (loginOrRegister) => {
  setNote(getOAuthNoteEl(loginOrRegister), t("auth.apple_redirect_notice", "ستتم إعادة التوجيه إلى Apple لإكمال الدخول."), "info");
};

const handleOAuthResult = async (result) => {
  const user = result?.user;
  if (!user || !user.email) return;
  await oauthLogin(user.email, user.displayName);
};

const createOAuthProvider = (providerName) => {
  if (providerName === "google") return new firebase.auth.GoogleAuthProvider();
  if (providerName === "facebook") return new firebase.auth.FacebookAuthProvider();
  const provider = new firebase.auth.OAuthProvider("apple.com");
  provider.setCustomParameters({ locale: window.i18n?.getLang?.() || "ar" });
  provider.addScope("name");
  provider.addScope("email");
  return provider;
};

const beginOAuthFlow = async (loginOrRegister, providerName) => {
  const provider = createOAuthProvider(providerName);
  const useRedirect = providerName === "apple" && shouldUseAppleRedirect();
  const performRedirect = async () => {
    notifyAppleRedirect(loginOrRegister);
    await firebase.auth().signInWithRedirect(provider);
  };

  if (useRedirect) {
    await performRedirect();
    return;
  }

  try {
    const result = await firebase.auth().signInWithPopup(provider);
    await handleOAuthResult(result);
  } catch (err) {
    if (providerName === "apple" && appleRedirectErrorCodes.has(err.code)) {
      await performRedirect();
      return;
    }
    console.error("oauth error", err);
  }
};

function setupSocialButtons(loginOrRegister, providerName) {
  const getBtn = () => {
    if (loginOrRegister === "login") {
      if (providerName === "google") return googleLoginBtn;
      if (providerName === "facebook") return facebookLoginBtn;
      return appleLoginBtn;
    }
    if (providerName === "google") return googleRegisterBtn;
    if (providerName === "facebook") return facebookRegisterBtn;
    return appleRegisterBtn;
  };
  const btn = getBtn();

  if (!btn) return;
  btn.addEventListener("click", () => {
    beginOAuthFlow(loginOrRegister, providerName).catch(err => {
      console.error("oauth flow error", err);
    });
  });
}

setupSocialButtons("login", "google");
setupSocialButtons("login", "facebook");
setupSocialButtons("register", "google");
setupSocialButtons("register", "facebook");
setupSocialButtons("login", "apple");
setupSocialButtons("register", "apple");

firebase.auth().getRedirectResult()
  .then(handleOAuthResult)
  .catch((err) => {
    if (err && err.code && !appleRedirectErrorCodes.has(err.code)) {
      console.error("oauth redirect error", err);
    }
  });

// profile handling
async function loadProfile() {
  const token = localStorage.getItem('friends_user_token');
  if (!token) return;
  try {
    const me = await api('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    // show profile
    profileNameEl.textContent = me.name;
    profileContactEl.textContent = me.email || me.phone || '';
    loginBox.style.display = 'none';
    registerBox.style.display = 'none';
    profileBox.style.display = '';
    // load orders
    myOrders = await api('/orders/my', { headers: { Authorization: `Bearer ${token}` } });
    renderMyOrders();
  } catch (e) {
    console.log('profile load failed', e);
  }
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('friends_user_token');
  localStorage.removeItem('friends_user');
  window.location.reload();
});

loadProfile();

renderCountryOptions();

window.addEventListener("langchange", () => {
  renderCountryOptions();
  renderMyOrders();
});

if (window.location.hash === "#register") {
  document.getElementById("registerName").focus();
} else {
  document.getElementById("loginEmail").focus();
}
