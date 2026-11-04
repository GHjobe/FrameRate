import { delay } from './client'
import { movies, genres } from '@/mocks/movies'

export const getMovies = () => delay(movies)
export const getTopRated = () => delay([...movies].sort((a, b) => b.score - a.score))
export const getPopular = () => delay([...movies].sort((a, b) => b.ratings - a.ratings))
export const getRecommended = () => delay(movies.slice(0, 5))
export const getFeatured = () => delay(movies.slice(0, 3))
export const getGenres = () => delay(genres)
export const getMovie = (id) => delay(movies.find((m) => m.id === Number(id)) ?? null)
export const getSimilarMovies = (id) => delay(movies.filter((m) => m.id !== Number(id)).slice(0, 4))
export const searchMovies = (query) => {
  const q = query.trim().toLowerCase()
  return delay(q ? movies.filter((m) => m.title.toLowerCase().includes(q)) : [])
}