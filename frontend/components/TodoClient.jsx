'use client'

import { useState } from 'react'

import DateSelector from './DateSelector'
import TodoHeader from './TodoHeader'
import TodoPanel from './TodoPanel'
import {
  addDaysToKey,
  DAY_LABELS,
  formatDate,
  formatSelectedDate,
  getWeekDates,
  isDateKeyInWeek,
  parseDateKey,
  toDateKey,
} from '@/lib/dates'
import { FILTER_OPTIONS, sortTodos } from '@/lib/todos'

export default function TodoClient({
  apiBaseUrl,
  initialTodos,
  initialWeekStartKey,
  initialMessage,
}) {
  const todayKey = toDateKey(new Date())
  const [todos, setTodos] = useState(sortTodos(initialTodos))
  const [weekStartKey, setWeekStartKey] = useState(initialWeekStartKey)
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey)
  const [todoText, setTodoText] = useState('')
  const [editingTodoId, setEditingTodoId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [currentFilter, setCurrentFilter] = useState('all')
  const [message, setMessage] = useState(initialMessage)
  const [isLoading, setIsLoading] = useState(false)

  const weekDates = getWeekDates(weekStartKey)
  const weekStartDate = weekDates[0]
  const weekEndDate = weekDates[6]
  const selectedDate = parseDateKey(selectedDateKey)
  const selectedTodos = todos.filter((todo) => todo.date === selectedDateKey)
  const filteredTodos = selectedTodos.filter((todo) => {
    if (currentFilter === 'active') {
      return !todo.completed
    }

    if (currentFilter === 'completed') {
      return todo.completed
    }

    return true
  })

  const requestJson = async (path, options) => {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'API request failed.')
    }

    if (response.status === 204) {
      return null
    }

    return response.json()
  }

  const loadWeek = async (nextWeekStartKey, nextSelectedDateKey) => {
    setIsLoading(true)
    setMessage('')

    try {
      const weekTodos = await requestJson(`/todos?week_start=${nextWeekStartKey}`)
      setTodos(sortTodos(weekTodos))
      setWeekStartKey(nextWeekStartKey)
      setSelectedDateKey(nextSelectedDateKey)
      setTodoText('')
      cancelEdit()
    } catch {
      setMessage('일정을 불러오지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const addTodo = async () => {
    const trimmedText = todoText.trim()

    if (!trimmedText) {
      setMessage('할 일을 입력한 뒤 추가해주세요.')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const createdTodo = await requestJson('/todos', {
        method: 'POST',
        body: JSON.stringify({
          content: trimmedText,
          date: selectedDateKey,
        }),
      })

      setTodos((currentTodos) => sortTodos([createdTodo, ...currentTodos]))
      setTodoText('')
    } catch {
      setMessage('일정을 추가하지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectDate = (date) => {
    setSelectedDateKey(toDateKey(date))
    setTodoText('')
    cancelEdit()
  }

  const startEdit = (todo) => {
    setEditingTodoId(todo.id)
    setEditingText(todo.content)
    setMessage('')
  }

  const cancelEdit = () => {
    setEditingTodoId(null)
    setEditingText('')
    setMessage('')
  }

  const saveEdit = async (todoId) => {
    const trimmedText = editingText.trim()

    if (!trimmedText) {
      setMessage('수정 내용은 비워둘 수 없습니다.')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const updatedTodo = await requestJson(`/todos/${todoId}`, {
        method: 'PUT',
        body: JSON.stringify({
          content: trimmedText,
        }),
      })

      setTodos((currentTodos) =>
        sortTodos(currentTodos.map((todo) => (todo.id === todoId ? updatedTodo : todo))),
      )
      cancelEdit()
    } catch {
      setMessage('일정을 수정하지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTodoCompletion = async (todoId) => {
    const targetTodo = todos.find((todo) => todo.id === todoId)

    if (!targetTodo) {
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const updatedTodo = await requestJson(`/todos/${todoId}`, {
        method: 'PUT',
        body: JSON.stringify({
          completed: !targetTodo.completed,
        }),
      })

      setTodos((currentTodos) =>
        sortTodos(currentTodos.map((todo) => (todo.id === todoId ? updatedTodo : todo))),
      )
    } catch {
      setMessage('완료 상태를 변경하지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTodo = async (todoId) => {
    setIsLoading(true)
    setMessage('')

    try {
      await requestJson(`/todos/${todoId}`, {
        method: 'DELETE',
      })

      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId))

      if (editingTodoId === todoId) {
        cancelEdit()
      }
    } catch {
      setMessage('일정을 삭제하지 못했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const moveWeek = (weekOffset) => {
    const nextWeekStartKey = addDaysToKey(weekStartKey, weekOffset * 7)
    const shiftedSelectedDateKey = addDaysToKey(selectedDateKey, weekOffset * 7)
    const nextSelectedDateKey = isDateKeyInWeek(shiftedSelectedDateKey, nextWeekStartKey)
      ? shiftedSelectedDateKey
      : nextWeekStartKey

    loadWeek(nextWeekStartKey, nextSelectedDateKey)
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
        isLoading={isLoading}
        onMoveWeek={moveWeek}
      />

      <DateSelector
        weekDates={weekDates}
        dayLabels={DAY_LABELS}
        selectedDateKey={selectedDateKey}
        todayKey={todayKey}
        todos={todos}
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
        isLoading={isLoading}
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
