exports.handler = async function (event, context) {
  try {
    // 1. Recibimos gastos y presupuesto desde el frontend (igual que hacía el worker)
    const { gastos, presupuesto } = JSON.parse(event.body);

    // Validación básica para evitar enviar datos vacíos a la API
    if (!gastos || presupuesto === undefined) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Faltan los parámetros 'gastos' o 'presupuesto' en la petición." }),
      };
    }

    // 2. Construimos el prompt con la misma lógica del experto en finanzas
    const prompt = `
        Actúa como un experto en finanzas personales. 
        Tengo un presupuesto de $${presupuesto}.
        Aquí está la lista de mis gastos recientes:
        ${JSON.stringify(gastos, null, 2)}
        
        Por favor, realiza un análisis detallado de mi situación financiera actual. 
        Incluye el total gastado, qué porcentaje del presupuesto representa, consejos de ahorro y alertas si detectas gastos innecesarios o si superé el presupuesto. Concluye con una recomendación breve y clara.
    `;

    const apiKey = process.env.GEMINI_API_KEY; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    // 3. Petición oficial a Gemini
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      })
    });
    
    const datos = await respuesta.json();

    // 4. Si Google devuelve un error de API (Ej: API key inválida, mal formato, etc.)
    if (!respuesta.ok) {
      console.error("Error de Google API:", JSON.stringify(datos));
      return {
        statusCode: respuesta.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          error: "Gemini API Error", 
          detalles: datos 
        }),
      };
    }

    // 5. Aplicamos las validaciones de estructura y bloqueos que tenía el Worker
    if (datos && datos.candidates && datos.candidates[0]?.content?.parts?.[0]?.text) {
      const analisisTexto = datos.candidates[0].content.parts[0].text;
      
      // Devolvemos la respuesta limpia al frontend
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'success', data: analisisTexto }),
      };
    } else {
      // Manejo de bloqueos por políticas de contenido de la IA
      if (datos.promptFeedback?.blockReason) {
        return {
          statusCode: 422, // Unprocessable Entity (para indicar que la IA lo rechazó)
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: `La solicitud fue bloqueada por: ${datos.promptFeedback.blockReason}` }),
        };
      }
      
      throw new Error("La estructura de respuesta de Gemini no es la esperada.");
    }

  } catch (error) {
    // Captura errores de parseo, de red o excepciones lanzadas manualmente
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: 'error', message: error.message }),
    };
  }
};