//Importar del archivo config la variable donde está la API key de Google
import { CONFIG } from "./config";
//Parámetros para usar la API
const apiKey = CONFIG.GOOGLE_API; //Modificar por API en el archivo config.js, si no existe debe crearlo

export function consultarIA(currentUser){
    //Componentes del DOM
    //botón para análisis de IA
    const btnAiService = document.getElementById('btn_aiService');
    //div donde se impimirá la respuesta de la IA
    const txtAiResponse = document.getElementById('aiResponse');
    //contenedor del div donde se muestra la respuesta de la IA
    const aiContainer = document.querySelector('.AiResponse-container');

    btnAiService.addEventListener('click', ()=>{
        if(!currentUser.gastos || !currentUser.budget){
            Swal.fire({
                title: 'No ha ingresado gastos o presupuesto',
                text: 'Debes agregar al menos un gasto y tu presupuesto',
                icon: 'warn',
                confirmButtonText: 'Ok'
            });
            return;
        }

        Swal.fire({
            title: 'Analizando tus finanzas...',
            text: 'Nuestro asistente de IA está procesando tu presupuesto y gastos en segundo plano.',
            allowOutsideClick: true,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        //Inicializar el webworker
        const aiWorker = new Worker('../js/ai_worker.js');

        aiWorker.postMessage({
            gastos: currentUser.gastos,
            presupuesto: currentUser.budget,
            apiKey: apiKey
        });

        aiWorker.onmessage = function(e) {
            // Ahora 'status' y 'message' llegarán correctamente incluso desde el catch
            const { status, data, message } = e.data;

            if (status === 'success') {
                Swal.close();
                txtAiResponse.innerHTML = marked.parse(data);
                aiContainer.classList.remove('aihidden');
            } else {
                Swal.close(); // Cerramos el loading antes de abrir el de error
                txtAiResponse.innerHTML = `<span style="color: #721c24;">Error al generar el análisis de IA debido a: ${message}</span>`;

                Swal.fire({
                    title: 'Error al generar el análisis',
                    text: `No se pudo generar el análisis debido a: ${message}`,
                    icon: 'error'
                });
            }
            aiWorker.terminate();
        }

        // Capturar errores críticos del Worker
        aiWorker.onerror = function(error) {
            Swal.close();
            if (txtAiResponse) {
                txtAiResponse.value = "Error crítico en el hilo secundario (ai_worker Worker).";
            }
            console.error("Error crítico en el Worker:", error);
            aiWorker.terminate();
        };
    });
}