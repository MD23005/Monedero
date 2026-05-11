const formulario = document.getElementById('formGasto');
const tablaGastos = document.getElementById('tablaGastos');
const totalRegistros = document.getElementById('totalRegistros');
const totalGastos = document.getElementById('totalGastos');
const latitud = document.getElementById('latitud');
const longitud = document.getElementById('longitud');
let editando = false;
const worker = new Worker('worker.js');

// FUNCION PARA GUARDAR GASTOS EN LOCALHOST
function guardarLocal(gastos){
    localStorage.setItem(
        'gastos',
        JSON.stringify(gastos)
    );
}
//GEOLOCALIZACION

function obtenerUbicacion() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                latitud.textContent =
                     position.coords.latitude;
                longitud.textContent =
                    position.coords.longitude;     
            },
            () => {
                latitud.textContent = 'No disponible';
                longitud.textContent = 'No disponible';
            }
        );

    }
}

//MOSTRAR GASTOS

async function cargarGastos() {
    try {
        const respuesta = await fetch('/gastos');

        const gastos = await respuesta.json();
        guardarLocal(gastos);
        tablaGastos.innerHTML = '';
        totalRegistros.textContent = gastos.length;
        worker.postMessage(gastos);
        worker.onmessage = function(e) {
            totalGastos.textContent = e.data;
        };

        gastos.forEach(gasto => {
            tablaGastos.innerHTML += `
            <tr>  
                <td>${gasto.id}</td>
                <td>${gasto.alimentacion}</td>
                <td>${gasto.educacion}</td>
                <td>${gasto.gMedicos}</td>
                <td>${gasto.gTransporte}</td>
                <td>${gasto.gArrendamiento}</td>
                <td>${gasto.otrosGastos}</td>
                <td>${gasto.fecha}</td>
                <td>

                  <button onclick="editarGasto(${gasto.id})">
                    editar
                  </button>  
                  
                  <button onclick="eliminarGasto(${gasto.id})">
                    eliminar
                  </button>
                </td>

            </tr>
           `;

            
        });
    } catch(error){
        console.error(error);
    }
}

// EVENTO SUBMIT

formulario.addEventListener('submit' , async (e) =>{

    e.preventDefault();

    // OBTENER DATOS

    const gasto = {
        id: parseInt(document.getElementById('id').value),
        alimentacion:parseFloat(document.getElementById('alimentacion').value) || 0,
        educacion:parseFloat(document.getElementById('educacion').value) || 0,
        gMedicos: parseFloat(document.getElementById('gMedicos').value) || 0,
        gTransporte: parseFloat(document.getElementById('gTransporte').value) || 0,
        gArrendamiento: parseFloat(document.getElementById('gArrendamiento').value) || 0,
        otrosGastos: parseFloat(document.getElementById('otrosGastos').value) || 0,
        fecha: document.getElementById('fecha').value
    };

    sessionStorage.setItem(
        'ultimaFecha',
        gasto.fecha
    );

    console.log(gasto.fecha);

   // ENVIAR A API
   
   try {

    const url = editando
        ? `/gastos/${gasto.id}`
        : '/gastos';

    const metodo = editando
        ?  'PUT'
        : 'POST';
    
    const respuesta = await fetch(url, {
        method: metodo,
        headers: {
            'Content-Type': 'application/json'
        },
        body:JSON.stringify(gasto)
    });    
  

    const datos = await respuesta.json();

    console.log(datos);
    alert('Gasto guardado correctamente');

    formulario.reset();
    editando = false;
    cargarGastos();

   } catch (error) {
       console.error(error);
       alert('Error al guardar gasto');
   }
   
});

async function editarGasto(id) {

    try {
        const respuesta = await fetch('/gastos');
        const gastos = await respuesta.json();
        const gasto = gastos.find(g => g.id === id);
        document.getElementById('id').value = gasto.id;
        document.getElementById('alimentacion').value = gasto.alimentacion;
        document.getElementById('educacion').value = gasto.educacion;
        document.getElementById('gMedicos').value = gasto.gMedicos;
        document.getElementById('gTransporte').value = gasto.gTransporte;
        document.getElementById('gArrendamiento').value = gasto.gArrendamiento;
        document.getElementById('otrosGastos').value = gasto.otrosGastos;
        document.getElementById('fecha').value = gasto.fecha;
        editando = true;

    } catch (error) {

        console.error(error);

    }
    
}

async function eliminarGasto(id) {

    try {
        await fetch(`/gastos/${id}`,{
            method: 'DELETE'
        });

        cargarGastos();
    } catch (error){
        console.error(error);
    }
    
}

cargarGastos();

obtenerUbicacion();


window.addEventListener('load', () => {

    const ultimaFecha =
        sessionStorage.getItem('ultimaFecha');
    
    console.log(ultimaFecha);
    
    if (ultimaFecha) {

        document.getElementById('fecha').value =
            ultimaFecha;

    }

});