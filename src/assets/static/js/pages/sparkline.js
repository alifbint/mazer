// Every element with the "sparkline" class is rendered from its data-* attributes:
// data-values (comma separated), data-type (line/area/bar), data-color,
// data-height, data-width and data-name (tooltip label).
const getTooltipTheme = () =>
  document.documentElement.getAttribute("data-bs-theme") === "dark"
    ? "dark"
    : "light"

const sparklines = []

document.querySelectorAll(".sparkline").forEach((el) => {
  const type = el.dataset.type || "line"
  const options = {
    series: [
      {
        name: el.dataset.name || "Value",
        data: el.dataset.values.split(",").map(Number),
      },
    ],
    chart: {
      type: type,
      height: Number(el.dataset.height) || 50,
      width: el.dataset.width ? Number(el.dataset.width) : "100%",
      sparkline: {
        enabled: true,
      },
    },
    colors: [el.dataset.color || "#435ebe"],
    stroke: {
      curve: "smooth",
      width: type === "bar" ? 0 : 2,
    },
    fill: {
      type: type === "area" ? "gradient" : "solid",
      gradient: {
        opacityFrom: 0.5,
        opacityTo: 0.05,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "60%",
        borderRadius: 2,
      },
    },
    tooltip: {
      theme: getTooltipTheme(),
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      marker: {
        show: false,
      },
    },
  }

  const chart = new ApexCharts(el, options)
  chart.render()
  sparklines.push(chart)
})

// Keep the tooltip readable when the theme is switched
new MutationObserver(() => {
  const theme = getTooltipTheme()
  sparklines.forEach((chart) => chart.updateOptions({ tooltip: { theme } }))
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-bs-theme"],
})
