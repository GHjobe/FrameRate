<script setup>
import { ref } from 'vue'
import BaseAvatar from '../components/BaseAvatar.vue'
import BaseButton from '../components/BaseButton.vue'
import BaseCheckbox from '../components/BaseCheckbox.vue'
import BaseChip from '../components/BaseChip.vue'
import BaseDropdown from '../components/BaseDropdown.vue'
import BaseInput from '../components/BaseInput.vue'
import BaseTabs from '../components/BaseTabs.vue'
import BaseTag from '../components/BaseTag.vue'
import BaseTextarea from '../components/BaseTextarea.vue'
import BaseToast from '../components/BaseToast.vue'
import BaseToggle from '../components/BaseToggle.vue'
import MovieCard from '../components/MovieCard.vue'
import ScoreBadge from '../components/ScoreBadge.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import StarRating from '../components/StarRating.vue'

const inputValue = ref('FrameRate user')
const textareaValue = ref('This movie was surprisingly good.')
const dropdownValue = ref('')
const checkboxValue = ref(false)
const toggleValue = ref(true)
const selectedTab = ref('overview')
const rating = ref(4)
const toastVisible = ref(true)
const addedMovie = ref('')
const chipSelected = ref(true)

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'reviews', label: 'Reviews', count: 12 },
  { key: 'similar', label: 'Similar Movies' },
]
const sampleMovie = {
  id: 'component-test',
  title: 'The FrameRate Test Movie',
  year: 2026,
  score: 8.7,
  ratings: 1240,
  poster: '',
}
</script>

<template>
  <main class="playground">
    <header class="page-header">
      <p class="eyebrow">FRAMERATE · UI-03</p>
      <h1>Component Playground</h1>
      <p>Test the shared components, their variants, and their basic interactions.</p>
    </header>

    <section class="demo-section">
      <h2>01 · Buttons</h2>
      <div class="demo-row">
        <BaseButton variant="primary">Primary</BaseButton>
        <BaseButton variant="secondary">Secondary</BaseButton>
        <BaseButton variant="text">Text</BaseButton>
        <BaseButton variant="danger">Red / Danger</BaseButton>
        <BaseButton disabled>Disabled</BaseButton>
      </div>
      <p class="hint">Hover, click, and keyboard-tab through the buttons to inspect their states.</p>
    </section>

    <section class="demo-section">
      <h2>02 · Text input</h2>
      <div class="demo-grid">
        <BaseInput v-model="inputValue" label="Username" placeholder="Enter username" />
        <BaseInput label="Disabled input" model-value="Cannot edit" disabled />
        <BaseInput label="Error state" model-value="Invalid email" error="Please enter a valid email." />
      </div>
      <p class="hint">Current value: {{ inputValue || '(empty)' }}</p>
    </section>

    <section class="demo-section">
      <h2>03 · Textarea</h2>
      <div class="demo-grid">
        <BaseTextarea v-model="textareaValue" label="Review" placeholder="Write your review..." />
        <BaseTextarea label="Error state" model-value="Too short" error="Please write a longer review." />
        <BaseTextarea label="Disabled" model-value="Read-only example" disabled />
      </div>
    </section>

    <section class="demo-section">
      <h2>04 · Dropdown</h2>
      <div class="demo-grid">
        <BaseDropdown v-model="dropdownValue" label="Favorite genre" placeholder="Choose a genre"
          :options="['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi']" />
        <BaseDropdown label="Error state" placeholder="Choose a region" :options="['Philippines', 'United States']"
          error="Please select a region." />
        <BaseDropdown label="Disabled" model-value="Philippines" :options="['Philippines', 'Japan']" disabled />
      </div>
      <p class="hint">Selected: {{ dropdownValue || 'Nothing selected' }}</p>
    </section>

    <section class="demo-section">
      <h2>05 · Checkbox</h2>
      <div class="demo-row">
        <BaseCheckbox v-model="checkboxValue">Remember me</BaseCheckbox>
        <BaseCheckbox label="Disabled checkbox" disabled />
        <BaseCheckbox label="Error checkbox" error="This field is required." />
      </div>
      <p class="hint">Checked: {{ checkboxValue }}</p>
    </section>

    <section class="demo-section">
      <h2>06 · Toggle</h2>
      <div class="demo-row">
        <BaseToggle v-model="toggleValue" label="Blur spoilers by default" />
        <BaseToggle label="Disabled toggle" disabled />
      </div>
      <p class="hint">Toggle value: {{ toggleValue ? 'ON' : 'OFF' }}</p>
    </section>

    <section class="demo-section">
      <h2>07 · Chips</h2>
      <div class="demo-row">
        <BaseChip :selected="chipSelected" @click="chipSelected = !chipSelected">Action · click to toggle</BaseChip>
        <BaseChip>Comedy</BaseChip>
        <BaseChip selected>Drama · selected</BaseChip>
        <BaseChip disabled>Disabled</BaseChip>
      </div>
    </section>

    <section class="demo-section">
      <h2>08 · Avatar</h2>
      <div class="demo-row avatar-row">
        <div><BaseAvatar name="FrameRate User" :size="48" /><small>Initials</small></div>
        <div><BaseAvatar name="Alex Morgan" src="https://i.pravatar.cc/100?img=12" :size="48" /><small>Image</small></div>
        <div><BaseAvatar name="Small" :size="28" /><small>Small</small></div>
      </div>
    </section>

    <section class="demo-section">
      <h2>09 · Tabs</h2>
      <BaseTabs v-model="selectedTab" :tabs="tabs" />
      <p class="hint">Active tab: {{ selectedTab }}</p>
    </section>

    <section class="demo-section">
      <h2>10 · Star rating</h2>
      <div class="demo-row rating-row">
        <div><StarRating v-model="rating" /><small>Interactive · {{ rating }} / 5</small></div>
        <div><StarRating :model-value="3.5" readonly /><small>Read-only · 3.5 / 5</small></div>
      </div>
    </section>

    <section class="demo-section">
      <h2>11 · Score badge</h2>
      <div class="demo-row">
        <ScoreBadge :score="9.2" :ratings="2480" />
        <ScoreBadge :score="7.5" :ratings="320" />
        <ScoreBadge :score="6.1" />
      </div>
    </section>

    <section class="demo-section">
      <h2>12 · Tags</h2>
      <div class="demo-row">
        <BaseTag label="PG-13" />
        <BaseTag>HD</BaseTag>
        <BaseTag>Action</BaseTag>
        <BaseTag>Science Fiction</BaseTag>
      </div>
    </section>

    <section class="demo-section">
      <h2>13 · Movie card</h2>
      <div class="demo-row movie-row">
        <MovieCard :movie="sampleMovie" @add="addedMovie = $event.title" />
        <p v-if="addedMovie" class="hint">Add button clicked for: {{ addedMovie }}</p>
      </div>
      <p class="hint">The card's title link uses RouterLink, so this page must run inside your Vue Router app.</p>
    </section>

    <section class="demo-section">
      <h2>14 · Toast</h2>
      <div class="demo-row">
        <BaseButton @click="toastVisible = true">Show success toast</BaseButton>
        <BaseButton variant="danger" @click="toastVisible = true">Show toast again</BaseButton>
      </div>
      <div v-if="toastVisible" class="toast-preview">
        <BaseToast message="Your changes have been saved." type="success" @close="toastVisible = false" />
      </div>
      <p class="hint">This tests BaseToast directly. ToastHost is connected to your Pinia toast store and is normally mounted in App.vue.</p>
    </section>

    <section class="demo-section">
      <h2>15 · Skeleton loader</h2>
      <div class="skeleton-demo">
        <SkeletonLoader width="100%" height="170px" />
        <SkeletonLoader width="65%" height="16px" />
        <SkeletonLoader width="42%" height="12px" />
      </div>
    </section>
  </main>
</template>

<style scoped>
.playground {
  min-height: 100vh;
  padding: 40px clamp(20px, 5vw, 72px) 80px;
  background: var(--color-background, #0b1020);
  color: var(--color-text, #f4f4f5);
}
.page-header { margin-bottom: 32px; }
.eyebrow { color: var(--color-primary, #e8ad45); font-size: 12px; letter-spacing: .16em; font-weight: 700; }
h1 { margin: 8px 0; font-size: clamp(30px, 4vw, 44px); font-family: var(--font-heading, Georgia, serif); }
.page-header > p:last-child, .hint { color: var(--color-text-muted, #9ca3af); }
.demo-section {
  margin: 18px 0;
  padding: 24px;
  border: 1px solid var(--color-border, #293247);
  border-radius: 14px;
  background: var(--color-surface, #141c2e);
}
.demo-section h2 { margin: 0 0 18px; font-size: 17px; }
.demo-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; }
.demo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 18px; }
.hint { margin: 12px 0 0; font-size: 13px; }
.avatar-row > div, .rating-row > div { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.avatar-row small, .rating-row small { color: var(--color-text-muted, #9ca3af); }
.movie-row { align-items: flex-start; }
.toast-preview { margin-top: 16px; max-width: 420px; }
.skeleton-demo { display: grid; gap: 12px; max-width: 260px; }
@media (max-width: 640px) { .playground { padding: 24px 14px 48px; } .demo-section { padding: 17px; } }
</style>
