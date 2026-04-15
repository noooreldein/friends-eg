import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const SEED_PATH = path.join(DATA_DIR, "seed.json");
const PRODUCTS_PATH = path.join(DATA_DIR, "products.json");
const HERO_PATH = path.join(DATA_DIR, "hero.json");
const ORDERS_PATH = path.join(DATA_DIR, "orders.json");
const USERS_PATH = path.join(DATA_DIR, "users.json");
const REVIEWS_PATH = path.join(DATA_DIR, "reviews.json");
const UPLOAD_DIR = path.join(__dirname, "images", "uploads");

const JWT_SECRET = process.env.JWT_SECRET || "friends_production_secret_key_change_in_env_file_2024";
const TOKEN_EXPIRES = "7d";

const discountCodes = {
  FRIENDS10: 0.1,
  WELCOME15: 0.15
};

const orderStatuses = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];

const statusLabels = {
  pending: "قيد المراجعة",
  confirmed: "تم التأكيد",
  packed: "تم التغليف",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "تم الإلغاء"
};

const rolePermissions = {
  supervisor: ["orders.read", "orders.support", "orders.shipping", "orders.delivered", "catalog.manage", "reviews.read", "reviews.manage", "staff.manage", "users.read"],
  shipping: ["orders.read", "orders.shipping", "orders.delivered"],
  support: ["orders.read", "orders.support", "reviews.read"],
  user: []
};

const normalizeRole = (role) => {
  if (role === "admin") return "supervisor";
  return role || "user";
};

const getRolePermissions = (role) => rolePermissions[normalizeRole(role)] || [];
const hasPermission = (role, permission) => getRolePermissions(role).includes(permission);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    } catch (error) {
      cb(error, UPLOAD_DIR);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const toUploadPath = (file) => (file ? `images/uploads/${file.filename}` : "");

const parseJsonField = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const sanitizePhone = (value = "") => String(value).replace(/\D/g, "");

const ensureDataFiles = async () => {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(UPLOAD_DIR, { recursive: true });

  try {
    await readFile(PRODUCTS_PATH, "utf8");
  } catch {
    const seedRaw = await readFile(SEED_PATH, "utf8");
    const seed = JSON.parse(seedRaw);
    await writeFile(PRODUCTS_PATH, JSON.stringify(seed.products, null, 2), "utf8");
  }

  try {
    await readFile(HERO_PATH, "utf8");
  } catch {
    const seedRaw = await readFile(SEED_PATH, "utf8");
    const seed = JSON.parse(seedRaw);
    const hero = (seed.hero || []).map((slide, idx) => ({
      id: idx + 1,
      title: slide.title || "",
      text: slide.text || "",
      badge: slide.badge || "",
      image: slide.image || ""
    }));
    await writeFile(HERO_PATH, JSON.stringify(hero, null, 2), "utf8");
  }

  try {
    await readFile(ORDERS_PATH, "utf8");
  } catch {
    await writeFile(ORDERS_PATH, JSON.stringify([], null, 2), "utf8");
  }

  try {
    await readFile(USERS_PATH, "utf8");
  } catch {
    const passwordHash = await bcrypt.hash("admin123", 10);
    const users = [
      { id: uuidv4(), name: "Supervisor", email: "admin@friends.local", passwordHash, role: "supervisor" },
      { id: uuidv4(), name: "Shipping", email: "shipping@friends.local", passwordHash, role: "shipping" },
      { id: uuidv4(), name: "Support", email: "support@friends.local", passwordHash, role: "support" }
    ];
    await writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf8");
  }

  try {
    await readFile(REVIEWS_PATH, "utf8");
  } catch {
    await writeFile(REVIEWS_PATH, JSON.stringify([], null, 2), "utf8");
  }

  const users = JSON.parse(await readFile(USERS_PATH, "utf8"));
  const normalized = users.map(user => ({ ...user, role: normalizeRole(user.role) }));
  const baseHash = await bcrypt.hash("admin123", 10);
  const ensureUser = (email, role, name) => {
    if (!normalized.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      normalized.push({ id: uuidv4(), name, email, passwordHash: baseHash, role });
    }
  };
  ensureUser("admin@friends.local", "supervisor", "Supervisor");
  ensureUser("shipping@friends.local", "shipping", "Shipping");
  ensureUser("support@friends.local", "support", "Support");
  await writeFile(USERS_PATH, JSON.stringify(normalized, null, 2), "utf8");
};

const normalizeProduct = (product) => {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  if (!images.length && product.image) images.push(product.image);
  return {
    ...product,
    images,
    image: images[0] || product.image || ""
  };
};

const readProducts = async () => {
  const items = JSON.parse(await readFile(PRODUCTS_PATH, "utf8"));
  return Array.isArray(items) ? items.map(normalizeProduct) : [];
};
const writeProducts = async (products) => writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2), "utf8");

const readHero = async () => JSON.parse(await readFile(HERO_PATH, "utf8"));
const writeHero = async (slides) => writeFile(HERO_PATH, JSON.stringify(slides, null, 2), "utf8");

const readOrders = async () => JSON.parse(await readFile(ORDERS_PATH, "utf8"));
const writeOrders = async (orders) => writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2), "utf8");

const readUsers = async () => JSON.parse(await readFile(USERS_PATH, "utf8"));
const writeUsers = async (users) => writeFile(USERS_PATH, JSON.stringify(users, null, 2), "utf8");

const readReviews = async () => JSON.parse(await readFile(REVIEWS_PATH, "utf8"));
const writeReviews = async (reviews) => writeFile(REVIEWS_PATH, JSON.stringify(reviews, null, 2), "utf8");

const buildCategories = (items) => {
  const counts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(counts).map(name => ({ name, count: counts[name] }));
};

const calculateTotals = (items, discountCode = "") => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 300 ? 0 : 25;
  const rate = discountCodes[String(discountCode).toUpperCase()] || 0;
  const discount = Math.round(subtotal * rate);
  const total = Math.max(0, subtotal + shipping - discount);
  return { subtotal, shipping, discount, total };
};

const normalizeOrder = (order) => ({
  ...order,
  status: order.status || "pending",
  statusHistory: Array.isArray(order.statusHistory) ? order.statusHistory : [],
  customer: order.customer || {},
  payment: order.payment || {},
  reviewTokenUsed: Boolean(order.reviewTokenUsed),
  adminAccessToken: order.adminAccessToken || uuidv4()
});

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.static(__dirname));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "unauthorized" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { ...payload, role: normalizeRole(payload.role) };
    next();
  } catch {
    res.status(401).json({ error: "invalid_token" });
  }
};

const requirePermission = (permission) => (req, res, next) => {
  if (!hasPermission(req.user?.role, permission)) {
    return res.status(403).json({ error: "forbidden" });
  }
  next();
};

const buildAuthPayload = (user) => ({
  id: user.id,
  email: user.email,
  phone: user.phone,
  altPhone: user.altPhone,
  address: user.address,
  country: user.country,
  role: normalizeRole(user.role),
  name: user.name,
  permissions: getRolePermissions(user.role)
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "credentials_required" });

  const users = await readUsers();
  const user = users.find(u => u.email && u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!user) return res.status(401).json({ error: "invalid_credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid_credentials" });

  const authPayload = buildAuthPayload(user);
  const token = jwt.sign(authPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
  res.json({ token, user: authPayload });
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, phone, address, country, altPhone, termsAccepted } = req.body || {};
  // allow either email+password or phone-based registration
  const missingFields = [];
  if (!name) missingFields.push("name");
  if (!address) missingFields.push("address");
  if (!country) missingFields.push("country");
  if (!altPhone) missingFields.push("altPhone");
  if (!termsAccepted) missingFields.push("terms");
  if (!email && !phone) missingFields.push("contact");
  if (missingFields.length) {
    return res.status(400).json({ error: "missing_profile_fields", fields: missingFields });
  }
  if (email && String(password).length < 6) return res.status(400).json({ error: "weak_password" });
  const altPhoneSanitized = sanitizePhone(altPhone);
  if (altPhoneSanitized.length < 8) {
    return res.status(400).json({ error: "invalid_alt_phone" });
  }

  const users = await readUsers();
  if (email) {
    const normalizedEmail = String(email).trim().toLowerCase();
    if (users.some(u => u.email && u.email.toLowerCase() === normalizedEmail)) {
      return res.status(409).json({ error: "email_exists" });
    }
  }
  if (phone) {
    const sanitized = sanitizePhone(phone);
    if (users.some(u => u.phone && sanitizePhone(u.phone) === sanitized)) {
      return res.status(409).json({ error: "phone_exists" });
    }
  }

  const user = {
    id: uuidv4(),
    name: String(name).trim(),
    email: email ? String(email).trim().toLowerCase() : undefined,
    phone: phone ? sanitizePhone(phone) : undefined,
    altPhone: altPhoneSanitized,
    address: String(address).trim(),
    country: String(country).trim(),
    passwordHash: email ? await bcrypt.hash(password, 10) : undefined,
    role: "user",
    termsAcceptedAt: new Date().toISOString()
  };

  users.push(user);
  await writeUsers(users);

  const authPayload = buildAuthPayload(user);
  const token = jwt.sign(authPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
  res.status(201).json({ token, user: authPayload });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    altPhone: req.user.altPhone,
    address: req.user.address,
    country: req.user.country,
    role: req.user.role,
    permissions: getRolePermissions(req.user.role)
  });
});


// new endpoint used by client when Firebase OAuth/phone verification is complete
app.post("/api/auth/oauth", async (req, res) => {
  const { email, name } = req.body || {};
  if (!email) return res.status(400).json({ error: "email_required" });
  const users = await readUsers();
  let user = users.find(u => u.email && u.email.toLowerCase() === String(email).trim().toLowerCase());
  if (!user) {
    user = {
      id: uuidv4(),
      name: String(name || "").trim() || email.split("@")[0],
      email: String(email).trim().toLowerCase(),
      role: "user"
    };
    users.push(user);
    await writeUsers(users);
  }
  const authPayload = buildAuthPayload(user);
  const token = jwt.sign(authPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
  res.json({ token, user: authPayload });
});

// phone login/register using data verified on client with Firebase
app.post("/api/auth/phone", async (req, res) => {
  const { phone, name, address, country, altPhone, termsAccepted } = req.body || {};
  if (!phone) return res.status(400).json({ error: "phone_required" });
  const sanitized = sanitizePhone(phone);
  const users = await readUsers();
  let user = users.find(u => u.phone && sanitizePhone(u.phone) === sanitized);
  if (!user) {
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!address) missingFields.push("address");
    if (!country) missingFields.push("country");
    if (!altPhone) missingFields.push("altPhone");
    if (!termsAccepted) missingFields.push("terms");
    if (missingFields.length) {
      return res.status(400).json({ error: "missing_profile_fields", fields: missingFields });
    }
    const altPhoneSanitized = sanitizePhone(altPhone);
    if (altPhoneSanitized.length < 8) {
      return res.status(400).json({ error: "invalid_alt_phone" });
    }
    user = {
      id: uuidv4(),
      name: String(name).trim(),
      phone: sanitized,
      altPhone: altPhoneSanitized,
      address: String(address).trim(),
      country: String(country).trim(),
      role: "user",
      termsAcceptedAt: new Date().toISOString()
    };
    users.push(user);
    await writeUsers(users);
  }
  const authPayload = buildAuthPayload(user);
  const token = jwt.sign(authPayload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
  res.json({ token, user: authPayload });
});

// return orders belonging to the authenticated user
app.get("/api/orders/my", requireAuth, async (req, res) => {
  const orders = await readOrders();
  const myOrders = orders.filter(order => {
    if (req.user.email && order.customer?.email) {
      return order.customer.email.toLowerCase() === req.user.email.toLowerCase();
    }
    if (req.user.phone && order.customer?.phone) {
      return sanitizePhone(order.customer.phone) === sanitizePhone(req.user.phone);
    }
    return false;
  });
  res.json(myOrders);
});

app.get("/api/products", async (req, res) => {
  const products = await readProducts();
  const { category, q } = req.query;
  let list = products;
  if (category) list = list.filter(item => item.category === category);
  if (q) {
    const term = String(q).toLowerCase();
    list = list.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.short.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term)
    );
  }
  res.json(list);
});

app.get("/api/products/:id", async (req, res) => {
  const products = await readProducts();
  const item = products.find(p => p.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: "not_found" });
  res.json(item);
});

app.get("/api/products/:id/reviews", async (req, res) => {
  const productId = Number(req.params.id);
  const reviews = await readReviews();
  const visible = [];

  reviews.forEach(review => {
    (review.products || []).forEach(item => {
      if (item.productId === productId && item.visible) {
        visible.push({
          reviewId: review.id,
          customerName: review.customerName,
          stars: item.stars,
          comment: item.comment || "",
          createdAt: review.createdAt
        });
      }
    });
  });

  res.json(visible);
});

app.get("/api/categories", async (req, res) => {
  res.json(buildCategories(await readProducts()));
});

app.get("/api/hero", async (req, res) => {
  res.json(await readHero());
});

app.post("/api/orders", upload.single("transferProofImage"), async (req, res) => {
  const items = parseJsonField(req.body.items, []);
  const customer = parseJsonField(req.body.customer, {});
  const payment = parseJsonField(req.body.payment, {});
  const discountCode = String(req.body.discountCode || "");

  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: "items_required" });
  if (!customer.name || !customer.phone || !customer.address) return res.status(400).json({ error: "customer_required" });
  if (!payment.method || !payment.provider || !payment.transferTo) return res.status(400).json({ error: "payment_required" });

  const products = await readProducts();
  const enriched = items.map(item => {
    const product = products.find(p => p.id === Number(item.id));
    if (!product) return null;
    return { id: product.id, name: product.name, price: product.price, qty: Number(item.qty || 1), sku: product.sku };
  }).filter(Boolean);

  if (!enriched.length) return res.status(400).json({ error: "invalid_items" });

  const createdAt = new Date().toISOString();
  const order = {
    id: uuidv4(),
    createdAt,
    updatedAt: createdAt,
    status: "pending",
    statusHistory: [{ status: "pending", label: statusLabels.pending, at: createdAt, note: "تم استلام الطلب." }],
    adminAccessToken: uuidv4(),
    reviewToken: null,
    reviewTokenUsed: false,
    items: enriched,
    discountCode,
    customer,
    payment: {
      method: payment.method,
      provider: payment.provider,
      transferTo: payment.transferTo,
      transferAccount: payment.transferAccount || "",
      transferProofImage: toUploadPath(req.file),
      transferRef: String(payment.transferRef || "")
    },
    totals: calculateTotals(enriched, discountCode)
  };

  const orders = await readOrders();
  orders.unshift(order);
  await writeOrders(orders);
  res.status(201).json(order);
});

app.post("/api/orders/track", async (req, res) => {
  const { orderCode, phone } = req.body || {};
  if (!orderCode || !phone) return res.status(400).json({ error: "missing_fields" });

  const targetCode = String(orderCode).trim().toLowerCase();
  const targetPhone = sanitizePhone(phone);
  const orders = (await readOrders()).map(normalizeOrder);

  const order = orders.find(item =>
    item.id.toLowerCase().startsWith(targetCode) &&
    sanitizePhone(item.customer?.phone) === targetPhone
  );

  if (!order) return res.status(404).json({ error: "not_found" });

  res.json({
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    statusLabel: statusLabels[order.status] || order.status,
    statusHistory: order.statusHistory,
    items: order.items,
    totals: order.totals,
    customer: { name: order.customer?.name || "", phone: order.customer?.phone || "" }
  });
});

app.get("/api/review/:token", async (req, res) => {
  const token = String(req.params.token || "");
  const orders = (await readOrders()).map(normalizeOrder);
  const order = orders.find(o => o.reviewToken === token);
  if (!order) return res.status(404).json({ error: "not_found" });
  if (order.reviewTokenUsed) return res.status(410).json({ error: "token_used" });

  res.json({ orderId: order.id, customerName: order.customer?.name || "", items: order.items || [] });
});

app.post("/api/review/:token", async (req, res) => {
  const token = String(req.params.token || "");
  const payload = req.body || {};
  const courierRating = Number(payload.courierRating || 0);
  if (courierRating < 1 || courierRating > 5) return res.status(400).json({ error: "courier_rating_required" });

  const orders = await readOrders();
  const orderIndex = orders.findIndex(o => o.reviewToken === token);
  if (orderIndex === -1) return res.status(404).json({ error: "not_found" });

  const order = normalizeOrder(orders[orderIndex]);
  if (order.reviewTokenUsed) return res.status(410).json({ error: "token_used" });

  const products = await readProducts();
  const productFeedback = Array.isArray(payload.productFeedback) ? payload.productFeedback : [];

  const normalizedProductFeedback = productFeedback
    .map(item => ({
      id: uuidv4(),
      productId: Number(item.productId),
      productName: String(item.productName || ""),
      stars: Number(item.stars || 0),
      comment: String(item.comment || "").trim(),
      visible: false
    }))
    .filter(item => item.productId > 0 && item.stars >= 1 && item.stars <= 5);

  normalizedProductFeedback.forEach(item => {
    const index = products.findIndex(p => p.id === item.productId);
    if (index === -1) return;
    const currentReviews = Number(products[index].reviews || 0);
    const currentRating = Number(products[index].rating || 0);
    const nextReviews = currentReviews + 1;
    const nextRating = ((currentRating * currentReviews) + item.stars) / nextReviews;
    products[index].reviews = nextReviews;
    products[index].rating = Number(nextRating.toFixed(1));
  });

  const review = {
    id: uuidv4(),
    orderId: order.id,
    customerName: order.customer?.name || "",
    customerPhone: order.customer?.phone || "",
    receivedConfirmed: payload.receivedConfirmed !== false,
    courierRating,
    courierComment: String(payload.courierComment || "").trim(),
    products: normalizedProductFeedback,
    createdAt: new Date().toISOString()
  };

  const reviews = await readReviews();
  reviews.unshift(review);

  order.reviewTokenUsed = true;
  order.receivedConfirmed = payload.receivedConfirmed !== false;
  order.reviewedAt = new Date().toISOString();
  orders[orderIndex] = order;

  await Promise.all([writeOrders(orders), writeReviews(reviews), writeProducts(products)]);
  res.status(201).json({ ok: true, reviewId: review.id });
});

app.get("/api/admin/orders", requireAuth, requirePermission("orders.read"), async (req, res) => {
  const { status = "", dateFrom = "", dateTo = "", q = "" } = req.query;
  let orders = (await readOrders()).map(normalizeOrder);

  if (status) orders = orders.filter(order => order.status === status);
  if (dateFrom) {
    const from = new Date(dateFrom).getTime();
    if (!Number.isNaN(from)) orders = orders.filter(order => new Date(order.createdAt).getTime() >= from);
  }
  if (dateTo) {
    const to = new Date(dateTo).getTime();
    if (!Number.isNaN(to)) orders = orders.filter(order => new Date(order.createdAt).getTime() <= to + (24 * 60 * 60 * 1000 - 1));
  }
  if (q) {
    const term = String(q).toLowerCase();
    orders = orders.filter(order =>
      order.id.toLowerCase().includes(term) ||
      String(order.customer?.name || "").toLowerCase().includes(term) ||
      String(order.customer?.phone || "").toLowerCase().includes(term)
    );
  }

  res.json(orders);
});

app.get("/api/admin/orders/access/:token", requireAuth, requirePermission("orders.read"), async (req, res) => {
  const token = String(req.params.token || "");
  const orders = (await readOrders()).map(normalizeOrder);
  const order = orders.find(o => o.adminAccessToken === token);
  if (!order) return res.status(404).json({ error: "not_found" });
  res.json(order);
});

app.patch("/api/admin/orders/:id/status", requireAuth, requirePermission("orders.read"), async (req, res) => {
  const { status } = req.body || {};
  if (!orderStatuses.includes(status)) return res.status(400).json({ error: "invalid_status" });
  if (status === "delivered") return res.status(400).json({ error: "use_delivered_endpoint" });

  if (["confirmed", "cancelled"].includes(status) && !hasPermission(req.user.role, "orders.support") && !hasPermission(req.user.role, "orders.shipping") && !hasPermission(req.user.role, "orders.delivered")) {
    return res.status(403).json({ error: "forbidden" });
  }

  if (["packed", "shipped"].includes(status) && !hasPermission(req.user.role, "orders.shipping") && !hasPermission(req.user.role, "orders.delivered")) {
    return res.status(403).json({ error: "forbidden" });
  }

  const orders = await readOrders();
  const index = orders.findIndex(order => order.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "not_found" });

  const next = normalizeOrder(orders[index]);
  const now = new Date().toISOString();
  next.status = status;
  next.updatedAt = now;
  next.statusHistory.push({ status, label: statusLabels[status], at: now, note: `تم تحديث الحالة إلى ${statusLabels[status]}` });

  const customerName = next.customer?.name || "العميل";
  const orderCode = next.id.slice(0, 8);
  next.lastNotification = {
    channel: "whatsapp",
    message: `مرحبًا ${customerName}، طلبك رقم ${orderCode} حالته الآن: ${statusLabels[status]}.`,
    sentAt: now
  };

  orders[index] = next;
  await writeOrders(orders);
  res.json(next);
});

app.patch("/api/admin/orders/:id/delivered", requireAuth, requirePermission("orders.delivered"), upload.single("deliveryProofImage"), async (req, res) => {
  const courierNote = String(req.body.courierNote || "");

  const orders = await readOrders();
  const index = orders.findIndex(order => order.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "not_found" });

  const next = normalizeOrder(orders[index]);
  const now = new Date().toISOString();
  const reviewToken = uuidv4();

  next.status = "delivered";
  next.updatedAt = now;
  next.reviewToken = reviewToken;
  next.reviewTokenUsed = false;
  next.delivery = {
    proofImage: toUploadPath(req.file),
    courierNote
  };
  next.statusHistory.push({ status: "delivered", label: statusLabels.delivered, at: now, note: "المندوب أكد التسليم." });

  const reviewPath = `/review.html?token=${reviewToken}`;
  const customerName = next.customer?.name || "العميل";
  const orderCode = next.id.slice(0, 8);
  next.lastNotification = {
    channel: "whatsapp",
    message: `مرحبًا ${customerName}، تم توصيل طلبك رقم ${orderCode}. من فضلك أكد الاستلام وقيّم التجربة من هنا: ${reviewPath}`,
    sentAt: now
  };

  orders[index] = next;
  await writeOrders(orders);
  res.json({ ...next, reviewPath });
});

app.get("/api/admin/reviews", requireAuth, requirePermission("reviews.read"), async (req, res) => {
  res.json(await readReviews());
});

app.patch("/api/admin/reviews/:reviewId/products/:productReviewId", requireAuth, requirePermission("reviews.manage"), async (req, res) => {
  const { visible } = req.body || {};
  const reviews = await readReviews();

  const reviewIndex = reviews.findIndex(r => r.id === req.params.reviewId);
  if (reviewIndex === -1) return res.status(404).json({ error: "review_not_found" });

  const productIndex = (reviews[reviewIndex].products || []).findIndex(p => p.id === req.params.productReviewId);
  if (productIndex === -1) return res.status(404).json({ error: "product_review_not_found" });

  reviews[reviewIndex].products[productIndex].visible = Boolean(visible);
  await writeReviews(reviews);
  res.json(reviews[reviewIndex].products[productIndex]);
});

app.get("/api/admin/staff", requireAuth, requirePermission("staff.manage"), async (req, res) => {
  const users = await readUsers();
  const staff = users
    .filter(u => ["supervisor", "shipping", "support", "admin"].includes(normalizeRole(u.role)))
    .map(u => ({ id: u.id, name: u.name, email: u.email, role: normalizeRole(u.role) }));
  res.json(staff);
});

app.post("/api/admin/staff", requireAuth, requirePermission("staff.manage"), async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "missing_fields" });
  }
  if (!["supervisor", "shipping", "support"].includes(role)) {
    return res.status(400).json({ error: "invalid_role" });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: "weak_password" });
  }

  const users = await readUsers();
  const normalizedEmail = String(email).trim().toLowerCase();
  if (users.some(u => u.email && u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ error: "email_exists" });
  }

  const user = {
    id: uuidv4(),
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 10),
    role
  };

  users.push(user);
  await writeUsers(users);
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.patch("/api/admin/staff/:id/role", requireAuth, requirePermission("staff.manage"), async (req, res) => {
  const { role } = req.body || {};
  if (!["supervisor", "shipping", "support"].includes(role)) {
    return res.status(400).json({ error: "invalid_role" });
  }

  const users = await readUsers();
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "not_found" });

  users[index].role = role;
  await writeUsers(users);
  res.json({ id: users[index].id, name: users[index].name, email: users[index].email, role });
});

app.get("/api/admin/users", requireAuth, requirePermission("users.read"), async (req, res) => {
  const { country = "", phoneKey = "", letter = "", q = "", roleType = "" } = req.query || {};
  let users = await readUsers();

  const roleFilter = String(roleType || "").trim().toLowerCase();
  if (roleFilter === "customers") {
    users = users.filter(u => normalizeRole(u.role) === "user");
  } else if (roleFilter === "staff") {
    users = users.filter(u => normalizeRole(u.role) !== "user");
  }

  const countryNeedle = String(country || "").trim().toLowerCase();
  if (countryNeedle) {
    users = users.filter(u => String(u.country || "").trim().toLowerCase() === countryNeedle);
  }

  const phoneNeedle = sanitizePhone(phoneKey);
  if (phoneNeedle) {
    users = users.filter(u => {
      const mainPhone = sanitizePhone(u.phone || "");
      const altPhone = sanitizePhone(u.altPhone || "");
      return mainPhone.startsWith(phoneNeedle) || altPhone.startsWith(phoneNeedle);
    });
  }

  const letterNeedle = String(letter || "").trim().toLowerCase();
  if (letterNeedle) {
    users = users.filter(u => String(u.name || "").toLowerCase().includes(letterNeedle));
  }

  const qNeedle = String(q || "").trim().toLowerCase();
  const qPhone = sanitizePhone(q);
  if (qNeedle || qPhone) {
    users = users.filter(u => {
      const nameMatch = String(u.name || "").toLowerCase().includes(qNeedle);
      const emailMatch = String(u.email || "").toLowerCase().includes(qNeedle);
      const addressMatch = String(u.address || "").toLowerCase().includes(qNeedle);
      const countryMatch = String(u.country || "").toLowerCase().includes(qNeedle);
      const phoneMatch = qPhone
        ? sanitizePhone(u.phone || "").includes(qPhone) || sanitizePhone(u.altPhone || "").includes(qPhone)
        : false;
      return nameMatch || emailMatch || addressMatch || countryMatch || phoneMatch;
    });
  }

  users.sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "ar"));

  res.json(users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email || "",
    phone: u.phone || "",
    altPhone: u.altPhone || "",
    address: u.address || "",
    country: u.country || "",
    role: normalizeRole(u.role)
  })));
});

app.get("/api/admin/products", requireAuth, requirePermission("catalog.manage"), async (req, res) => {
  res.json(await readProducts());
});

app.post("/api/admin/products", requireAuth, requirePermission("catalog.manage"), async (req, res) => {
  const products = await readProducts();
  const payload = req.body || {};
  if (!payload.name || Number(payload.price) <= 0 || !payload.category) {
    return res.status(400).json({ error: "missing_fields" });
  }

  const images = Array.isArray(payload.images) ? payload.images.filter(Boolean) : [];
  if (!images.length && payload.image) images.push(payload.image);
  const en = payload.i18n?.en || {};
  const i18n = {
    en: {
      name: en.name ? String(en.name).trim() : "",
      category: en.category ? String(en.category).trim() : "",
      short: en.short ? String(en.short).trim() : "",
      details: en.details ? String(en.details).trim() : "",
      usage: en.usage ? String(en.usage).trim() : "",
      brand: en.brand ? String(en.brand).trim() : ""
    }
  };
  const hasEn = Object.values(i18n.en).some(Boolean);

  const id = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const product = {
    id,
    name: payload.name,
    short: payload.short || "",
    price: Number(payload.price),
    category: payload.category,
    image: images[0] || "",
    images,
    discount: payload.discount || "لا يوجد",
    usage: payload.usage || "",
    details: payload.details || "",
    brand: payload.brand || "",
    sku: payload.sku || `FR-${id}`,
    stock: Number(payload.stock || 0),
    rating: Number(payload.rating || 0),
    reviews: Number(payload.reviews || 0),
    tags: Array.isArray(payload.tags) ? payload.tags : []
  };
  if (hasEn) product.i18n = i18n;

  products.push(product);
  await writeProducts(products);
  res.status(201).json(product);
});

app.put("/api/admin/products/:id", requireAuth, requirePermission("catalog.manage"), async (req, res) => {
  const products = await readProducts();
  const id = Number(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: "not_found" });

  const payload = req.body || {};
  const nextPrice = payload.price === undefined ? products[index].price : Number(payload.price);
  const nextStock = payload.stock === undefined ? products[index].stock : Number(payload.stock);
  if (Number.isNaN(nextPrice) || nextPrice < 0) return res.status(400).json({ error: "invalid_price" });
  if (Number.isNaN(nextStock) || nextStock < 0) return res.status(400).json({ error: "invalid_stock" });

  const hasImagePayload = Object.prototype.hasOwnProperty.call(payload, "images") ||
    Object.prototype.hasOwnProperty.call(payload, "image");
  let images = products[index].images || (products[index].image ? [products[index].image] : []);
  if (hasImagePayload) {
    images = Array.isArray(payload.images) ? payload.images.filter(Boolean) : [];
    if (!images.length && payload.image) images.push(payload.image);
  }

  const currentI18n = products[index].i18n || {};
  let nextI18n = currentI18n;
  if (payload.i18n && payload.i18n.en) {
    const en = payload.i18n.en || {};
    const cleaned = {
      name: en.name ? String(en.name).trim() : "",
      category: en.category ? String(en.category).trim() : "",
      short: en.short ? String(en.short).trim() : "",
      details: en.details ? String(en.details).trim() : "",
      usage: en.usage ? String(en.usage).trim() : "",
      brand: en.brand ? String(en.brand).trim() : ""
    };
    const hasEn = Object.values(cleaned).some(Boolean);
    nextI18n = hasEn ? { ...currentI18n, en: cleaned } : currentI18n;
  }

  const updated = {
    ...products[index],
    ...payload,
    id,
    price: nextPrice,
    stock: nextStock,
    images,
    image: images[0] || "",
    i18n: nextI18n
  };
  products[index] = updated;
  await writeProducts(products);
  res.json(updated);
});

app.delete("/api/admin/products/:id", requireAuth, requirePermission("catalog.manage"), async (req, res) => {
  const products = await readProducts();
  const id = Number(req.params.id);
  const next = products.filter(p => p.id !== id);
  if (next.length === products.length) return res.status(404).json({ error: "not_found" });
  await writeProducts(next);
  res.json({ ok: true });
});

app.get("/api/admin/hero", requireAuth, requirePermission("catalog.manage"), async (req, res) => {
  res.json(await readHero());
});

app.post("/api/admin/hero", requireAuth, requirePermission("catalog.manage"), async (req, res) => {
  const hero = await readHero();
  const payload = req.body || {};
  if (!payload.title || !payload.text) return res.status(400).json({ error: "missing_fields" });

  const id = hero.length ? Math.max(...hero.map(s => s.id || 0)) + 1 : 1;
  const slide = {
    id,
    title: String(payload.title),
    text: String(payload.text),
    badge: String(payload.badge || "عرض خاص"),
    image: String(payload.image || "")
  };

  hero.push(slide);
  await writeHero(hero);
  res.status(201).json(slide);
});

app.put("/api/admin/hero/:id", requireAuth, requirePermission("catalog.manage"), async (req, res) => {
  const hero = await readHero();
  const id = Number(req.params.id);
  const index = hero.findIndex(s => Number(s.id) === id);
  if (index === -1) return res.status(404).json({ error: "not_found" });

  const updated = { ...hero[index], ...(req.body || {}), id };
  if (!updated.title || !updated.text) return res.status(400).json({ error: "missing_fields" });

  hero[index] = updated;
  await writeHero(hero);
  res.json(updated);
});

app.delete("/api/admin/hero/:id", requireAuth, requirePermission("catalog.manage"), async (req, res) => {
  const hero = await readHero();
  const id = Number(req.params.id);
  const next = hero.filter(s => Number(s.id) !== id);
  if (next.length === hero.length) return res.status(404).json({ error: "not_found" });
  await writeHero(next);
  res.json({ ok: true });
});

const start = async () => {
  await ensureDataFiles();
  app.listen(PORT, () => {
    console.log(`FRIENDS backend running on PORT ${PORT}`);
  });
};

start();
