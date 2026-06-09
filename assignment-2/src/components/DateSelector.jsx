function DateSelector({
  weekDates,
  dayLabels,
  selectedDateKey,
  todayKey,
  todos,
  createDateKey,
  onSelectDate,
}) {
  return (
    <section className="date-selector" aria-label="날짜 선택">
      {weekDates.map((date, index) => {
        const dateKey = createDateKey(date)
        const isSelected = dateKey === selectedDateKey
        const isToday = dateKey === todayKey
        const todoCount = todos.filter((todo) => todo.dateKey === dateKey).length

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

export default DateSelector
