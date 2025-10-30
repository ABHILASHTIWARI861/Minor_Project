function withTimeout(ms) {
	const controller = new AbortController()
	const id = setTimeout(() => controller.abort(), ms)
	return { signal: controller.signal, cancel: () => clearTimeout(id) }
}

export async function warmUp(endpoint) {
	try {
		const url = new URL(endpoint)
		const pingUrl = `${url.origin}/`
		const { signal, cancel } = withTimeout(12000)
		await fetch(pingUrl, { method: 'GET', mode: 'cors', cache: 'no-store', keepalive: true, signal })
		cancel()
	} catch {
		// ignore warm-up errors
	}
}

export async function predictWithFormData(endpoint, formData) {
	const { signal, cancel } = withTimeout(30000)
	const response = await fetch(endpoint, {
		method: 'POST',
		mode: 'cors',
		body: formData,
		keepalive: true,
		signal,
	})
	cancel()
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


