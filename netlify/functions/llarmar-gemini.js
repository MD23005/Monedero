exports.handler = async function (event, context) {
  try {
    // Recuperamos el prompt que mandó el Web Worker
    const { prompt } = JSON.parse(event.body);

    // 1. Intentamos leer la variable de entorno de Netlify
    let apiKey = process.env.GEMINI_API_KEY; 

    // 2. URL de Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    // 3. Petición adaptada a Gemini 2.5 (
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          role: "user", // Requerido/Recomendado en v1beta para 2.5
          parts: [{ text: prompt }] 
        }]
      })
    });
    
    const datos = await respuesta.json();

    if (!respuesta.ok) {
      return {
        statusCode: respuesta.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          error: "Error de la API de Gemini", 
          detalles: datos 
        }),
      };
    }

    // Le devolvemos la respuesta exitosa de Gemini al Web Worker
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