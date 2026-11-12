import { delay } from './client'
import { reports } from '@/mocks/reports'

let nextId = 1

// type: 'movie' | 'review'; targetId: the movie or review id
export const submitReport = ({ type, targetId, reason, details = '', reporter }) => {
  if (!reason) return Promise.reject(new Error('Please choose a reason.'))
  const report = { id: nextId++, type, targetId, reason, details: details.trim(), reporter, status: 'open', createdAt: new Date().toISOString() }
  reports.push(report)
  return delay({ ...report })
}

// For the Moderation page later.
export const getReports = () => delay(reports.map((r) => ({ ...r })))