self.onmessage = async function(event) {
    const { gastos, presupuesto, apiKey } = event.data;

    const prompt = `
        Actúa como un experto en finanzas personales. 
        Tengo un presupuesto de $${presupuesto}.
        Aquí está la lista de mis gastos recientes:
        ${JSON.stringify(gastos, null, 2)}
        
        Por favor, realiza un análisis detallado de mi situación financiera actual. 
        Incluye el total gastado, qué porcentaje del presupuesto representa, consejos de ahorro y alertas si detectas gastos innecesarios o si superé el presupuesto. Concluye con una recomendación breve y clara.
    `;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Primero validamos de forma segura si la estructura esperada existe
        if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const analisisTexto = data.candidates[0].content.parts[0].text;
            // Enviamos el estado exitoso
            self.postMessage({ status: 'success', data: analisisTexto });
        } else {
            // Manejo de respuestas alternativas (ej. si la IA bloquea el contenido por políticas)
            if (data.promptFeedback?.blockReason) {
                throw new Error(`La solicitud fue bloqueada por: ${data.promptFeedback.blockReason}`);
            }
            throw new Error("La estructura de respuesta de Gemini no es la esperada.");
        }

    } catch (err) {
        // Mantenemos las llaves en inglés (status y message) para que ai_service.js las entienda
        self.postMessage({ status: 'error', message: err.message });
    }
}