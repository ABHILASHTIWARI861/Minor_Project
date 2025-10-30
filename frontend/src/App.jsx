import React from 'react'
import ImageUploader from './components/ImageUploader.jsx'

export default function App() {
	return (
		<div className="container">
			<h1>PetX Image Predictor</h1>
			<p className="muted">Upload an image and get a prediction from the backend.</p>
			<ImageUploader />
			<footer>Backend: <code>https://minor-project-petx.onrender.com</code>. No backend changes required.</footer>
		</div>
	)
}


