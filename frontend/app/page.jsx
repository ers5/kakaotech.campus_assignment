import TodoClient from '@/components/TodoClient'
import { getSundayStartKey } from '@/lib/dates'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'

async function getInitialTodos(weekStartKey) {
  try {
    const response = await fetch(`${API_BASE_URL}/todos?week_start=${weekStartKey}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to load todos.')
    }

    return {
      todos: await response.json(),
      error: '',
    }
  } catch {
    return {
      todos: [],
      error: '서버에서 일정을 불러오지 못했습니다. 백엔드 실행 상태를 확인해주세요.',
    }
  }
}

export default async function Home() {
  const today = new Date()
  const initialWeekStartKey = getSundayStartKey(today)
  const { todos, error } = await getInitialTodos(initialWeekStartKey)

  return (
    <TodoClient
      apiBaseUrl={API_BASE_URL}
      initialTodos={todos}
      initialWeekStartKey={initialWeekStartKey}
      initialMessage={error}
    />
  )
}
