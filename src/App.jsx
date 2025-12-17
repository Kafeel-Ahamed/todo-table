import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './component/Layout'
import Admin from './component/Admin'
import User from './component/User'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Admin />} />
            <Route path="/user" element={<User />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
