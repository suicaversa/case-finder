-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "companyName" TEXT,
    "companyUrl" TEXT,
    "jobCategory" TEXT NOT NULL,
    "jobCategoryOther" TEXT,
    "industry" TEXT NOT NULL,
    "industryOther" TEXT,
    "consultationContent" TEXT,
    "status" TEXT NOT NULL DEFAULT '未対応',
    "shownCaseIds" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStudy" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "requestedContent" TEXT NOT NULL,
    "actualServices" JSONB NOT NULL,
    "contractPlan" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "jobCategories" TEXT[],
    "industries" TEXT[],

    CONSTRAINT "CaseStudy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
