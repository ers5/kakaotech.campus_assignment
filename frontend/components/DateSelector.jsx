import { toDateKey } from '@/lib/dates'

export default function DateSelector({
  weekDates,
  dayLabels,
  selectedDateKey,
  todayKey,
  todos,
  onSelectDate,
}) {
  return (
    <section className="date-selector" aria-label="날짜 선택">
      {weekDates.map((date, index) => {
        const dateKey = toDateKey(date)
        const isSelected = dateKey === selectedDateKey
        const isToday = dateKey === todayKey
        const todoCount = todos.filter((todo) => todo.date === dateKey).length

        return (
          <button
            className={`date-card${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
            type="button"
            key={dateKey}
            aria-pressed={isSelected}
            onClick={() => onSelectDate(date)}
          >
            <span className="date-weekday">{dayLabels[index]}</span>
            <strong className="date-day">{date.getDate()}</strong>
            <span className="date-count">{todoCount}개</span>
          </button>
        )
      })}
    </section>
  )
}
