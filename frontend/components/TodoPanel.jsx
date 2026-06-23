import TodoItem from './TodoItem'

export default function TodoPanel({
  selectedDate,
  selectedTodos,
  filteredTodos,
  currentFilter,
  filterOptions,
  todoText,
  editingTodoId,
  editingText,
  message,
  isLoading,
  formatSelectedDate,
  onAddTodo,
  onTodoTextChange,
  onFilterChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditingTextChange,
  onToggleTodoCompletion,
  onDeleteTodo,
}) {
  const activeTodoCount = selectedTodos.filter((todo) => !todo.completed).length
  const completedTodoCount = selectedTodos.filter((todo) => todo.completed).length

  return (
    <section className="selected-panel" aria-label="선택한 날짜 Todo 목록">
      <div className="selected-summary">
        <div>
          <strong>{formatSelectedDate(selectedDate)}</strong>
          <span>
            전체 {selectedTodos.length}개 / 진행 중 {activeTodoCount}개 / 완료{' '}
            {completedTodoCount}개
          </span>
        </div>
      </div>

      <form
        className="todo-form"
        onSubmit={(event) => {
          event.preventDefault()
          onAddTodo()
        }}
      >
        <label className="visually-hidden" htmlFor="todo-input">
          할 일 입력
        </label>
        <input
          id="todo-input"
          className="todo-input"
          type="text"
          value={todoText}
          disabled={isLoading}
          onChange={(event) => onTodoTextChange(event.target.value)}
          placeholder="선택한 날짜에 할 일 추가"
          maxLength={100}
        />
        <button className="primary-button" type="submit" disabled={isLoading}>
          추가
        </button>
      </form>

      <p className="input-message" role="status" aria-live="polite">
        {message}
      </p>

      <div className="filter-controls" aria-label="Todo 상태 필터">
        {filterOptions.map((filterOption) => (
          <button
            className={`filter-button${currentFilter === filterOption.value ? ' selected' : ''}`}
            type="button"
            key={filterOption.value}
            aria-pressed={currentFilter === filterOption.value}
            onClick={() => onFilterChange(filterOption.value)}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {filteredTodos.length === 0 ? (
        <p className="empty-message">
          {selectedTodos.length === 0
            ? '선택한 날짜에 등록된 할 일이 없습니다.'
            : '현재 필터에 맞는 할 일이 없습니다.'}
        </p>
      ) : (
        <ul className="todo-list">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              isEditing={editingTodoId === todo.id}
              editingText={editingText}
              isLoading={isLoading}
              onStartEdit={onStartEdit}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onEditingTextChange={onEditingTextChange}
              onToggleTodoCompletion={onToggleTodoCompletion}
              onDeleteTodo={onDeleteTodo}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
