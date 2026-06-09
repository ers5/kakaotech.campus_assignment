import { useEffect, useRef, useState } from 'react'
import './App.css'

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']
const TODO_STORAGE_KEY = 'weeklyTodos'
const FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '진행 중' },
  { value: 'completed', label: '완료' },
]

const createDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const normalizeDate = (date) => {
  const normalizedDate = new Date(date)
  normalizedDate.setHours(0, 0, 0, 0)

  return normalizedDate
}

const getWeekStartDate = (date) => {
  const weekStartDate = normalizeDate(date)
  const dayOfWeek = weekStartDate.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  weekStartDate.setDate(weekStartDate.getDate() + mondayOffset)

  return weekStartDate
}

const getWeekDates = (date) => {
  const weekStartDate = getWeekStartDate(date)

  return Array.from({ length: 7 }, (_, index) => {
    const weekDate = new Date(weekStartDate)
    weekDate.setDate(weekStartDate.getDate() + index)

    return weekDate
  })
}

const formatDate = (date) =>
  new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
  }).format(date)

const formatSelectedDate = (date) =>
  new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(date)

const initialTodos = [
  {
    id: 1,
    text: '이번 주 할 일 계획하기',
    dateKey: createDateKey(new Date()),
    completed: false,
  },
]

const getNextTodoId = (todoItems) => {
  const maxTodoId = todoItems.reduce((maxId, todo) => Math.max(maxId, todo.id), 0)

  return maxTodoId + 1
}

const parseStoredTodos = (storedTodos) => {
  const parsedTodos = JSON.parse(storedTodos)

  if (!Array.isArray(parsedTodos)) {
    return null
  }

  return parsedTodos
    .filter(
      (todo) =>
        typeof todo.id === 'number' &&
        typeof todo.text === 'string' &&
        typeof todo.dateKey === 'string',
    )
    .map((todo) => ({
      id: todo.id,
      text: todo.text,
      dateKey: todo.dateKey,
      completed: typeof todo.completed === 'boolean' ? todo.completed : false,
    }))
}

const loadInitialTodos = () => {
  const storedTodos = localStorage.getItem(TODO_STORAGE_KEY)

  if (!storedTodos) {
    return initialTodos
  }

  try {
    return parseStoredTodos(storedTodos) ?? initialTodos
  } catch (error) {
    console.error('저장된 Todo 데이터를 불러오는 중 오류가 발생했습니다.', error)
    return initialTodos
  }
}

function App() {
  const today = normalizeDate(new Date())
  const [todos, setTodos] = useState(loadInitialTodos)
  const [selectedDate, setSelectedDate] = useState(today)
  const [todoText, setTodoText] = useState('')
  const [editingTodoId, setEditingTodoId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [currentFilter, setCurrentFilter] = useState('all')
  const [message, setMessage] = useState('')
  const nextTodoIdRef = useRef(getNextTodoId(todos))

  useEffect(() => {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const selectedDateKey = createDateKey(selectedDate)
  const weekDates = getWeekDates(selectedDate)
  const weekStartDate = weekDates[0]
  const weekEndDate = weekDates[6]
  const selectedTodos = todos.filter((todo) => todo.dateKey === selectedDateKey)
  const filteredTodos = selectedTodos.filter((todo) => {
    if (currentFilter === 'active') {
      return !todo.completed
    }

    if (currentFilter === 'completed') {
      return todo.completed
    }

    return true
  })

  const addTodo = () => {
    const trimmedText = todoText.trim()

    if (!trimmedText) {
      setMessage('할 일을 입력한 뒤 추가해 주세요.')
      return
    }

    const newTodo = {
      id: nextTodoIdRef.current,
      text: trimmedText,
      dateKey: selectedDateKey,
      completed: false,
    }

    nextTodoIdRef.current += 1
    setTodos((currentTodos) => [newTodo, ...currentTodos])
    setTodoText('')
    setMessage('')
  }

  const selectDate = (date) => {
    setSelectedDate(normalizeDate(date))
    setTodoText('')
    cancelEdit()
  }

  const startEdit = (todo) => {
    setEditingTodoId(todo.id)
    setEditingText(todo.text)
    setMessage('')
  }

  const cancelEdit = () => {
    setEditingTodoId(null)
    setEditingText('')
    setMessage('')
  }

  const saveEdit = (todoId) => {
    const trimmedText = editingText.trim()

    if (!trimmedText) {
      setMessage('수정 내용은 비워둘 수 없어요.')
      return
    }

    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, text: trimmedText } : todo,
      ),
    )
    cancelEdit()
  }

  const toggleTodoCompletion = (todoId) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      ),
    )
    setMessage('')
  }

  const deleteTodo = (todoId) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId))

    if (editingTodoId === todoId) {
      cancelEdit()
      return
    }

    setMessage('')
  }

  const moveWeek = (weekOffset) => {
    const nextSelectedDate = new Date(selectedDate)
    nextSelectedDate.setDate(selectedDate.getDate() + weekOffset * 7)
    setSelectedDate(normalizeDate(nextSelectedDate))
    setTodoText('')
    cancelEdit()
  }

  return (
    <main className="todo-app">
      <header className="todo-header">
        <div>
          <h1>주간 Todo</h1>
          <p>날짜를 선택하면 해당 날짜의 할 일만 표시됩니다.</p>
        </div>
        <div className="week-controls" aria-label="주간 이동">
          <button type="button" className="week-button" onClick={() => moveWeek(-1)}>
            이전 주
          </button>
          <strong className="week-range">
            {formatDate(weekStartDate)} - {formatDate(weekEndDate)}
          </strong>
          <button type="button" className="week-button" onClick={() => moveWeek(1)}>
            다음 주
          </button>
        </div>
      </header>

      <section className="date-selector" aria-label="날짜 선택">
        {weekDates.map((date, index) => {
          const dateKey = createDateKey(date)
          const isSelected = dateKey === selectedDateKey
          const isToday = dateKey === createDateKey(today)
          const todoCount = todos.filter((todo) => todo.dateKey === dateKey).length

          return (
            <button
              className={`date-card${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
              type="button"
              key={dateKey}
              aria-pressed={isSelected}
              onClick={() => selectDate(date)}
            >
              <span className="date-weekday">{DAY_LABELS[index]}</span>
              <strong className="date-day">{date.getDate()}</strong>
              <span className="date-count">{todoCount}개</span>
            </button>
          )
        })}
      </section>

      <section className="selected-panel" aria-label="선택한 날짜 Todo 목록">
        <div className="selected-summary">
          <div>
            <strong>{formatSelectedDate(selectedDate)}</strong>
            <span>
              전체 {selectedTodos.length}개 / 진행 중{' '}
              {selectedTodos.filter((todo) => !todo.completed).length}개 / 완료{' '}
              {selectedTodos.filter((todo) => todo.completed).length}개
            </span>
          </div>
        </div>

        <form
          className="todo-form"
          onSubmit={(event) => {
            event.preventDefault()
            addTodo()
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
            onChange={(event) => setTodoText(event.target.value)}
            placeholder="선택한 날짜에 할 일 추가"
            maxLength={100}
          />
          <button className="primary-button" type="submit">
            추가
          </button>
        </form>

        <p className="input-message" role="status" aria-live="polite">
          {message}
        </p>

        <div className="filter-controls" aria-label="Todo 상태 필터">
          {FILTER_OPTIONS.map((filterOption) => (
            <button
              className={`filter-button${
                currentFilter === filterOption.value ? ' selected' : ''
              }`}
              type="button"
              key={filterOption.value}
              aria-pressed={currentFilter === filterOption.value}
              onClick={() => {
                setCurrentFilter(filterOption.value)
                cancelEdit()
              }}
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
            {filteredTodos.map((todo) => {
              const isEditing = editingTodoId === todo.id

              return (
                <li className={`todo-item${todo.completed ? ' completed' : ''}`} key={todo.id}>
                  {isEditing ? (
                    <input
                      className="edit-input"
                      type="text"
                      value={editingText}
                      onChange={(event) => setEditingText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          saveEdit(todo.id)
                        }

                        if (event.key === 'Escape') {
                          cancelEdit()
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
                        <button
                          className="action-button"
                          type="button"
                          onClick={() => saveEdit(todo.id)}
                        >
                          저장
                        </button>
                        <button className="action-button" type="button" onClick={cancelEdit}>
                          취소
                        </button>
                      </>
                    ) : (
                      <button
                        className="action-button"
                        type="button"
                        onClick={() => startEdit(todo)}
                      >
                        수정
                      </button>
                    )}
                    <button
                      className="action-button"
                      type="button"
                      onClick={() => toggleTodoCompletion(todo.id)}
                    >
                      {todo.completed ? '완료 해제' : '완료'}
                    </button>
                    <button
                      className="action-button delete"
                      type="button"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      삭제
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
