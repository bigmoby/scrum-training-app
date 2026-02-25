-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lang" TEXT NOT NULL DEFAULT 'it',
    "title" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "hint" TEXT,
    "correctLocation" TEXT NOT NULL,
    "explanationLocation" TEXT NOT NULL DEFAULT '-',
    "correctSuspect" TEXT NOT NULL,
    "explanationSuspect" TEXT NOT NULL DEFAULT '-',
    "correctWeapon" TEXT NOT NULL,
    "explanationWeapon" TEXT NOT NULL DEFAULT '-',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Case" ("correctLocation", "correctSuspect", "correctWeapon", "createdAt", "explanationLocation", "explanationSuspect", "explanationWeapon", "hint", "id", "story", "title") SELECT "correctLocation", "correctSuspect", "correctWeapon", "createdAt", "explanationLocation", "explanationSuspect", "explanationWeapon", "hint", "id", "story", "title" FROM "Case";
DROP TABLE "Case";
ALTER TABLE "new_Case" RENAME TO "Case";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
