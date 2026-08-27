-- CreateTable
CREATE TABLE `AdminUser` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` ENUM('OWNER', 'ADMIN', 'EDITOR') NOT NULL DEFAULT 'ADMIN',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `failedLoginCount` INTEGER NOT NULL DEFAULT 0,
    `lockedUntil` DATETIME(3) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    INDEX `AdminUser_active_deletedAt_idx`(`active`, `deletedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminSession` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `csrfTokenHash` CHAR(64) NOT NULL,
    `ipHash` CHAR(64) NULL,
    `userAgent` VARCHAR(500) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `lastSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `revokedAt` DATETIME(3) NULL,

    UNIQUE INDEX `AdminSession_tokenHash_key`(`tokenHash`),
    INDEX `AdminSession_userId_expiresAt_idx`(`userId`, `expiresAt`),
    INDEX `AdminSession_expiresAt_revokedAt_idx`(`expiresAt`, `revokedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` CHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_tokenHash_key`(`tokenHash`),
    INDEX `PasswordResetToken_userId_expiresAt_idx`(`userId`, `expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PackageCategory_name_key`(`name`),
    UNIQUE INDEX `PackageCategory_slug_key`(`slug`),
    INDEX `PackageCategory_active_sortOrder_idx`(`active`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Destination` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `slug` VARCHAR(140) NOT NULL,
    `city` VARCHAR(120) NOT NULL,
    `state` VARCHAR(80) NOT NULL,
    `stateCode` CHAR(2) NOT NULL,
    `description` TEXT NULL,
    `coverPath` VARCHAR(500) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Destination_slug_key`(`slug`),
    INDEX `Destination_active_stateCode_sortOrder_idx`(`active`, `stateCode`, `sortOrder`),
    UNIQUE INDEX `Destination_city_stateCode_key`(`city`, `stateCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Package` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(180) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `summary` VARCHAR(500) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `destinationId` VARCHAR(191) NOT NULL,
    `city` VARCHAR(120) NOT NULL,
    `state` VARCHAR(80) NOT NULL,
    `stateCode` CHAR(2) NOT NULL,
    `departureAt` DATETIME(3) NOT NULL,
    `returnAt` DATETIME(3) NOT NULL,
    `boardingTime` VARCHAR(20) NULL,
    `boardingLocation` VARCHAR(240) NULL,
    `durationDays` INTEGER NOT NULL,
    `cashPrice` DECIMAL(10, 2) NOT NULL,
    `installmentCount` INTEGER NOT NULL DEFAULT 1,
    `installmentValue` DECIMAL(10, 2) NULL,
    `installmentTotal` DECIMAL(10, 2) NULL,
    `totalSpots` INTEGER NULL,
    `remainingSpots` INTEGER NULL,
    `showSpots` BOOLEAN NOT NULL DEFAULT false,
    `accommodation` TEXT NULL,
    `transport` TEXT NULL,
    `meals` TEXT NULL,
    `guide` VARCHAR(180) NULL,
    `childPolicy` TEXT NULL,
    `requiredDocuments` TEXT NULL,
    `paymentMethods` TEXT NULL,
    `importantNotes` TEXT NULL,
    `mapUrl` VARCHAR(600) NULL,
    `publicationStatus` ENUM('DRAFT', 'PUBLISHED', 'INACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `availabilityStatus` ENUM('AVAILABLE', 'FEW_SPOTS', 'SOLD_OUT', 'CANCELLED') NOT NULL DEFAULT 'AVAILABLE',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `featuredOrder` INTEGER NULL,
    `featuredStartsAt` DATETIME(3) NULL,
    `featuredEndsAt` DATETIME(3) NULL,
    `waitingListEnabled` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `publicationEndsAt` DATETIME(3) NULL,
    `seoTitle` VARCHAR(70) NULL,
    `seoDescription` VARCHAR(170) NULL,
    `shareImagePath` VARCHAR(500) NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `whatsappClickCount` INTEGER NOT NULL DEFAULT 0,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Package_slug_key`(`slug`),
    INDEX `Package_publicationStatus_deletedAt_idx`(`publicationStatus`, `deletedAt`),
    INDEX `Package_availabilityStatus_idx`(`availabilityStatus`),
    INDEX `Package_departureAt_returnAt_idx`(`departureAt`, `returnAt`),
    INDEX `Package_destinationId_publicationStatus_idx`(`destinationId`, `publicationStatus`),
    INDEX `Package_categoryId_publicationStatus_idx`(`categoryId`, `publicationStatus`),
    INDEX `Package_featured_featuredOrder_idx`(`featured`, `featuredOrder`),
    INDEX `Package_publishedAt_publicationEndsAt_idx`(`publishedAt`, `publicationEndsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageMedia` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `type` ENUM('IMAGE', 'VIDEO') NOT NULL,
    `path` VARCHAR(500) NOT NULL,
    `thumbnailPath` VARCHAR(500) NULL,
    `posterPath` VARCHAR(500) NULL,
    `altText` VARCHAR(240) NULL,
    `mimeType` VARCHAR(120) NOT NULL,
    `sizeBytes` BIGINT NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `durationMs` INTEGER NULL,
    `isCover` BOOLEAN NOT NULL DEFAULT false,
    `isPreview` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PackageMedia_packageId_sortOrder_idx`(`packageId`, `sortOrder`),
    INDEX `PackageMedia_packageId_isCover_idx`(`packageId`, `isCover`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageIncludedItem` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `text` VARCHAR(500) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `PackageIncludedItem_packageId_sortOrder_idx`(`packageId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageExcludedItem` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `text` VARCHAR(500) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `PackageExcludedItem_packageId_sortOrder_idx`(`packageId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ItineraryItem` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `dayNumber` INTEGER NULL,
    `time` VARCHAR(20) NULL,
    `title` VARCHAR(180) NOT NULL,
    `details` TEXT NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `ItineraryItem_packageId_sortOrder_idx`(`packageId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lead` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NULL,
    `phone` VARCHAR(30) NULL,
    `email` VARCHAR(191) NULL,
    `packageId` VARCHAR(191) NULL,
    `message` TEXT NULL,
    `origin` ENUM('CONTACT_FORM', 'PACKAGE_FORM', 'WHATSAPP', 'WAITING_LIST') NOT NULL,
    `status` ENUM('NEW', 'IN_PROGRESS', 'PROPOSAL_SENT', 'WON', 'LOST', 'WAITING_LIST') NOT NULL DEFAULT 'NEW',
    `adminNotes` TEXT NULL,
    `consentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Lead_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Lead_packageId_createdAt_idx`(`packageId`, `createdAt`),
    INDEX `Lead_origin_createdAt_idx`(`origin`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Testimonial` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `destination` VARCHAR(160) NULL,
    `quote` TEXT NOT NULL,
    `rating` INTEGER NOT NULL DEFAULT 5,
    `avatarPath` VARCHAR(500) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Testimonial_active_sortOrder_idx`(`active`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Faq` (
    `id` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NULL,
    `scope` ENUM('GENERAL', 'PACKAGE') NOT NULL DEFAULT 'GENERAL',
    `question` VARCHAR(500) NOT NULL,
    `answer` TEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Faq_scope_active_sortOrder_idx`(`scope`, `active`, `sortOrder`),
    INDEX `Faq_packageId_active_idx`(`packageId`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GalleryItem` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(180) NULL,
    `path` VARCHAR(500) NOT NULL,
    `mediaType` ENUM('IMAGE', 'VIDEO') NOT NULL DEFAULT 'IMAGE',
    `altText` VARCHAR(240) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `GalleryItem_active_sortOrder_idx`(`active`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompanySettings` (
    `id` VARCHAR(191) NOT NULL,
    `singletonKey` VARCHAR(30) NOT NULL DEFAULT 'default',
    `companyName` VARCHAR(160) NOT NULL,
    `city` VARCHAR(120) NOT NULL,
    `state` VARCHAR(80) NOT NULL,
    `phonePrimary` VARCHAR(30) NOT NULL,
    `phoneSecondary` VARCHAR(30) NULL,
    `whatsappNumber` VARCHAR(30) NOT NULL,
    `instagramHandle` VARCHAR(120) NULL,
    `address` VARCHAR(500) NOT NULL,
    `businessHours` VARCHAR(300) NULL,
    `mapEmbedUrl` VARCHAR(800) NULL,
    `aboutTitle` VARCHAR(240) NULL,
    `aboutText` LONGTEXT NULL,
    `mission` TEXT NULL,
    `vision` TEXT NULL,
    `valuesText` TEXT NULL,
    `fewSpotsThreshold` INTEGER NOT NULL DEFAULT 5,
    `maxFeaturedPackages` INTEGER NOT NULL DEFAULT 6,
    `logoDarkPath` VARCHAR(500) NULL,
    `logoLightPath` VARCHAR(500) NULL,
    `defaultShareImagePath` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CompanySettings_singletonKey_key`(`singletonKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `adminUserId` VARCHAR(191) NULL,
    `action` VARCHAR(100) NOT NULL,
    `entityType` VARCHAR(100) NOT NULL,
    `entityId` VARCHAR(191) NULL,
    `summary` VARCHAR(500) NULL,
    `beforeState` JSON NULL,
    `afterState` JSON NULL,
    `ipHash` CHAR(64) NULL,
    `userAgent` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_adminUserId_createdAt_idx`(`adminUserId`, `createdAt`),
    INDEX `AuditLog_entityType_entityId_createdAt_idx`(`entityType`, `entityId`, `createdAt`),
    INDEX `AuditLog_action_createdAt_idx`(`action`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AdminSession` ADD CONSTRAINT `AdminSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AdminUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AdminUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Package` ADD CONSTRAINT `Package_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `PackageCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Package` ADD CONSTRAINT `Package_destinationId_fkey` FOREIGN KEY (`destinationId`) REFERENCES `Destination`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Package` ADD CONSTRAINT `Package_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Package` ADD CONSTRAINT `Package_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageMedia` ADD CONSTRAINT `PackageMedia_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageIncludedItem` ADD CONSTRAINT `PackageIncludedItem_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PackageExcludedItem` ADD CONSTRAINT `PackageExcludedItem_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ItineraryItem` ADD CONSTRAINT `ItineraryItem_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Faq` ADD CONSTRAINT `Faq_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_adminUserId_fkey` FOREIGN KEY (`adminUserId`) REFERENCES `AdminUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
