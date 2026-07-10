import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1'
const LOGGED_OUT_KEY = 'authLoggedOut'

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
        // In demo mode, don't redirect on auth errors — just log them
        if (error.response?.status === 401) {
          console.warn('API returned 401 — backend may not be running.')
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: UserProfile }>> {
    try {
      const response = await this.instance.post('/auth/login', credentials)
      if (response.data.success && response.data.data?.token) {
        localStorage.setItem('authToken', response.data.data.token)
        localStorage.removeItem(LOGGED_OUT_KEY)
      }
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Login failed',
      }
    }
  }

  async register(credentials: LoginCredentials): Promise<ApiResponse<any>> {
    try {
      const response = await this.instance.post('/auth/register', credentials)
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Registration failed',
      }
    }
  }

  // Upload endpoints
  async uploadSalesData(file: File, mapping?: Record<string, string>): Promise<ApiResponse<{ uploadedRecords: number }>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (mapping) {
        formData.append('mapping', JSON.stringify(mapping))
      }

      const response = await this.instance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      // Backend returns {id, filename, status, records_processed, uploaded_at}
      return {
        success: true,
        data: { uploadedRecords: response.data.records_processed || 0 },
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Upload failed',
      }
    }
  }

  // Upload history
  async getUploadHistory(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.instance.get('/upload/history')
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch upload history',
      }
    }
  }

  async deleteUpload(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.instance.delete(`/upload/${id}`)
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to delete upload',
      }
    }
  }

  async bulkDeleteUploads(ids: number[]): Promise<ApiResponse<any>> {
    try {
      const response = await this.instance.post('/upload/bulk-delete', { ids })
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to delete selected uploads',
      }
    }
  }

  async getUploadData(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.instance.get(`/upload/${id}/data`)
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch upload data',
      }
    }
  }

  // Dashboard endpoints
  async getDashboardKPIs(uploadId?: number): Promise<ApiResponse<any>> {
    try {
      const params: any = {}
      if (uploadId) params.upload_id = uploadId
      const response = await this.instance.get('/dashboard', { params })
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch KPIs',
      }
    }
  }

  async getTopProducts(uploadId?: number): Promise<ApiResponse<any[]>> {
    try {
      const params: any = {}
      if (uploadId) params.upload_id = uploadId
      const response = await this.instance.get('/dashboard/top-products', { params })
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch top products',
      }
    }
  }

  async getRegionalSales(uploadId?: number): Promise<ApiResponse<any[]>> {
    try {
      const params: any = {}
      if (uploadId) params.upload_id = uploadId
      const response = await this.instance.get('/dashboard/regional-sales', { params })
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch regional sales',
      }
    }
  }

  async getDailyRevenue(uploadId?: number): Promise<ApiResponse<any[]>> {
    try {
      const params: any = {}
      if (uploadId) params.upload_id = uploadId
      const response = await this.instance.get('/dashboard/daily-revenue', { params })
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch daily revenue',
      }
    }
  }

  async getCategorySales(uploadId?: number): Promise<ApiResponse<any[]>> {
    try {
      const params: any = {}
      if (uploadId) params.upload_id = uploadId
      const response = await this.instance.get('/dashboard/category-sales', { params })
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch category sales',
      }
    }
  }

  // Sales endpoints
  async getSalesData(filters?: {
    range?: string
    category?: string
    region?: string
    uploadId?: number
  }): Promise<ApiResponse<SalesData[]>> {
    try {
      const params: any = {}
      if (filters) {
        if (filters.range) params.range = filters.range
        if (filters.category) params.category = filters.category
        if (filters.region) params.region = filters.region
        if (filters.uploadId) params.upload_id = filters.uploadId
      }
      const response = await this.instance.get('/analytics/sales', { params })
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch sales data',
      }
    }
  }

  // Forecast endpoints
  async generateForecast(params?: {
    horizon?: number
    method?: string
    uploadId?: number
  }): Promise<ApiResponse<Forecast[]>> {
    try {
      const payload: any = {}
      if (params) {
        if (params.horizon) payload.horizon = params.horizon
        if (params.method) payload.method = params.method
        if (params.uploadId) payload.upload_id = params.uploadId
      }
      const response = await this.instance.post('/ml/forecast', payload)
      const backendData = response.data as any
      const forecasts: Forecast[] = []
      if (backendData && Array.isArray(backendData.dates)) {
        for (let i = 0; i < backendData.dates.length; i++) {
          forecasts.push({
            date: backendData.dates[i],
            predicted: backendData.predictions?.[i] || 0,
            confidence_lower: backendData.lower_bounds?.[i] || 0,
            confidence_upper: backendData.upper_bounds?.[i] || 0
          })
        }
      }
      return { success: true, data: forecasts }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to generate forecast',
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
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch reports',
      }
    }
  }

  async generateReport(type: string, format: 'pdf' | 'excel' | 'csv', uploadId?: number): Promise<Blob> {
    try {
      const params: any = { type }
      if (uploadId) params.upload_id = uploadId
      const response = await this.instance.get(`/reports/${format}`, {
        params,
        responseType: 'blob',
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.response?.data?.detail || 'Failed to generate report')
    }
  }

  // Profile endpoints
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await this.instance.get('/auth/profile')
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch profile',
      }
    }
  }

  // Anomaly endpoints
  async detectAnomalies(): Promise<ApiResponse<{ total_anomalies: number; anomalies: any[] }>> {
    try {
      const response = await this.instance.post('/ml/anomaly-detection')
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to detect anomalies',
      }
    }
  }

  // Customer Segmentation endpoints
  async segmentCustomers(): Promise<ApiResponse<{ clusters: number; distribution: Record<string, number> }>> {
    try {
      const response = await this.instance.post('/ml/customer-segmentation')
      return { success: true, data: response.data }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.detail || 'Failed to segment customers',
      }
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken')
    localStorage.setItem(LOGGED_OUT_KEY, 'true')
  }
}

export const apiClient = new ApiClient()
