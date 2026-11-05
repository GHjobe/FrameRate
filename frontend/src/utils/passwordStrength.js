export function getPasswordStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (!password) return { level: 0, label: '' }
  if (score <= 2) return { level: 1, label: 'Weak' }
  if (score === 3) return { level: 2, label: 'Fair' }
  if (score === 4) return { level: 3, label: 'Good' }
  return { level: 4, label: 'Strong' }
}