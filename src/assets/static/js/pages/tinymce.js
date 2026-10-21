document.addEventListener("DOMContentLoaded", () => {

  const themeOptions = document.body.classList.contains("dark")
    ? {
        skin: "oxide-dark",
        content_css: "dark",
      }
    : {
        skin: "oxide",
        content_css: "default",
      }

  // TinyMCE 7+ requires a license key; "gpl" is the open-source license
  themeOptions.license_key = "gpl"

  tinymce.init({ selector: "#default", ...themeOptions })
  tinymce.init({
    selector: "#dark",
    toolbar:
      "undo redo styles bold italic alignleft aligncenter alignright bullist numlist outdent indent code",
    plugins: "code",
    ...themeOptions,
  })
})
