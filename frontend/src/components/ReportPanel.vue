<script setup>
import { reactive, ref, watch } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseTextarea from './BaseTextarea.vue'

const MAX_DETAILS = 500
const REASONS = ['Incorrect information', 'Inappropriate content', 'Spam', 'Copyright issue', 'Other']

const props = defineProps({
  // What is being reported: { type: 'movie' | 'review', id, label }
  target: { type: Object, required: true },
  busy: Boolean,
})
const emit = defineEmits(['submit', 'cancel'])

const reason = ref('')
const details = ref('')
const errors = reactive({ reason: '', details: '' })

const reset = () => {
  reason.value = ''
  details.value = ''
  errors.reason = ''
  errors.details = ''
}
watch(() => props.target, reset)
watch(reason, () => { errors.reason = '' })

const cancel = () => {
  reset()
  emit('cancel')
}

const submit = () => {
  errors.reason = reason.value ? '' : 'Please choose a reason.'
  errors.details = details.value.length > MAX_DETAILS ? `Details can be up to ${MAX_DETAILS} characters.` : ''
  if (errors.reason || errors.details) return
  emit('submit', { reason: reason.value, details: details.value.trim() })
}
</script>

<template>
  <section class="report" aria-labelledby="report-title">
    <h3 id="report-title" class="report__title">Report</h3>
    <p class="report__target">
      Reporting: <strong>{{ target.label }}</strong>
    </p>

    <fieldset class="report__reasons">
      <legend class="report__legend">Reason</legend>
      <label v-for="r in REASONS" :key="r" class="report__option">
        <input v-model="reason" type="radio" name="report-reason" :value="r" />
        <span>{{ r }}</span>
      </label>
      <p v-if="errors.reason" class="report__error" role="alert">{{ errors.reason }}</p>
    </fieldset>

    <BaseTextarea
      v-model="details"
      label="Details (optional)"
      placeholder="Tell us more about the problem"
      :rows="3"
      :error="errors.details"
    />
    <p :class="['report__count', { 'is-over': details.length > MAX_DETAILS }]">{{ details.length }}/{{ MAX_DETAILS }}</p>

    <div class="report__actions">
      <BaseButton variant="text" @click="cancel">Cancel</BaseButton>
      <BaseButton variant="danger" :disabled="busy" @click="submit">Report</BaseButton>
    </div>
  </section>
</template>

<style scoped>
.report {
  display: flex; flex-direction: column; gap: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}
.report__title { font-size: var(--text-lg); }
.report__target { color: var(--color-text-muted); font-size: var(--text-sm); overflow-wrap: anywhere; }
.report__target strong { color: var(--color-text); }
.report__reasons { display: flex; flex-direction: column; gap: var(--space-2); border: 0; padding: 0; min-width: 0; }
.report__legend { font-weight: 600; margin-bottom: var(--space-2); padding: 0; }
.report__option { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm); }
.report__option input { accent-color: var(--color-primary); width: 16px; height: 16px; margin: 0; }
.report__error { color: var(--color-danger); font-size: var(--text-sm); }
.report__count { align-self: flex-end; margin-top: calc(var(--space-1) * -1); color: var(--color-text-muted); font-size: var(--text-sm); }
.report__count.is-over { color: var(--color-danger); }
.report__actions { display: flex; justify-content: flex-end; gap: var(--space-3); margin-top: var(--space-2); }
</style>