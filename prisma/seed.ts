import { PrismaClient, ProductCategory } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const sellerEmail = process.env.SEED_SELLER_EMAIL ?? "admin@paraillere.ph";
  const sellerPassword = process.env.SEED_SELLER_PASSWORD ?? "changeme123";

  await prisma.seller.upsert({
    where: { email: sellerEmail },
    update: {},
    create: {
      email: sellerEmail,
      passwordHash: await bcrypt.hash(sellerPassword, 10),
      name: "Par A.",
    },
  });

  const existingBatch = await prisma.batch.findFirst({ orderBy: { createdAt: "desc" } });
  if (!existingBatch) {
    await prisma.batch.create({
      data: {
        code: "BATCH 14",
        isOpen: true,
        cutoffLabel: "Wed 19 Aug, 9pm",
        deliveryLabel: "Sat 22 Aug",
        minOrder: 4,
      },
    });
  }

  const products = [
    {
      slug: "smores",
      name: "S'mores",
      type: "Cookies",
      price: 45,
      stock: 6,
      planned: 24,
      category: ProductCategory.FILLED,
      allergens: ["Gluten", "Dairy", "Egg", "Soy"],
      blurb: "Toasted marshmallow, graham base, dark chocolate centre.",
      longDesc:
        "A graham-laced dough wrapped around dark chocolate, torched marshmallow on top. 45g of dough before the toppings, so it comes out thick and still molten in the middle.",
    },
    {
      slug: "espresso",
      name: "Espresso",
      type: "Cookies",
      price: 42,
      stock: 14,
      planned: 18,
      category: ProductCategory.FILLED,
      allergens: ["Gluten", "Dairy", "Egg"],
      blurb: "Ground espresso in the dough, molten chocolate inside.",
      longDesc:
        "Fine-ground espresso folded straight into the dough with a dark chocolate ganache centre. Bitter, sweet, and a little bit of a jolt.",
    },
    {
      slug: "dark-chocolate",
      name: "Dark Chocolate",
      type: "Cookies",
      price: 40,
      stock: 20,
      planned: 20,
      category: ProductCategory.FILLED,
      allergens: ["Gluten", "Dairy", "Egg"],
      blurb: "70% couverture, cracked top, still soft in the middle.",
      longDesc:
        "70% couverture melted into the dough and pooled inside. Cracked top, fudgy centre, no filler flavours.",
    },
    {
      slug: "oreo",
      name: "Oreo Cookie",
      type: "Cookies",
      price: 38,
      stock: 3,
      planned: 16,
      category: ProductCategory.NO_FILLING,
      allergens: ["Gluten", "Dairy", "Soy"],
      blurb: "Crushed oreos folded through, no filling.",
      longDesc:
        "Crushed oreos through the dough and over the top. No filling — this one is for people who want crunch.",
    },
    {
      slug: "classic-chocolate-chip",
      name: "Classic Chocolate Chip",
      type: "Cookies",
      price: 32,
      stock: 26,
      planned: 30,
      category: ProductCategory.NO_FILLING,
      allergens: ["Gluten", "Dairy", "Egg"],
      blurb: "The plain one, done properly. Chilled overnight.",
      longDesc:
        "Brown-butter dough rested overnight, chocolate chips only. The one we judge every other batch against.",
    },
    {
      slug: "fudge-brownie",
      name: "Fudge Brownie",
      type: "Brownies",
      price: 55,
      stock: 10,
      planned: 16,
      category: ProductCategory.NO_FILLING,
      allergens: ["Gluten", "Dairy", "Egg"],
      blurb: "Dense, fudgy, crackly top. Cut thick.",
      longDesc:
        "Slow-melted dark chocolate and butter, barely any flour. Baked until the edges set and the centre stays fudgy, then cut into thick squares.",
    },
    {
      slug: "salted-caramel-brownie",
      name: "Salted Caramel Brownie",
      type: "Brownies",
      price: 60,
      stock: 8,
      planned: 16,
      category: ProductCategory.FILLED,
      allergens: ["Gluten", "Dairy", "Egg"],
      blurb: "Fudge brownie swirled with salted caramel through the centre.",
      longDesc:
        "The same slow-melted fudge brownie base, swirled with a salted caramel ribbon through the middle before baking. Finished with flaky salt on top.",
    },
  ];

  const productRecords: Record<string, string> = {};
  for (const p of products) {
    const rec = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, active: true },
    });
    productRecords[p.name] = rec.id;
  }

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  await prisma.counter.upsert({
    where: { id: "ref" },
    update: {},
    create: { id: "ref", nextRef: 843 },
  });

  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    const demoOrders = [
      {
        ref: "CK-0842",
        customerName: "Mika Reyes",
        phone: "0917 555 2210",
        social: "@mikareyes",
        batchCode: "BATCH 14",
        items: [
          { name: "S'mores", qty: 2, price: 45 },
          { name: "Espresso", qty: 2, price: 42 },
        ],
        fulfilMethod: "PICKUP" as const,
        address: null,
        notes: "Pickup around 4pm",
        payMethod: "GCASH" as const,
        payRef: "0092 8471 2233",
        proofUrl: null,
        payStatus: "PENDING" as const,
        orderStatus: "TO_BAKE" as const,
        rejectReason: "",
      },
      {
        ref: "CK-0841",
        customerName: "Jules Alonzo",
        phone: "0918 220 7781",
        social: "@julesa",
        batchCode: "BATCH 14",
        items: [
          { name: "Dark Chocolate", qty: 4, price: 40 },
          { name: "Oreo Cookie", qty: 1, price: 38 },
        ],
        fulfilMethod: "MAXIM" as const,
        address: "12 Kaimito St, Brgy San Roque, Antipolo",
        notes: "",
        payMethod: "GOTYME" as const,
        payRef: "8812 4490 1157",
        proofUrl: null,
        payStatus: "VERIFIED" as const,
        orderStatus: "BAKING" as const,
        rejectReason: "",
      },
      {
        ref: "CK-0840",
        customerName: "Bea Tanchico",
        phone: "0906 118 4402",
        social: "@beatanch",
        batchCode: "BATCH 14",
        items: [{ name: "Classic Chocolate Chip", qty: 6, price: 32 }],
        fulfilMethod: "PICKUP" as const,
        address: null,
        notes: "",
        payMethod: "CASH" as const,
        payRef: null,
        proofUrl: null,
        payStatus: "ON_PICKUP" as const,
        orderStatus: "READY" as const,
        rejectReason: "",
      },
      {
        ref: "CK-0839",
        customerName: "Nico Salcedo",
        phone: "0915 664 0092",
        social: "@nicos",
        batchCode: "BATCH 13",
        items: [{ name: "Espresso", qty: 4, price: 42 }],
        fulfilMethod: "MAXIM" as const,
        address: "88 Ilang-Ilang, Brgy Sto Niño, Marikina",
        notes: "Leave with guard",
        payMethod: "GCASH" as const,
        payRef: "0071 2288 9910",
        proofUrl: null,
        payStatus: "REJECTED" as const,
        orderStatus: "TO_BAKE" as const,
        rejectReason:
          "The screenshot shows ₱120 but the order total is ₱168 — please send the correct proof or top up the difference.",
      },
    ];

    for (const o of demoOrders) {
      await prisma.order.create({
        data: {
          ref: o.ref,
          customerName: o.customerName,
          phone: o.phone,
          social: o.social,
          batchCode: o.batchCode,
          fulfilMethod: o.fulfilMethod,
          address: o.address,
          notes: o.notes,
          payMethod: o.payMethod,
          payRef: o.payRef,
          proofUrl: o.proofUrl,
          payStatus: o.payStatus,
          orderStatus: o.orderStatus,
          rejectReason: o.rejectReason,
          items: {
            create: o.items.map((i) => ({
              productId: productRecords[i.name] ?? null,
              productName: i.name,
              qty: i.qty,
              unitPrice: i.price,
            })),
          },
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`Seller login: ${sellerEmail} / ${sellerPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
