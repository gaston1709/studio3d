-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "receiptPath" TEXT,
    "shippingMethod" TEXT,
    "materialId" TEXT,
    "colorId" TEXT,
    "customMaterial" TEXT,
    "customColor" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_QUOTE',
    "price" REAL,
    "printTimeEstimated" REAL,
    "estimatedDelivery" DATETIME,
    "queuePosition" INTEGER NOT NULL DEFAULT 0,
    "adminNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("adminNotes", "colorId", "createdAt", "estimatedDelivery", "fileName", "filePath", "id", "materialId", "price", "printTimeEstimated", "queuePosition", "receiptPath", "shippingMethod", "status", "updatedAt", "userId") SELECT "adminNotes", "colorId", "createdAt", "estimatedDelivery", "fileName", "filePath", "id", "materialId", "price", "printTimeEstimated", "queuePosition", "receiptPath", "shippingMethod", "status", "updatedAt", "userId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
