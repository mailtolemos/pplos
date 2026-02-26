-- ═══════════════════════════════════════════════════
-- peeps:// HRIS — Full Database Schema
-- Run this in Supabase SQL Editor or as a migration
-- ═══════════════════════════════════════════════════

-- ─── TENANTS ───
CREATE TABLE public.tenants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  plan text DEFAULT 'starter' CHECK (plan IN ('starter','growth','enterprise')),
  status text DEFAULT 'active' CHECK (status IN ('active','suspended','trial','churned')),
  enabled_modules text[] DEFAULT ARRAY['core','leave','shifts','compensation','performance','analytics','workflows','policies'],
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ─── PROFILES (linked to auth.users) ───
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name text,
  role text DEFAULT 'admin',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- ─── EMPLOYEES ───
CREATE TABLE public.employees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  role text,
  department text,
  status text DEFAULT 'active' CHECK (status IN ('active','on_leave','terminated','suspended')),
  type text DEFAULT 'full_time' CHECK (type IN ('full_time','part_time','contract')),
  work_model text DEFAULT 'hybrid' CHECK (work_model IN ('hybrid','remote','on_site')),
  hire_date date DEFAULT CURRENT_DATE,
  salary numeric DEFAULT 0,
  skills text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ─── LEAVE REQUESTS ───
CREATE TABLE public.leave_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name text,
  type text NOT NULL CHECK (type IN ('Annual','Sick','Parental','Personal','Unpaid')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  days integer DEFAULT 1,
  reason text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','approved','denied')),
  created_at timestamptz DEFAULT now()
);

-- ─── SHIFTS ───
CREATE TABLE public.shifts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name text,
  date date NOT NULL,
  template text,
  time_range text,
  hours numeric DEFAULT 8,
  color text DEFAULT '#22d3ee',
  note text,
  created_at timestamptz DEFAULT now()
);

-- ─── REVIEW CYCLES ───
CREATE TABLE public.review_cycles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text DEFAULT 'quarterly' CHECK (type IN ('quarterly','annual','360','probation')),
  start_date date,
  end_date date,
  status text DEFAULT 'active' CHECK (status IN ('active','completed','draft')),
  completed integer DEFAULT 0,
  total integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ─── REVIEWS ───
CREATE TABLE public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name text,
  cycle_id uuid REFERENCES public.review_cycles(id) ON DELETE SET NULL,
  reviewer text,
  score integer CHECK (score >= 1 AND score <= 5),
  feedback text,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- ─── WORKFLOWS ───
CREATE TABLE public.workflows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  trigger_event text,
  action_type text,
  description text,
  is_active boolean DEFAULT true,
  runs integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ─── POLICIES ───
CREATE TABLE public.policies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  category text DEFAULT 'General',
  content text,
  status text DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  version integer DEFAULT 1,
  acknowledgements uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ─── ACTIVITY LOG ───
CREATE TABLE public.activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════
CREATE INDEX idx_employees_tenant ON public.employees(tenant_id);
CREATE INDEX idx_employees_status ON public.employees(tenant_id, status);
CREATE INDEX idx_employees_dept ON public.employees(tenant_id, department);
CREATE INDEX idx_leave_tenant ON public.leave_requests(tenant_id);
CREATE INDEX idx_leave_status ON public.leave_requests(tenant_id, status);
CREATE INDEX idx_shifts_tenant ON public.shifts(tenant_id);
CREATE INDEX idx_shifts_date ON public.shifts(tenant_id, date);
CREATE INDEX idx_reviews_tenant ON public.reviews(tenant_id);
CREATE INDEX idx_cycles_tenant ON public.review_cycles(tenant_id);
CREATE INDEX idx_workflows_tenant ON public.workflows(tenant_id);
CREATE INDEX idx_policies_tenant ON public.policies(tenant_id);
CREATE INDEX idx_activity_tenant ON public.activity_log(tenant_id, created_at DESC);
CREATE INDEX idx_profiles_tenant ON public.profiles(tenant_id);

-- ═══════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════

-- Helper function: get current user's tenant_id
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$;

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Tenant: users can see their own tenant
CREATE POLICY "Users see own tenant" ON public.tenants
  FOR ALL USING (id = public.get_my_tenant_id());

-- Profiles: users see own profile
CREATE POLICY "Users see own profile" ON public.profiles
  FOR ALL USING (id = auth.uid());

-- Allow profile creation during signup
CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Allow tenant creation during signup (no tenant_id yet)
CREATE POLICY "Authenticated users can create tenants" ON public.tenants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- All tenant-scoped tables: tenant isolation
CREATE POLICY "Tenant isolation" ON public.employees
  FOR ALL USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY "Tenant isolation" ON public.leave_requests
  FOR ALL USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY "Tenant isolation" ON public.shifts
  FOR ALL USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY "Tenant isolation" ON public.review_cycles
  FOR ALL USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY "Tenant isolation" ON public.reviews
  FOR ALL USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY "Tenant isolation" ON public.workflows
  FOR ALL USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY "Tenant isolation" ON public.policies
  FOR ALL USING (tenant_id = public.get_my_tenant_id());

CREATE POLICY "Tenant isolation" ON public.activity_log
  FOR ALL USING (tenant_id = public.get_my_tenant_id());

-- ═══════════════════════════════════════════════════
-- AUTO-UPDATED_AT TRIGGER
-- ═══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ═══════════════════════════════════════════════════
-- SEED FUNCTION (called after signup to populate demo data)
-- ═══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.seed_tenant_data(p_tenant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO employees (tenant_id, name, email, role, department, status, type, work_model, hire_date, salary, skills, tags) VALUES
    (p_tenant_id, 'Maria Silva', 'maria@company.com', 'VP Engineering', 'Engineering', 'active', 'full_time', 'hybrid', '2022-03-15', 95000, ARRAY['React','Node.js','AWS'], ARRAY['leadership']),
    (p_tenant_id, 'João Costa', 'joao@company.com', 'Head of Design', 'Design', 'active', 'full_time', 'remote', '2022-06-01', 82000, ARRAY['Figma','UX'], ARRAY['leadership']),
    (p_tenant_id, 'Ana Ferreira', 'ana@company.com', 'COO', 'Operations', 'active', 'full_time', 'on_site', '2021-11-10', 110000, ARRAY['Strategy'], ARRAY['c-level']),
    (p_tenant_id, 'Pedro Santos', 'pedro@company.com', 'Marketing Lead', 'Marketing', 'active', 'full_time', 'hybrid', '2023-01-20', 68000, ARRAY['SEO','Content'], ARRAY[]::text[]),
    (p_tenant_id, 'Catarina Lopes', 'catarina@company.com', 'CFO', 'Finance', 'active', 'full_time', 'on_site', '2022-01-05', 105000, ARRAY['Finance'], ARRAY['c-level']),
    (p_tenant_id, 'Tiago Mendes', 'tiago@company.com', 'Senior Engineer', 'Engineering', 'active', 'full_time', 'remote', '2023-04-10', 78000, ARRAY['Python','ML'], ARRAY[]::text[]),
    (p_tenant_id, 'Inês Rodrigues', 'ines@company.com', 'Product Designer', 'Design', 'active', 'full_time', 'hybrid', '2023-08-15', 62000, ARRAY['Figma'], ARRAY[]::text[]),
    (p_tenant_id, 'Bruno Almeida', 'bruno@company.com', 'DevOps Engineer', 'Engineering', 'on_leave', 'full_time', 'remote', '2023-02-28', 75000, ARRAY['Kubernetes'], ARRAY[]::text[]),
    (p_tenant_id, 'Sofia Ribeiro', 'sofia@company.com', 'HR Manager', 'Operations', 'active', 'full_time', 'hybrid', '2022-09-01', 65000, ARRAY['Recruitment'], ARRAY[]::text[]),
    (p_tenant_id, 'Lucas Martins', 'lucas@company.com', 'Frontend Engineer', 'Engineering', 'active', 'contract', 'remote', '2024-01-15', 55000, ARRAY['React','TypeScript'], ARRAY[]::text[]);

  INSERT INTO activity_log (tenant_id, action) VALUES
    (p_tenant_id, 'Welcome to peeps:// — your workspace is ready');
END;
$$;
