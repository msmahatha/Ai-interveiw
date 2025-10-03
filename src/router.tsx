import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import IntervieweePage from './pages/IntervieweePage'
import InterviewerPage from './pages/InterviewerPage'
import AuthDebugger from './components/debug/AuthDebugger'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <IntervieweePage />
      },
      {
        path: '/interviewee',
        element: <IntervieweePage />
      },
      {
        path: '/interviewer',
        element: <InterviewerPage />
      },
      {
        path: '/debug-auth',
        element: <AuthDebugger />
      }
    ]
  }
])