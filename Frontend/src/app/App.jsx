import { RouterProvider } from 'react-router'
import { router } from './app.routes'
import {useAuth} from '../features/auth/hooks/useAuth'
import { useEffect, useRef } from 'react'
import { clearActiveChatId } from '../features/chat/service/activeChatStorage'

function App() {
  const auth = useAuth()
  const getMe = useRef(auth.handleGetMe)
  const previousUserId = useRef(null)

  useEffect(() => {
    getMe.current()
  }, [])

  useEffect(() => {
    const userId = auth.user?._id

    if (userId) {
      previousUserId.current = userId
      return
    }

    if (previousUserId.current) {
      clearActiveChatId(previousUserId.current)
      previousUserId.current = null
    }
  }, [auth.user?._id])

  return (
    <RouterProvider router={router} />
  )
}

export default App
