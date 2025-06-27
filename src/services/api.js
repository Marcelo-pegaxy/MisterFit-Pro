import { getApiUrl } from '../config/env.js';

// URL da API baseada no ambiente
const API_BASE_URL = getApiUrl();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Método para fazer requisições HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Configuração padrão
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('misterfit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`API Response: ${response.status}`, data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  }

  // Métodos de autenticação
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Métodos para planos de treino
  async getWorkoutPlans() {
    return this.request('/workout-plans');
  }

  async createWorkoutPlan(planData) {
    return this.request('/workout-plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updateWorkoutPlan(id, planData) {
    return this.request(`/workout-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  async deleteWorkoutPlan(id) {
    return this.request(`/workout-plans/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para planos de dieta
  async getDietPlans() {
    return this.request('/diet-plans');
  }

  async createDietPlan(planData) {
    return this.request('/diet-plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updateDietPlan(id, planData) {
    return this.request(`/diet-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  async deleteDietPlan(id) {
    return this.request(`/diet-plans/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para avaliações
  async getAssessments() {
    return this.request('/assessments');
  }

  async createAssessment(assessmentData) {
    return this.request('/assessments', {
      method: 'POST',
      body: JSON.stringify(assessmentData),
    });
  }

  async updateAssessment(id, assessmentData) {
    return this.request(`/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assessmentData),
    });
  }

  async deleteAssessment(id) {
    return this.request(`/assessments/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para chat
  async getChatMessages(userId) {
    return this.request(`/chat/messages/${userId}`);
  }

  async sendMessage(messageData) {
    return this.request('/chat/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessageAsRead(messageId) {
    return this.request(`/chat/messages/${messageId}/read`, {
      method: 'PUT',
    });
  }

  // Métodos para usuários (trainers)
  async getStudents() {
    return this.request('/users/students');
  }

  async getStudentDetails(studentId) {
    return this.request(`/users/students/${studentId}`);
  }

  async updateStudent(studentId, studentData) {
    return this.request(`/users/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }

  // Métodos para assinaturas
  async getSubscription() {
    return this.request('/subscriptions/current');
  }

  async cancelSubscription() {
    return this.request('/subscriptions/cancel', {
      method: 'PUT',
    });
  }

  // Métodos para pagamentos
  async getPayments() {
    return this.request('/payments');
  }

  async createPaymentIntent(amount) {
    return this.request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Método para verificar se a API está funcionando
  async healthCheck() {
    return this.request('/health');
  }

  // Buscar treinos disponíveis para vínculo
  async getAvailableWorkouts(trainerEmail) {
    const allWorkouts = await this.request(`/workout-plans?trainer_email=${trainerEmail}`);
    // Filtra no frontend os treinos não vinculados
    return allWorkouts.filter(w => (!w.student_id && !w.aluno_id));
  }

  // Vincular treino ao aluno
  async assignWorkoutToStudent(workoutId, studentId) {
    return this.request(`/workout-plans/${workoutId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId }),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Buscar dietas disponíveis para vínculo
  async getAvailableDiets(studentId) {
    return this.request(`/diet-plans/available?student_id=${studentId}`);
  }

  // Vincular dieta ao aluno
  async assignDietToStudent(dietId, studentId) {
    return this.request(`/diet-plans/${dietId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId }),
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Buscar planos de treino de um aluno específico
  async getStudentWorkoutPlans(studentId) {
    return this.request(`/workout-plans?student_id=${studentId}`);
  }

  // Buscar dietas de um aluno específico
  async getStudentDietPlans(studentId) {
    return this.request(`/diet-plans?student_id=${studentId}`);
  }

  // Buscar avaliações de um aluno específico
  async getStudentAssessments(studentId) {
    return this.request(`/assessments/student/${studentId}`);
  }

  // Buscar contagem de mensagens não lidas do chat
  async getUnreadChatCount() {
    return this.request('/chat/unread-count');
  }

  // Desvincular treino do aluno
  async unassignWorkoutFromStudent(id) {
    return this.request(`/workout-plans/${id}/unassign`, { method: 'PATCH' });
  }

  // Desvincular dieta do aluno
  async unassignDietFromStudent(id) {
    return this.request(`/diet-plans/${id}/unassign`, { method: 'PATCH' });
  }
}

// Instância única do serviço
const apiService = new ApiService();

export default apiService; 