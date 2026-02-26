// Default tenant configuration — used when tenant.config is empty or missing keys
const DEFAULTS = {
  departments: ['Engineering', 'Design', 'Operations', 'Marketing', 'Finance', 'HR', 'Sales', 'Support'],
  department_colors: {
    Engineering: '#b4a0f4', Design: '#e879f9', Operations: '#34d399', Marketing: '#fbbf24',
    Finance: '#fb7185', HR: '#818cf8', Sales: '#fb923c', Support: '#2dd4bf',
  },
  leave_types: ['Annual', 'Sick', 'Parental', 'Personal', 'Unpaid'],
  job_types: [
    { value: 'full_time', label: 'Full-time' },
    { value: 'part_time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
  ],
  work_models: [
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'remote', label: 'Remote' },
    { value: 'on_site', label: 'On-site' },
  ],
  shift_templates: [
    { name: 'Morning', time: '06:00–14:00', color: '#fbbf24', h: 8 },
    { name: 'Day', time: '09:00–17:00', color: '#b4a0f4', h: 8 },
    { name: 'Evening', time: '14:00–22:00', color: '#e879f9', h: 8 },
    { name: 'Night', time: '22:00–06:00', color: '#fb7185', h: 8 },
  ],
  currency: '€',
  work_hours_per_day: 8,
  salary_months: 14,
}

const PALETTE = ['#b4a0f4','#e879f9','#34d399','#fbbf24','#fb7185','#818cf8','#fb923c','#2dd4bf','#a3e635','#38bdf8','#f472b6','#c084fc']

export { DEFAULTS, PALETTE }

export function getTenantConfig(tenant) {
  const cfg = tenant?.config || {}
  return {
    departments: cfg.departments || DEFAULTS.departments,
    department_colors: cfg.department_colors || DEFAULTS.department_colors,
    leave_types: cfg.leave_types || DEFAULTS.leave_types,
    job_types: cfg.job_types || DEFAULTS.job_types,
    work_models: cfg.work_models || DEFAULTS.work_models,
    shift_templates: cfg.shift_templates || DEFAULTS.shift_templates,
    currency: cfg.currency || DEFAULTS.currency,
    work_hours_per_day: cfg.work_hours_per_day ?? DEFAULTS.work_hours_per_day,
    salary_months: cfg.salary_months ?? DEFAULTS.salary_months,
  }
}

// Get color for a department, falling back to a palette color
export function getDeptColor(cfg, dept) {
  if (cfg.department_colors?.[dept]) return cfg.department_colors[dept]
  const idx = cfg.departments.indexOf(dept)
  return PALETTE[idx % PALETTE.length] || '#b4a0f4'
}
