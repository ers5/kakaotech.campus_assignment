function TodoItem({
  todo,
  isEditing,
  editingText,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditingTextChange,
  onToggleTodoCompletion,
  onDeleteTodo,
}) {
  return (
    <li className={`todo-item${todo.completed ? ' completed' : ''}`}>
      {isEditing ? (
        <input
          className="edit-input"
          type="text"
          value={editingText}
          onChange={(event) => onEditingTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onSaveEdit(todo.id)
            }

            if (event.key === 'Escape') {
              onCancelEdit()
            }
          }}
          maxLength={100}
          autoFocus
        />
      ) : (
        <p className="todo-text">{todo.text}</p>
      )}

      <div className="todo-actions">
        {isEditing ? (
          <>
            <button className="action-button" type="button" onClick={() => onSaveEdit(todo.id)}>
              저장
            </button>
            <button className="action-button" type="button" onClick={onCancelEdit}>
              취소
            </button>
          </>
        ) : (
          <button className="action-button" type="button" onClick={() => onStartEdit(todo)}>
            수정
          </button>
        )}
        <button
          className="action-button"
          type="button"
          onClick={() => onToggleTodoCompletion(todo.id)}
        >
          {todo.completed ? '완료 해제' : '완료'}
        </button>
        <button className="action-button delete" type="button" onClick={() => onDeleteTodo(todo.id)}>
          삭제
        </button>
      </div>
    </li>
  )
}

export default TodoItem
