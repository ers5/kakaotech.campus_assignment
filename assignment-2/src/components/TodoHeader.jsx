function TodoHeader({ weekStartDate, weekEndDate, formatDate, onMoveWeek }) {
  return (
    <header className="todo-header">
      <div>
        <h1>주간 Todo</h1>
        <p>날짜를 선택하면 해당 날짜의 할 일만 표시됩니다.</p>
      </div>
      <div className="week-controls" aria-label="주간 이동">
        <button type="button" className="week-button" onClick={() => onMoveWeek(-1)}>
          이전 주
        </button>
        <strong className="week-range">
          {formatDate(weekStartDate)} - {formatDate(weekEndDate)}
        </strong>
        <button type="button" className="week-button" onClick={() => onMoveWeek(1)}>
          다음 주
        </button>
      </div>
    </header>
  )
}

export default TodoHeader
