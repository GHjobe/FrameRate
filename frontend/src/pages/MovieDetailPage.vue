<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMovie, getSimilarMovies } from '@/api/movies'
import { submitReport } from '@/api/reports'
import { getReviews, addReview, updateReview, toggleHelpful, deleteReview } from '@/api/reviews'
import { getWatchlist, addToWatchlist, updateWatchlistStatus, removeFromWatchlist } from '@/api/watchlist'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import BaseButton from '@/components/BaseButton.vue'
import BaseDropdown from '@/components/BaseDropdown.vue'
import BaseTabs from '@/components/BaseTabs.vue'
import BaseTag from '@/components/BaseTag.vue'
import MovieCard from '@/components/MovieCard.vue'
import RateReviewPanel from '@/components/RateReviewPanel.vue'
import ReportPanel from '@/components/ReportPanel.vue'
import ReviewCard from '@/components/ReviewCard.vue'
import ScoreBadge from '@/components/ScoreBadge.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const state = ref('loading') // loading | ready | notfound | error
const movie = ref(null)
const similar = ref([])
const PAGE_SIZE = 5
const reviews = ref([])
const visibleCount = ref(PAGE_SIZE)
const saving = ref(false)
const reporting = ref(false)
const reportOverride = ref(null) // set when a review is being reported; null = report the movie
const reportKey = ref(0) // bumped after a report is sent so the form starts fresh
const quickAccessEl = ref(null)
const watchlist = ref([])
const activeTab = ref('overview')
let requestId = 0

// ---------- data loading ----------
// Copy items so Vue sees changes made to the mock array by the API layer.
const refreshWatchlist = async () => {
  const list = auth.isLoggedIn ? await getWatchlist() : []
  watchlist.value = (list ?? []).map((item) => ({ ...item }))
}

async function load(id) {
  const current = ++requestId
  state.value = 'loading'
  activeTab.value = 'overview'
  reportOverride.value = null
  try {
    const [m, sim, , revs] = await Promise.all([getMovie(id), getSimilarMovies(id), refreshWatchlist(), getReviews(id)])
    if (current !== requestId) return // a newer navigation took over
    movie.value = m ?? null
    similar.value = sim ?? []
    reviews.value = revs ?? []
    visibleCount.value = PAGE_SIZE
    state.value = m ? 'ready' : 'notfound'
  } catch {
    if (current !== requestId) return
    state.value = 'error'
  }
}

watch(
  () => [route.params.id, auth.isLoggedIn],
  ([id]) => load(id),
  { immediate: true },
)

// ---------- display helpers ----------
const runtimeLabel = computed(() => {
  const mins = movie.value?.runtime
  if (!mins) return ''
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h ? `${h}h ${m}m` : `${m}m`
})

const hasScore = computed(() => typeof movie.value?.score === 'number')
const hasRatings = computed(() => typeof movie.value?.ratings === 'number')

const backdropStyle = computed(() =>
  movie.value?.backdrop ? { backgroundImage: `url("${movie.value.backdrop}")` } : {},
)

const distribution = computed(() => {
  const d = movie.value?.distribution
  const counts = [5, 4, 3, 2, 1].map((star) => ({ star, count: Number(d?.[star]) || 0 }))
  const total = counts.reduce((sum, row) => sum + row.count, 0)
  return {
    hasData: total > 0,
    rows: counts.map((row) => ({ ...row, pct: total ? Math.round((row.count / total) * 100) : 0 })),
  }
})

const providerGroups = [
  { key: 'stream', label: 'Stream' },
  { key: 'rent', label: 'Rent' },
  { key: 'buy', label: 'Buy' },
  { key: 'other', label: 'Others' },
]
const visibleProviderGroups = computed(() =>
  providerGroups
    .map((g) => ({ ...g, items: movie.value?.providers?.[g.key] ?? [] }))
    .filter((g) => g.items.length),
)

const tabs = computed(() => [
  { key: 'overview', label: 'Overview' },
  { key: 'reviews', label: 'Reviews', count: reviews.value.length },
  { key: 'similar', label: 'Similar Movies', count: similar.value.length },
])

// ---------- actions ----------
const requireLogin = (action) => {
  if (auth.isLoggedIn) return true
  toast.show(`Log in to ${action}`, 'error')
  return false
}

const onRateReview = () => {
  if (!requireLogin('rate and review movies')) return
  scrollToPanel()
}

const onReport = () => {
  if (!requireLogin('report a movie')) return
  reportOverride.value = null
  scrollToPanel()
}

// ---------- reviews ----------
const isOwn = (r) => auth.isLoggedIn && r.username === auth.user?.username
// The signed-in user's own review is pinned to the top.
const orderedReviews = computed(() => [...reviews.value.filter(isOwn), ...reviews.value.filter((r) => !isOwn(r))])
const visibleReviews = computed(() => orderedReviews.value.slice(0, visibleCount.value))
const isHelped = (r) => auth.isLoggedIn && r.helpedBy.includes(auth.user?.username)

async function handleHelpful(review) {
  if (!requireLogin('mark reviews as helpful')) return
  if (review.username === auth.user?.username) {
    toast.show('You can’t mark your own review as helpful', 'error')
    return
  }
  try {
    const updated = await toggleHelpful(review.id, auth.user.username)
    reviews.value = reviews.value.map((r) => (r.id === updated.id ? updated : r))
  } catch {
    toast.show('Could not update your vote', 'error')
  }
}

const scrollToPanel = () => quickAccessEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
const onEditReview = () => scrollToPanel()

// The user's own review (if any) fills the Rate & Review panel in edit mode.
const ownReview = computed(() => reviews.value.find(isOwn) ?? null)
const movieSubtitle = computed(() => [movie.value?.year, runtimeLabel.value].filter(Boolean).join(' · '))

async function handleSubmitReview(form) {
  if (!requireLogin('rate and review movies')) return
  saving.value = true
  try {
    if (ownReview.value) {
      const updated = await updateReview(ownReview.value.id, form)
      reviews.value = reviews.value.map((r) => (r.id === updated.id ? updated : r))
      toast.show('Your review was updated')
    } else {
      const created = await addReview({ movieId: movie.value.id, username: auth.user.username, ...form })
      reviews.value = [created, ...reviews.value]
      toast.show('Your review was posted')
    }
    activeTab.value = 'reviews'
  } catch (e) {
    toast.show(e?.message || 'Could not save your review', 'error')
  } finally {
    saving.value = false
  }
}

async function onDeleteReview(review) {
  try {
    await deleteReview(review.id)
    reviews.value = reviews.value.filter((r) => r.id !== review.id)
    toast.show('Your review was deleted')
  } catch {
    toast.show('Could not delete your review', 'error')
  }
}

const reportTarget = computed(
  () => reportOverride.value ?? { type: 'movie', id: movie.value.id, label: movie.value.title },
)

const onReportReview = (review) => {
  if (!requireLogin('report a review')) return
  reportOverride.value = { type: 'review', id: review.id, label: `review by ${review.username}` }
  scrollToPanel()
}

async function handleSubmitReport({ reason, details }) {
  if (!requireLogin('report content')) return
  reporting.value = true
  try {
    await submitReport({
      type: reportTarget.value.type,
      targetId: reportTarget.value.id,
      reason,
      details,
      reporter: auth.user.username,
    })
    toast.show('Thanks, your report was submitted')
    reportOverride.value = null
    reportKey.value += 1
  } catch (e) {
    toast.show(e?.message || 'Could not send your report', 'error')
  } finally {
    reporting.value = false
  }
}

const watchlistItem = computed(() => watchlist.value.find((w) => w.movieId === movie.value?.id) ?? null)

const STATUS_LABELS = { plan: 'Plan to Watch', watched: 'Watched' }
const statusOptions = computed(() => {
  const current = watchlistItem.value?.status
  const options = Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value,
    label: `In Watchlist · ${label}`,
  }))
  if (current && !(current in STATUS_LABELS)) {
    options.push({ value: current, label: `In Watchlist · ${current}` })
  }
  options.push({ value: 'remove', label: 'Remove from Watchlist' })
  return options
})

async function handleAdd(target) {
  if (!target || !requireLogin('add movies to your watchlist')) return
  if (watchlist.value.some((w) => w.movieId === target.id)) {
    toast.show(`${target.title} is already in your watchlist`)
    return
  }
  try {
    await addToWatchlist(target.id)
    await refreshWatchlist()
    toast.show(`${target.title} added to your watchlist`)
  } catch {
    toast.show('Could not update your watchlist', 'error')
  }
}

async function changeStatus(value) {
  const id = movie.value.id
  try {
    if (value === 'remove') {
      await removeFromWatchlist(id)
      toast.show('Removed from your watchlist')
    } else {
      await updateWatchlistStatus(id, value)
      toast.show('Watchlist status updated')
    }
    await refreshWatchlist()
  } catch {
    toast.show('Could not update your watchlist', 'error')
  }
}

const statusModel = computed({
  get: () => watchlistItem.value?.status ?? '',
  set: (value) => changeStatus(value),
})
</script>

<template>
  <main class="container detail">
    <!-- Loading -->
    <div v-if="state === 'loading'" class="detail__loading" aria-busy="true">
      <SkeletonLoader height="340px" radius="var(--radius-lg)" />
      <div class="detail__grid">
        <div class="detail__skeleton-main">
          <SkeletonLoader height="120px" />
          <SkeletonLoader height="40px" />
          <SkeletonLoader height="160px" />
        </div>
        <SkeletonLoader height="220px" />
      </div>
    </div>

    <!-- Not found / error -->
    <section v-else-if="state !== 'ready'" class="detail__message">
      <h1>{{ state === 'notfound' ? 'Movie not found' : 'Something went wrong' }}</h1>
      <p>
        {{ state === 'notfound' ? 'We couldn’t find the movie you’re looking for.' : 'We couldn’t load this movie. Please try again.' }}
      </p>
      <BaseButton v-if="state === 'error'" @click="load(route.params.id)">Try again</BaseButton>
      <BaseButton v-else variant="secondary" @click="router.push('/')">Back to Home</BaseButton>
    </section>

    <!-- Detail -->
    <template v-else>
      <section class="hero">
        <div class="hero__backdrop" :style="backdropStyle" />
        <div class="hero__content">
          <div class="hero__poster">
            <img v-if="movie.poster" :src="movie.poster" :alt="movie.title" />
            <span v-else class="hero__placeholder">{{ movie.title }}</span>
          </div>

          <div class="hero__info">
            <h1 class="hero__title">{{ movie.title }}</h1>
            <div class="hero__meta">
              <span>{{ movie.year }}</span>
              <span v-if="runtimeLabel" class="hero__runtime">{{ runtimeLabel }}</span>
              <BaseTag v-if="movie.certification" :label="movie.certification" />
              <BaseTag v-if="movie.hd" label="HD" />
            </div>
            <div class="hero__genres">
              <BaseTag v-for="g in movie.genres ?? []" :key="g" :label="g" class="hero__genre" />
            </div>
            <p v-if="movie.synopsis" class="hero__synopsis">{{ movie.synopsis }}</p>
          </div>
        </div>
      </section>

      <div class="detail__grid">
        <div class="detail__main">
          <!-- Score box + actions -->
          <section class="panel score-box" aria-label="FrameRate score">
            <div class="score-box__stats">
              <div class="score-box__head">
                <ScoreBadge v-if="hasScore" :score="movie.score" />
                <span v-else class="muted">Not rated yet</span>
                <span v-if="hasRatings" class="muted">{{ movie.ratings.toLocaleString() }} ratings</span>
              </div>
              <p class="muted">FrameRate score</p>

              <div class="score-box__bars">
                <template v-if="distribution.hasData">
                  <div v-for="row in distribution.rows" :key="row.star" class="bar">
                    <span class="bar__label">{{ row.star }}★</span>
                    <span class="bar__track" role="presentation">
                      <span class="bar__fill" :style="{ width: row.pct + '%' }" />
                    </span>
                    <span class="bar__pct">{{ row.pct }}%</span>
                  </div>
                </template>
                <p v-else class="muted">Rating breakdown not available.</p>
              </div>
            </div>

            <div class="score-box__actions">
              <BaseButton variant="secondary" @click="onRateReview">Rate &amp; Review</BaseButton>

              <BaseDropdown v-if="watchlistItem" v-model="statusModel" :options="statusOptions" />
              <BaseButton v-else variant="secondary" @click="handleAdd(movie)">+ Add to Watchlist</BaseButton>

              <BaseButton variant="danger" @click="onReport">Report</BaseButton>
            </div>
          </section>

          <!-- Tabs -->
          <BaseTabs v-model="activeTab" :tabs="tabs" />

          <section v-if="activeTab === 'overview'" class="tab-panel">
            <dl class="facts">
              <div><dt>Released</dt><dd>{{ movie.year }}</dd></div>
              <div v-if="runtimeLabel"><dt>Runtime</dt><dd>{{ runtimeLabel }}</dd></div>
              <div v-if="movie.genres?.length"><dt>Genres</dt><dd>{{ movie.genres.join(', ') }}</dd></div>
              <div v-if="movie.certification"><dt>Rated</dt><dd>{{ movie.certification }}</dd></div>
              <div v-if="movie.hd"><dt>Quality</dt><dd>HD</dd></div>
            </dl>
            <p v-if="movie.synopsis" class="tab-panel__text">{{ movie.synopsis }}</p>
          </section>

          <section v-else-if="activeTab === 'reviews'" class="tab-panel">
            <p v-if="!reviews.length" class="muted">No reviews yet. Be the first to rate and review this movie.</p>
            <div v-else class="reviews">
              <ReviewCard
                v-for="r in visibleReviews"
                :key="r.id"
                :review="r"
                :helped="isHelped(r)"
                :own="isOwn(r)"
                @helpful="handleHelpful"
                @report="onReportReview"
                @edit="onEditReview"
                @delete="onDeleteReview"
              />
              <BaseButton
                v-if="reviews.length > visibleCount"
                variant="secondary"
                class="reviews__more"
                @click="visibleCount += PAGE_SIZE"
              >Show more reviews ({{ reviews.length - visibleCount }} more)</BaseButton>
            </div>
          </section>

          <section v-else class="tab-panel">
            <div v-if="similar.length" class="similar">
              <MovieCard v-for="m in similar" :key="m.id" :movie="m" @add="handleAdd" />
            </div>
            <p v-else class="muted">No similar movies found.</p>
          </section>
        </div>

        <!-- Where to Watch -->
        <aside class="panel watch" aria-label="Where to Watch">
          <h2 class="panel__title">Where to Watch</h2>

          <template v-if="visibleProviderGroups.length">
            <div v-for="g in visibleProviderGroups" :key="g.key" class="watch__group">
              <h3 class="watch__label">{{ g.label }}</h3>
              <div class="watch__tags">
                <BaseTag v-for="p in g.items" :key="p" :label="p" />
              </div>
            </div>
          </template>
          <p v-else class="muted">No streaming information available.</p>

          <p class="watch__credit">
            Streaming data by
            <a href="https://www.justwatch.com" target="_blank" rel="noopener noreferrer">JustWatch</a>
          </p>
        </aside>
      </div>

      <!-- Quick Access: inline panels (no popups) -->
      <section ref="quickAccessEl" class="quick" aria-label="Quick Access">
        <h2 class="quick__title">Quick Access</h2>
        <div class="quick__grid">
          <RateReviewPanel
            :movie="movie"
            :subtitle="movieSubtitle"
            :review="ownReview"
            :busy="saving"
            @submit="handleSubmitReview"
          />
          <ReportPanel
            :key="reportKey"
            :target="reportTarget"
            :busy="reporting"
            @submit="handleSubmitReport"
            @cancel="reportOverride = null"
          />
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.detail { padding-top: var(--space-6); padding-bottom: var(--space-8); }
.muted { color: var(--color-text-muted); font-size: var(--text-sm); }

/* Loading + message states */
.detail__loading { display: flex; flex-direction: column; gap: var(--space-6); }
.detail__skeleton-main { display: flex; flex-direction: column; gap: var(--space-4); }
.detail__message { display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-3); padding: var(--space-8) 0; }
.detail__message h1 { font-family: var(--font-heading); font-size: var(--text-xl); }
.detail__message p { color: var(--color-text-muted); }

/* Hero */
.hero { position: relative; overflow: hidden; margin-bottom: var(--space-6); }
.hero__backdrop {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, var(--color-surface-hover), var(--color-bg));
  background-size: cover; background-position: center;
}
.hero__backdrop::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(to top, var(--color-bg) 0%, rgba(11, 18, 32, 0.35) 100%);
}
.hero__content { position: relative; display: flex; gap: var(--space-6); align-items: flex-start; padding: var(--space-4); min-height: 300px; }
.hero__poster {
  flex-shrink: 0; width: 150px; aspect-ratio: 2 / 3;
  border-radius: var(--radius-sm); overflow: hidden;
  background: var(--color-surface); border: 1px solid var(--color-border);
  box-shadow: var(--shadow-card);
  display: flex; align-items: center; justify-content: center;
}
.hero__poster img { width: 100%; height: 100%; object-fit: cover; }
.hero__placeholder { padding: var(--space-3); text-align: center; color: var(--color-text-muted); font-size: var(--text-sm); }
.hero__info { display: flex; flex-direction: column; gap: var(--space-3); min-width: 0; }
.hero__title { font-family: var(--font-body); font-size: var(--text-2xl); font-weight: 700; line-height: 1.1; }
.hero__meta { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-4); font-size: var(--text-lg); font-weight: 600; }
.hero__runtime { padding-left: var(--space-4); border-left: 2px solid var(--color-text-muted); }
.hero__genres { display: flex; flex-wrap: wrap; gap: var(--space-3); }
.hero__genres .hero__genre {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  font-size: var(--text-md); font-weight: 600;
}
.hero__synopsis { max-width: 55ch; font-size: var(--text-sm); line-height: 1.6; }

/* Layout */
.detail__grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: var(--space-6); align-items: start; }
.detail__main { display: flex; flex-direction: column; gap: var(--space-6); min-width: 0; }

.panel { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-6); }
.panel__title { font-size: var(--text-lg); margin-bottom: var(--space-3); }

/* Score box + actions */
.score-box { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: var(--space-6); }
.score-box__stats { display: flex; flex-direction: column; gap: var(--space-1); }
.score-box__head { display: flex; align-items: center; gap: var(--space-3); }
.score-box__bars { display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-3); }
.bar { display: grid; grid-template-columns: 28px minmax(0, 1fr) 40px; align-items: center; gap: var(--space-3); font-size: var(--text-sm); }
.bar__label { color: var(--color-text-muted); }
.bar__track { height: 8px; border-radius: var(--radius-pill); background: var(--color-border); overflow: hidden; }
.bar__fill { display: block; height: 100%; background: var(--color-primary); border-radius: var(--radius-pill); }
.bar__pct { text-align: right; color: var(--color-text-muted); }
.score-box__actions {
  display: flex; flex-direction: column; justify-content: center; gap: var(--space-3);
  padding-left: var(--space-6); border-left: 1px solid var(--color-border);
}

/* Tabs */
.tab-panel { display: flex; flex-direction: column; gap: var(--space-4); }
.tab-panel__text { max-width: 70ch; line-height: 1.6; }
.facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: var(--space-4); }
.facts dt { color: var(--color-text-muted); font-size: var(--text-sm); }
.facts dd { font-weight: 600; }
.reviews { display: flex; flex-direction: column; }
.reviews__more { align-self: center; margin-top: var(--space-4); }
.similar { display: flex; flex-wrap: wrap; gap: var(--space-6); }

/* Quick Access */
.quick { margin-top: var(--space-8); scroll-margin-top: calc(var(--navbar-height) + var(--space-4)); }
.quick__title { font-size: var(--text-xl); margin-bottom: var(--space-4); }
.quick__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-6); align-items: start; }

/* Where to Watch */
.watch__group { margin-top: var(--space-4); }
.watch__label { font-family: var(--font-body); font-size: var(--text-md); font-weight: 600; margin-bottom: var(--space-2); }
.watch__tags { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.watch__credit { margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--color-border); color: var(--color-text-muted); font-size: var(--text-sm); }
.watch__credit a { color: var(--color-nav-active); }
.watch__credit a:hover { text-decoration: underline; }

@media (max-width: 900px) {
  .quick__grid { grid-template-columns: minmax(0, 1fr); }
  .detail__grid { grid-template-columns: minmax(0, 1fr); }
  .hero__content { flex-direction: column; }
  .hero__poster { width: 120px; }
  .hero__title { font-size: var(--text-xl); }
  .score-box { grid-template-columns: minmax(0, 1fr); gap: var(--space-4); }
  .score-box__actions { padding-left: 0; border-left: 0; padding-top: var(--space-4); border-top: 1px solid var(--color-border); }
}
</style>