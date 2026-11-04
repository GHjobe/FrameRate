import { defineStore } from 'pinia'

let nextId = 1

export const useToastStore = defineStore('toast', {
  state: () => ({ items: [] }),
  actions: {
    show(message, type = 'success', ms = 3000) {
      const id = nextId++
      this.items.push({ id, message, type })
      setTimeout(() => this.dismiss(id), ms)
    },
    dismiss(id) {
      this.items = this.items.filter((t) => t.id !== id)
    },
  },
})