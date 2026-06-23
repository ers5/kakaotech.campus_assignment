import './globals.css'

export const metadata = {
  title: '주간 Todo',
  description: 'Next.js와 FastAPI로 만든 주간 Todo 앱',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
