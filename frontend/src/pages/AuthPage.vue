<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { login, register } from '@/api/auth'
import { getPasswordStrength } from '@/utils/passwordStrength'
import BaseInput from '@/components/BaseInput.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCheckbox from '@/components/BaseCheckbox.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

// view: 'login' | 'register' | 'blocked' | 'verify'
const view = ref(route.query.mode === 'register' ? 'register' : 'login')
const mode = computed(() => (view.value === 'register' ? 'register' : 'login'))
const loading = ref(false)

watch(
  () => route.query.mode,
  (m) => {
    view.value = m === 'register' ? 'register' : 'login'
  },
)

function setMode(m) {
  view.value = m
  router.replace({ name: 'login', query: m === 'register' ? { mode: 'register' } : {} })
  clearErrors()
}

const loginForm = reactive({ identifier: '', password: '', remember: false })
const regForm = reactive({ username: '', email: '', password: '', confirm: '', terms: false })
const errors = reactive({})

function clearErrors() {
  Object.keys(errors).forEach((k) => delete errors[k])
}

const strength = computed(() => getPasswordStrength(regForm.password))

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function submitLogin() {
  clearErrors()
  if (!loginForm.identifier.trim()) errors.identifier = 'Enter your username or email.'
  if (!loginForm.password) errors.password = 'Enter your password.'
  if (Object.keys(errors).length) return

  loading.value = true
  try {
    const user = await login(loginForm.identifier, loginForm.password)
    auth.fakeLogin(user.role, user.username)
    toast.show(`Welcome back, ${user.username}!`)
    router.push('/')
  } catch (e) {
    errors.password = e.message
  } finally {
    loading.value = false
  }
}

async function submitRegister() {
  clearErrors()
  const u = regForm.username.trim()
  if (u.length < 3) errors.username = 'Username must be at least 3 characters.'
  if (!emailPattern.test(regForm.email.trim())) errors.email = 'Enter a valid email address.'
  if (regForm.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (regForm.confirm !== regForm.password) errors.confirm = 'Passwords do not match.'
  if (!regForm.terms) errors.terms = 'You must accept the terms to continue.'
  if (Object.keys(errors).length) return

  loading.value = true
  try {
    await register({
      username: regForm.username,
      email: regForm.email,
      password: regForm.password,
    })
    view.value = 'verify'
  } catch (e) {
    if (e.code === 'DEVICE_BLOCKED') view.value = 'blocked'
    else if (e.field) errors[e.field] = e.message
    else errors.username = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth">
    <!-- Brand panel -->
    <section class="brand">
      <img src="/logo.png" alt="FrameRate" class="brand__logo" />
      <div class="brand__collage" aria-hidden="true">
        <span v-for="n in 6" :key="n" class="brand__tile" :style="{ '--i': n }" />
      </div>
      <h1 class="brand__title">
        Rate what you watch.<br />Find what’s <span class="brand__accent">next.</span>
      </h1>
      <p class="brand__text">Join movie lovers who rate, review, and watch together.</p>
    </section>

    <!-- Form card -->
    <section class="panel">
      <div class="card">
        <!-- Pill toggle -->
        <div v-if="view === 'login' || view === 'register'" class="pill" role="tablist">
          <button
            type="button"
            role="tab"
            :aria-selected="mode === 'login'"
            :class="['pill__btn', { 'is-active': mode === 'login' }]"
            @click="setMode('login')"
          >
            Log in
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="mode === 'register'"
            :class="['pill__btn', { 'is-active': mode === 'register' }]"
            @click="setMode('register')"
          >
            Register
          </button>
        </div>

        <!-- LOGIN -->
        <form v-if="view === 'login'" class="form" novalidate @submit.prevent="submitLogin">
          <h2 class="form__title">Welcome back.</h2>
          <BaseInput
            v-model="loginForm.identifier"
            label="Username or email"
            placeholder="Enter your username or email"
            :error="errors.identifier"
          />
          <BaseInput
            v-model="loginForm.password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            :error="errors.password"
          />
          <div class="row">
            <BaseCheckbox v-model="loginForm.remember" label="Remember me" />
            <a href="#" class="link" @click.prevent="toast.show('Password reset is not available yet.', 'error')">
              Forgot password?
            </a>
          </div>
          <BaseButton type="submit" :disabled="loading">{{ loading ? 'Logging in…' : 'Log in' }}</BaseButton>
          <p class="switch">
            Don’t have an account?
            <button type="button" class="link" @click="setMode('register')">Register</button>
          </p>
          <p class="hint">Demo: demo_user / Password1! (moderator: mod_demo)</p>
        </form>

        <!-- REGISTER -->
        <form v-else-if="view === 'register'" class="form" novalidate @submit.prevent="submitRegister">
          <h2 class="form__title">Create account.</h2>
          <BaseInput v-model="regForm.username" label="Username" placeholder="Choose a username" :error="errors.username" />
          <BaseInput v-model="regForm.email" label="Email" type="email" placeholder="you@example.com" :error="errors.email" />
          <div>
            <BaseInput
              v-model="regForm.password"
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              :error="errors.password"
            />
            <div v-if="regForm.password" class="strength">
              <div class="strength__bar">
                <span
                  v-for="n in 4"
                  :key="n"
                  :class="['strength__seg', { [`is-level-${strength.level}`]: n <= strength.level }]"
                />
              </div>
              <span class="strength__text">{{ strength.label }}</span>
            </div>
          </div>
          <BaseInput
            v-model="regForm.confirm"
            label="Confirm password"
            type="password"
            placeholder="Re-enter your password"
            :error="errors.confirm"
          />
          <div>
            <BaseCheckbox v-model="regForm.terms" :error="errors.terms">
              I agree to the Terms and Privacy Policy.
            </BaseCheckbox>
            <p class="note">A random device identifier is stored on this device to help prevent duplicate accounts.</p>
          </div>
          <BaseButton type="submit" :disabled="loading">{{ loading ? 'Creating…' : 'Create account' }}</BaseButton>
          <p class="switch">
            Already have an account?
            <button type="button" class="link" @click="setMode('login')">Log in</button>
          </p>
        </form>

        <!-- DEVICE BLOCKED -->
        <div v-else-if="view === 'blocked'" class="message">
          <div class="message__icon message__icon--warn" aria-hidden="true">!</div>
          <h2 class="form__title">Account already exists</h2>
          <p class="message__text">An account already exists on this device. Log in instead.</p>
          <BaseButton @click="setMode('login')">Log in</BaseButton>
        </div>

        <!-- VERIFY EMAIL -->
        <div v-else class="message">
          <div class="message__icon message__icon--ok" aria-hidden="true">✓</div>
          <h2 class="form__title">Check your email</h2>
          <p class="message__text">
            We sent a verification email to <strong>{{ regForm.email }}</strong>. Open it to finish creating your account.
          </p>
          <BaseButton variant="secondary" @click="setMode('login')">Back to log in</BaseButton>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.auth {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

/* Brand panel */
.brand {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-6);
  padding: var(--space-8) 64px;
  background: linear-gradient(160deg, var(--color-surface) 0%, var(--color-bg) 100%);
  border-right: 1px solid var(--color-border);
}
.brand__logo { height: 40px; width: auto; align-self: flex-start; }
.brand__collage {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  max-width: 420px;
}
.brand__tile {
  aspect-ratio: 2 / 3;
  border-radius: var(--radius-md);
  background: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  opacity: calc(0.4 + var(--i) * 0.1);
}
.brand__title { font-size: var(--text-2xl); }
.brand__accent { color: var(--color-primary); }
.brand__text { max-width: 420px; color: var(--color-text-muted); }

/* Form panel */
.panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}
.card {
  width: 100%;
  max-width: 440px;
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

/* Pill toggle */
.pill {
  display: flex;
  padding: 4px;
  margin-bottom: var(--space-6);
  background: var(--color-bg);
  border-radius: var(--radius-pill);
}
.pill__btn {
  flex: 1;
  padding: 8px var(--space-4);
  border-radius: var(--radius-pill);
  color: var(--color-text-muted);
  font-weight: 600;
  transition: background 0.15s, color 0.15s;
}
.pill__btn:hover { color: var(--color-text); }
.pill__btn.is-active { background: var(--color-primary); color: #1a1205; }

/* Form */
.form { display: flex; flex-direction: column; gap: var(--space-4); }
.form__title { margin-bottom: var(--space-2); text-align: center; }
.row { display: flex; align-items: center; justify-content: space-between; }
.link {
  color: var(--color-nav-active);
  font-size: var(--text-sm);
  text-decoration: none;
}
.link:hover { text-decoration: underline; }
.switch { text-align: center; color: var(--color-text-muted); font-size: var(--text-sm); }
.hint { text-align: center; color: var(--color-text-muted); font-size: 12px; }
.note { margin-top: var(--space-2); color: var(--color-text-muted); font-size: 12px; }

/* Password strength */
.strength { display: flex; align-items: center; gap: var(--space-3); margin-top: var(--space-2); }
.strength__bar { flex: 1; display: flex; gap: 4px; }
.strength__seg { flex: 1; height: 6px; border-radius: var(--radius-pill); background: var(--color-border); }
.strength__seg.is-level-1 { background: var(--color-danger); }
.strength__seg.is-level-2 { background: var(--color-primary); }
.strength__seg.is-level-3,
.strength__seg.is-level-4 { background: var(--color-score); }
.strength__text { font-size: var(--text-sm); color: var(--color-text-muted); min-width: 48px; }

/* Message cards */
.message { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); text-align: center; }
.message__icon {
  display: flex; align-items: center; justify-content: center;
  width: 56px; height: 56px;
  border-radius: 50%;
  font-size: 28px; font-weight: 700;
}
.message__icon--warn { background: var(--color-primary); color: #1a1205; }
.message__icon--ok { background: var(--color-score); color: #06260f; }
.message__text { color: var(--color-text-muted); }
.message__text strong { color: var(--color-text); }
</style>