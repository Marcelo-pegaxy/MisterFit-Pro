const supabase = require('../config/supabaseClient');

// Controller para planos financeiros
const financialController = {
  // Buscar plano financeiro de um aluno
  async getFinancialPlan(req, res) {
    try {
      const { student_id, student_email, trainer_email } = req.query;
      
      if ((!student_id && !student_email) || !trainer_email) {
        return res.status(400).json({ error: 'ID ou email do aluno e email do treinador são obrigatórios' });
      }

      let query = supabase
        .from('financial_plans')
        .select('*')
        .eq('trainer_email', trainer_email);
      if (student_id) {
        query = query.eq('student_id', student_id);
      } else {
        query = query.eq('student_email', student_email);
      }
      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ error: 'Erro ao buscar plano financeiro' });
      }

      res.json(data || null);
    } catch (error) {
      console.error('Erro ao buscar plano financeiro:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Criar ou atualizar plano financeiro
  async upsertFinancialPlan(req, res) {
    try {
      const { student_email, trainer_email, amount, payment_period, next_due_date, status = 'ativo' } = req.body;
      
      if (!student_email || !trainer_email || !amount || !payment_period || !next_due_date) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      // Verificar se já existe um plano
      const { data: existingPlan } = await supabase
        .from('financial_plans')
        .select('id')
        .eq('student_email', student_email)
        .eq('trainer_email', trainer_email)
        .single();

      let result;
      if (existingPlan) {
        // Atualizar plano existente
        const { data, error } = await supabase
          .from('financial_plans')
          .update({
            amount,
            payment_period,
            next_due_date,
            status,
            updated_at: new Date()
          })
          .eq('id', existingPlan.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Criar novo plano
        const { data, error } = await supabase
          .from('financial_plans')
          .insert({
            student_email,
            trainer_email,
            amount,
            payment_period,
            next_due_date,
            status
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      res.json(result);
    } catch (error) {
      console.error('Erro ao salvar plano financeiro:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Marcar pagamento como realizado
  async markAsPaid(req, res) {
    try {
      const { id } = req.params;
      const { payment_period } = req.body;

      // Buscar o plano financeiro
      const { data: plan, error: planError } = await supabase
        .from('financial_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (planError || !plan) {
        return res.status(404).json({ error: 'Plano financeiro não encontrado' });
      }

      // Calcular próxima data de vencimento
      const currentDueDate = new Date(plan.next_due_date);
      let nextDueDate;

      switch (payment_period) {
        case 'semanal':
          nextDueDate = new Date(currentDueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'quinzenal':
          nextDueDate = new Date(currentDueDate.getTime() + 15 * 24 * 60 * 60 * 1000);
          break;
        case 'mensal':
          nextDueDate = new Date(currentDueDate.getFullYear(), currentDueDate.getMonth() + 1, currentDueDate.getDate());
          break;
        case 'trimestral':
          nextDueDate = new Date(currentDueDate.getFullYear(), currentDueDate.getMonth() + 3, currentDueDate.getDate());
          break;
        case 'semestral':
          nextDueDate = new Date(currentDueDate.getFullYear(), currentDueDate.getMonth() + 6, currentDueDate.getDate());
          break;
        case 'anual':
          nextDueDate = new Date(currentDueDate.getFullYear() + 1, currentDueDate.getMonth(), currentDueDate.getDate());
          break;
        default:
          nextDueDate = new Date(currentDueDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias padrão
      }

      // Atualizar plano
      const { data, error } = await supabase
        .from('financial_plans')
        .update({
          next_due_date: nextDueDate.toISOString().split('T')[0],
          status: 'ativo',
          updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Listar cobranças de um aluno ou de todos do treinador
  async getInvoices(req, res) {
    try {
      const { student_email, trainer_email, status } = req.query;
      if (!trainer_email) {
        return res.status(400).json({ error: 'Email do treinador é obrigatório' });
      }
      let query = supabase
        .from('invoices')
        .select('*')
        .eq('trainer_email', trainer_email)
        .order('created_at', { ascending: false });
      if (student_email) {
        query = query.eq('student_email', student_email);
      }
      if (status) {
        query = query.eq('status', status);
      }
      const { data, error } = await query;
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error('Erro ao buscar cobranças:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Criar nova cobrança
  async createInvoice(req, res) {
    try {
      const { student_email, trainer_email, amount, description, due_date, payment_method = 'PIX' } = req.body;
      
      if (!student_email || !trainer_email || !amount || !description || !due_date) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      // Gerar número único da cobrança
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Gerar código PIX (simulado)
      const pixCode = `00020126580014BR.GOV.BCB.PIX0136${student_email}5204000053039865802BR5925${student_email}6009SAO PAULO62070503***6304`;
      
      // Gerar link de pagamento
      const paymentLink = `https://misterfit.com/pay/${invoiceNumber}`;

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          student_email,
          trainer_email,
          amount,
          description,
          due_date,
          payment_method,
          pix_code: pixCode,
          payment_link: paymentLink,
          invoice_number: invoiceNumber
        })
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Erro ao criar cobrança:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Atualizar status de uma cobrança
  async updateInvoiceStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, payment_date } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' });
      }

      const updateData = {
        status,
        updated_at: new Date()
      };

      if (status === 'pago' && payment_date) {
        updateData.payment_date = payment_date;
      }

      const { data, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json(data);
    } catch (error) {
      console.error('Erro ao atualizar status da cobrança:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Buscar estatísticas financeiras
  async getFinancialStats(req, res) {
    try {
      const { trainer_email } = req.query;
      console.log('[getFinancialStats] trainer_email:', trainer_email);
      if (!trainer_email) {
        console.log('[getFinancialStats] trainer_email não fornecido');
        return res.status(400).json({ error: 'Email do treinador é obrigatório' });
      }
      if (!supabase) {
        console.log('[getFinancialStats] supabase client não está definido');
        return res.status(500).json({ error: 'Supabase client não está definido' });
      }
      // Buscar todos os alunos vinculados ao treinador
      const { data: linkedStudents, error: studentsError } = await supabase
        .from('users')
        .select('id')
        .eq('user_type', 'aluno')
        .eq('linked_trainer_email', trainer_email)
        .eq('is_active', true);
      if (studentsError) throw studentsError;
      // Total de alunos ativos (vinculados)
      const totalActiveStudents = linkedStudents?.length || 0;
      // Total de alunos com plano financeiro ativo (para referência futura)
      const { data: activePlans, error: plansError } = await supabase
        .from('financial_plans')
        .select('amount')
        .eq('trainer_email', trainer_email)
        .eq('status', 'ativo');
      console.log('[getFinancialStats] linkedStudents:', linkedStudents, 'activePlans:', activePlans, 'plansError:', plansError);
      if (plansError) throw plansError;
      // Cobranças pendentes
      const { data: pendingInvoices, error: pendingError } = await supabase
        .from('invoices')
        .select('amount')
        .eq('trainer_email', trainer_email)
        .eq('status', 'pendente');
      console.log('[getFinancialStats] pendingInvoices:', pendingInvoices, 'pendingError:', pendingError);
      if (pendingError) throw pendingError;
      // Cobranças pagas no mês atual
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const lastDay = new Date(year, month, 0).getDate();
      const currentMonth = now.toISOString().slice(0, 7);
      const startDate = `${currentMonth}-01`;
      const endDate = `${currentMonth}-${String(lastDay).padStart(2, '0')}`;
      const { data: paidInvoices, error: paidError } = await supabase
        .from('invoices')
        .select('amount, payment_date')
        .eq('trainer_email', trainer_email)
        .eq('status', 'pago')
        .gte('payment_date', startDate)
        .lte('payment_date', endDate);
      console.log('[getFinancialStats] paidInvoices:', paidInvoices, 'paidError:', paidError);
      if (paidError) throw paidError;
      const stats = {
        totalActiveStudents,
        monthlyRevenue: activePlans?.reduce((sum, plan) => sum + parseFloat(plan.amount || 0), 0) || 0,
        pendingAmount: pendingInvoices?.reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0) || 0,
        paidThisMonth: paidInvoices?.reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0) || 0
      };
      console.log('[getFinancialStats] stats:', stats);
      res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro interno do servidor', details: error?.message });
    }
  }
};

module.exports = financialController; 