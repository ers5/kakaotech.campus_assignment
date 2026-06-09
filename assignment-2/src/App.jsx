import { useEffect, useRef, useState } from 'react'
import DateSelector from './components/DateSelector'
import TodoHeader from './components/TodoHeader'
import TodoPanel from './components/TodoPanel'
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

  const changeFilter = (filterValue) => {
    setCurrentFilter(filterValue)
    cancelEdit()
  }

  return (
    <main className="todo-app">
      <TodoHeader
        weekStartDate={weekStartDate}
        weekEndDate={weekEndDate}
        formatDate={formatDate}
        onMoveWeek={moveWeek}
      />

      <DateSelector
        weekDates={weekDates}
        dayLabels={DAY_LABELS}
        selectedDateKey={selectedDateKey}
        todayKey={createDateKey(today)}
        todos={todos}
        createDateKey={createDateKey}
        onSelectDate={selectDate}
      />

      <TodoPanel
        selectedDate={selectedDate}
        selectedTodos={selectedTodos}
        filteredTodos={filteredTodos}
        currentFilter={currentFilter}
        filterOptions={FILTER_OPTIONS}
        todoText={todoText}
        editingTodoId={editingTodoId}
        editingText={editingText}
        message={message}
        formatSelectedDate={formatSelectedDate}
        onAddTodo={addTodo}
        onTodoTextChange={setTodoText}
        onFilterChange={changeFilter}
        onStartEdit={startEdit}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        onEditingTextChange={setEditingText}
        onToggleTodoCompletion={toggleTodoCompletion}
        onDeleteTodo={deleteTodo}
      />
    </main>
  )
}

export default App
