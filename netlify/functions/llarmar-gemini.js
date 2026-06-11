exports.handler = async function (event, context) {
  try {
    // 1. Validar que el cuerpo exista
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "El cuerpo de la petición está vacío." }),
      };
    }

    const { gastos, presupuesto } = JSON.parse(event.body);

    if (!gastos || presupuesto === undefined) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Faltan los parámetros 'gastos' o 'presupuesto'." }),
      };
    }

    // 2. Verificar la API Key antes de hacer el fetch
    const apiKey = process.env.GEMINI_API_KEY; 
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "La variable de entorno GEMINI_API_KEY no está configurada en Netlify." }),
      };
    }

    const prompt = `
        Actúa como un experto en finanzas personales. 
        Tengo un presupuesto de $${presupuesto}.
        Aquí está la lista de mis gastos recientes:
        ${JSON.stringify(gastos, null, 2)}
        
        Por favor, realiza un análisis detallado de mi situación financiera actual. 
        Incluye el total gastado, qué porcentaje del presupuesto representa, consejos de ahorro y alertas si detectas gastos innecesarios o si superé el presupuesto. Concluye con una recomendación breve y clara.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    // 3. Petición segura a Gemini
    const respuesta = await llamarGeminiConRetry(url, {
      contents: [{ parts: [{ text: prompt }] }]
    });
        
    // 4. Leer el texto plano primero para evitar que una respuesta rota de Google rompa Node.js
    const textoPlano = await respuesta.text();
    let datos;
    
    try {
      datos = JSON.parse(textoPlano);
    } catch (e) {
      return {
        statusCode: 502, // Bad Gateway
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Google no devolvió un JSON válido.", detallesTexto: textoPlano }),
      };
    }

    // 5. Si Google devolvió un error controlado
    if (!respuesta.ok) {
      return {
        statusCode: respuesta.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: 'error',
          message: "Error devuelto por la API de Gemini", 
          detalles: datos 
        }),
      };
    }

    // 6. Retorno de éxito estructurado
    if (datos && datos.candidates && datos.candidates[0]?.content?.parts?.[0]?.text) {
      const analisisTexto = datos.candidates[0].content.parts[0].text;
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'success', data: analisisTexto }),
      };
    } else {
      return {
        statusCode: 422,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: 'error', message: "Estructura inesperada o bloqueo de contenido.", detalles: datos }),
      };
    }

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: 'error', message: error.message }),
    };
  }
};

async function llamarGeminiConRetry(url, body, intentos = 3) {
  let respuesta;
  for (let i = 0; i < intentos; i++) {
    respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (respuesta.status !== 503) {
      return respuesta;
    }

    if (i < intentos - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  return respuesta;
}