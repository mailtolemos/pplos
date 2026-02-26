'use client'
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getTenantConfig, getDeptColor } from '@/lib/config'

const Ctx = createContext()
export const useData = () => useContext(Ctx)

export function DataProvider({ initialTenant, initialProfile, impersonating, children }) {
  const supabase = createClient()
  const tid = initialTenant.id
  const [tenant, setTenant] = useState(initialTenant)
  const [profile, setProfile] = useState(initialProfile)
  const [emps, setEmps] = useState([])
  const [leaves, setLeaves] = useState([])
  const [shifts, setShifts] = useState([])
  const [cycles, setCycles] = useState([])
  const [reviews, setRevs] = useState([])
  const [wfs, setWfs] = useState([])
  const [pols, setPols] = useState([])
  const [locs, setLocs] = useState([])
  const [shiftRules, setShiftRules] = useState([])
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const show = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  const logAct = useCallback(async (action) => {
    const { data } = await supabase.from('activity_log').insert({ tenant_id: tid, action }).select().single()
    if (data) setLog(p => [data, ...p].slice(0, 50))
  }, [tid])

  // ─── Load all data ───
  useEffect(() => {
    async function load() {
      const [e, l, s, c, r, w, p, a, lo, sr] = await Promise.all([
        supabase.from('employees').select('*').order('created_at'),
        supabase.from('leave_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('shifts').select('*').order('date'),
        supabase.from('review_cycles').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('workflows').select('*').order('created_at', { ascending: false }),
        supabase.from('policies').select('*').order('created_at', { ascending: false }),
        supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('locations').select('*').order('created_at'),
        supabase.from('shift_rules').select('*').order('created_at'),
      ])
      setEmps(e.data || [])
      setLeaves(l.data || [])
      setShifts(s.data || [])
      setCycles(c.data || [])
      setRevs(r.data || [])
      setWfs(w.data || [])
      setPols(p.data || [])
      setLog(a.data || [])
      setLocs(lo.data || [])
      setShiftRules(sr.data || [])
      setLoading(false)
    }
    load()
  }, [])

  // ─── Analytics (derived) ───
  const ana = useMemo(() => {
    const active = emps.filter(e => e.status === 'active')
    const ds = {}
    emps.forEach(e => { if (e.department) ds[e.department] = (ds[e.department] || 0) + 1 })
    return {
      total: emps.length,
      active: active.length,
      onLeave: emps.filter(e => e.status === 'on_leave').length,
      avgSal: active.length ? Math.round(active.reduce((s, e) => s + (e.salary || 0), 0) / active.length) : 0,
      ds,
      pLeaves: leaves.filter(l => l.status === 'pending').length,
    }
  }, [emps, leaves])

  // ─── Employee CRUD ───
  const addEmp = useCallback(async (d) => {
    const { data, error } = await supabase.from('employees').insert({ ...d, tenant_id: tid }).select().single()
    if (error) { show(error.message, 'error'); return }
    setEmps(p => [...p, data])
    logAct(`${data.name} added as ${data.role}`)
    show(`${data.name} added`)
    return data
  }, [tid, show, logAct])

  const updEmp = useCallback(async (id, d) => {
    const { data, error } = await supabase.from('employees').update(d).eq('id', id).select().single()
    if (error) { show(error.message, 'error'); return }
    setEmps(p => p.map(e => e.id === id ? data : e))
    show('Updated')
    return data
  }, [show])

  const delEmp = useCallback(async (id) => {
    const emp = emps.find(e => e.id === id)
    const { error } = await supabase.from('employees').delete().eq('id', id)
    if (error) { show(error.message, 'error'); return }
    setEmps(p => p.filter(e => e.id !== id))
    logAct(`${emp?.name} removed`)
    show('Removed', 'error')
  }, [emps, show, logAct])

  const termEmp = useCallback(async (id) => {
    const { data, error } = await supabase.from('employees').update({ status: 'terminated' }).eq('id', id).select().single()
    if (error) { show(error.message, 'error'); return }
    setEmps(p => p.map(e => e.id === id ? data : e))
    logAct(`${data.name} terminated`)
    show('Terminated')
  }, [show, logAct])

  // ─── Leave CRUD ───
  const addLeave = useCallback(async (d) => {
    const { data, error } = await supabase.from('leave_requests').insert({ ...d, tenant_id: tid }).select().single()
    if (error) { show(error.message, 'error'); return }
    setLeaves(p => [data, ...p])
    logAct(`Leave: ${d.employee_name} (${d.type}, ${d.days}d)`)
    show('Submitted')
    return data
  }, [tid, show, logAct])

  const appLeave = useCallback(async (id) => {
    const { error } = await supabase.from('leave_requests').update({ status: 'approved' }).eq('id', id)
    if (!error) { setLeaves(p => p.map(l => l.id === id ? { ...l, status: 'approved' } : l)); show('Approved') }
  }, [show])

  const denLeave = useCallback(async (id) => {
    const { error } = await supabase.from('leave_requests').update({ status: 'denied' }).eq('id', id)
    if (!error) { setLeaves(p => p.map(l => l.id === id ? { ...l, status: 'denied' } : l)); show('Denied') }
  }, [show])

  // ─── Shift CRUD ───
  const addShift = useCallback(async (d) => {
    const { data, error } = await supabase.from('shifts').insert({ ...d, tenant_id: tid }).select().single()
    if (error) { show(error.message, 'error'); return }
    setShifts(p => [...p, data])
    show('Shift created')
    return data
  }, [tid, show])

  const delShift = useCallback(async (id) => {
    const { error } = await supabase.from('shifts').delete().eq('id', id)
    if (!error) { setShifts(p => p.filter(s => s.id !== id)); show('Removed') }
  }, [show])

  // ─── Review Cycles + Reviews ───
  const addCycle = useCallback(async (d) => {
    const total = emps.filter(e => e.status === 'active').length
    const { data, error } = await supabase.from('review_cycles').insert({ ...d, tenant_id: tid, total }).select().single()
    if (error) { show(error.message, 'error'); return }
    setCycles(p => [data, ...p])
    logAct(`Cycle "${data.name}" started`)
    show('Created')
    return data
  }, [tid, emps, show, logAct])

  const addRev = useCallback(async (d) => {
    const { data, error } = await supabase.from('reviews').insert({ ...d, tenant_id: tid }).select().single()
    if (error) { show(error.message, 'error'); return }
    setRevs(p => [data, ...p])
    if (d.cycle_id) {
      await supabase.rpc('', {}).catch(() => {})
      setCycles(p => p.map(c => c.id === d.cycle_id ? { ...c, completed: c.completed + 1 } : c))
      await supabase.from('review_cycles').update({ completed: (cycles.find(c=>c.id===d.cycle_id)?.completed||0)+1 }).eq('id', d.cycle_id)
    }
    show('Submitted')
    return data
  }, [tid, cycles, show])

  // ─── Workflows ───
  const addWf = useCallback(async (d) => {
    const { data, error } = await supabase.from('workflows').insert({ ...d, tenant_id: tid }).select().single()
    if (error) { show(error.message, 'error'); return }
    setWfs(p => [data, ...p])
    logAct(`Workflow "${data.name}" created`)
    show('Created')
    return data
  }, [tid, show, logAct])

  const togWf = useCallback(async (id) => {
    const wf = wfs.find(w => w.id === id)
    const { error } = await supabase.from('workflows').update({ is_active: !wf?.is_active }).eq('id', id)
    if (!error) setWfs(p => p.map(w => w.id === id ? { ...w, is_active: !w.is_active } : w))
  }, [wfs])

  const delWf = useCallback(async (id) => {
    const { error } = await supabase.from('workflows').delete().eq('id', id)
    if (!error) { setWfs(p => p.filter(w => w.id !== id)); show('Deleted') }
  }, [show])

  // ─── Policies ───
  const addPol = useCallback(async (d) => {
    const { data, error } = await supabase.from('policies').insert({ ...d, tenant_id: tid }).select().single()
    if (error) { show(error.message, 'error'); return }
    setPols(p => [data, ...p])
    logAct(`Policy "${data.title}" created`)
    show('Created')
    return data
  }, [tid, show, logAct])

  const pubPol = useCallback(async (id) => {
    const { error } = await supabase.from('policies').update({ status: 'published' }).eq('id', id)
    if (!error) { setPols(p => p.map(x => x.id === id ? { ...x, status: 'published' } : x)); show('Published') }
  }, [show])

  const ackPol = useCallback(async (pid, eid) => {
    const pol = pols.find(p => p.id === pid)
    const acks = [...new Set([...(pol?.acknowledgements || []), eid])]
    const { error } = await supabase.from('policies').update({ acknowledgements: acks }).eq('id', pid)
    if (!error) { setPols(p => p.map(x => x.id === pid ? { ...x, acknowledgements: acks } : x)); show('Acknowledged') }
  }, [pols, show])

  const delPol = useCallback(async (id) => {
    const { error } = await supabase.from('policies').delete().eq('id', id)
    if (!error) { setPols(p => p.filter(x => x.id !== id)); show('Deleted') }
  }, [show])

  // ─── Locations CRUD ───
  const addLoc = useCallback(async (d) => {
    const { data, error } = await supabase.from('locations').insert({ ...d, tenant_id: tid }).select().single()
    if (error) { show(error.message, 'error'); return }
    setLocs(p => [...p, data])
    logAct(`Location "${data.name}" created`)
    show('Created')
    return data
  }, [tid, show, logAct])

  const updLoc = useCallback(async (id, d) => {
    const { data, error } = await supabase.from('locations').update(d).eq('id', id).select().single()
    if (error) { show(error.message, 'error'); return }
    setLocs(p => p.map(l => l.id === id ? data : l))
    show('Updated')
    return data
  }, [show])

  const delLoc = useCallback(async (id) => {
    const { error } = await supabase.from('locations').delete().eq('id', id)
    if (error) { show(error.message, 'error'); return }
    setLocs(p => p.filter(l => l.id !== id))
    // Clear location_id from employees
    setEmps(p => p.map(e => e.location_id === id ? { ...e, location_id: null } : e))
    show('Deleted')
  }, [show])

  // ─── Shift Rules CRUD ───
  const addRule = useCallback(async (d) => {
    const { data, error } = await supabase.from('shift_rules').insert({ ...d, tenant_id: tid }).select().single()
    if (error) { show(error.message, 'error'); return }
    setShiftRules(p => [...p, data])
    show('Rule created')
    return data
  }, [tid, show])

  const delRule = useCallback(async (id) => {
    const { error } = await supabase.from('shift_rules').delete().eq('id', id)
    if (!error) { setShiftRules(p => p.filter(r => r.id !== id)); show('Deleted') }
  }, [show])

  // ─── Auto-Generate Shifts ───
  // Fair round-robin: distributes employees across shifts evenly,
  // respecting days_of_week rules and configurable work days per week.
  const generateSchedule = useCallback(async (locationId, period, workDaysPerWeek = 5) => {
    const locRules = shiftRules.filter(r => r.location_id === locationId)
    const locEmps = emps.filter(e => e.location_id === locationId && e.status === 'active')

    if (!locRules.length || !locEmps.length) {
      show('Need employees and shift rules for this location', 'error')
      return 0
    }

    // Calculate date range
    const today = new Date()
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    let end
    if (period === 'monthly') {
      end = new Date(start); end.setMonth(end.getMonth() + 1)
    } else if (period === 'quarterly') {
      end = new Date(start); end.setMonth(end.getMonth() + 3)
    } else {
      end = new Date(start); end.setFullYear(end.getFullYear() + 1)
    }

    // Build the schedule
    const newShifts = []
    const empHours = {} // track hours per employee for fairness
    locEmps.forEach(e => { empHours[e.id] = 0 })

    // For each rule, maintain a rotation pointer
    const pointers = {}
    locRules.forEach(r => { pointers[r.id] = 0 })

    // Track work days per employee per week
    const weekWork = {} // { weekKey: { empId: count } }

    const d = new Date(start)
    while (d < end) {
      const iso = d.toISOString().split('T')[0]
      const dow = d.getDay() === 0 ? 7 : d.getDay() // 1=Mon...7=Sun
      const weekKey = `${d.getFullYear()}-W${Math.ceil((d.getDate() + new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7)}-${d.getMonth()}`

      if (!weekWork[weekKey]) {
        weekWork[weekKey] = {}
        locEmps.forEach(e => { weekWork[weekKey][e.id] = 0 })
      }

      for (const rule of locRules) {
        if (!rule.days_of_week.includes(dow)) continue

        // Calculate hours for this shift
        const [sh, sm] = (rule.start_time || '09:00').split(':').map(Number)
        const [eh, em] = (rule.end_time || '17:00').split(':').map(Number)
        let hours = (eh + em / 60) - (sh + sm / 60)
        if (hours <= 0) hours += 24 // overnight shift

        // Assign min_employees, picking from rotation but respecting weekly limits
        let assigned = 0
        let attempts = 0
        const maxAttempts = locEmps.length * 2

        while (assigned < rule.min_employees && attempts < maxAttempts) {
          const empIdx = pointers[rule.id] % locEmps.length
          const emp = locEmps[empIdx]
          pointers[rule.id]++
          attempts++

          // Check if employee has already worked max days this week
          if ((weekWork[weekKey][emp.id] || 0) >= workDaysPerWeek) continue

          // Check if already scheduled for this day (different rule)
          if (newShifts.some(s => s.employee_id === emp.id && s.date === iso)) continue

          weekWork[weekKey][emp.id] = (weekWork[weekKey][emp.id] || 0) + 1
          empHours[emp.id] = (empHours[emp.id] || 0) + hours

          newShifts.push({
            tenant_id: tid,
            employee_id: emp.id,
            employee_name: emp.name,
            date: iso,
            template: rule.name,
            time_range: `${rule.start_time}–${rule.end_time}`,
            hours,
            color: rule.color,
            location_id: locationId,
          })
          assigned++
        }
      }

      d.setDate(d.getDate() + 1)
    }

    if (!newShifts.length) {
      show('No shifts generated — check rules and employee assignments', 'error')
      return 0
    }

    // Batch insert (Supabase handles up to ~1000 rows per insert)
    const batches = []
    for (let i = 0; i < newShifts.length; i += 500) {
      batches.push(newShifts.slice(i, i + 500))
    }

    let total = 0
    for (const batch of batches) {
      const { data, error } = await supabase.from('shifts').insert(batch).select()
      if (error) { show(error.message, 'error'); return total }
      if (data) {
        setShifts(p => [...p, ...data])
        total += data.length
      }
    }

    logAct(`Generated ${total} shifts for ${locs.find(l => l.id === locationId)?.name}`)
    show(`${total} shifts generated`)
    return total
  }, [tid, shiftRules, emps, locs, supabase, show, logAct])

  // ─── Clear shifts for a location/period ───
  const clearLocationShifts = useCallback(async (locationId) => {
    const { error } = await supabase.from('shifts').delete().eq('location_id', locationId)
    if (error) { show(error.message, 'error'); return }
    setShifts(p => p.filter(s => s.location_id !== locationId))
    show('Shifts cleared')
  }, [supabase, show])

  // ─── Tenant settings ───
  const updTenant = useCallback(async (d) => {
    const { data, error } = await supabase.from('tenants').update(d).eq('id', tid).select().single()
    if (error) { show(error.message, 'error'); return }
    setTenant(data)
    show('Updated')
  }, [tid, show])

  // ─── Sign out ───
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }, [])

  const cfg = getTenantConfig(tenant)

  const value = {
    tenant, profile, loading, toast, ana, log, signOut, impersonating, cfg,
    emps, leaves, shifts, cycles, reviews, wfs, pols, locs, shiftRules,
    addEmp, updEmp, delEmp, termEmp,
    addLeave, appLeave, denLeave,
    addShift, delShift,
    addCycle, addRev,
    addWf, togWf, delWf,
    addPol, pubPol, ackPol, delPol,
    addLoc, updLoc, delLoc,
    addRule, delRule,
    generateSchedule, clearLocationShifts,
    updTenant, show,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
