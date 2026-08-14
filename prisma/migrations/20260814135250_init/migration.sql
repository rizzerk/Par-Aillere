-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('FILLED', 'NO_FILLING');

-- CreateEnum
CREATE TYPE "FulfilMethod" AS ENUM ('PICKUP', 'MAXIM');

-- CreateEnum
CREATE TYPE "PayMethod" AS ENUM ('GCASH', 'GOTYME', 'CASH');

-- CreateEnum
CREATE TYPE "PayStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'ON_PICKUP');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('TO_BAKE', 'BAKING', 'READY', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "cutoffLabel" TEXT NOT NULL,
    "deliveryLabel" TEXT NOT NULL,
    "minOrder" INTEGER NOT NULL DEFAULT 4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "planned" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "category" "ProductCategory" NOT NULL DEFAULT 'FILLED',
    "allergens" TEXT[],
    "blurb" TEXT NOT NULL,
    "longDesc" TEXT NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "batchCode" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "social" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "fulfilMethod" "FulfilMethod" NOT NULL,
    "address" TEXT,
    "payMethod" "PayMethod" NOT NULL,
    "payRef" TEXT,
    "proofUrl" TEXT,
    "payStatus" "PayStatus" NOT NULL,
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'TO_BAKE',
    "rejectReason" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counter" (
    "id" TEXT NOT NULL DEFAULT 'ref',
    "nextRef" INTEGER NOT NULL DEFAULT 843,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "gcashAccountName" TEXT NOT NULL DEFAULT 'Par A. (Aillere Bakes)',
    "gcashAccountNumber" TEXT NOT NULL DEFAULT '0917 000 0000',
    "gotymeAccountName" TEXT NOT NULL DEFAULT 'Par A. (Aillere Bakes)',
    "gotymeAccountNumber" TEXT NOT NULL DEFAULT '0117 4482 0091',
    "gcashQrUrl" TEXT,
    "gotymeQrUrl" TEXT,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seller_email_key" ON "Seller"("email");

-- CreateIndex
CREATE INDEX "Batch_createdAt_idx" ON "Batch"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Order_ref_key" ON "Order"("ref");

-- CreateIndex
CREATE INDEX "Order_ref_idx" ON "Order"("ref");

-- CreateIndex
CREATE INDEX "Order_batchCode_idx" ON "Order"("batchCode");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

