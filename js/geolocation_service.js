//Función que devuelve {latitud, longitud, país}

export async function obtenerUbicacion(){
    return new Promise((resolve,reject)=>{
        if(!navigator.geolocation){
            return reject(new Error("Este navegador no soporta la navegación"))
        }

        navigator.geolocation.getCurrentPosition(
            async (posicion)=>{
                const lat = posicion.coords.latitude;
                const long = posicion.coords.longitude;

                //Consultar Api para obtener el país con las coordenadas
                try {
                    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${long}`;

                    const respuesta = await fetch(url,{
                        headers: {
                            'Accept-Language':'es'
                        }
                    });

                    if(!respuesta.ok){ throw new Error("Error en la respuesta del servidor");}

                    const datos = await respuesta.json();

                    const pais = datos.address && datos.address.country ? datos.address.country : "País no identificado"

                    resolve({
                        latitud: lat,
                        longitud: long,
                        pais: pais
                    });


                } catch (error) {
                    resolve({
                        latitud: lat,
                        longitud: long,
                        pais: "Error al obtener el país"
                    });
                }
            },
            (errorGPS)=>{
                reject(errorGPS);
            },
            {
                enableHighAccuracy: true,
                timeout: 8000
            }
        )
    })
}