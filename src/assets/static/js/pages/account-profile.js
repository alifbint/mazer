// "Edit Profile" button in the header opens the matching tab
document.querySelectorAll("[data-profile-tab]").forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault()
    const tab = document.querySelector(`[data-bs-toggle="tab"][href="${button.getAttribute("href")}"]`)
    bootstrap.Tab.getOrCreateInstance(tab).show()
    tab.scrollIntoView({ behavior: "smooth", block: "start" })
  })
})
