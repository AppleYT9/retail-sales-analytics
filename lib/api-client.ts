import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SalesData {
  id: string
  date: string
  category: string
  product: string
  quantity: number
  price: number
  revenue: number
  region: string
}

export interface DashboardKPI {
  totalSales: number
  averageOrderValue: number
  growthRate: number
  totalOrders: number
  topCategory: string
  topProduct: string
}

export interface Forecast {
  date: string
  actual?: number
  predicted: number
  confidence_lower?: number
  confidence_upper?: number
}

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}

class ApiClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add interceptor to include auth token
    this.instance.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle responses
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken')
            window.location.href = '/auth/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: UserProfile }>> {
    try {
      const response = await this.instance.post('/login', credentials)
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
      }
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      }
    }
  }

  // Upload endpoints
  async uploadSalesData(file: File): Promise<ApiResponse<{ uploadedRecords: number }>> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await this.instance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Upload failed',
      }
    }
  }

  // Dashboard endpoints
  async getDashboardKPIs(): Promise<ApiResponse<DashboardKPI>> {
    try {
      const response = await this.instance.get('/dashboard')
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch KPIs',
      }
    }
  }

  // Sales endpoints
  async getSalesData(filters?: {
    startDate?: string
    endDate?: string
    category?: string
    region?: string
  }): Promise<ApiResponse<SalesData[]>> {
    try {
      const response = await this.instance.get('/sales', { params: filters })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch sales data',
      }
    }
  }

  // Forecast endpoints
  async generateForecast(params?: {
    horizon?: number
    method?: string
  }): Promise<ApiResponse<Forecast[]>> {
    try {
      const response = await this.instance.post('/forecast', params)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to generate forecast',
      }
    }
  }

  // Reports endpoints
  async getReports(filters?: {
    startDate?: string
    endDate?: string
    type?: string
  }): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.instance.get('/reports', { params: filters })
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch reports',
      }
    }
  }

  async generateReport(type: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
    try {
      const response = await this.instance.get(`/reports/${type}?format=${format}`, {
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to generate report')
    }
  }

  // Profile endpoints
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await this.instance.get('/profile')
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch profile',
      }
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken')
  }
}

export const apiClient = new ApiClient()
