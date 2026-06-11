exports.handler = async function (event, context) {
  try {
    const { prompt } = JSON.parse(event.body);

    let apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
      try {
        const config = require('./config.js');
        apiKey = config.CONFIG.GOOGLE_API; 
      } catch (error) {
        return {
          statusCode: 500,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "No se encontró la API Key" }),
        };
      }
    }

    // Usamos la URL oficial para generación de contenido
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    // Formato estándar estricto de Gemini API
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

    // SI GOOGLE DEVUELVE ERROR (Aquí capturamos el 400)
    if (!respuesta.ok) {
      console.error("Error de Google API:", JSON.stringify(datos));
      return {
        statusCode: respuesta.status,
        headers: { "Content-Type": "application/json" },
        // Le pasamos el error real de Google al frontend para inspeccionarlo
        body: JSON.stringify({ 
          error: "Gemini API Error", 
          detalles: datos 
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};