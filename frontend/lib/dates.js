export const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export const toDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number)

  return new Date(year, month - 1, day)
}

export const addDaysToKey = (dateKey, dayOffset) => {
  const date = parseDateKey(dateKey)
  date.setDate(date.getDate() + dayOffset)

  return toDateKey(date)
}

export const getSundayStartKey = (date) => {
  const weekStartDate = new Date(date)
  weekStartDate.setHours(0, 0, 0, 0)
  weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay())

  return toDateKey(weekStartDate)
}

export const getWeekDates = (weekStartKey) =>
  Array.from({ length: 7 }, (_, index) => parseDateKey(addDaysToKey(weekStartKey, index)))

export const isDateKeyInWeek = (dateKey, weekStartKey) => {
  const weekEndKey = addDaysToKey(weekStartKey, 6)

  return dateKey >= weekStartKey && dateKey <= weekEndKey
}

export const formatDate = (date) =>
  new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
  }).format(date)

export const formatSelectedDate = (date) =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)
