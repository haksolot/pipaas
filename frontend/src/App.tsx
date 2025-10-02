import { Route, Routes, BrowserRouter as Router } from "react-router-dom"
import { ThemeProvider } from "@/components/layouts/theme-provider"
import { SidebarLayout } from "@/components/layouts/sidebar-layout"
import { ServicesPage } from "./pages/services"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <SidebarLayout>
          <Routes>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/settings" element={<div>Settings</div>} />
          </Routes>
        </SidebarLayout>
      </Router>
    </ThemeProvider>
  )
}

export default App
