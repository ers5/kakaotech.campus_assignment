export const FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '진행 중' },
  { value: 'completed', label: '완료' },
]

export const sortTodos = (todos) =>
  [...todos].sort((firstTodo, secondTodo) => {
    if (firstTodo.date !== secondTodo.date) {
      return firstTodo.date.localeCompare(secondTodo.date)
    }

    return secondTodo.id - firstTodo.id
  })
