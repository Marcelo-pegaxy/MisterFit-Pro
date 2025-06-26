-- Apaga tabelas existentes para um reset limpo
DROP TABLE IF EXISTS "invoices", "financial_plans", "subscriptions", "assessments", "diet_meals", "diets", "workout_exercises", "workouts", "exercises", "users" CASCADE;

-- Tabela de usuários
CREATE TABLE "users" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL, -- No Supabase, isso é gerenciado pelo Auth, mas mantido por compatibilidade
  "name" VARCHAR(255) NOT NULL,
  "full_name" VARCHAR(255), -- Nome completo do usuário
  "user_type" VARCHAR(50) NOT NULL CHECK ("user_type" IN ('personal', 'aluno')),
  "unique_share_id" VARCHAR(20) UNIQUE, -- ID único para compartilhamento (alunos)
  "phone" VARCHAR(20), -- Telefone do usuário
  "birthdate" DATE, -- Data de nascimento
  "gender" VARCHAR(20), -- Sexo (masculino, feminino, outro)
  "city" VARCHAR(100), -- Cidade do usuário
  "bio" TEXT, -- Biografia/sobre o usuário
  "profile_photo" VARCHAR(255), -- URL da foto do perfil
  "linked_trainer_email" VARCHAR(255), -- Email do personal trainer vinculado (para alunos)
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de assinaturas para alunos
CREATE TABLE "subscriptions" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "aluno_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "personal_id" UUID REFERENCES "users"("id") ON DELETE SET NULL, -- Aluno pode não ter um personal
  "status" VARCHAR(50) DEFAULT 'trial' CHECK ("status" IN ('trial', 'active', 'cancelled', 'incomplete')),
  "amount" DECIMAL(10, 2) DEFAULT 12.90,
  "trial_ends_at" TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de planos financeiros dos alunos
CREATE TABLE "financial_plans" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "student_email" VARCHAR(255) NOT NULL,
  "trainer_email" VARCHAR(255) NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "payment_period" VARCHAR(50) NOT NULL CHECK ("payment_period" IN ('mensal', 'semanal', 'quinzenal', 'trimestral', 'semestral', 'anual')),
  "next_due_date" DATE NOT NULL,
  "status" VARCHAR(50) DEFAULT 'ativo' CHECK ("status" IN ('ativo', 'atrasado', 'cancelado')),
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de cobranças/invoices
CREATE TABLE "invoices" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "student_email" VARCHAR(255) NOT NULL,
  "trainer_email" VARCHAR(255) NOT NULL,
  "amount" DECIMAL(10, 2) NOT NULL,
  "description" TEXT NOT NULL,
  "due_date" DATE NOT NULL,
  "status" VARCHAR(50) DEFAULT 'pendente' CHECK ("status" IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  "payment_method" VARCHAR(50), -- PIX, cartão, boleto, etc.
  "payment_date" DATE,
  "pix_code" TEXT, -- Código PIX para pagamento
  "payment_link" VARCHAR(500), -- Link para pagamento
  "invoice_number" VARCHAR(50) UNIQUE, -- Número único da cobrança
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de exercícios pré-definidos
CREATE TABLE "exercises" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" VARCHAR(255) UNIQUE NOT NULL,
  "muscle_group" VARCHAR(100),
  "difficulty" VARCHAR(50) CHECK ("difficulty" IN ('Iniciante', 'Intermediário', 'Avançado')),
  "description" TEXT,
  "video_url" VARCHAR(255)
);

-- Tabela de treinos
CREATE TABLE "workouts" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "aluno_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "personal_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "start_date" DATE,
  "end_date" DATE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de associação entre treinos e exercícios
CREATE TABLE "workout_exercises" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "workout_id" UUID NOT NULL REFERENCES "workouts"("id") ON DELETE CASCADE,
  "exercise_id" UUID NOT NULL REFERENCES "exercises"("id") ON DELETE CASCADE,
  "sets" INTEGER,
  "reps" VARCHAR(50),
  "rest_period" VARCHAR(100),
  "notes" TEXT
);

-- Tabela de dietas
CREATE TABLE "diets" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "aluno_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "personal_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "start_date" DATE,
  "end_date" DATE,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de refeições da dieta
CREATE TABLE "diet_meals" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "diet_id" UUID NOT NULL REFERENCES "diets"("id") ON DELETE CASCADE,
  "meal_time" VARCHAR(100) NOT NULL, -- Ex: Café da Manhã, Almoço
  "description" TEXT NOT NULL,
  "calories" INTEGER
);

-- Tabela de avaliações físicas
CREATE TABLE "assessments" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "aluno_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "personal_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "assessment_date" DATE NOT NULL DEFAULT CURRENT_DATE,
  "weight" DECIMAL(5, 2),
  "height" DECIMAL(5, 2),
  "body_fat_percentage" DECIMAL(5, 2),
  "notes" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para otimização de consultas
CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_type" ON "users"("user_type");
CREATE INDEX "idx_subscriptions_aluno" ON "subscriptions"("aluno_id");
CREATE INDEX "idx_workouts_aluno" ON "workouts"("aluno_id");
CREATE INDEX "idx_diets_aluno" ON "diets"("aluno_id");
CREATE INDEX "idx_assessments_aluno" ON "assessments"("aluno_id");
CREATE INDEX "idx_financial_plans_student" ON "financial_plans"("student_email");
CREATE INDEX "idx_financial_plans_trainer" ON "financial_plans"("trainer_email");
CREATE INDEX "idx_invoices_student" ON "invoices"("student_email");
CREATE INDEX "idx_invoices_trainer" ON "invoices"("trainer_email");
CREATE INDEX "idx_invoices_status" ON "invoices"("status"); 