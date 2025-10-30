import React, { useCallback, useMemo, useRef, useState } from 'react'
import { predictWithFormData, warmUp } from '../services/api.js'

const DEFAULT_ENDPOINT = 'https://minor-project-petx.onrender.com/predictImage'
const ALT_ENDPOINT = 'https://minor-project-petx.onrender.com/predict'

export default function ImageUploader() {
	const [endpoint, setEndpoint] = useState(
		window.localStorage.getItem('petx:endpoint') || DEFAULT_ENDPOINT
	)
	const [status, setStatus] = useState('Waiting for action…')
	const [isLoading, setIsLoading] = useState(false)
	const [previewUrl, setPreviewUrl] = useState('')
	const fileInputRef = useRef(null)

	const fieldName = useMemo(() => (endpoint.endsWith('/predictImage') ? 'image' : 'file'), [endpoint])

	const onChooseClick = useCallback(() => {
		fileInputRef.current?.click()
	}, [])

	const onFilesSelected = useCallback((files) => {
		if (!files || !files.length) return
		const file = files[0]
		if (!file.type.startsWith('image/')) {
			setStatus('Please choose an image file.')
			return
		}
		const url = URL.createObjectURL(file)
		setPreviewUrl(url)
		setStatus('Ready to upload.')
	}, [])

	const onDrop = useCallback((e) => {
		e.preventDefault()
		const dt = e.dataTransfer
		if (dt && dt.files) {
			if (fileInputRef.current) fileInputRef.current.files = dt.files
			onFilesSelected(dt.files)
		}
	}, [onFilesSelected])

	const onDragOver = useCallback((e) => { e.preventDefault() }, [])

	const onClear = useCallback(() => {
		if (fileInputRef.current) fileInputRef.current.value = ''
		setPreviewUrl('')
		setStatus('Cleared. Choose another image.')
	}, [])

	const onPredict = useCallback(async () => {
		const input = fileInputRef.current
		if (!input || !input.files || !input.files.length) {
			setStatus('Please select an image first.')
			return
		}
		const file = input.files[0]
		const formData = new FormData()
		formData.append(fieldName, file)

		setIsLoading(true)
		setStatus('Warming backend and predicting...')
		try {
			// Wake server (Render cold start) – ignore errors
			await warmUp(endpoint)
			setStatus('Uploading and predicting...')
			const result = await predictWithFormData(endpoint, formData)
			const parts = []
			if (result && Object.prototype.hasOwnProperty.call(result, 'prediction')) parts.push(`Prediction: ${result.prediction}`)
			if (result && Object.prototype.hasOwnProperty.call(result, 'confidence')) parts.push(`Confidence: ${result.confidence}`)
			setStatus(parts.length ? parts.join('\n') : JSON.stringify(result, null, 2))
		} catch (err) {
			const msg = err?.message || 'Unknown error'
			const extra = msg.includes('Failed to fetch')
				? '\nTip: Check the endpoint URL, server availability, and CORS. Try opening the URL in your browser and ensure /docs loads, then retry.'
				: ''
			setStatus(`Error: ${msg}${extra}`)
		} finally {
			setIsLoading(false)
		}
	}, [fieldName, endpoint])

	return (
		<div className="card row">
			<div
				id="dropzone"
				className="dropzone"
				onClick={onChooseClick}
				onDrop={onDrop}
				onDragOver={onDragOver}
				role="button"
				title="Click to select or drag and drop"
			>
				<strong>Click to choose</strong> or drag & drop an image here
				<br />
				<span className="muted">PNG, JPG, JPEG</span>
				<input
					ref={fileInputRef}
					id="fileInput"
					type="file"
					accept="image/*"
					style={{ display: 'none' }}
					onChange={(e) => onFilesSelected(e.target.files)}
				/>
			</div>

			{previewUrl ? (
				<div id="preview" className="preview">
					<img id="previewImg" alt="preview" src={previewUrl} />
					<div>
						<div className="actions">
							<button id="predictBtn" className="btn primary" onClick={onPredict} disabled={isLoading}>
								{isLoading ? 'Predicting…' : 'Upload & Predict'}
							</button>
							<button id="clearBtn" className="btn" type="button" onClick={onClear} disabled={isLoading}>Clear</button>
						</div>
						<pre className="status" id="status">{status}</pre>
					</div>
				</div>
			) : (
				<pre className="status" id="status">{status}</pre>
			)}

			<div className="endpoint">
				<label htmlFor="endpointInput">Endpoint:</label>{' '}
				<input
					id="endpointInput"
					className="btn"
					style={{ width: '100%' }}
					list="endpointOptions"
					value={endpoint}
					onChange={(e) => {
						setEndpoint(e.target.value)
						try { window.localStorage.setItem('petx:endpoint', e.target.value) } catch {}
					}}
					title="Enter full URL to your API endpoint"
				/>
				<datalist id="endpointOptions">
					<option value={DEFAULT_ENDPOINT}>/predictImage (field: image)</option>
					<option value={ALT_ENDPOINT}>/predict (field: file)</option>
				</datalist>
			</div>
		</div>
	)
}


