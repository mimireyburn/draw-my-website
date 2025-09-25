import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
// import GetSnap from './get-snap/get-snap.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App />} />
				{/* <Route path="/get-snap" element={<GetSnap />} /> */}
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
)
