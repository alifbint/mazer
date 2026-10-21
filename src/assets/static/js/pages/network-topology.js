// Sample network topology built with vis-network. Ping results and resource metrics
// are simulated on the client; replace `pingDevice()` and `sampleMetrics()` with
// calls to your own monitoring API (ICMP/SNMP, Zabbix, Prometheus, ...) to use real data.
;(() => {
  const MAX_POINTS = 30
  const LATENCY_WARNING_MS = 100
  const ICON_PATH = "assets/static/images/topology/"

  // Each type maps to an icon in ICON_PATH. Add a type here and drop a new SVG/PNG
  // into that folder to use your own icons.
  const DEVICE_TYPES = {
    router: { label: "Router", icon: "router.svg", latency: 2 },
    switch: { label: "Switch", icon: "switch.svg", latency: 1 },
    firewall: { label: "Firewall", icon: "firewall.svg", latency: 2 },
    server: { label: "Server", icon: "server.svg", latency: 1 },
    "access-point": { label: "Access Point", icon: "access-point.svg", latency: 4 },
    pc: { label: "PC", icon: "pc.svg", latency: 3 },
    cloud: { label: "Internet / Cloud", icon: "cloud.svg", latency: 18, noMetrics: true },
  }

  const STATUS = {
    up: { label: "Up", color: "success", order: 2 },
    warning: { label: "Warning", color: "warning", order: 1 },
    down: { label: "Down", color: "danger", order: 0 },
  }

  const DEVICE_FIELDS = ["id", "label", "type", "ip", "model", "location", "x", "y"]

  const SAMPLE = {
    nodes: [
      { id: "internet", label: "Internet", type: "cloud", ip: "203.0.113.1", model: "ISP uplink", x: 0, y: -320 },
      { id: "fw-01", label: "FW-01", type: "firewall", ip: "10.0.0.1", model: "FortiGate 100F", location: "DC · Rack A1", x: 0, y: -190 },
      { id: "core-01", label: "Core-RTR-01", type: "router", ip: "10.0.0.2", model: "MikroTik CCR2116", location: "DC · Rack A1", x: 0, y: -60 },
      { id: "sw-dc", label: "SW-DC-01", type: "switch", ip: "10.0.10.1", model: "Cisco C9300-48T", location: "DC · Rack A2", x: -280, y: 70 },
      { id: "sw-office", label: "SW-OFC-01", type: "switch", ip: "10.0.20.1", model: "Aruba 2930F", location: "Office · Floor 1", x: 280, y: 70 },
      { id: "srv-web", label: "srv-web-01", type: "server", ip: "10.0.10.11", model: "Dell R650", location: "DC · Rack A3", x: -440, y: 210 },
      { id: "srv-app", label: "srv-app-01", type: "server", ip: "10.0.10.12", model: "Dell R650", location: "DC · Rack A3", x: -280, y: 210 },
      { id: "srv-db", label: "srv-db-01", type: "server", ip: "10.0.10.13", model: "Dell R750", location: "DC · Rack A4", x: -120, y: 210 },
      { id: "ap-lobby", label: "AP-Lobby", type: "access-point", ip: "10.0.20.11", model: "UniFi U7 Pro", location: "Office · Lobby", x: 140, y: 210 },
      { id: "ap-meeting", label: "AP-Meeting", type: "access-point", ip: "10.0.20.12", model: "UniFi U7 Pro", location: "Office · Meeting room", x: 280, y: 210 },
      { id: "pc-finance", label: "PC-Finance-01", type: "pc", ip: "10.0.20.101", model: "Dell OptiPlex 7010", location: "Office · Finance", x: 420, y: 210 },
    ],
    edges: [
      { from: "internet", to: "fw-01", label: "1G WAN" },
      { from: "fw-01", to: "core-01", label: "10G" },
      { from: "core-01", to: "sw-dc", label: "10G" },
      { from: "core-01", to: "sw-office", label: "10G" },
      { from: "sw-dc", to: "srv-web", label: "1G" },
      { from: "sw-dc", to: "srv-app", label: "1G" },
      { from: "sw-dc", to: "srv-db", label: "1G" },
      { from: "sw-office", to: "ap-lobby", label: "1G" },
      { from: "sw-office", to: "ap-meeting", label: "1G" },
      { from: "sw-office", to: "pc-finance", label: "1G" },
    ],
  }

  const state = { timer: null, interval: 3000, connecting: false, modalId: null, editingId: null }
  const stats = new Map()
  const modalCharts = {}

  const $ = (id) => document.getElementById(id)
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
  const drift = (value, step, min, max) => clamp(value + (Math.random() - 0.5) * step, min, max)
  const isDark = () => document.documentElement.getAttribute("data-bs-theme") === "dark"
  const escapeHtml = (text) =>
    String(text ?? "").replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

  function cssVar(name, element = document.documentElement) {
    return getComputedStyle(element).getPropertyValue(name).trim()
  }

  function palette() {
    const card = $("topology").closest(".card")
    return {
      primary: cssVar("--bs-primary"),
      success: cssVar("--bs-success"),
      warning: cssVar("--bs-warning"),
      danger: cssVar("--bs-danger"),
      info: cssVar("--bs-info"),
      text: cssVar("--bs-body-color"),
      muted: cssVar("--bs-secondary-color"),
      line: cssVar("--bs-secondary-color"),
      border: cssVar("--bs-border-color"),
      surface: cssVar("--bs-card-bg", card) || cssVar("--bs-body-bg"),
      font: getComputedStyle(document.body).fontFamily,
    }
  }

  function iconUrl(type) {
    return ICON_PATH + (DEVICE_TYPES[type] ?? DEVICE_TYPES.server).icon
  }

  function formatDuration(seconds) {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  function formatTime(date) {
    return date ? new Date(date).toLocaleTimeString([], { hour12: false }) : "-"
  }

  // Simulated monitoring

  function getStats(device) {
    if (!stats.has(device.id)) {
      const type = DEVICE_TYPES[device.type] ?? DEVICE_TYPES.server
      const entry = {
        fault: "none",
        status: "up",
        baseLatency: type.latency * (0.8 + Math.random() * 0.6),
        noMetrics: Boolean(type.noMetrics),
        cpu: 15 + Math.random() * 30,
        memory: 30 + Math.random() * 30,
        rx: 50 + Math.random() * 200,
        tx: 20 + Math.random() * 100,
        uptime: Math.round((3 + Math.random() * 60) * 86400),
        lastChecked: null,
        history: { latency: [], cpu: [], memory: [], rx: [], tx: [] },
      }
      stats.set(device.id, entry)
      // Seed the history so the charts are not empty when a device is opened.
      const now = Date.now()
      for (let i = MAX_POINTS; i > 0; i--) probe(device.id, now - i * state.interval, false)
      entry.fault = "none"
    }
    return stats.get(device.id)
  }

  // Replace with a request to your backend, e.g. GET /api/devices/:id/ping.
  // Returns the round-trip time in ms, or null when the packet was lost.
  function pingDevice(entry) {
    if (entry.fault === "offline") return null
    if (Math.random() < 0.01) return null
    const factor = entry.fault === "slow" ? 40 + Math.random() * 60 : 1
    return Math.max(0.3, entry.baseLatency * factor + (Math.random() - 0.3) * entry.baseLatency)
  }

  // Replace with a request to your backend, e.g. GET /api/devices/:id/metrics.
  function sampleMetrics(entry) {
    const busy = entry.fault === "slow" ? 25 : 0
    entry.cpu = clamp(drift(entry.cpu, 12, 3, 70) + busy, 0, 99)
    entry.memory = drift(entry.memory, 3, 20, 92)
    entry.rx = drift(entry.rx, 80, 5, 900)
    entry.tx = drift(entry.tx, 40, 2, 500)
  }

  function nextFault(fault) {
    const roll = Math.random()
    if (fault === "none") return roll < 0.01 ? "slow" : roll < 0.014 ? "offline" : "none"
    if (fault === "slow") return roll < 0.06 ? "offline" : roll < 0.3 ? "none" : "slow"
    return roll < 0.25 ? "none" : "offline"
  }

  function pushPoint(series, time, value) {
    series.push([time, value === null ? null : Number(value.toFixed(1))])
    if (series.length > MAX_POINTS) series.shift()
  }

  function probe(id, time = Date.now(), changeFault = true) {
    const entry = stats.get(id)
    if (changeFault) entry.fault = nextFault(entry.fault)

    const latency = pingDevice(entry)
    const online = entry.fault !== "offline"
    if (online && !entry.noMetrics) sampleMetrics(entry)

    pushPoint(entry.history.latency, time, latency)
    pushPoint(entry.history.cpu, time, online ? entry.cpu : null)
    pushPoint(entry.history.memory, time, online ? entry.memory : null)
    pushPoint(entry.history.rx, time, online ? entry.rx : null)
    pushPoint(entry.history.tx, time, online ? entry.tx : null)

    if (online) entry.uptime += state.interval / 1000
    else entry.uptime = 0
    entry.latency = latency
    entry.lastChecked = time
    entry.status = !online
      ? "down"
      : latency === null || latency > LATENCY_WARNING_MS || entry.cpu >= 85 || entry.memory >= 90
        ? "warning"
        : "up"
  }

  function pingSummary(entry) {
    const values = entry.history.latency.map((point) => point[1])
    const replies = values.filter((value) => value !== null)
    return {
      last: entry.latency,
      avg: replies.length ? replies.reduce((sum, value) => sum + value, 0) / replies.length : null,
      min: replies.length ? Math.min(...replies) : null,
      max: replies.length ? Math.max(...replies) : null,
      loss: values.length ? ((values.length - replies.length) / values.length) * 100 : 0,
    }
  }

  // Network

  const nodes = new vis.DataSet()
  const edges = new vis.DataSet()
  let network

  function nodeVisual(device) {
    const theme = palette()
    const border = theme[STATUS[getStats(device).status].color]
    const color = { border, background: theme.surface }
    return {
      id: device.id,
      shape: "circularImage",
      image: iconUrl(device.type),
      color: { ...color, highlight: color, hover: color },
    }
  }

  function edgeVisual(edge) {
    const theme = palette()
    const down = [edge.from, edge.to].some((id) => stats.get(id)?.status === "down")
    return {
      id: edge.id,
      dashes: down ? [6, 6] : false,
      color: {
        color: down ? theme.danger : theme.line,
        highlight: theme.primary,
        hover: theme.primary,
      },
    }
  }

  function networkOptions() {
    const theme = palette()
    return {
      height: "560px",
      physics: false,
      interaction: { hover: true, multiselect: true, selectConnectedEdges: false },
      manipulation: { enabled: false, addEdge: onAddEdge },
      nodes: {
        size: 24,
        borderWidth: 3,
        borderWidthSelected: 5,
        font: { color: theme.text, face: theme.font, size: 13, vadjust: 4 },
      },
      edges: {
        width: 2,
        smooth: false,
        font: { color: theme.muted, face: theme.font, size: 11, strokeColor: theme.surface, strokeWidth: 4 },
      },
    }
  }

  function edgeId(edge) {
    return edge.id ?? `${edge.from}:${edge.to}`
  }

  function loadTopology(data) {
    disableConnect()
    stats.clear()
    nodes.clear()
    edges.clear()
    nodes.add(data.nodes.map((device) => ({ ...pick(device), ...nodeVisual(device) })))
    edges.add(
      data.edges
        .filter((edge) => nodes.get(edge.from) && nodes.get(edge.to))
        .map((edge) => {
          const item = { id: edgeId(edge), from: edge.from, to: edge.to, label: edge.label }
          return { ...item, ...edgeVisual(item) }
        })
    )
    network?.fit()
    renderSidebar()
  }

  function pick(device) {
    return Object.fromEntries(DEVICE_FIELDS.filter((field) => device[field] !== undefined).map((field) => [field, device[field]]))
  }

  // vis-network leaves edit mode whenever the data changes, so status colors are
  // held while connecting and applied again when connect mode ends.
  function refreshVisuals() {
    if (state.connecting) return
    nodes.update(nodes.get().map(nodeVisual))
    edges.update(edges.get().map(edgeVisual))
  }

  function onAddEdge(data, callback) {
    const duplicate = edges.get({
      filter: (edge) =>
        (edge.from === data.from && edge.to === data.to) || (edge.from === data.to && edge.to === data.from),
    }).length
    if (data.from === data.to || duplicate) {
      callback(null)
    } else {
      const item = { id: edgeId(data), from: data.from, to: data.to, label: "1G" }
      callback({ ...item, ...edgeVisual(item) })
      renderSidebar()
    }
    // Stay in connect mode so several links can be drawn in a row.
    if (state.connecting) setTimeout(() => state.connecting && network.addEdgeMode(), 0)
  }

  function enableConnect() {
    state.connecting = true
    network.unselectAll()
    network.addEdgeMode()
    $("toggle-connect").classList.replace("btn-light-primary", "btn-primary")
    $("toggle-connect").querySelector("span").textContent = "Done"
    $("mode-hint").textContent = "Drag from one device to another to connect them · Esc to finish"
    updateSelectionButtons()
  }

  function disableConnect() {
    if (!state.connecting) return
    state.connecting = false
    network.disableEditMode()
    $("toggle-connect").classList.replace("btn-primary", "btn-light-primary")
    $("toggle-connect").querySelector("span").textContent = "Connect"
    $("mode-hint").textContent = "Click a device for details · drag to move · Ctrl+click to select several"
    refreshVisuals()
  }

  function removeDevices(ids) {
    edges.remove(ids.flatMap((id) => network.getConnectedEdges(id)))
    nodes.remove(ids)
    ids.forEach((id) => stats.delete(id))
    renderSidebar()
    updateSelectionButtons()
  }

  function updateSelectionButtons() {
    const selection = network.getSelection()
    $("delete-selected").disabled = state.connecting || !(selection.nodes.length || selection.edges.length)
  }

  // Sidebar

  function renderSidebar() {
    const devices = nodes.get()
    const counts = { up: 0, warning: 0, down: 0 }
    devices.forEach((device) => counts[getStats(device).status]++)
    $("count-up").textContent = counts.up
    $("count-warning").textContent = counts.warning
    $("count-down").textContent = counts.down
    $("last-update").textContent = formatTime(Date.now())

    $("device-list").innerHTML = devices.length
      ? devices
          .sort(
            (a, b) =>
              STATUS[stats.get(a.id).status].order - STATUS[stats.get(b.id).status].order ||
              a.label.localeCompare(b.label)
          )
          .map((device) => {
            const entry = stats.get(device.id)
            const status = STATUS[entry.status]
            const latency = entry.latency === null ? "timeout" : `${entry.latency.toFixed(1)} ms`
            return `
              <button type="button" class="list-group-item w-100 text-start d-flex align-items-center gap-3" data-device="${escapeHtml(device.id)}">
                <img src="${iconUrl(device.type)}" alt="" width="32" height="32" class="rounded-circle">
                <span class="flex-grow-1 text-truncate">
                  <span class="d-block font-semibold text-truncate">${escapeHtml(device.label)}</span>
                  <small class="text-muted">${escapeHtml(device.ip)} · ${latency}</small>
                </span>
                <span class="badge bg-${status.color}">${status.label}</span>
              </button>`
          })
          .join("")
      : `<div class="list-group-item text-muted">No devices yet</div>`
  }

  // Device modal

  function gaugeOptions(value) {
    const theme = palette()
    const color = value >= 85 ? theme.danger : value >= 70 ? theme.warning : theme.success
    return {
      series: [value ?? 0],
      chart: { type: "radialBar", height: 150, width: 130, sparkline: { enabled: true } },
      colors: [color],
      plotOptions: {
        radialBar: {
          hollow: { size: "58%" },
          track: { background: theme.border },
          dataLabels: {
            name: { show: false },
            value: {
              offsetY: 6,
              fontSize: "18px",
              fontWeight: 700,
              color: theme.text,
              formatter: (val) => (value === null ? "—" : `${Math.round(val)}%`),
            },
          },
        },
      },
      stroke: { lineCap: "round" },
    }
  }

  function lineOptions(series, colors, unit) {
    const theme = palette()
    return {
      series,
      chart: {
        type: "area",
        height: 220,
        foreColor: theme.muted,
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: false },
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
      yaxis: { min: 0, tickAmount: 4, labels: { formatter: (val) => `${Math.round(val)}${unit}` } },
      tooltip: {
        theme: isDark() ? "dark" : "light",
        x: { format: "HH:mm:ss" },
        y: { formatter: (val) => (val === null || val === undefined ? "timeout" : `${val.toFixed(1)}${unit}`) },
      },
    }
  }

  function trafficSeries(entry) {
    return [
      { name: "Inbound", data: entry.history.rx },
      { name: "Outbound", data: entry.history.tx },
    ]
  }

  function latencySeries(entry) {
    return [{ name: "Latency", data: entry.history.latency }]
  }

  function activePane() {
    return document.querySelector("#device-modal .tab-pane.active")?.id
  }

  // Charts are created when their tab is visible, because ApexCharts cannot
  // measure a hidden container.
  function renderModalCharts() {
    const entry = stats.get(state.modalId)
    if (!entry) return
    const theme = palette()
    const pane = activePane()

    if (pane === "pane-resource" && !entry.noMetrics && !modalCharts.cpu) {
      const online = entry.status !== "down"
      modalCharts.cpu = new ApexCharts($("gauge-cpu"), gaugeOptions(online ? entry.cpu : null))
      modalCharts.memory = new ApexCharts($("gauge-memory"), gaugeOptions(online ? entry.memory : null))
      modalCharts.traffic = new ApexCharts(
        $("chart-traffic"),
        lineOptions(trafficSeries(entry), [theme.success, theme.primary], " Mbps")
      )
      ;["cpu", "memory", "traffic"].forEach((key) => modalCharts[key].render())
    }

    if (pane === "pane-ping" && !modalCharts.latency) {
      modalCharts.latency = new ApexCharts($("chart-latency"), lineOptions(latencySeries(entry), [theme.info], " ms"))
      modalCharts.latency.render()
    }
  }

  function destroyModalCharts() {
    Object.keys(modalCharts).forEach((key) => {
      modalCharts[key].destroy()
      delete modalCharts[key]
    })
  }

  function updateModal() {
    const device = nodes.get(state.modalId)
    const entry = stats.get(state.modalId)
    if (!device || !entry) return
    const status = STATUS[entry.status]
    const online = entry.status !== "down"
    const neighbors = network.getConnectedNodes(device.id).map((id) => nodes.get(id)?.label)

    $("device-icon").src = iconUrl(device.type)
    $("device-name").textContent = device.label
    $("device-ip").textContent = device.ip
    $("device-status").className = `badge bg-${status.color} ms-1`
    $("device-status").textContent = status.label

    $("info-type").textContent = (DEVICE_TYPES[device.type] ?? DEVICE_TYPES.server).label
    $("info-ip").textContent = device.ip
    $("info-model").textContent = device.model || "-"
    $("info-location").textContent = device.location || "-"
    $("info-uptime").textContent = online ? formatDuration(entry.uptime) : "Offline"
    $("info-links").textContent = neighbors.length ? neighbors.join(", ") : "-"
    $("info-checked").textContent = formatTime(entry.lastChecked)

    $("resource-unavailable").classList.toggle("d-none", !entry.noMetrics)
    $("resource-content").classList.toggle("d-none", entry.noMetrics)
    $("traffic-now").textContent = online
      ? `↓ ${Math.round(entry.rx)} ↑ ${Math.round(entry.tx)} Mbps`
      : "No data"

    const ping = pingSummary(entry)
    const ms = (value) => (value === null ? "—" : `${value.toFixed(1)} ms`)
    $("ping-last").textContent = ping.last === null ? "Timeout" : ms(ping.last)
    $("ping-avg").textContent = ms(ping.avg)
    $("ping-minmax").textContent = ping.min === null ? "—" : `${ping.min.toFixed(1)} / ${ping.max.toFixed(1)}`
    $("ping-loss").textContent = `${Math.round(ping.loss)}%`
    $("ping-loss").className = `mb-0 ${ping.loss >= 20 ? "text-danger" : ping.loss > 0 ? "text-warning" : ""}`

    $("ping-log").innerHTML = entry.history.latency
      .slice(-5)
      .reverse()
      .map(([time, value]) => {
        const reply =
          value === null
            ? `<span class="text-danger">Request timed out</span>`
            : `Reply from ${escapeHtml(device.ip)}: time=${value} ms`
        return `
          <li class="list-group-item d-flex justify-content-between gap-3">
            <span class="text-truncate">${reply}</span>
            <span class="text-muted">${formatTime(time)}</span>
          </li>`
      })
      .join("")

    if (modalCharts.cpu) {
      modalCharts.cpu.updateOptions(gaugeOptions(online ? entry.cpu : null))
      modalCharts.memory.updateOptions(gaugeOptions(online ? entry.memory : null))
      modalCharts.traffic.updateSeries(trafficSeries(entry))
    }
    modalCharts.latency?.updateSeries(latencySeries(entry))
  }

  function openDevice(id) {
    state.modalId = id
    updateModal()
    bootstrap.Modal.getOrCreateInstance($("device-modal")).show()
  }

  // Add / edit form

  function openForm(id = null) {
    const device = id ? nodes.get(id) : {}
    state.editingId = id
    $("form-title").textContent = id ? "Edit device" : "Add device"
    $("form-name").value = device.label ?? ""
    $("form-type").value = device.type ?? "switch"
    $("form-ip").value = device.ip ?? ""
    $("form-model").value = device.model ?? ""
    $("form-location").value = device.location ?? ""
    $("device-form").classList.remove("was-validated")
    bootstrap.Modal.getOrCreateInstance($("device-form-modal")).show()
  }

  function saveForm(event) {
    event.preventDefault()
    const form = $("device-form")
    if (!form.checkValidity()) {
      form.classList.add("was-validated")
      return
    }

    const values = {
      label: $("form-name").value.trim(),
      type: $("form-type").value,
      ip: $("form-ip").value.trim(),
      model: $("form-model").value.trim(),
      location: $("form-location").value.trim(),
    }

    if (state.editingId) {
      const device = { ...nodes.get(state.editingId), ...values }
      nodes.update({ ...values, ...nodeVisual(device) })
    } else {
      // Place new devices near the middle of the current view.
      const center = network.getViewPosition()
      const device = {
        ...values,
        id: `device-${Date.now().toString(36)}`,
        x: Math.round(center.x + (Math.random() - 0.5) * 80),
        y: Math.round(center.y + (Math.random() - 0.5) * 80),
      }
      nodes.add({ ...device, ...nodeVisual(device) })
      network.selectNodes([device.id])
    }

    bootstrap.Modal.getOrCreateInstance($("device-form-modal")).hide()
    renderSidebar()
    updateSelectionButtons()
  }

  // Import / export

  function showAlert(message, type = "danger") {
    $("topology-alert").innerHTML = `
      <div class="alert alert-light-${type} alert-dismissible fade show" role="alert">
        ${escapeHtml(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`
  }

  function exportTopology() {
    network.storePositions()
    const data = {
      nodes: nodes.get().map(pick),
      edges: edges.get().map((edge) => ({ id: edge.id, from: edge.from, to: edge.to, label: edge.label })),
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }))
    const link = Object.assign(document.createElement("a"), { href: url, download: "network-topology.json" })
    link.click()
    URL.revokeObjectURL(url)
  }

  function importTopology(file) {
    file
      .text()
      .then((text) => {
        const data = JSON.parse(text)
        const valid =
          Array.isArray(data.nodes) &&
          Array.isArray(data.edges) &&
          data.nodes.every((device) => device.id !== undefined && device.label && DEVICE_TYPES[device.type])
        if (!valid) throw new Error("invalid")
        loadTopology(data)
        showAlert(`Imported ${data.nodes.length} devices and ${data.edges.length} links.`, "success")
      })
      .catch(() => showAlert("This file is not a valid topology export."))
  }

  // Live updates

  function tick() {
    nodes.getIds().forEach((id) => probe(id))
    refreshVisuals()
    renderSidebar()
    if (state.modalId) updateModal()
  }

  function start() {
    stop()
    state.timer = setInterval(tick, state.interval)
  }

  function stop() {
    clearInterval(state.timer)
    state.timer = null
  }

  // Re-apply theme colors when the user toggles light/dark mode.
  function watchTheme() {
    new MutationObserver(() => {
      network.setOptions(networkOptions())
      refreshVisuals()
      if (state.connecting) network.addEdgeMode()
      if (state.modalId) {
        destroyModalCharts()
        renderModalCharts()
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] })
  }

  function initControls() {
    $("form-type").innerHTML = Object.entries(DEVICE_TYPES)
      .map(([value, type]) => `<option value="${value}">${type.label}</option>`)
      .join("")

    $("add-device").addEventListener("click", () => {
      disableConnect()
      openForm()
    })
    $("toggle-connect").addEventListener("click", () => (state.connecting ? disableConnect() : enableConnect()))
    $("delete-selected").addEventListener("click", () => {
      const selection = network.getSelection()
      edges.remove(selection.edges)
      removeDevices(selection.nodes)
    })
    $("fit-view").addEventListener("click", () => network.fit({ animation: true }))
    $("export-topology").addEventListener("click", exportTopology)
    $("import-topology").addEventListener("click", () => $("import-file").click())
    $("import-file").addEventListener("change", (event) => {
      if (event.target.files[0]) importTopology(event.target.files[0])
      event.target.value = ""
    })
    $("reset-topology").addEventListener("click", () => loadTopology(SAMPLE))

    const liveButton = $("toggle-live")
    liveButton.addEventListener("click", () => {
      const running = state.timer !== null
      running ? stop() : start()
      liveButton.querySelector("i").className = `bi bi-${running ? "play-fill" : "pause-fill"} bi-middle`
      liveButton.querySelector("span").textContent = running ? "Resume" : "Pause"
    })

    $("device-list").addEventListener("click", (event) => {
      const item = event.target.closest("[data-device]")
      if (!item) return
      const id = nodes.getIds().find((nodeId) => String(nodeId) === item.dataset.device)
      network.selectNodes([id])
      network.focus(id, { scale: 1.2, animation: true })
      updateSelectionButtons()
      openDevice(id)
    })

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.connecting) disableConnect()
    })

    const deviceModal = $("device-modal")
    deviceModal.addEventListener("shown.bs.modal", renderModalCharts)
    deviceModal.addEventListener("hidden.bs.modal", () => {
      destroyModalCharts()
      state.modalId = null
    })
    deviceModal.querySelectorAll('[data-bs-toggle="tab"]').forEach((tab) =>
      tab.addEventListener("shown.bs.tab", renderModalCharts)
    )
    $("ping-now").addEventListener("click", () => {
      probe(state.modalId)
      refreshVisuals()
      renderSidebar()
      updateModal()
    })
    $("device-delete").addEventListener("click", () => {
      const id = state.modalId
      bootstrap.Modal.getOrCreateInstance(deviceModal).hide()
      removeDevices([id])
    })
    $("device-edit").addEventListener("click", () => {
      const id = state.modalId
      deviceModal.addEventListener("hidden.bs.modal", () => openForm(id), { once: true })
      bootstrap.Modal.getOrCreateInstance(deviceModal).hide()
    })

    $("device-form").addEventListener("submit", saveForm)
  }

  network = new vis.Network($("topology"), { nodes, edges }, networkOptions())
  loadTopology(SAMPLE)

  network.on("click", (params) => {
    updateSelectionButtons()
    const multiSelect = params.event.srcEvent.ctrlKey || params.event.srcEvent.metaKey
    if (state.connecting || multiSelect || !params.nodes.length) return
    openDevice(params.nodes[0])
  })
  network.on("dragEnd", updateSelectionButtons)

  initControls()
  watchTheme()
  start()
})()
