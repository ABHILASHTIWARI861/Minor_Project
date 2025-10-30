export async function predictWithFormData(endpoint, formData) {
	const response = await fetch(endpoint, {
		method: 'POST',
		body: formData,
	})
	if (!response.ok) {
		let errorText = ''
		try {
			errorText = await response.text()
		} catch {
			// ignore
		}
		throw new Error(`${response.status} - ${errorText || 'Request failed'}`)
	}
	try {
		return await response.json()
	} catch (err) {
		throw new Error('Failed to parse JSON response')
	}
}


