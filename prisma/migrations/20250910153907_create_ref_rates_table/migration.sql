-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."properties" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "label" TEXT,
    "addressText" TEXT,
    "pincode" TEXT,
    "tehsil" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "rooftopAreaSqm" DOUBLE PRECISION,
    "roofType" TEXT,
    "runoffCoeff" DOUBLE PRECISION,
    "hasBasement" BOOLEAN NOT NULL DEFAULT false,
    "landUse" TEXT,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."safety_surveys" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "septicWithin15m" BOOLEAN NOT NULL,
    "sewerWithin15m" BOOLEAN NOT NULL,
    "openDrainWithin15m" BOOLEAN NOT NULL,
    "dumpWithin15m" BOOLEAN NOT NULL,
    "minDistanceM" DOUBLE PRECISION,
    "confirmation" BOOLEAN NOT NULL DEFAULT false,
    "result" TEXT,

    CONSTRAINT "safety_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assessments" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vetoResult" TEXT,
    "depthBand" TEXT,
    "waterDepthPostM" DOUBLE PRECISION,
    "soilClass" TEXT,
    "lithoClass" TEXT,
    "slopePct" DOUBLE PRECISION,
    "rainfallMm" DOUBLE PRECISION,
    "runoffCoeff" DOUBLE PRECISION,
    "annualRunoffLiters" DOUBLE PRECISION,
    "recommendation" TEXT,
    "recommendationDims" TEXT,
    "scorePoints" DOUBLE PRECISION,
    "score100" DOUBLE PRECISION,
    "scoreLevel" TEXT,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."factor_scores" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "rawValue" TEXT,
    "band" TEXT,
    "points" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "weighted" DOUBLE PRECISION,

    CONSTRAINT "factor_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cost_estimates" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "materialSubtotal" DOUBLE PRECISION,
    "laborSubtotal" DOUBLE PRECISION,
    "overhead" DOUBLE PRECISION,
    "contingency" DOUBLE PRECISION,
    "preGst" DOUBLE PRECISION,
    "gst" DOUBLE PRECISION,
    "grandTotal" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "rateCardVersion" TEXT,

    CONSTRAINT "cost_estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cost_items" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "lineNo" INTEGER,
    "category" TEXT,
    "code" TEXT,
    "description" TEXT,
    "unit" TEXT,
    "qty" DOUBLE PRECISION,
    "unitRate" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "cost_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."house_profiles" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "occupants" INTEGER,
    "monthlyNeedKl" DOUBLE PRECISION,
    "tankerRateInrPerL" DOUBLE PRECISION,
    "djbMeter" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "house_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."billing_scenarios" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "month" TEXT,
    "needKl" DOUBLE PRECISION,
    "rtrwhSupplyKl" DOUBLE PRECISION,
    "djbDrawKl" DOUBLE PRECISION,
    "djbBillWithout" DOUBLE PRECISION,
    "djbBillWith" DOUBLE PRECISION,
    "savings" DOUBLE PRECISION,
    "sewerPct" DOUBLE PRECISION,
    "serviceCharge" DOUBLE PRECISION,

    CONSTRAINT "billing_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."badges" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ref_tariffs" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "slabMinKl" DOUBLE PRECISION,
    "slabMaxKl" DOUBLE PRECISION,
    "volumetricInrPerKl" DOUBLE PRECISION,
    "sewerPct" DOUBLE PRECISION,
    "serviceCharge" DOUBLE PRECISION,
    "freeUptoKl" DOUBLE PRECISION,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ref_tariffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ref_rates" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unitRate" DOUBLE PRECISION NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'Delhi',
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ref_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "public"."badges"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "public"."user_badges"("userId", "badgeId");

-- AddForeignKey
ALTER TABLE "public"."properties" ADD CONSTRAINT "properties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."safety_surveys" ADD CONSTRAINT "safety_surveys_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assessments" ADD CONSTRAINT "assessments_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."factor_scores" ADD CONSTRAINT "factor_scores_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cost_estimates" ADD CONSTRAINT "cost_estimates_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cost_items" ADD CONSTRAINT "cost_items_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."cost_estimates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."house_profiles" ADD CONSTRAINT "house_profiles_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billing_scenarios" ADD CONSTRAINT "billing_scenarios_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "public"."assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "public"."badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
