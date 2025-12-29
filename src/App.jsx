import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="w-[300px] h-[400px] bg-slate-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Strange Tabs </h1>
      <p className="text-center text-gray-300">
        React + Tailwind is working!
      </p>
      <button className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded transition">
        Test Button
      </button>
    </div>
  )
}

export default App