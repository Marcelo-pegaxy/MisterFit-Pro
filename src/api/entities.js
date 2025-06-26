// Stub entities for app compatibility. Replace with real implementations as needed.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class User {
  static async list() {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!response.ok) throw new Error('Erro ao buscar usuários');
    return response.json();
  }
  static async update(id, data) {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao atualizar usuário');
    return response.json();
  }
  static async listLinked() {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/users/students/linked`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!response.ok) throw new Error('Erro ao buscar alunos vinculados');
    return response.json();
  }
}
export class WorkoutPlan {
  static async filter(params = {}, sort = '') {
    const token = localStorage.getItem('misterfit_token');
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/workout-plans${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!response.ok) throw new Error('Erro ao buscar planos de treino');
    return response.json();
  }
  static async available(params = {}) {
    const token = localStorage.getItem('misterfit_token');
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/workout-plans${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!response.ok) throw new Error('Erro ao buscar treinos disponíveis');
    const allWorkouts = await response.json();
    return allWorkouts.filter(w => (!w.student_id && !w.aluno_id));
  }
  static async create(data) {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/workout-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao criar plano de treino');
    return response.json();
  }
  static async update(id, data) {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/workout-plans/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao atualizar plano de treino');
    return response.json();
  }
  static async delete(id) {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/workout-plans/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!response.ok) throw new Error('Erro ao deletar plano de treino');
    return response.json();
  }
}
export class DietPlan {
  static async filter(params = {}, sort = '') {
    const token = localStorage.getItem('misterfit_token');
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/diet-plans${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!response.ok) throw new Error('Erro ao buscar planos alimentares');
    return response.json();
  }
  static async create(data) {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/diet-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao criar plano alimentar');
    return response.json();
  }
  static async update(id, data) {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/diet-plans/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao atualizar plano alimentar');
    return response.json();
  }
  static async delete(id) {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/diet-plans/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!response.ok) throw new Error('Erro ao deletar plano alimentar');
    return response.json();
  }
}
export class ChatMessage {
  static async filter(params = {}, sort = '', limit = 100) {
    const token = localStorage.getItem('misterfit_token');
    const query = new URLSearchParams({ ...params, sort, limit }).toString();
    const response = await fetch(`${API_URL}/chat/messages?${query}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!response.ok) return [];
    return response.json();
  }

  static async create(data) {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao enviar mensagem');
    return response.json();
  }

  static async markAsRead(withEmail) {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/chat/messages/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ with: withEmail })
    });
    if (!response.ok) throw new Error('Erro ao marcar mensagens como lidas');
    return response.json();
  }
}
export class Assessment {
  static async filter(params = {}, sort = '') {
    const token = localStorage.getItem('misterfit_token');
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/assessments${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!response.ok) throw new Error('Erro ao buscar avaliações');
    return response.json();
  }
}
export class RecentActivity {}
export class Payment {}
export class StudentFinancials {
  static async filter(params = {}) {
    const token = localStorage.getItem('misterfit_token');
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/financial/plans${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!response.ok) throw new Error('Erro ao buscar plano financeiro');
    return response.json();
  }

  static async create(data) {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/financial/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao criar plano financeiro');
    return response.json();
  }

  static async update(id, data) {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/financial/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao atualizar plano financeiro');
    return response.json();
  }

  static async markAsPaid(id, payment_period) {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/financial/plans/${id}/mark-paid`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ payment_period })
    });
    if (!response.ok) throw new Error('Erro ao marcar como pago');
    return response.json();
  }
}

export class Invoices {
  static async filter(params = {}) {
    const token = localStorage.getItem('misterfit_token');
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/financial/invoices${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!response.ok) throw new Error('Erro ao buscar cobranças');
    return response.json();
  }

  static async create(data) {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/financial/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Erro ao criar cobrança');
    return response.json();
  }

  static async updateStatus(id, status, payment_date = null) {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/financial/invoices/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ status, payment_date })
    });
    if (!response.ok) throw new Error('Erro ao atualizar status da cobrança');
    return response.json();
  }
}

export class FinancialStats {
  static async get(trainer_email) {
    const token = localStorage.getItem('misterfit_token');
    const response = await fetch(`${API_URL}/financial/stats?trainer_email=${trainer_email}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    if (!response.ok) throw new Error('Erro ao buscar estatísticas financeiras');
    return response.json();
  }
}