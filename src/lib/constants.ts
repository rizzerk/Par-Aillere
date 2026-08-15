import { ProductCategory } from "@prisma/client";

export const CUSTOMER_NAV = [
  { href: "#menu", label: "Menu" },
  { href: "#order", label: "Order" },
  { href: "#track", label: "Track" },
  { href: "#faq", label: "FAQ" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
] as const;

export const ADMIN_NAV = [
  { href: "/studio", label: "Dashboard" },
  { href: "/studio/products", label: "Products" },
  { href: "/studio/types", label: "Types" },
  { href: "/studio/batch", label: "Batch" },
  { href: "/studio/stock", label: "Stock" },
  { href: "/studio/orders", label: "Orders" },
] as const;

export const CONTACT = {
  instagramHandle: "@par.aillere",
  instagramUrl: "https://instagram.com/par.aillere",
  facebookLabel: "Par Aillere",
  facebookUrl: "https://www.facebook.com/share/1EWwQUL2yU/?mibextid=wwXIfr",
  phone: "0927 585 3154",
  email: "camallereaiyina06@gmail.com",
} as const;

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  [ProductCategory.FILLED]: "Filled",
  [ProductCategory.NO_FILLING]: "No filling",
};

export const ALLERGEN_FREE_OPTIONS = [
  { key: "Nuts", label: "Nut-free" },
  { key: "Dairy", label: "Dairy-free" },
  { key: "Soy", label: "Soy-free" },
  { key: "Egg", label: "Egg-free" },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  TO_BAKE: "To bake",
  BAKING: "Baking",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_VALUES = ["TO_BAKE", "BAKING", "READY", "COMPLETED", "CANCELLED"] as const;

export const PAY_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  ON_PICKUP: "On pickup",
};

export const FAQS = [
  {
    q: "How does the batch cycle work?",
    a: "We open one batch at a time. Orders come in until the cutoff, then the whole batch is baked on the delivery day — nothing is baked ahead or stored.",
  },
  {
    q: "What's the cutoff policy?",
    a: "Orders close at the cutoff shown on the menu, usually the Wednesday before the bake. After that the dough is already portioned, so we can't add to the batch.",
  },
  {
    q: "Is there a minimum order?",
    a: "Four pieces, and you can mix any flavours — cookies, brownies, or whatever else is on the menu — to get there.",
  },
  {
    q: "What about allergens?",
    a: "Every item contains wheat and dairy; most contain egg and some contain soy. The kitchen also handles nuts, so we can't guarantee anything nut-free.",
  },
  {
    q: "How do I pay?",
    a: "GCash, GoTyme or cash on pickup. For GCash and GoTyme, send a screenshot and the reference number at checkout — we verify it manually and message you once it clears.",
  },
  {
    q: "Pickup or delivery?",
    a: "Pickup is in Cainta between 2 and 7pm on the bake day. We can book a Maxim rider for you; the fare is paid by you on arrival.",
  },
];
