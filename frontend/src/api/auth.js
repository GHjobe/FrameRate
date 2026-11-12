import { users } from '@/mocks/users'

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const login = async (identifier, password) => {
  await wait()
  const id = identifier.trim().toLowerCase()
  const user = users.find(
    (u) => u.username.toLowerCase() === id || u.email.toLowerCase() === id,
  )
  if (!user || user.password !== password) {
    throw new Error('Invalid username/email or password.')
  }
  return { username: user.username, role: user.role }
}

export const register = async ({ username, email, password }) => {
  await wait()
  // Fake rule: the username "blocked" simulates a device that already has an account
  if (username.trim().toLowerCase() === 'blocked') {
    const err = new Error('device-blocked')
    err.code = 'DEVICE_BLOCKED'
    throw err
  }
  if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
    const err = new Error('That username is already taken.')
    err.field = 'username'
    throw err
  }
  if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    const err = new Error('That email is already registered.')
    err.field = 'email'
    throw err
  }
  // In-memory only: lost on page refresh (mock)
  users.push({ username: username.trim(), email: email.trim(), password, role: 'user' })
  return { ok: true }
}