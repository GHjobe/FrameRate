<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { getFeatured, getGenres, getTopRated, getPopular, getRecommended } from '@/api/movies'
import BaseButton from '@/components/BaseButton.vue'
import BaseChip from '@/components/BaseChip.vue'
import MovieRow from '@/components/MovieRow.vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const loading = ref(true)
const featured = ref([])
const genres = ref([])
const topRated = ref([])
const popular = ref([])
const recommended = ref([])

const current = ref(0)
let timer = null

function go(i) {
  current.value = i
  restart()
}
function restart() {
  clearInterval(timer)
  timer = setInterval(() => {
    if (featured.value.length) current.value = (current.value + 1) % featured.value.length
  }, 6000)
}

const genreScroller = ref(null)
const scrollGenres = () => genreScroller.value?.scrollBy({ left: 300, behavior: 'smooth' })

function addToWatchlist(movie) {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login' })
    return
  }
  toast.show(`Added “${movie.title}” to your watchlist`)
}

onMounted(async () => {
  const [f, g, t, p, r] = await Promise.all([
    getFeatured(), getGenres(), getTopRated(), getPopular(), getRecommended(),
  ])
  featured.value = f
  genres.value = g
  topRated.value = t
  popular.value = p
  recommended.value = r
  loading.value = false
  restart()
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <main>
    <!-- Hero -->
    <section v-if="featured.length" class="hero">
      <div
        v-for="(m, i) in featured"
        :key="m.id"
        :class="['hero__slide', { 'is-active': i === current }]"
        :style="m.backdrop ? { backgroundImage: `url(${m.backdrop})` } : null"
      >
        <div class="hero__shade" />
        <div class="container hero__content">
          <span class="hero__label">Featured</span>
          <h1 class="hero__title">{{ m.title }}</h1>
          <p class="hero__meta">{{ m.year }} &nbsp;|&nbsp; {{ Math.floor(m.runtime / 60) }}h {{ m.runtime % 60 }}m</p>
          <div class="hero__actions">
            <BaseButton variant="secondary" @click="router.push(`/movie/${m.id}`)">Expand</BaseButton>
            <BaseButton variant="text" @click="addToWatchlist(m)">+ Add to Watchlist</BaseButton>
          </div>
        </div>
      </div>
      <div class="hero__dots">
        <button
          v-for="(m, i) in featured"
          :key="m.id"
          type="button"
          :class="['hero__dot', { 'is-active': i === current }]"
          :aria-label="`Show ${m.title}`"
          @click="go(i)"
        />
      </div>
    </section>

    <div class="container">
      <!-- Browse by Genre -->
      <section class="genres">
        <h2 class="genres__title">Browse by Genre</h2>
        <div class="genres__wrap">
          <div ref="genreScroller" class="genres__list">
            <BaseChip
              v-for="g in genres"
              :key="g"
              @click="router.push({ name: 'search', query: { genre: g } })"
            >
              {{ g }}
            </BaseChip>
          </div>
          <button type="button" class="genres__arrow" aria-label="Scroll genres" @click="scrollGenres">›</button>
        </div>
      </section>

      <MovieRow
        title="Top Rated on FrameRate"
        :movies="topRated"
        :loading="loading"
        see-all-to="/search"
        @add="addToWatchlist"
      />
      <MovieRow title="Popular Now" :movies="popular" :loading="loading" see-all-to="/search" @add="addToWatchlist" />
      <MovieRow
        v-if="auth.isLoggedIn"
        title="Recommended for You"
        :movies="recommended"
        :loading="loading"
        see-all-to="/for-you"
        @add="addToWatchlist"
      />
    </div>
  </main>
</template>

<style scoped>
.hero { position: relative; height: 460px; overflow: hidden; background: var(--color-surface); }
.hero__slide {
  position: absolute; inset: 0;
  display: flex; align-items: flex-end;
  background: linear-gradient(135deg, #1b2740 0%, #0b1220 70%) center / cover no-repeat;
  opacity: 0; transition: opacity 0.6s;
}
.hero__slide.is-active { opacity: 1; }
.hero__shade {
  position: absolute; inset: 0;
  background: linear-gradient(to top, var(--color-bg) 0%, rgba(11, 18, 32, 0.4) 55%, transparent 100%);
}
.hero__content { position: relative; padding-bottom: var(--space-8); }
.hero__label { color: var(--color-text-muted); font-size: var(--text-sm); }
.hero__title { font-family: var(--font-body); font-weight: 700; font-size: 3.5rem; margin: var(--space-1) 0; }
.hero__meta { color: var(--color-text-muted); margin-bottom: var(--space-4); }
.hero__actions { display: flex; gap: var(--space-3); }
.hero__dots { position: absolute; right: var(--space-8); bottom: var(--space-6); display: flex; gap: var(--space-2); }
.hero__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-border); }
.hero__dot:hover { background: var(--color-text-muted); }
.hero__dot.is-active { background: var(--color-text); }

.genres { margin-top: var(--space-8); }
.genres__title { font-family: var(--font-body); font-size: var(--text-lg); font-weight: 600; margin-bottom: var(--space-4); }
.genres__wrap { display: flex; align-items: center; gap: var(--space-3); }
.genres__list { display: flex; gap: var(--space-3); overflow-x: auto; scrollbar-width: none; flex: 1; }
.genres__list::-webkit-scrollbar { display: none; }
.genres__arrow {
  width: 32px; height: 32px; border-radius: 50%;
  border: 1px solid var(--color-border); background: var(--color-surface);
  font-size: 20px; line-height: 1;
}
.genres__arrow:hover { background: var(--color-surface-hover); }
</style>