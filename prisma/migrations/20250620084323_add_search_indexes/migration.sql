-- CreateIndex
CREATE INDEX "contacts_name_idx" ON "contacts"("name");

-- CreateIndex
CREATE INDEX "contacts_phoneNumber_idx" ON "contacts"("phoneNumber");

-- CreateIndex
CREATE INDEX "spam_reports_phoneNumber_idx" ON "spam_reports"("phoneNumber");

-- CreateIndex
CREATE INDEX "users_name_idx" ON "users"("name");
