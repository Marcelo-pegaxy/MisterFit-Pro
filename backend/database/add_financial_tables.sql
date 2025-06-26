-- Adicionar tabelas financeiras ao banco existente
-- Execute este script no Supabase SQL Editor

-- Tabela de planos financeiros dos alunos
CREATE TABLE IF NOT EXISTS "financial_plans" (
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
CREATE TABLE IF NOT EXISTS "invoices" (
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

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS "idx_financial_plans_student" ON "financial_plans"("student_email");
CREATE INDEX IF NOT EXISTS "idx_financial_plans_trainer" ON "financial_plans"("trainer_email");
CREATE INDEX IF NOT EXISTS "idx_invoices_student" ON "invoices"("student_email");
CREATE INDEX IF NOT EXISTS "idx_invoices_trainer" ON "invoices"("trainer_email");
CREATE INDEX IF NOT EXISTS "idx_invoices_status" ON "invoices"("status");

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_financial_plans_updated_at 
    BEFORE UPDATE ON financial_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at 
    BEFORE UPDATE ON invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 