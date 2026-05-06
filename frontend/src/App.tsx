import { BrowserRouter, Route, Routes } from 'react-router'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import ChatAppPage from './pages/ChatAppPage'
import { Toaster } from 'sonner'
import ProtectedRoute from "./components/auth/protectedRoute"
function App() {
  return <>
    <Toaster richColors />
    <BrowserRouter>
      <Routes>
        <Route
          path='/signin'
          element={<SignInPage />}
        />
        <Route
          path='/signUp'
          element={<SignUpPage />}
        />
        <Route element={<ProtectedRoute />}>
          <Route
            path='/'
            element={<ChatAppPage />}
          />
        </Route>

      </Routes>
    </BrowserRouter>
  </>

}

export default App
