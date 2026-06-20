
import './App.css'
import router from "@/routes/router.jsx"
import { AuthProvider } from '@/contexts/auth.jsx'
import { RouterProvider } from 'react-router-dom'

export default function App() {
  return (
    <AuthProvider>
      <div className="w-[80%] mx-auto p-3 bg-blue-50/25 min-h-screen flex flex-col">
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  );
}

