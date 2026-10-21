const body = document.body;
const theme = localStorage.getItem('theme')

if (theme)
  document.documentElement.setAttribute('data-bs-theme', theme)

/**
 * Custom theme colors, stored in localStorage as
 * { light: { primary, bodyBg, surfaceBg, textColor, headingColor }, dark: { ... } }.
 * Every key is optional; a missing key keeps the default Mazer color.
 */
const THEME_COLORS_KEY = 'theme-colors'
const THEME_COLORS_STYLE_ID = 'theme-colors'

function getThemeColors() {
  try {
    return JSON.parse(localStorage.getItem(THEME_COLORS_KEY)) || {}
  } catch (e) {
    return {}
  }
}

function saveThemeColors(colors) {
  localStorage.setItem(THEME_COLORS_KEY, JSON.stringify(colors))
  applyThemeColors(colors)
}

function resetThemeColors() {
  localStorage.removeItem(THEME_COLORS_KEY)
  applyThemeColors({})
}

function hexToRgb(hex) {
  const value = parseInt(hex.slice(1), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

// Same as Bootstrap's mix(): weight is the share of `with`
function mixColor(hex, withHex, weight) {
  const a = hexToRgb(hex)
  const b = hexToRgb(withHex)
  return '#' + a.map((c, i) => Math.round(c * (1 - weight) + b[i] * weight).toString(16).padStart(2, '0')).join('')
}

function contrastColor(hex) {
  const [r, g, b] = hexToRgb(hex).map(c => {
    c /= 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return 1.05 / (luminance + 0.05) >= 3 ? '#fff' : '#000'
}

function primaryCss(t, p) {
  const s = `html[data-bs-theme="${t}"]`
  const rgb = hexToRgb(p).join(', ')
  const fg = contrastColor(p)
  const dark = t === 'dark'
  const emphasis = dark ? mixColor(p, '#ffffff', 0.4) : mixColor(p, '#000000', 0.6)
  const bgSubtle = dark ? mixColor(p, '#000000', 0.8) : mixColor(p, '#ffffff', 0.8)
  const borderSubtle = dark ? mixColor(p, '#000000', 0.4) : mixColor(p, '#ffffff', 0.6)
  const hover = mixColor(p, '#000000', 0.2)
  const ring = `0 0 0 0.25rem rgba(${rgb}, 0.25)`

  return `
${s} {
  --bs-primary: ${p}; --bs-primary-rgb: ${rgb}; --bs-blue: ${p};
  --bs-primary-text-emphasis: ${emphasis}; --bs-primary-bg-subtle: ${bgSubtle}; --bs-primary-border-subtle: ${borderSubtle};
  --bs-link-color: ${p}; --bs-link-color-rgb: ${rgb};
  --bs-link-hover-color: ${hover}; --bs-link-hover-color-rgb: ${hexToRgb(hover).join(', ')};
  --bs-focus-ring-color: rgba(${rgb}, 0.25);
}
${s} .btn-primary {
  --bs-btn-color: ${fg}; --bs-btn-bg: ${p}; --bs-btn-border-color: ${p};
  --bs-btn-hover-color: ${fg}; --bs-btn-hover-bg: ${mixColor(p, '#000000', 0.15)}; --bs-btn-hover-border-color: ${hover};
  --bs-btn-focus-shadow-rgb: ${rgb};
  --bs-btn-active-color: ${fg}; --bs-btn-active-bg: ${hover}; --bs-btn-active-border-color: ${mixColor(p, '#000000', 0.25)};
  --bs-btn-disabled-color: ${fg}; --bs-btn-disabled-bg: ${p}; --bs-btn-disabled-border-color: ${p};
}
${s} .btn-outline-primary {
  --bs-btn-color: ${p}; --bs-btn-border-color: ${p};
  --bs-btn-hover-color: ${fg}; --bs-btn-hover-bg: ${p}; --bs-btn-hover-border-color: ${p};
  --bs-btn-focus-shadow-rgb: ${rgb};
  --bs-btn-active-color: ${fg}; --bs-btn-active-bg: ${p}; --bs-btn-active-border-color: ${p};
  --bs-btn-disabled-color: ${p}; --bs-btn-disabled-border-color: ${p};
}
${s} .btn-link { --bs-btn-color: ${p}; --bs-btn-hover-color: ${hover}; }
${s} .dropdown-menu { --bs-dropdown-link-active-bg: ${p}; }
${s} .nav-pills { --bs-nav-pills-link-active-bg: ${p}; }
${s} .pagination {${dark ? '' : ` --bs-pagination-color: ${p};`} --bs-pagination-active-bg: ${p}; --bs-pagination-active-border-color: ${p}; --bs-pagination-focus-box-shadow: ${ring}; }
${s} .progress, ${s} .progress-stacked { --bs-progress-bar-bg: ${p}; }
${s} .list-group { --bs-list-group-active-bg: ${p}; --bs-list-group-active-border-color: ${p}; }
${s} .accordion { --bs-accordion-btn-focus-box-shadow: ${ring}; }
${s} .btn-close { --bs-btn-close-focus-shadow: ${ring}; }
${s} .form-control:focus, ${s} .form-select:focus, ${s} .form-check-input:focus, ${s} .nav-link:focus-visible { box-shadow: ${ring}; }
${s} .form-check-input:checked, ${s} .form-check-input[type="checkbox"]:indeterminate,
${s} .form-check .form-check-input.form-check-primary, ${s} .form-check.form-check-primary .form-check-input { background-color: ${p}; border-color: ${p}; }
${s} .form-range::-webkit-slider-thumb { background-color: ${p}; }
${s} .form-range::-moz-range-thumb { background-color: ${p}; }
${s} .alert-primary, ${s} .pricing .card-highlighted, ${s} .pricing .card-highlighted .card-body, ${s} .pricing .card-highlighted .card-footer { background-color: ${p}; }
${s} .bg-light-primary, ${s} .btn.btn-light-primary, ${s} .alert-light-primary { color: ${p}; background-color: rgba(${rgb}, 0.15); border-color: rgba(${rgb}, 0.2); }
${s} .sidebar-wrapper .menu .sidebar-item.active > .sidebar-link { background-color: ${p}; }
${s} .sidebar-wrapper .menu .sidebar-item.active > .sidebar-link span { color: ${fg}; }
${s} .sidebar-wrapper .menu .sidebar-item.active > .sidebar-link svg, ${s} .sidebar-wrapper .menu .sidebar-item.active > .sidebar-link i { fill: ${fg}; color: ${fg}; }
${s} .sidebar-wrapper .menu .submenu .submenu-item.active > a, ${s} .sidebar-wrapper .menu .submenu .submenu-item a:hover { color: ${p}; }
${s} .nav-pills .nav-link.active { box-shadow: 0 2px 10px rgba(${rgb}, 0.5); }
${s} .nav-tabs .nav-link:hover { text-shadow: 0 0 2px rgba(${rgb}, 0.3); }
${s} .nav-tabs .nav-link.active { color: ${p}; }
${s} .nav-tabs .nav-link.active:after { background-color: ${p}; box-shadow: 0 2px 5px rgba(${rgb}, 0.5); }
${s} .pagination.pagination-primary .page-item.active .page-link { background-color: ${p}; border-color: ${p}; box-shadow: 0 2px 5px rgba(${rgb}, 0.3); }
${s} .progress.progress-primary .progress-bar { background-color: ${p}; }
${s} .comment-time { color: ${p}; }
${dark ? '' : `${s} .layout-horizontal .main-navbar { background-color: ${p}; }`}`
}

function bodyBgCss(t, bg) {
  const s = `html[data-bs-theme="${t}"]`
  return `
${s} { --bs-body-bg: ${bg}; --bs-body-bg-rgb: ${hexToRgb(bg).join(', ')}; }
${s} .nav-tabs { --bs-nav-tabs-link-active-bg: ${bg}; }
${s} .divider .divider-text { background-color: ${bg}; }
${t === 'dark' ? `${s} .pagination { --bs-pagination-bg: ${bg}; --bs-pagination-border-color: ${bg}; --bs-pagination-hover-border-color: ${bg}; }
${s} .list-group { --bs-list-group-bg: ${bg}; }` : ''}`
}

function surfaceBgCss(t, bg) {
  const s = `html[data-bs-theme="${t}"]`
  return `
${s} { --swal2-background: ${bg}; }
${s} .card { --bs-card-bg: ${bg}; --bs-card-cap-bg: ${bg}; }
${s} .modal { --bs-modal-bg: ${bg}; }
${s} .sidebar-wrapper, ${s} .layout-horizontal .header-top { background-color: ${bg}; }`
}

function textCss(t, c) {
  const s = `html[data-bs-theme="${t}"]`
  const rgb = hexToRgb(c).join(', ')
  return `
${s} {
  --bs-body-color: ${c}; --bs-body-color-rgb: ${rgb}; --bs-highlight-color: ${c};
  --bs-secondary-color: rgba(${rgb}, 0.75); --bs-secondary-color-rgb: ${rgb};
  --bs-tertiary-color: rgba(${rgb}, 0.5); --bs-tertiary-color-rgb: ${rgb};
}
${s} .table { --bs-table-color: ${c}; --bs-table-striped-color: ${c}; --bs-table-active-color: ${c};${t === 'dark' ? '' : ` --bs-table-hover-color: ${c};`} }
${s} .form-label, ${s} .col-form-label, ${s} .form-control, ${s} .form-control:focus, ${s} .form-control-plaintext, ${s} .form-select,
${s} .choices__input, ${s} .navbar-top .notification-item a { color: ${c}; }
${s} .dropdown-menu { --bs-dropdown-color: ${c}; }
${s} .accordion { --bs-accordion-color: ${c}; --bs-accordion-btn-color: ${c}; }
${s} .list-group { --bs-list-group-action-active-color: ${c}; }
${s} .popover { --bs-popover-body-color: ${c}; }
${s} .toast { --bs-toast-color: ${c}; }
${t === 'dark' ? `${s} .sidebar-wrapper .menu .sidebar-title, ${s} .sidebar-wrapper .menu .sidebar-link, ${s} .sidebar-wrapper .menu .submenu .submenu-item a, ${s} .theme-toggle { color: ${c}; }` : ''}`
}

function headingCss(t, c) {
  const s = `html[data-bs-theme="${t}"]`
  return `
${s} { --bs-heading-color: ${c}; }
${s} .card { --bs-card-title-color: ${c}; }
${t === 'light' ? `${s} .sidebar-wrapper .menu .sidebar-title, ${s} .sidebar-wrapper .menu .sidebar-link, ${s} .sidebar-wrapper .menu .submenu .submenu-item a { color: ${c}; }` : ''}`
}

function themeColorsCss(colors) {
  return ['light', 'dark'].map(t => {
    const c = colors[t] || {}
    return (c.primary ? primaryCss(t, c.primary) : '')
      + (c.bodyBg ? bodyBgCss(t, c.bodyBg) : '')
      + (c.surfaceBg ? surfaceBgCss(t, c.surfaceBg) : '')
      + (c.textColor ? textCss(t, c.textColor) : '')
      + (c.headingColor ? headingCss(t, c.headingColor) : '')
  }).join('')
}

/**
 * Inject (or remove) the <style> that overrides Mazer colors.
 * It is appended to <head> after app.css/app-dark.css, so it wins on equal specificity.
 */
function applyThemeColors(colors = getThemeColors()) {
  const css = themeColorsCss(colors)
  let style = document.getElementById(THEME_COLORS_STYLE_ID)

  if (!css) {
    if (style) style.remove()
    return
  }
  if (!style) {
    style = document.createElement('style')
    style.id = THEME_COLORS_STYLE_ID
    document.head.appendChild(style)
  }
  style.textContent = css
}

applyThemeColors()
