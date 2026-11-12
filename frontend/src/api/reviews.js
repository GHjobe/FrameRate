import { delay } from './client'
import { reviews } from '@/mocks/reviews'

let nextId = Math.max(0, ...reviews.map((r) => r.id)) + 1

// Return copies so pages never hold references into the mock array.
const copy = (r) => ({ ...r, helpedBy: [...r.helpedBy] })
const today = () => new Date().toISOString().slice(0, 10)

export const getReviews = (movieId) =>
  delay(reviews.filter((r) => r.movieId === Number(movieId)).map(copy))

export const addReview = ({ movieId, username, rating, text = '', spoiler = false }) => {
  if (!rating || rating < 1 || rating > 5) return Promise.reject(new Error('Please choose a star rating.'))
  if (reviews.some((r) => r.movieId === movieId && r.username === username)) {
    return Promise.reject(new Error('You already reviewed this movie.'))
  }
  const review = { id: nextId++, movieId, username, avatar: '', rating, text: text.trim(), spoiler, helpful: 0, helpedBy: [], createdAt: today() }
  reviews.push(review)
  return delay(copy(review))
}

export const updateReview = (id, { rating, text, spoiler }) => {
  const review = reviews.find((r) => r.id === id)
  if (!review) return Promise.reject(new Error('Review not found.'))
  if (rating !== undefined) review.rating = rating
  if (text !== undefined) review.text = text.trim()
  if (spoiler !== undefined) review.spoiler = spoiler
  return delay(copy(review))
}

export const deleteReview = (id) => {
  const i = reviews.findIndex((r) => r.id === id)
  if (i !== -1) reviews.splice(i, 1)
  return delay(true)
}

// Adds or removes the user's helpful vote.
export const toggleHelpful = (id, username) => {
  const review = reviews.find((r) => r.id === id)
  if (!review) return Promise.reject(new Error('Review not found.'))
  const i = review.helpedBy.indexOf(username)
  if (i === -1) review.helpedBy.push(username)
  else review.helpedBy.splice(i, 1)
  review.helpful = Math.max(0, review.helpful + (i === -1 ? 1 : -1))
  return delay(copy(review))
}