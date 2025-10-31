function withTimeout(ms) {
    const controller = new AbortController()
    const id = setTimeout(() => {
        // Provide an explicit reason so errors are clearer across browsers
        try {
            controller.abort('Timeout')
        } catch {
            // Fallback in older browsers
            controller.abort()
        }
    }, ms)
    return { signal: controller.signal, cancel: () => clearTimeout(id) }
}

export async function warmUp(endpoint) {
	try {
		const url = new URL(endpoint)
		const pingUrl = `${url.origin}/`
        const { signal, cancel } = withTimeout(20000)
		await fetch(pingUrl, { method: 'GET', mode: 'cors', cache: 'no-store', keepalive: true, signal })
		cancel()
	} catch {
		// ignore warm-up errors
	}
}

export async function predictWithFormData(endpoint, formData) {
    const { signal, cancel } = withTimeout(90000)
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            mode: 'cors',
            body: formData,
            // keepalive is unnecessary for long-running uploads and can cause issues
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
    } catch (err) {
        cancel()
        if (err?.name === 'AbortError' || err === 'Timeout' || err?.message?.toLowerCase?.().includes('aborted')) {
            throw new Error('Request timed out. The server may be cold or slow. Please retry.')
        }
        throw err
    }
}


