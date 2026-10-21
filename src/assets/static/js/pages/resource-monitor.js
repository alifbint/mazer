// Sample resource monitor. All metrics are simulated on the client; replace
// `sample()` with a fetch to your own metrics endpoint to use real data.
;(() => {
  const MAX_POINTS = 60
  const MEMORY_TOTAL_GB = 32
  const LINK_MBPS = 1000

  const state = {
    cpu: 32,
    cpuBase: 32,
    memory: 48,
    disk: 18,
    netIn: 120,
    netOut: 45,
    load: [1.2, 1.1, 0.9],
    uptimeSeconds: 12 * 86400 + 4 * 3600 + 17 * 60,
    timer: null,
    interval: 2000,
  }

  const history = { cpu: [], memory: [], netIn: [], netOut: [] }

  const services = [
    { name: "Nginx", icon: "globe", latency: 12, uptime: 99.99, status: "healthy" },
    { name: "API Gateway", icon: "diagram-3", latency: 48, uptime: 99.95, status: "healthy" },
    { name: "PostgreSQL", icon: "database", latency: 6, uptime: 99.98, status: "healthy" },
    { name: "Redis", icon: "lightning-charge", latency: 2, uptime: 99.99, status: "healthy" },
    { name: "Queue Worker", icon: "inboxes", latency: 85, uptime: 99.7, status: "healthy" },
    { name: "SMTP Relay", icon: "envelope", latency: 140, uptime: 99.4, status: "healthy" },
  ]

  const processes = [
    { pid: 1842, name: "postgres", cpu: 12, mem: 9.4 },
    { pid: 2210, name: "node", cpu: 9, mem: 6.1 },
    { pid: 977, name: "nginx", cpu: 4, mem: 1.2 },
    { pid: 1630, name: "redis-server", cpu: 3, mem: 2.8 },
    { pid: 3120, name: "php-fpm", cpu: 6, mem: 3.5 },
    { pid: 512, name: "systemd-journald", cpu: 1, mem: 0.4 },
  ]

  const events = []

  const STATUS = {
    healthy: { label: "Healthy", badge: "bg-success" },
    degraded: { label: "Degraded", badge: "bg-warning" },
    down: { label: "Down", badge: "bg-danger" },
  }

  const $ = (id) => document.getElementById(id)
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
  const drift = (value, step, min, max) =>
    clamp(value + (Math.random() - 0.5) * step, min, max)

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }

  function palette() {
    return {
      primary: cssVar("--bs-primary"),
      success: cssVar("--bs-success"),
      info: cssVar("--bs-info"),
      warning: cssVar("--bs-warning"),
      danger: cssVar("--bs-danger"),
      text: cssVar("--bs-secondary-color"),
      border: cssVar("--bs-border-color"),
    }
  }

  function levelColor(percent) {
    const colors = palette()
    if (percent >= 85) return colors.danger
    if (percent >= 70) return colors.warning
    return colors.success
  }

  function formatDuration(seconds) {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour12: false })
  }

  // Charts

  function gaugeOptions(value) {
    const colors = palette()
    return {
      series: [value],
      chart: { type: "radialBar", height: 130, width: 110, sparkline: { enabled: true } },
      colors: [levelColor(value)],
      plotOptions: {
        radialBar: {
          hollow: { size: "58%" },
          track: { background: colors.border },
          dataLabels: {
            name: { show: false },
            value: {
              offsetY: 6,
              fontSize: "18px",
              fontWeight: 700,
              color: cssVar("--bs-body-color"),
              formatter: (val) => `${Math.round(val)}%`,
            },
          },
        },
      },
      stroke: { lineCap: "round" },
    }
  }

  function lineOptions(series, colors, yMax, unit) {
    const theme = palette()
    return {
      series,
      chart: {
        type: "area",
        height: 300,
        foreColor: theme.text,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true, dynamicAnimation: { speed: 800 } },
      },
      colors,
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.02 } },
      grid: { borderColor: theme.border, strokeDashArray: 4 },
      legend: { position: "top", horizontalAlign: "right" },
      xaxis: {
        type: "datetime",
        labels: { datetimeUTC: false, format: "HH:mm:ss" },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        max: yMax,
        tickAmount: 4,
        labels: { formatter: (val) => `${Math.round(val)}${unit}` },
      },
      tooltip: {
        theme: document.documentElement.getAttribute("data-bs-theme") === "dark" ? "dark" : "light",
        x: { format: "HH:mm:ss" },
        y: { formatter: (val) => `${val.toFixed(1)}${unit}` },
      },
    }
  }

  function storageOptions() {
    const theme = palette()
    const used = [62, 41, 78, 23]
    return {
      series: [{ name: "Used", data: used }],
      chart: { type: "bar", height: 300, foreColor: theme.text, toolbar: { show: false } },
      plotOptions: {
        bar: { horizontal: true, borderRadius: 4, barHeight: "50%", distributed: true },
      },
      colors: used.map(levelColor),
      legend: { show: false },
      dataLabels: { enabled: true, formatter: (val) => `${val}%` },
      grid: { borderColor: theme.border, strokeDashArray: 4 },
      xaxis: {
        categories: ["/ (120 GB)", "/home (500 GB)", "/var (250 GB)", "/boot (2 GB)"],
        max: 100,
        labels: { formatter: (val) => `${val}%` },
      },
      tooltip: { enabled: false },
    }
  }

  const charts = {}

  function renderCharts() {
    charts.cpu = new ApexCharts($("gauge-cpu"), gaugeOptions(state.cpu))
    charts.memory = new ApexCharts($("gauge-memory"), gaugeOptions(state.memory))
    charts.disk = new ApexCharts($("gauge-disk"), gaugeOptions(state.disk))
    charts.network = new ApexCharts($("gauge-network"), gaugeOptions(networkPercent()))
    charts.cpuMemory = new ApexCharts(
      $("chart-cpu-memory"),
      lineOptions(cpuMemorySeries(), [palette().primary, palette().info], 100, "%")
    )
    charts.traffic = new ApexCharts(
      $("chart-network"),
      lineOptions(trafficSeries(), [palette().success, palette().warning], undefined, " Mbps")
    )
    charts.storage = new ApexCharts($("chart-storage"), storageOptions())
    Object.values(charts).forEach((chart) => chart.render())
  }

  // Re-apply theme colors when the user toggles light/dark mode.
  function watchTheme() {
    new MutationObserver(() => {
      const theme = palette()
      ;[charts.cpu, charts.memory, charts.disk, charts.network].forEach((chart) =>
        chart.updateOptions({
          plotOptions: {
            radialBar: {
              track: { background: theme.border },
              dataLabels: { value: { color: cssVar("--bs-body-color") } },
            },
          },
        })
      )
      ;[charts.cpuMemory, charts.traffic, charts.storage].forEach((chart) =>
        chart.updateOptions({
          chart: { foreColor: theme.text },
          grid: { borderColor: theme.border },
          tooltip: {
            theme: document.documentElement.getAttribute("data-bs-theme") === "dark" ? "dark" : "light",
          },
        })
      )
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] })
  }

  function networkPercent() {
    return clamp(((state.netIn + state.netOut) / LINK_MBPS) * 100, 0, 100)
  }

  function cpuMemorySeries() {
    return [
      { name: "CPU", data: history.cpu },
      { name: "Memory", data: history.memory },
    ]
  }

  function trafficSeries() {
    return [
      { name: "Inbound", data: history.netIn },
      { name: "Outbound", data: history.netOut },
    ]
  }

  // Data

  function pushPoint(series, time, value) {
    series.push([time, Number(value.toFixed(1))])
    if (series.length > MAX_POINTS) series.shift()
  }

  function sample() {
    // Occasional spike so the thresholds and events have something to show.
    const spike = Math.random() < 0.06 ? 35 : 0
    state.cpuBase = drift(state.cpuBase, 14, 5, 75)
    state.cpu = clamp(state.cpuBase + spike, 0, 99)
    state.memory = drift(state.memory, 3, 35, 92)
    state.disk = drift(state.disk, 12, 2, 80)
    state.netIn = drift(state.netIn, 60, 10, 600)
    state.netOut = drift(state.netOut, 30, 5, 300)

    const load = (state.cpu / 100) * 8
    state.load = [
      load,
      state.load[1] + (load - state.load[1]) * 0.2,
      state.load[2] + (load - state.load[2]) * 0.07,
    ]

    processes.forEach((proc) => {
      proc.cpu = drift(proc.cpu, 4, 0.1, 40)
      proc.mem = drift(proc.mem, 0.4, 0.1, 15)
    })

    services.forEach((service) => {
      const base = service.baseLatency ?? (service.baseLatency = service.latency)
      const roll = Math.random()
      const previous = service.status
      if (service.status === "healthy" && roll < 0.015) service.status = "degraded"
      else if (service.status === "degraded" && roll < 0.08) service.status = "down"
      else if (service.status !== "healthy" && roll > 0.7) service.status = "healthy"

      const factor = { healthy: 1, degraded: 4, down: 0 }[service.status]
      service.latency = factor ? drift(base * factor, base * 0.6, 1, base * 8) : null

      if (previous !== service.status) {
        const type = { healthy: "success", degraded: "warning", down: "danger" }[service.status]
        addEvent(type, `${service.name} is ${STATUS[service.status].label.toLowerCase()}`)
      }
    })

    if (spike) addEvent("warning", `CPU spike detected (${Math.round(state.cpu)}%)`)
    if (state.memory > 88) addEvent("danger", `Memory usage high (${Math.round(state.memory)}%)`)
  }

  function addEvent(type, message) {
    const icon = {
      success: "check-circle-fill",
      warning: "exclamation-triangle-fill",
      danger: "x-octagon-fill",
      info: "info-circle-fill",
    }[type]
    events.unshift({ type, icon, message, time: new Date() })
    if (events.length > 6) events.pop()
  }

  // Rendering

  function renderSummary() {
    const usedGb = (state.memory / 100) * MEMORY_TOTAL_GB
    $("cpu-detail").textContent = `Load ${state.load[0].toFixed(2)}`
    $("memory-detail").textContent = `${usedGb.toFixed(1)} / ${MEMORY_TOTAL_GB} GB`
    $("disk-detail").textContent = `${Math.round(state.disk * 4.2)} MB/s`
    $("network-detail").textContent = `↓ ${Math.round(state.netIn)} ↑ ${Math.round(state.netOut)} Mbps`
    $("load-1").textContent = state.load[0].toFixed(2)
    $("load-5").textContent = state.load[1].toFixed(2)
    $("load-15").textContent = state.load[2].toFixed(2)
    $("process-count").textContent = 280 + Math.round(state.cpu / 2)
    $("cpu-temp").textContent = `${Math.round(38 + state.cpu * 0.4)} °C`
    $("uptime").textContent = formatDuration(state.uptimeSeconds)
    $("last-update").textContent = formatTime(new Date())

    const down = services.some((service) => service.status === "down")
    const degraded =
      services.some((service) => service.status === "degraded") || state.cpu >= 85 || state.memory >= 85
    const health = down
      ? { title: "Partial outage", bg: "bg-danger", icon: "x-octagon" }
      : degraded
        ? { title: "Degraded performance", bg: "bg-warning", icon: "exclamation-triangle" }
        : { title: "All systems operational", bg: "bg-success", icon: "shield-check" }
    $("health-title").textContent = health.title
    $("health-icon").className = `stats-icon ${health.bg}`
    $("health-icon").innerHTML = `<i class="bi bi-${health.icon} bi-middle lh-1 w-auto h-auto"></i>`
  }

  function renderServices() {
    $("service-table").innerHTML = services
      .map((service) => {
        const status = STATUS[service.status]
        const latency = service.latency === null ? "—" : `${Math.round(service.latency)} ms`
        return `
          <tr>
            <td>
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-${service.icon} bi-middle lh-1 text-muted"></i>
                <span class="font-semibold">${service.name}</span>
              </div>
            </td>
            <td><span class="badge ${status.badge}">${status.label}</span></td>
            <td class="text-end">${latency}</td>
            <td class="text-end">${service.uptime.toFixed(2)}%</td>
          </tr>`
      })
      .join("")
  }

  function renderProcesses() {
    $("process-table").innerHTML = [...processes]
      .sort((a, b) => b.cpu - a.cpu)
      .map(
        (proc) => `
          <tr>
            <td class="text-muted">${proc.pid}</td>
            <td>${proc.name}</td>
            <td class="text-end">${proc.cpu.toFixed(1)}%</td>
            <td class="text-end">${proc.mem.toFixed(1)}%</td>
          </tr>`
      )
      .join("")
  }

  function renderEvents() {
    $("event-count").textContent = `${events.length} event${events.length === 1 ? "" : "s"}`
    $("event-list").innerHTML = events.length
      ? events
          .map(
            (event) => `
              <li class="list-group-item d-flex align-items-center gap-3">
                <i class="bi bi-${event.icon} bi-middle lh-1 text-${event.type}"></i>
                <span class="flex-grow-1">${event.message}</span>
                <small class="text-muted text-nowrap">${formatTime(event.time)}</small>
              </li>`
          )
          .join("")
      : `<li class="list-group-item text-muted">No events yet</li>`
  }

  function update() {
    const now = Date.now()
    sample()
    state.uptimeSeconds += state.interval / 1000

    pushPoint(history.cpu, now, state.cpu)
    pushPoint(history.memory, now, state.memory)
    pushPoint(history.netIn, now, state.netIn)
    pushPoint(history.netOut, now, state.netOut)

    charts.cpu.updateOptions({ series: [state.cpu], colors: [levelColor(state.cpu)] })
    charts.memory.updateOptions({ series: [state.memory], colors: [levelColor(state.memory)] })
    charts.disk.updateOptions({ series: [state.disk], colors: [levelColor(state.disk)] })
    charts.network.updateOptions({ series: [networkPercent()], colors: [levelColor(networkPercent())] })
    charts.cpuMemory.updateSeries(cpuMemorySeries())
    charts.traffic.updateSeries(trafficSeries())

    renderSummary()
    renderServices()
    renderProcesses()
    renderEvents()
  }

  // Controls

  function start() {
    stop()
    state.timer = setInterval(update, state.interval)
  }

  function stop() {
    clearInterval(state.timer)
    state.timer = null
  }

  function initControls() {
    const button = $("toggle-live")
    button.addEventListener("click", () => {
      const running = state.timer !== null
      running ? stop() : start()
      button.querySelector("i").className = `bi bi-${running ? "play-fill" : "pause-fill"} bi-middle`
      button.querySelector("span").textContent = running ? "Resume" : "Pause"
    })

    $("refresh-interval").addEventListener("change", (event) => {
      state.interval = Number(event.target.value)
      if (state.timer !== null) start()
    })
  }

  // Seed the history so the charts are not empty on first paint.
  const now = Date.now()
  for (let i = MAX_POINTS; i > 0; i--) {
    sample()
    const time = now - i * state.interval
    pushPoint(history.cpu, time, state.cpu)
    pushPoint(history.memory, time, state.memory)
    pushPoint(history.netIn, time, state.netIn)
    pushPoint(history.netOut, time, state.netOut)
  }
  events.length = 0
  services.forEach((service) => {
    service.status = "healthy"
    service.latency = service.baseLatency
  })
  addEvent("info", "Monitoring agent connected to srv-prod-01")

  renderCharts()
  watchTheme()
  renderSummary()
  renderServices()
  renderProcesses()
  renderEvents()
  initControls()
  start()
})()
