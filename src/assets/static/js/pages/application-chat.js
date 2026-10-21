const contacts = document.getElementById("chat-contacts")
const messages = document.getElementById("chat-messages")
const form = document.getElementById("chat-form")
const input = document.getElementById("chat-input")

// Demo conversations, keyed by data-chat on the contact. `left` = message from the contact.
const conversations = {
  alfy: null, // rendered from the markup
  jane: [
    { left: true, text: "Hey! Do you have a minute?" },
    { left: true, text: "Can you review my pull request?" },
  ],
  michael: [
    { left: false, text: "Are we still meeting at 1 PM?" },
    { left: true, text: "The meeting is moved to 3 PM" },
  ],
  sarah: [
    { left: false, text: "I fixed the dark mode issue on the modal" },
    { left: true, text: "Thanks for the help!" },
  ],
  david: [
    { left: true, text: "Let's finish the report tomorrow" },
    { left: false, text: "See you tomorrow" },
  ],
}

const content = () => messages.querySelector(".chat-content")

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight
}

function createMessage(text, left) {
  const chat = document.createElement("div")
  chat.className = left ? "chat chat-left" : "chat"
  const body = document.createElement("div")
  body.className = "chat-body"
  const message = document.createElement("div")
  message.className = "chat-message"
  message.textContent = text
  body.appendChild(message)
  chat.appendChild(body)
  return chat
}

function renderConversation(key) {
  if (conversations[key] === null) {
    // Keep the original markup the first time, then remember it
    conversations[key] = [...content().querySelectorAll(".chat")].flatMap((chat) =>
      [...chat.querySelectorAll(".chat-message")].map((m) => ({
        left: chat.classList.contains("chat-left"),
        text: m.textContent,
      }))
    )
  }
  const container = content()
  container.querySelectorAll(".chat").forEach((chat) => chat.remove())
  conversations[key].forEach((m) => container.appendChild(createMessage(m.text, m.left)))
  scrollToBottom()
}

function currentContact() {
  return contacts.querySelector(".list-group-item.active")
}

// Switch conversation
contacts.addEventListener("click", (e) => {
  const item = e.target.closest(".list-group-item")
  if (!item) return
  e.preventDefault()
  const previous = currentContact()
  if (previous === item) return

  // Save the open conversation before switching
  renderConversation(previous.dataset.chat)
  previous.classList.remove("active")
  item.classList.add("active")
  item.querySelector("[data-unread]")?.remove()

  document.getElementById("chat-name").textContent = item.dataset.name
  document.getElementById("chat-status").textContent = item.dataset.status
  const avatar = document.getElementById("chat-avatar")
  avatar.src = item.dataset.avatar
  avatar.alt = item.dataset.name
  avatar.nextElementSibling.className = item.querySelector(".avatar-status").className

  renderConversation(item.dataset.chat)
  input.focus()
})

// Send a message
form.addEventListener("submit", (e) => {
  e.preventDefault()
  const text = input.value.trim()
  if (!text) return
  const key = currentContact().dataset.chat
  if (conversations[key] === null) renderConversation(key)
  conversations[key].push({ left: false, text })
  content().appendChild(createMessage(text, false))
  currentContact().querySelector("[data-last-message]").textContent = text
  input.value = ""
  scrollToBottom()
})

// Filter contacts by name
document.getElementById("chat-search").addEventListener("input", (e) => {
  const query = e.target.value.trim().toLowerCase()
  let visible = 0
  contacts.querySelectorAll(".list-group-item").forEach((item) => {
    const match = item.dataset.name.toLowerCase().includes(query)
    item.classList.toggle("d-none", !match)
    if (match) visible++
  })
  document.getElementById("chat-no-contacts").classList.toggle("d-none", visible > 0)
})

// Clear the open conversation
document.getElementById("chat-clear").addEventListener("click", (e) => {
  e.preventDefault()
  conversations[currentContact().dataset.chat] = []
  content().querySelectorAll(".chat").forEach((chat) => chat.remove())
})

scrollToBottom()
