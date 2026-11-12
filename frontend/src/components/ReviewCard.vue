<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import BaseAvatar from './BaseAvatar.vue'
import BaseButton from './BaseButton.vue'
import BaseTag from './BaseTag.vue'
import StarRating from './StarRating.vue'

const props = defineProps({
  review: { type: Object, required: true },
  helped: Boolean, // has the current user marked this review helpful?
  own: Boolean, // is this the signed-in user's own review?
})
const emit = defineEmits(['helpful', 'report', 'edit', 'delete'])

const revealed = ref(false)
const expanded = ref(false)
const isClamped = ref(false)
const textEl = ref(null)
const confirmingDelete = ref(false)

const confirmDelete = () => {
  confirmingDelete.value = false
  emit('delete', props.review)
}

// Spoiler reviews stay blurred until the reader clicks Reveal.
// Your own review is never blurred.
const hidden = computed(() => props.review.spoiler && !revealed.value && !props.own)

// Is the text taller than the 3-line clamp? Only measured while collapsed.
const measure = () => {
  const el = textEl.value
  if (el && !expanded.value) isClamped.value = el.scrollHeight > el.clientHeight + 1
}
onMounted(measure)
watch(() => props.review.text, () => nextTick(measure))

const timeAgo = computed(() => {
  const then = new Date(props.review.createdAt)
  if (Number.isNaN(then.getTime())) return ''
  const days = Math.floor((Date.now() - then.getTime()) / 86400000)
  if (days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  const years = Math.floor(days / 365)
  return `${years} year${years > 1 ? 's' : ''} ago`
})
</script>

<template>
  <article :class="['review', { 'is-own': own }]">
    <header class="review__head">
      <BaseAvatar :src="review.avatar" :name="review.username" :size="36" />
      <div class="review__who">
        <span class="review__name">{{ review.username }}</span>
        <StarRating readonly :size="14" :model-value="review.rating" />
      </div>
      <BaseTag v-if="own" label="Your review" />
      <BaseTag v-if="review.spoiler" label="Spoiler" />
      <span class="review__date">{{ timeAgo }}</span>
    </header>

    <div v-if="review.text" :class="['review__body', { 'is-hidden': hidden }]">
      <p
        ref="textEl"
        :class="['review__text', { 'is-clamped': !expanded, 'is-blurred': hidden }]"
        :aria-hidden="hidden ? 'true' : undefined"
      >{{ review.text }}</p>

      <div v-if="hidden" class="review__reveal">
        <BaseButton
          variant="secondary"
          :aria-label="`Reveal spoiler review by ${review.username}`"
          @click="revealed = true"
        >Reveal</BaseButton>
      </div>
    </div>

    <BaseButton
      v-if="!hidden && review.text && (isClamped || expanded)"
      variant="text"
      class="review__more"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >{{ expanded ? 'Show less' : 'Show more' }}</BaseButton>

    <footer class="review__actions">
      <!-- Your own review: Edit / Delete (with inline confirmation) -->
      <template v-if="own">
        <span class="review__stat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          Helpful ({{ review.helpful }})
        </span>

        <template v-if="!confirmingDelete">
          <BaseButton variant="text" class="review__action" @click="emit('edit', review)">Edit</BaseButton>
          <BaseButton variant="text" class="review__action review__action--danger" @click="confirmingDelete = true">Delete</BaseButton>
        </template>
        <template v-else>
          <span class="review__confirm">Delete this review?</span>
          <BaseButton variant="danger" @click="confirmDelete">Yes, delete</BaseButton>
          <BaseButton variant="text" @click="confirmingDelete = false">Cancel</BaseButton>
        </template>
      </template>

      <!-- Someone else's review: Helpful / Report -->
      <template v-else>
        <BaseButton
          variant="text"
          :class="['review__action', { 'is-active': helped }]"
          :aria-pressed="helped"
          @click="emit('helpful', review)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          Helpful ({{ review.helpful }})
        </BaseButton>

        <BaseButton
          variant="text"
          class="review__action"
          :aria-label="`Report review by ${review.username}`"
          @click="emit('report', review)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          Report
        </BaseButton>
      </template>
    </footer>
  </article>
</template>

<style scoped>
.review {
  display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-3);
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--color-border);
}
.review:last-child { border-bottom: 0; }
.review__head { align-self: stretch; display: flex; align-items: center; gap: var(--space-3); }
.review__who { display: flex; flex-direction: column; gap: var(--space-1); min-width: 0; flex: 1; }
.review__name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.review__date { color: var(--color-text-muted); font-size: var(--text-sm); }

.review__body { position: relative; align-self: stretch; }
.review__body.is-hidden { min-height: 56px; }
.review__text { line-height: 1.6; overflow-wrap: anywhere; }
.review__text.is-clamped {
  display: -webkit-box; -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; line-clamp: 3;
  overflow: hidden;
}
.review__text.is-blurred { filter: blur(6px); user-select: none; pointer-events: none; }
.review__reveal { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }

.review__actions { display: flex; align-items: center; gap: var(--space-4); }
.review__actions .review__action {
  display: inline-flex; align-items: center; gap: var(--space-2);
  font-size: var(--text-sm); color: var(--color-text-muted);
}
.review__actions .review__action:hover { color: var(--color-text); }
.review__actions .review__action.is-active { color: var(--color-primary); }
.review__actions .review__action--danger:hover { color: var(--color-danger); }
.review__stat { display: inline-flex; align-items: center; gap: var(--space-2); font-size: var(--text-sm); color: var(--color-text-muted); }
.review__confirm { font-size: var(--text-sm); }
.review.is-own {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
}
</style>