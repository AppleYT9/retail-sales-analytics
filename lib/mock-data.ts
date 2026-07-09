import { SalesData, DashboardKPI, Forecast, UserProfile } from './api-client'

export const mockSalesData: SalesData[] = [
  {
    id: '1',
    date: '2024-01-15',
    category: 'Electronics',
    product: 'Laptop Pro',
    quantity: 2,
    price: 1299.99,
    revenue: 2599.98,
    region: 'North America',
  },
  {
    id: '2',
    date: '2024-01-15',
    category: 'Accessories',
    product: 'Wireless Mouse',
    quantity: 5,
    price: 49.99,
    revenue: 249.95,
    region: 'Europe',
  },
  {
    id: '3',
    date: '2024-01-16',
    category: 'Electronics',
    product: 'Tablet',
    quantity: 3,
    price: 599.99,
    revenue: 1799.97,
    region: 'Asia',
  },
  {
    id: '4',
    date: '2024-01-16',
    category: 'Software',
    product: 'Office Suite',
    quantity: 10,
    price: 99.99,
    revenue: 999.9,
    region: 'North America',
  },
  {
    id: '5',
    date: '2024-01-17',
    category: 'Accessories',
    product: 'USB Cable',
    quantity: 50,
    price: 12.99,
    revenue: 649.5,
    region: 'Europe',
  },
  {
    id: '6',
    date: '2024-01-17',
    category: 'Electronics',
    product: 'Monitor',
    quantity: 4,
    price: 299.99,
    revenue: 1199.96,
    region: 'North America',
  },
  {
    id: '7',
    date: '2024-01-18',
    category: 'Software',
    product: 'Antivirus Pro',
    quantity: 7,
    price: 79.99,
    revenue: 559.93,
    region: 'Asia',
  },
  {
    id: '8',
    date: '2024-01-18',
    category: 'Accessories',
    product: 'Keyboard Mechanical',
    quantity: 3,
    price: 149.99,
    revenue: 449.97,
    region: 'Europe',
  },
]

export const mockDashboardKPI: DashboardKPI = {
  totalSales: 84509.16,
  averageOrderValue: 1425.15,
  growthRate: 23.5,
  totalOrders: 59,
  topCategory: 'Electronics',
  topProduct: 'Laptop Pro',
}

export const mockForecasts: Forecast[] = [
  { date: '2024-01-19', actual: 3200, predicted: 3150, confidence_lower: 2800, confidence_upper: 3500 },
  { date: '2024-01-20', actual: 3400, predicted: 3350, confidence_lower: 2900, confidence_upper: 3800 },
  { date: '2024-01-21', predicted: 3600, confidence_lower: 3100, confidence_upper: 4100 },
  { date: '2024-01-22', predicted: 3800, confidence_lower: 3200, confidence_upper: 4400 },
  { date: '2024-01-23', predicted: 4000, confidence_lower: 3300, confidence_upper: 4700 },
  { date: '2024-01-24', predicted: 4200, confidence_lower: 3400, confidence_upper: 5000 },
  { date: '2024-01-25', predicted: 4100, confidence_lower: 3300, confidence_upper: 4900 },
  { date: '2024-01-26', predicted: 3900, confidence_lower: 3100, confidence_upper: 4700 },
  { date: '2024-01-27', predicted: 3700, confidence_lower: 2900, confidence_upper: 4500 },
  { date: '2024-01-28', predicted: 3800, confidence_lower: 3000, confidence_upper: 4600 },
]

export const mockUserProfile: UserProfile = {
  id: 'user_123',
  email: 'demo@example.com',
  name: 'Demo User',
  avatar: undefined,
  createdAt: '2024-01-01',
}

// Generate mock data for demo
export function generateMockSalesData(days: number = 30): SalesData[] {
  const data: SalesData[] = []
  const categories = ['Electronics', 'Accessories', 'Software', 'Services']
  const products: { [key: string]: string[] } = {
    Electronics: ['Laptop Pro', 'Tablet', 'Monitor', 'Smartphone'],
    Accessories: ['Wireless Mouse', 'USB Cable', 'Keyboard Mechanical', 'USB Hub'],
    Software: ['Office Suite', 'Antivirus Pro', 'Design Software', 'Analytics Tool'],
    Services: ['Support Plan', 'Maintenance', 'Training', 'Consulting'],
  }
  const regions = ['North America', 'Europe', 'Asia', 'South America']

  let id = 1
  for (let d = 0; d < days; d++) {
    const date = new Date()
    date.setDate(date.getDate() - d)

    for (let i = 0; i < Math.floor(Math.random() * 5) + 2; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const product = products[category][Math.floor(Math.random() * products[category].length)]

      data.push({
        id: String(id++),
        date: date.toISOString().split('T')[0],
        category,
        product,
        quantity: Math.floor(Math.random() * 20) + 1,
        price: Math.floor(Math.random() * 1000) + 50,
        revenue: Math.floor(Math.random() * 5000) + 100,
        region: regions[Math.floor(Math.random() * regions.length)],
      })
    }
  }

  return data
}
