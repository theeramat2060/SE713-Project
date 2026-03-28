-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action" VARCHAR(255) NOT NULL,
    "entity" VARCHAR(255) NOT NULL,
    "entity_id" VARCHAR(255),
    "user_id" UUID,
    "details" TEXT,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_audit_action" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "idx_audit_entity" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "idx_audit_user_id" ON "AuditLog"("user_id");

-- CreateIndex
CREATE INDEX "idx_audit_created_at" ON "AuditLog"("created_at");
