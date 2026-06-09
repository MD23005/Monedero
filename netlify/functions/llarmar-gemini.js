exports.handler = async function (event, context) {
  try {
    // Recuperamos el prompt que mandó el Web Worker
    const { prompt } = JSON.parse(event.body);

    // Intentamos leer la variable de entorno segura de Netlify (Producción)
    let apiKey = process.env.GEMINI_API_KEY; 

    // Si no hay variable de entorno usa la local
    if (!apiKey) {
      try {
        
        const config = require('./config.js');
        apiKey = config.CONFIG.GOOGLE_API; 
      } catch (error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "No se encontró la API Key local en config.js" }),
        };
      }
    }

    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    const datos = await respuesta.json();

    // Le devolvemos la respuesta de Gemini al Web Worker
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};