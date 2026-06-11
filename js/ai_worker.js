self.onmessage = async function(event) {
    const { gastos, presupuesto } = event.data;

    try {
        // Aseguramos la URL absoluta usando la ubicación actual del dominio
        const url = `${self.location.origin}/.netlify/functions/llarmar-gemini`;

        // Le enviamos a Netlify únicamente las variables limpias
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gastos, presupuesto }) 
        });

        const data = await response.json();

        if (!response.ok) {
            // Si Netlify o Gemini fallaron, capturamos el mensaje de error estructurado
            throw new Error(data.error || data.message || `HTTP ${response.status}`);
        }

        // Si la función de Netlify ya te devuelve el formato { status: 'success', data: '...' }
        if (data.status === 'success') {
            self.postMessage({ status: 'success', data: data.data });
        } else {
            throw new Error(data.message || "Error desconocido en la función serverless.");
        }

    } catch (err) {
        self.postMessage({ status: 'error', message: err.message });
    }
}