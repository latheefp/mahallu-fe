import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const resolveApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8086/api';
    }
  }
  return 'https://services.mahallu.com/api';
};

const API_BASE_URL = resolveApiBaseUrl();

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          this.clearAuthToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  public setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  private unwrapData<T = any>(payload: any): T {
    if (payload && typeof payload === 'object' && 'data' in payload) {
      return payload.data as T;
    }
    return payload as T;
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.client.post('/users/login', { email, password });
    if (response.data.token) {
      this.setAuthToken(response.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    return response.data;
  }

  async logout() {
    this.clearAuthToken();
  }

  // Families
  async getFamilies(page = 1, limit = 20, filters = {}) {
    const response = await this.client.get('/families', {
      params: { page, limit, ...filters },
    });
    return response.data;
  }

  async getFamily(id: number) {
    const response = await this.client.get(`/families/${id}`);
    return response.data;
  }

  async createFamily(data: any) {
    const response = await this.client.post('/families', data);
    return response.data;
  }

  async updateFamily(id: number, data: any) {
    const response = await this.client.put(`/families/${id}`, data);
    return response.data;
  }

  async deleteFamily(id: number) {
    const response = await this.client.delete(`/families/${id}`);
    return response.data;
  }

  // Members
  async getMembers(familyId?: number, page = 1, limit = 20) {
    const params: any = { page, limit };
    if (familyId) params.family_id = familyId;
    
    const response = await this.client.get('/members', { params });
    return response.data;
  }

  async getMember(id: number) {
    const response = await this.client.get(`/members/${id}`);
    return response.data;
  }

  async createMember(data: any) {
    const response = await this.client.post('/members', data);
    return response.data;
  }

  async updateMember(id: number, data: any) {
    const response = await this.client.put(`/members/${id}`, data);
    return response.data;
  }

  // Birth Registrations
  async getBirthRegistrations(page = 1, limit = 20) {
    const response = await this.client.get('/birth-registrations', {
      params: { page, limit },
    });
    return response.data;
  }

  async createBirthRegistration(data: any) {
    const response = await this.client.post('/birth-registrations', data);
    return response.data;
  }

  // Marriage Registrations
  async getMarriageRegistrations(page = 1, limit = 20) {
    const response = await this.client.get('/marriage-registrations', {
      params: { page, limit },
    });
    return response.data;
  }

  async createMarriageRegistration(data: any) {
    const response = await this.client.post('/marriage-registrations', data);
    return response.data;
  }

  // Wards
  async getWards() {
    const response = await this.client.get('/wards');
    return response.data;
  }

  // Panchayath Wards
  async getPanchayathWards() {
    const response = await this.client.get('/panchayath-wards');
    return response.data;
  }

  // Educations
  async getEducations() {
    const response = await this.client.get('/educations');
    return response.data;
  }

  // Statistics
  async getDashboardStats() {
    const response = await this.client.get('/statistics/dashboard');
    return response.data;
  }

  // Subscription Payments
  async getSubscriptionPayments(page = 1, limit = 20) {
    const response = await this.client.get('/subscription-payments', {
      params: { page, limit },
    });
    return response.data;
  }

  async createSubscriptionPayment(data: any) {
    const response = await this.client.post('/subscription-payments', data);
    return response.data;
  }

  // Mahallu Information
  async getMahalluInfo() {
    const response = await this.client.get('/mahallu-info');
    return this.unwrapData(response.data);
  }

  async updateMahalluInfo(data: any) {
    const response = await this.client.put('/mahallu-info', data);
    return response.data;
  }

  // Posters/Gallery
  async getPosters(page = 1, limit = 20) {
    const response = await this.client.get('/posters', {
      params: { page, limit, status: 'published' },
    });
    return response.data;
  }

  async getPoster(id: number) {
    const response = await this.client.get(`/posters/${id}`);
    return response.data;
  }

  async createPoster(data: any) {
    const response = await this.client.post('/posters', data);
    return response.data;
  }

  async deletePoster(id: number) {
    const response = await this.client.delete(`/posters/${id}`);
    return response.data;
  }

  // News/Information
  async getNews(page = 1, limit = 20, filters = {}) {
    const response = await this.client.get('/news', {
      params: { page, limit, status: 'published', ...filters },
    });
    return this.unwrapData(response.data);
  }

  async getNewsItem(id: number) {
    const response = await this.client.get(`/news/${id}`);
    // Increment view count
    this.incrementNewsView(id).catch(() => {});
    return this.unwrapData(response.data);
  }

  async getFeaturedNews(limit = 6) {
    const response = await this.client.get('/news', {
      params: { is_featured: 1, status: 'published', limit },
    });
    return this.unwrapData(response.data);
  }

  async getRelatedNews(id: number, limit = 3) {
    const response = await this.client.get(`/news/${id}/related`, {
      params: { limit },
    });
    return this.unwrapData(response.data);
  }

  async incrementNewsView(id: number) {
    const response = await this.client.get(`/news/${id}/view`);
    return response.data;
  }

  // Admin News Management (requires authentication)
  async createNews(data: any) {
    const response = await this.client.post('/news', data);
    return response.data;
  }

  async updateNews(id: number, data: any) {
    const response = await this.client.put(`/news/${id}`, data);
    return response.data;
  }

  async deleteNews(id: number) {
    const response = await this.client.delete(`/news/${id}`);
    return response.data;
  }

  async uploadNewsImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await this.client.post('/news/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Announcements
  async getAnnouncements(page = 1, limit = 20, filters = {}) {
    const response = await this.client.get('/announcements', {
      params: { page, limit, status: 'published', ...filters },
    });
    return this.unwrapData(response.data);
  }

  async getAnnouncementItem(id: number) {
    const response = await this.client.get(`/announcements/${id}`);
    return this.unwrapData(response.data);
  }

  async getFeaturedAnnouncements(limit = 5) {
    const response = await this.client.get('/announcements/featured', {
      params: { limit },
    });
    return this.unwrapData(response.data);
  }

  // Events
  async getEvents(page = 1, limit = 20, filters = {}) {
    const response = await this.client.get('/events', {
      params: { page, limit, status: 'published', ...filters },
    });
    return this.unwrapData(response.data);
  }

  async getEventItem(id: number) {
    const response = await this.client.get(`/events/${id}`);
    return this.unwrapData(response.data);
  }

  async getFeaturedEvents(limit = 5) {
    const response = await this.client.get('/events/featured', {
      params: { limit },
    });
    return this.unwrapData(response.data);
  }

  async getUpcomingEvents(limit = 10) {
    const response = await this.client.get('/events/upcoming', {
      params: { limit },
    });
    return this.unwrapData(response.data);
  }

  // Generic request method for custom endpoints
  async request(config: AxiosRequestConfig) {
    const response = await this.client.request(config);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
