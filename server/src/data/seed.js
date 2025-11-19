// Shared seed data for development and fallback

const roleTemplates = [
  {
    name: 'Delivery Boy',
    salaryMin: 15000,
    salaryMax: 22000,
    workHours: '10am - 7pm',
    defaultRequirements: ['10th pass', 'Android phone', 'Two-wheeler preferred'],
  },
  {
    name: 'Retail Associate',
    salaryMin: 12000,
    salaryMax: 18000,
    workHours: '10am - 8pm',
    defaultRequirements: ['12th pass', 'Basic English', 'POS handling'],
  },
  {
    name: 'Helper',
    salaryMin: 10000,
    salaryMax: 14000,
    workHours: '9am - 6pm',
    defaultRequirements: ['No education requirement', 'Physically fit'],
  },
]

const candidates = [
  { name: 'Ravi Kumar', role: 'Delivery Boy', area: 'JP Nagar', education: '10th pass', phone: '+91-90000-00001', activeToday: true, appliedToSimilar: false, status: 'new' },
  { name: 'Sita Devi', role: 'Retail Associate', area: 'BTM Layout', education: '12th pass', phone: '+91-90000-00002', activeToday: true, appliedToSimilar: true, status: 'new' },
  { name: 'Akash', role: 'Helper', area: 'JP Nagar', education: '8th pass', phone: '+91-90000-00003', activeToday: false, appliedToSimilar: true, status: 'new' },
  { name: 'Rahul', role: 'Delivery Boy', area: 'JP Nagar', education: '10th pass', phone: '+91-90000-00004', activeToday: true, appliedToSimilar: false, status: 'new' },
]

module.exports = { roleTemplates, candidates }
