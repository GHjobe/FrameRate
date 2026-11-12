<script setup>
import { reactive, ref, watch } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import BaseTextarea from './BaseTextarea.vue'
import StarRating from './StarRating.vue'

const MAX_LENGTH = 1000

const props = defineProps({
  movie: { type: Object, required: true },
  subtitle: { type: String, default: '' },
  review: { type: Object, default: null }, // the user's existing review, if any (edit mode)
  busy: Boolean,
})
const emit = defineEmits(['submit'])

const rating = ref(0)
const text = ref('')
const spoiler = ref(false)
const errors = reactive({ rating: '', text: '' })

// Fill the form from the saved review (or clear it when there is none).
const fill = () => {
  rating.value = props.review?.rating ?? 0
  text.value = props.review?.text ?? ''
  spoiler.value = props.review?.spoiler ?? false
  errors.rating = ''
  errors.text = ''
}
watch(() => props.review, fill, { immediate: true })
watch(rating, () => { errors.rating = '' })

const submit = () => {
  errors.rating = rating.value ? '' : 'Please choose a star rating.'
  errors.text = text.value.length > MAX_LENGTH ? `Reviews can be up to ${MAX_LENGTH} characters.` : ''
  if (errors.rating || errors.text) return
  emit('submit', { rating: rating.value, text: text.value.trim(), spoiler: spoiler.value })
}
</script>

<template>
  <section class="rate" aria-labelledby="rate-title">
    <h3 id="rate-title" class="rate__title">{{ review ? 'Edit your review' : 'Rate & Review' }}</h3>

    <div class="rate__movie">
      <div class="rate__thumb">
        <img v-if="movie.poster" :src="movie.poster" :alt="movie.title" />
        <span v-else>{{ movie.title.charAt(0) }}</span>
      </div>
      <div class="rate__info">
        <p class="rate__name">{{ movie.title }}</p>
        <p v-if="subtitle" class="rate__sub">{{ subtitle }}</p>
        <StarRating v-model="rating" :size="26" />
        <p v-if="errors.rating" class="rate__error" role="alert">{{ errors.rating }}</p>
      </div>
    </div>

    <BaseTextarea
      v-model="text"
      label="Write a review"
      placeholder="What did you think? (optional)"
      :rows="4"
      :error="errors.text"
    />
    <p :class="['rate__count', { 'is-over': text.length > MAX_LENGTH }]">{{ text.length }}/{{ MAX_LENGTH }}</p>

    <BaseCheckbox v-model="spoiler" label="Contains spoilers" />

    <div class="rate__actions">
      <BaseButton variant="text" @click="fill">Cancel</BaseButton>
      <BaseButton :disabled="busy" @click="submit">{{ review ? 'Save' : 'Submit' }}</BaseButton>
    </div>
  </section>
</template>

<style scoped>
.rate {
  display: flex; flex-direction: column; gap: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}
.rate__title { font-size: var(--text-lg); }
.rate__movie { display: flex; gap: var(--space-4); align-items: flex-start; }
.rate__thumb {
  flex-shrink: 0; width: 64px; aspect-ratio: 2 / 3;
  border-radius: var(--radius-sm); overflow: hidden;
  background: var(--color-bg); border: 1px solid var(--color-border);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-text-muted); font-weight: 600;
}
.rate__thumb img { width: 100%; height: 100%; object-fit: cover; }
.rate__info { display: flex; flex-direction: column; gap: var(--space-1); min-width: 0; }
.rate__name { font-weight: 600; }
.rate__sub { color: var(--color-text-muted); font-size: var(--text-sm); margin-bottom: var(--space-2); }
.rate__error { color: var(--color-danger); font-size: var(--text-sm); }
.rate__count { align-self: flex-end; margin-top: calc(var(--space-1) * -1); color: var(--color-text-muted); font-size: var(--text-sm); }
.rate__count.is-over { color: var(--color-danger); }
.rate__actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-2); }
</style>