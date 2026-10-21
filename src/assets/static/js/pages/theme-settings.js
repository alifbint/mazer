// Default Mazer colors (see _bootstrap-variables.scss and themes/dark/_variables-dark.scss)
const DEFAULT_THEME_COLORS = {
  light: { primary: "#435ebe", bodyBg: "#f2f7ff", surfaceBg: "#ffffff", textColor: "#607080", headingColor: "#25396f" },
  dark: { primary: "#435ebe", bodyBg: "#151521", surfaceBg: "#1e1e2d", textColor: "#c2c2d9", headingColor: "#c2c2d9" },
}

const HEX_PATTERN = /^#[0-9a-f]{6}$/i

const COLOR_SWATCHES = {
  primary: ["#435ebe", "#57caeb", "#198754", "#20c997", "#fdac41", "#ff7976", "#d63384", "#6f42c1"],
  light: ["#f2f7ff", "#ffffff", "#f8f9fa", "#eef7f1", "#fdf6ec", "#f5f3ff", "#e9ecef", "#fff5f5"],
  dark: ["#151521", "#1e1e2d", "#111827", "#1f2a37", "#121212", "#1b1f24", "#0f172a", "#1c1917"],
  lightText: ["#607080", "#25396f", "#212529", "#343a40", "#495057", "#1e293b", "#3f3f46", "#000000"],
  darkText: ["#c2c2d9", "#ffffff", "#e9ecef", "#dee2e6", "#adb5bd", "#cbd5e1", "#e4e4e7", "#9899ac"],
}

function currentTheme() {
  return document.documentElement.getAttribute("data-bs-theme") === "dark" ? "dark" : "light"
}

// Show the stored (or default) colors in the inputs
let renderingInputs = false

function renderColorInputs() {
  const colors = getThemeColors()
  renderingInputs = true
  document.querySelectorAll("[data-theme][data-key]").forEach((input) => {
    const { theme, key } = input.dataset
    input.value = (colors[theme] && colors[theme][key]) || DEFAULT_THEME_COLORS[theme][key]
    input.classList.remove("is-invalid")
    // Update the Coloris swatch
    input.dispatchEvent(new Event("input", { bubbles: true }))
  })
  renderingInputs = false
}

function initColorPickers() {
  Coloris({
    el: "[data-coloris]",
    alpha: false,
    format: "hex",
    themeMode: currentTheme(),
    swatches: COLOR_SWATCHES.primary,
  })
  Coloris.setInstance('[data-key="bodyBg"][data-theme="light"], [data-key="surfaceBg"][data-theme="light"]', {
    swatches: COLOR_SWATCHES.light,
  })
  Coloris.setInstance('[data-key="bodyBg"][data-theme="dark"], [data-key="surfaceBg"][data-theme="dark"]', {
    swatches: COLOR_SWATCHES.dark,
  })
  Coloris.setInstance('[data-key="textColor"][data-theme="light"], [data-key="headingColor"][data-theme="light"]', {
    swatches: COLOR_SWATCHES.lightText,
  })
  Coloris.setInstance('[data-key="textColor"][data-theme="dark"], [data-key="headingColor"][data-theme="dark"]', {
    swatches: COLOR_SWATCHES.darkText,
  })
  // Coloris wraps each input in .clr-field on DOMContentLoaded; let it fill the row next to the reset button
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".clr-field").forEach((field) => field.classList.add("d-block", "flex-grow-1"))
  })
}

function renderThemeMode() {
  const theme = currentTheme()
  document.getElementById(`theme-mode-${theme}`).checked = true
  document.querySelectorAll("[data-theme-card]").forEach((card) => {
    card.querySelector("[data-active-badge]").classList.toggle("d-none", card.dataset.themeCard !== theme)
  })
  const toggler = document.getElementById("toggle-dark")
  if (toggler) toggler.checked = theme === "dark"
  Coloris({ themeMode: theme })
}

function switchTheme(theme) {
  if (theme === currentTheme()) return
  setTheme(theme, true)
  renderThemeMode()
}

function setColor(theme, key, value) {
  const colors = getThemeColors()
  colors[theme] = colors[theme] || {}

  if (value && value.toLowerCase() !== DEFAULT_THEME_COLORS[theme][key]) {
    colors[theme][key] = value.toLowerCase()
  } else {
    delete colors[theme][key]
  }
  if (!Object.keys(colors[theme]).length) delete colors[theme]

  saveThemeColors(colors)
  // Preview the theme that is being edited
  switchTheme(theme)
}

document.querySelectorAll("[data-theme][data-key]").forEach((input) => {
  input.addEventListener("input", () => {
    if (renderingInputs) return
    const { theme, key } = input.dataset
    let value = input.value.trim()
    if (!value.startsWith("#")) value = "#" + value
    input.classList.toggle("is-invalid", !HEX_PATTERN.test(value))
    if (HEX_PATTERN.test(value)) setColor(theme, key, value)
  })
})

document.querySelectorAll("[data-reset-theme]").forEach((button) => {
  button.addEventListener("click", () => {
    const { resetTheme, resetKey } = button.dataset
    if (resetKey) {
      setColor(resetTheme, resetKey, null)
    } else {
      const colors = getThemeColors()
      delete colors[resetTheme]
      saveThemeColors(colors)
      switchTheme(resetTheme)
    }
    renderColorInputs()
  })
})

document.getElementById("reset-all-colors").addEventListener("click", () => {
  resetThemeColors()
  renderColorInputs()
})

document.querySelectorAll('input[name="theme-mode"]').forEach((radio) => {
  radio.addEventListener("change", () => switchTheme(radio.value))
})

// The sidebar switch (dark.js) changes the theme too
const darkToggler = document.getElementById("toggle-dark")
if (darkToggler) darkToggler.addEventListener("input", renderThemeMode)

// The preview links are only for display
document.querySelectorAll(".page-content a[href='#'], .section a[href='#']").forEach((link) => {
  link.addEventListener("click", (e) => e.preventDefault())
})

initColorPickers()
renderColorInputs()
renderThemeMode()
