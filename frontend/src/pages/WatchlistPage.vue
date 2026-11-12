<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getWatchlist, updateWatchlistStatus, removeFromWatchlist, WATCHLIST_STATUSES } from '@/api/watchlist'
import { getMovies } from '@/api/movies'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import BaseAvatar from '@/components/BaseAvatar.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseDropdown from '@/components/BaseDropdown.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseTabs from '@/components/BaseTabs.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const state = ref('loading') // loading | ready | error
const items = ref([]) // watchlist entries joined with their movie: { movieId, status, dateAdded, movie }
let requestId = 0

const activeTab = ref(WATCHLIST_STATUSES[0].value)
const query = ref('') // title search, applied to the current tab
const sortBy = ref('added-desc')
const busyId = ref(null) // movie id with a change in progress
const confirmingId = ref(null) // movie id showing the inline "Remove? Yes / No"

const username = computed(() => auth.user?.username ?? '')

// Tab counts come from the full list, so they stay correct whatever the tab or search.
const tabs = computed(() =>
  WATCHLIST_STATUSES.map((s) => ({
    key: s.value,
    label: s.label,
    count: items.value.filter((i) => i.status === s.value).length,
  })),
)
const activeLabel = computed(() => WATCHLIST_STATUSES.find((s) => s.value === activeTab.value)?.label ?? '')

// Newest first for now (the sort dropdown comes later).
const SORT_OPTIONS = [
  { value: 'added-desc', label: 'Date added (newest)' },
  { value: 'added-asc', label: 'Date added (oldest)' },
  { value: 'title', label: 'Title (A–Z)' },
  { value: 'year-desc', label: 'Year (newest)' },
]
const sorters = {
  'added-desc': (a, b) => b.dateAdded.localeCompare(a.dateAdded),
  'added-asc': (a, b) => a.dateAdded.localeCompare(b.dateAdded),
  title: (a, b) => a.movie.title.localeCompare(b.movie.title),
  'year-desc': (a, b) => b.movie.year - a.movie.year || b.dateAdded.localeCompare(a.dateAdded),
}

// Rows of the current tab, filtered by the search box and ordered by the sort dropdown.
const rows = computed(() => {
  const q = query.value.trim().toLowerCase()
  return items.value
    .filter((i) => i.status === activeTab.value && (!q || i.movie.title.toLowerCase().includes(q)))
    .sort(sorters[sortBy.value])
})

const emptyMessage = computed(() => {
  const q = query.value.trim()
  const tabHasMovies = items.value.some((i) => i.status === activeTab.value)
  return q && tabHasMovies ? `No results for “${q}” in ${activeLabel.value}.` : `No movies in ${activeLabel.value} yet.`
})

// Switching tab closes any open "Remove?" question.
watch(activeTab, () => { confirmingId.value = null })

const labelFor = (status) => WATCHLIST_STATUSES.find((s) => s.value === status)?.label ?? status

// Saves to the mock data through the API, then updates the row. The row moves to its new tab and the counts follow.
async function changeStatus(item, status) {
  if (status === item.status) return
  busyId.value = item.movieId
  try {
    await updateWatchlistStatus(item.movieId, status)
    item.status = status
    toast.show(`${item.movie.title} moved to ${labelFor(status)}`)
  } catch {
    toast.show('Could not update the status', 'error')
  } finally {
    busyId.value = null
  }
}

async function removeItem(item) {
  busyId.value = item.movieId
  try {
    await removeFromWatchlist(item.movieId)
    items.value = items.value.filter((i) => i.movieId !== item.movieId)
    toast.show(`${item.movie.title} was removed from your watchlist`)
  } catch {
    toast.show('Could not remove this movie', 'error')
  } finally {
    busyId.value = null
    confirmingId.value = null
  }
}

const formatRuntime = (mins) => {
  if (!mins) return ''
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h ? `${h}h ${m}m` : `${m}m`
}

// 2026-10-15 -> October 15, 2026 (parsed as a local date so the day never shifts)
const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

// The watchlist only has movie ids, so join it with the movie list for poster, title, year and runtime.
async function load() {
  const current = ++requestId
  state.value = 'loading'
  try {
    const [list, movies] = await Promise.all([getWatchlist(), getMovies()])
    if (current !== requestId) return
    const byId = new Map((movies ?? []).map((m) => [m.id, m]))
    items.value = (list ?? [])
      .filter((w) => byId.has(w.movieId))
      .map((w) => ({ ...w, movie: byId.get(w.movieId) }))
    state.value = 'ready'
  } catch {
    if (current === requestId) state.value = 'error'
  }
}

watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) load()
  },
  { immediate: true },
)
</script>

<template>
  <main class="watchlist">
    <!-- Guests should not normally get here; show a short message instead of an empty page -->
    <section v-if="!auth.isLoggedIn" class="container watchlist__guest">
      <h1>Your Watchlist</h1>
      <p>Log in to see your watchlist.</p>
      <BaseButton @click="router.push({ name: 'login' })">Log In</BaseButton>
    </section>

    <template v-else>
      <!-- Banner -->
      <section class="banner">
        <div class="container banner__inner">
          <BaseAvatar :name="username" :size="120" />
          <h1 class="banner__title">{{ username }}’s Watchlist</h1>
        </div>
      </section>

      <div class="container watchlist__body">
        <div v-if="state === 'loading'" class="watchlist__loading" aria-busy="true">
          <SkeletonLoader height="40px" />
          <SkeletonLoader height="56px" />
          <SkeletonLoader height="56px" />
          <SkeletonLoader height="56px" />
        </div>

        <div v-else-if="state === 'error'" class="watchlist__message">
          <p>We couldn’t load your watchlist. Please try again.</p>
          <BaseButton @click="load">Try again</BaseButton>
        </div>

        <template v-else>
          <BaseTabs v-model="activeTab" :tabs="tabs" />

          <div class="watchlist__grid">
          <div class="card">
            <p v-if="!rows.length" class="card__empty">{{ emptyMessage }}</p>

            <div v-else class="table-wrap">
              <table class="wl">
                <thead>
                  <tr>
                    <th class="wl__movie">Movie / Series</th>
                    <th>Status</th>
                    <th>Date Added</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in rows" :key="item.movieId">
                    <td class="wl__movie">
                      <RouterLink :to="`/movie/${item.movie.id}`" class="wl__link">
                        <span class="wl__poster">
                          <img v-if="item.movie.poster" :src="item.movie.poster" :alt="item.movie.title" />
                          <span v-else>{{ item.movie.title.charAt(0) }}</span>
                        </span>
                        <span class="wl__info">
                          <span class="wl__title">{{ item.movie.title }}</span>
                          <span class="wl__meta">{{ item.movie.year }}</span>
                          <span class="wl__meta">{{ formatRuntime(item.movie.runtime) }}</span>
                        </span>
                      </RouterLink>
                    </td>
                    <td class="wl__status">
                      <BaseDropdown
                        :model-value="item.status"
                        :options="WATCHLIST_STATUSES"
                        :disabled="busyId === item.movieId"
                        @update:modelValue="(status) => changeStatus(item, status)"
                      />
                    </td>
                    <td class="wl__date">{{ formatDate(item.dateAdded) }}</td>
                    <td class="wl__remove">
                      <div v-if="confirmingId === item.movieId" class="wl__confirm" role="group" :aria-label="`Remove ${item.movie.title}?`">
                        <span>Remove?</span>
                        <BaseButton variant="danger" :disabled="busyId === item.movieId" @click="removeItem(item)">Yes</BaseButton>
                        <BaseButton variant="text" @click="confirmingId = null">No</BaseButton>
                      </div>
                      <BaseButton
                        v-else
                        variant="text"
                        :aria-label="`Remove ${item.movie.title}`"
                        @click="confirmingId = item.movieId"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </BaseButton>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <aside class="side" aria-label="Search and sort">
            <h2 class="side__title">Search</h2>
            <div class="search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <BaseInput v-model="query" placeholder="Search by title" />
            </div>
            <BaseDropdown v-model="sortBy" label="Sort by" :options="SORT_OPTIONS" />
          </aside>
          </div>
        </template>
      </div>
    </template>
  </main>
</template>

<style scoped>
.muted { color: var(--color-text-muted); font-size: var(--text-sm); }

.watchlist__guest { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-3); padding-top: var(--space-8); padding-bottom: var(--space-8); }
.watchlist__guest h1 { font-family: var(--font-heading); font-size: var(--text-xl); }
.watchlist__guest p { color: var(--color-text-muted); }

/* Banner: plain default look (no image) */
.banner {
  background: linear-gradient(135deg, var(--color-surface-hover) 0%, var(--color-bg) 75%);
  border-bottom: 1px solid var(--color-border);
}
.banner__inner { display: flex; align-items: center; gap: var(--space-8); padding-top: var(--space-8); padding-bottom: var(--space-8); }
.banner__title {
  font-family: var(--font-body); font-size: var(--text-2xl); font-weight: 700; line-height: 1.15;
  min-width: 0; overflow-wrap: anywhere;
}

.watchlist__body { padding-top: var(--space-6); padding-bottom: var(--space-8); }
.watchlist__loading { display: flex; flex-direction: column; gap: var(--space-3); }
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.watchlist__grid { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: var(--space-6); align-items: start; margin-top: var(--space-4); }
.side { display: flex; flex-direction: column; gap: var(--space-3); }
.side__title { font-family: var(--font-heading); font-size: var(--text-lg); }
.search { position: relative; }
.search svg { position: absolute; left: var(--space-3); top: 50%; transform: translateY(-50%); color: var(--color-text-muted); pointer-events: none; }
.search :deep(.field__control) { padding-left: 40px; width: 100%; }
.card__empty { padding: var(--space-8) var(--space-6); text-align: center; color: var(--color-text-muted); }
.table-wrap { overflow-x: auto; }
.wl { width: 100%; min-width: 620px; border-collapse: collapse; }
.wl th {
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-muted); font-size: var(--text-sm); font-weight: 600; text-align: center;
  border-bottom: 1px solid var(--color-border);
}
.wl td { padding: var(--space-3) var(--space-4); text-align: center; vertical-align: middle; }
.wl tbody tr + tr td { border-top: 1px solid var(--color-border); }
.wl .wl__movie { text-align: left; }
.wl__link { display: flex; align-items: center; gap: var(--space-3); color: inherit; text-decoration: none; }
.wl__link:hover .wl__title { color: var(--color-primary); }
.wl__poster {
  flex-shrink: 0; width: 44px; aspect-ratio: 2 / 3;
  border-radius: var(--radius-sm); overflow: hidden;
  background: var(--color-bg); border: 1px solid var(--color-border);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-muted); font-weight: 600;
}
.wl__poster img { width: 100%; height: 100%; object-fit: cover; }
.wl__info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.wl__title { font-weight: 600; font-size: var(--text-sm); transition: color 0.15s; }
.wl__meta { color: var(--color-text-muted); font-size: 0.75rem; }
.wl__status { width: 190px; }
.wl__date { font-weight: 600; font-size: var(--text-sm); white-space: nowrap; }
.wl__remove { width: 190px; }
.wl__confirm { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: var(--space-2); font-size: var(--text-sm); }

.watchlist__message { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-3); color: var(--color-text-muted); }

@media (max-width: 900px) {
  .watchlist__grid { grid-template-columns: minmax(0, 1fr); }
  .side { order: -1; }
}

@media (max-width: 700px) {
  .banner__inner { flex-direction: column; align-items: flex-start; gap: var(--space-4); }
  .banner__title { font-size: var(--text-xl); }
}
</style>