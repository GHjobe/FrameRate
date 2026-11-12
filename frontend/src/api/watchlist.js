import { delay } from './client'
import { watchlist } from '@/mocks/watchlist'

// Every status a watchlist item can have, in tab order. `value` is what is stored.
export const WATCHLIST_STATUSES = [
  { value: 'plan', label: 'Plan to Watch' },
  { value: 'watched', label: 'Watched' },
  { value: 'hold', label: 'On Hold' },
  { value: 'dropped', label: 'Dropped' },
]

export const getWatchlist = () => delay(watchlist)

export const updateWatchlistStatus = (movieId, status) => {
  const item = watchlist.find((w) => w.movieId === movieId)
  if (item) item.status = status
  return delay(item)
}

export const removeFromWatchlist = (movieId) => {
  const i = watchlist.findIndex((w) => w.movieId === movieId)
  if (i !== -1) watchlist.splice(i, 1)
  return delay(true)
}

export const addToWatchlist = (movieId, status = 'plan') => {
  let item = watchlist.find((w) => w.movieId === movieId)
  if (!item) {
    item = { movieId, status, dateAdded: new Date().toISOString().slice(0, 10) }
    watchlist.push(item)
  }
  return delay(item)
}