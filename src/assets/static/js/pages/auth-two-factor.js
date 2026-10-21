const otpInputs = Array.from(document.querySelectorAll("#otp-inputs input"))
const otpSubmit = document.getElementById("otp-submit")
const otpResend = document.getElementById("otp-resend")
const otpCountdown = document.getElementById("otp-countdown")

const updateSubmit = () => {
  otpSubmit.disabled = !otpInputs.every((input) => input.value !== "")
}

// Fill inputs starting at `index` with the given digits, then focus the next empty one
const fillFrom = (index, digits) => {
  digits.split("").forEach((digit, i) => {
    if (otpInputs[index + i]) otpInputs[index + i].value = digit
  })
  const next = otpInputs[Math.min(index + digits.length, otpInputs.length - 1)]
  next.focus()
  next.select()
  updateSubmit()
}

otpInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    const digits = input.value.replace(/\D/g, "")
    input.value = ""
    if (digits) fillFrom(index, digits)
    else updateSubmit()
  })

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && input.value === "" && index > 0) {
      otpInputs[index - 1].value = ""
      otpInputs[index - 1].focus()
      updateSubmit()
      e.preventDefault()
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputs[index - 1].focus()
      e.preventDefault()
    } else if (e.key === "ArrowRight" && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus()
      e.preventDefault()
    }
  })

  input.addEventListener("paste", (e) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "")
    e.preventDefault()
    if (digits) fillFrom(index, digits.slice(0, otpInputs.length - index))
  })

  input.addEventListener("focus", () => input.select())
})

// Resend countdown
let countdownTimer
const startCountdown = (seconds) => {
  otpResend.disabled = true
  otpCountdown.textContent = `(${seconds}s)`
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    seconds--
    if (seconds <= 0) {
      clearInterval(countdownTimer)
      otpResend.disabled = false
      otpCountdown.textContent = ""
    } else {
      otpCountdown.textContent = `(${seconds}s)`
    }
  }, 1000)
}

otpResend.addEventListener("click", () => {
  otpInputs.forEach((input) => (input.value = ""))
  otpInputs[0].focus()
  updateSubmit()
  startCountdown(30)
})

// Recovery code toggle (auth layout doesn't load Bootstrap JS)
const recoveryToggle = document.getElementById("recovery-toggle")
const recoveryCode = document.getElementById("recovery-code")
recoveryToggle.addEventListener("click", () => {
  const open = recoveryCode.classList.toggle("show")
  recoveryToggle.setAttribute("aria-expanded", open)
  if (open) document.getElementById("recovery-input").focus()
})

startCountdown(30)
otpInputs[0].focus()
