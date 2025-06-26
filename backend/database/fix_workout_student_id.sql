-- Script para tornar a coluna aluno_id opcional na tabela workouts
-- Isso permite que treinos sejam criados sem estar vinculados a um aluno

-- Primeiro, vamos adicionar uma coluna student_id como alternativa
ALTER TABLE "workouts" ADD COLUMN IF NOT EXISTS "student_id" UUID REFERENCES "users"("id") ON DELETE SET NULL;

-- Agora vamos tornar a coluna aluno_id opcional
ALTER TABLE "workouts" ALTER COLUMN "aluno_id" DROP NOT NULL;

-- Atualizar registros existentes para usar student_id em vez de aluno_id
UPDATE "workouts" SET "student_id" = "aluno_id" WHERE "student_id" IS NULL AND "aluno_id" IS NOT NULL;

-- Comentário para documentar a mudança
COMMENT ON COLUMN "workouts"."student_id" IS 'ID do aluno vinculado ao treino (pode ser NULL se não estiver vinculado)';
COMMENT ON COLUMN "workouts"."aluno_id" IS 'ID do aluno (mantido para compatibilidade, mas agora opcional)'; 