-- Script para adicionar colunas de perfil à tabela users existente
-- Execute este script se você não quiser recriar o banco de dados

-- Adicionar colunas de perfil do usuário
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

-- Comentários para documentar as colunas
COMMENT ON COLUMN "users"."full_name" IS 'Nome completo do usuário';
COMMENT ON COLUMN "users"."unique_share_id" IS 'ID único para compartilhamento (alunos)';
COMMENT ON COLUMN "users"."phone" IS 'Telefone do usuário';
COMMENT ON COLUMN "users"."birthdate" IS 'Data de nascimento';
COMMENT ON COLUMN "users"."gender" IS 'Sexo (masculino, feminino, outro)';
COMMENT ON COLUMN "users"."city" IS 'Cidade do usuário';
COMMENT ON COLUMN "users"."bio" IS 'Biografia/sobre o usuário';
COMMENT ON COLUMN "users"."profile_photo" IS 'URL da foto do perfil';
COMMENT ON COLUMN "users"."linked_trainer_email" IS 'Email do personal trainer vinculado (para alunos)'; 