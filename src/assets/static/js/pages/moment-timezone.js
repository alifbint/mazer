const guessedZone = moment.tz.guess()
const zoneNames = moment.tz.names()

const clockZones = [
  { city: "Jakarta", zone: "Asia/Jakarta", color: "primary" },
  { city: "Makassar", zone: "Asia/Makassar", color: "success" },
  { city: "Jayapura", zone: "Asia/Jayapura", color: "warning" },
  { city: "Tokyo", zone: "Asia/Tokyo", color: "danger" },
  { city: "London", zone: "Europe/London", color: "info" },
  { city: "New York", zone: "America/New_York", color: "secondary" },
]

const formats = [
  "YYYY-MM-DD HH:mm:ss",
  "dddd, D MMMM YYYY",
  "LLLL",
  "h:mm A z",
  "Z / ZZ",
  "X",
]

document.getElementById("guessed-zone").textContent = guessedZone

// World clock
const worldClock = document.getElementById("world-clock")
worldClock.innerHTML = clockZones
  .map(
    ({ city, zone, color }) => `
      <div class="col-12 col-sm-6 col-xl-4">
        <div class="d-flex align-items-center gap-3 p-3 border rounded">
          <div class="avatar avatar-lg bg-light-${color}">
            <span class="avatar-content"><i class="bi bi-clock-fill bi-middle lh-1 text-${color}"></i></span>
          </div>
          <div class="flex-grow-1">
            <h6 class="mb-0">${city}</h6>
            <small class="text-muted">${zone}</small>
          </div>
          <div class="text-end">
            <h5 class="mb-0" data-clock-time="${zone}"></h5>
            <small class="text-muted" data-clock-date="${zone}"></small>
          </div>
        </div>
      </div>`
  )
  .join("")

const tickClock = () => {
  const now = moment()
  clockZones.forEach(({ zone }) => {
    const local = now.clone().tz(zone)
    worldClock.querySelector(`[data-clock-time="${zone}"]`).textContent = local.format("HH:mm:ss")
    worldClock.querySelector(`[data-clock-date="${zone}"]`).textContent = local.format("ddd, D MMM · z")
  })
}
tickClock()
setInterval(tickClock, 1000)

// Zone selects
const fillZones = (select, selected) => {
  select.innerHTML = zoneNames
    .map((name) => `<option value="${name}">${name} (UTC${moment.tz(name).format("Z")})</option>`)
    .join("")
  select.value = selected
}

// Converter
const convertDatetime = document.getElementById("convert-datetime")
const convertFrom = document.getElementById("convert-from")
const convertTo = document.getElementById("convert-to")

fillZones(convertFrom, guessedZone)
fillZones(convertTo, guessedZone === "America/New_York" ? "Asia/Jakarta" : "America/New_York")

const setNow = () => {
  convertDatetime.value = moment().tz(convertFrom.value).format("YYYY-MM-DDTHH:mm")
}

const convert = () => {
  if (!convertDatetime.value) return
  const source = moment.tz(convertDatetime.value, "YYYY-MM-DDTHH:mm", convertFrom.value)
  const target = source.clone().tz(convertTo.value)
  const diffHours = (target.utcOffset() - source.utcOffset()) / 60
  document.getElementById("convert-source").textContent =
    `${source.format("dddd, D MMMM YYYY HH:mm z")} in ${convertFrom.value}`
  document.getElementById("convert-result").textContent =
    `${target.format("dddd, D MMMM YYYY HH:mm z")}`
  document.getElementById("convert-diff").textContent =
    diffHours === 0
      ? `${convertTo.value} has the same offset`
      : `${convertTo.value} is ${Math.abs(diffHours)} hour(s) ${diffHours > 0 ? "ahead" : "behind"}`
}

setNow()
convert()
;[convertDatetime, convertFrom, convertTo].forEach((el) => el.addEventListener("change", convert))
document.getElementById("convert-now").addEventListener("click", () => {
  setNow()
  convert()
})
document.getElementById("convert-swap").addEventListener("click", () => {
  const from = convertFrom.value
  convertDatetime.value = moment
    .tz(convertDatetime.value, "YYYY-MM-DDTHH:mm", from)
    .tz(convertTo.value)
    .format("YYYY-MM-DDTHH:mm")
  convertFrom.value = convertTo.value
  convertTo.value = from
  convert()
})

// Formatting
const formatZone = document.getElementById("format-zone")
const formatTable = document.getElementById("format-table")
fillZones(formatZone, guessedZone)

const renderFormats = () => {
  const now = moment().tz(formatZone.value)
  formatTable.innerHTML = formats
    .map((format) => `<tr><td><code>${format}</code></td><td>${now.format(format)}</td></tr>`)
    .join("")
}
renderFormats()
formatZone.addEventListener("change", renderFormats)
setInterval(renderFormats, 1000)
