-- Adicionar colunas de perfil do usuÃ¡rio
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "full_name" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "unique_share_id" VARCHAR(20) UNIQUE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" VARCHAR(20);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birthdate" DATE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" VARCHAR(20);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "city" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "profile_photo" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "linked_trainer_email" VARCHAR(255);

-- Atualizar registros existentes para ter full_name baseado no name
UPDATE "users" SET "full_name" = "name" WHERE "full_name" IS NULL;
