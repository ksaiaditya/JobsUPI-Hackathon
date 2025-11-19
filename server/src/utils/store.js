// In-memory store for quick demo without DB
const roleTemplates = [
  {
    id: 'role-1',
    name: 'Delivery',
    salaryRange: [12000, 18000],
    workHours: '9am - 6pm',
    description: 'Deliver parcels/food locally using bike',
  },
  {
    id: 'role-2',
    name: 'Retail',
    salaryRange: [10000, 15000],
    workHours: '10am - 8pm',
    description: 'Assist customers, manage billing and stocking',
  },
  {
    id: 'role-3',
    name: 'Helper',
    salaryRange: [9000, 13000],
    workHours: 'Flexible shifts',
    description: 'General help in store/warehouse',
  },
]

const candidates = [
  {
    id: 'cand-1',
    name: 'Ravi Kumar',
    phone: '+91-900000001',
    role: 'Delivery',
    location: 'JP Nagar',
    education: '10th',
    expectedSalary: 15000,
    activeToday: true,
    lastActiveAt: new Date().toISOString(),
    status: 'available',
  },
  {
    id: 'cand-2',
    name: 'Amit Sharma',
    phone: '+91-900000002',
    role: 'Retail',
    location: 'BTM',
    education: '12th',
    expectedSalary: 13000,
    activeToday: true,
    lastActiveAt: new Date().toISOString(),
    status: 'available',
  },
  {
    id: 'cand-3',
    name: 'Sanjana',
    phone: '+91-900000003',
    role: 'Helper',
    location: 'JP Nagar',
    education: '8th',
    expectedSalary: 10000,
    activeToday: false,
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: 'available',
  },
]

module.exports = { roleTemplates, candidates }
