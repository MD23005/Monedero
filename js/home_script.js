//Cargar las sesiones activas
const localUser = JSON.parse(localStorage.getItem('currentUser'));
const guestUser = JSON.parse(sessionStorage.getItem('currentUser'));

//Cargar el botón de logout
const logoutBtn = document.getElementById('btn-logout');

//boton para agregar gasto
const addGastoBtn = document.getElementById('add-gasto');

//Tabla de gastos
const gastosTableBody = document.getElementById('t-gastos');

//Cargando el avatar
const avatarCtn = document.getElementById('avatar');

//celda donde se muestra el total de gastos
const totalGastosCell = document.getElementById('total-gastos');

//Cargar el primer usuario que se encuentre
let currentUser = guestUser || localUser;

//contenedor del nombre en el encabezado
const usernameDisplay = document.getElementById('username-display');

if(!currentUser){
    Swal.fire({
        title: 'No posee una cuenta activa o de invitado',
        text: "Por favor, inicie sesión o continúe sin sesión para acceder a su monedero.",
        icon: 'warning',
        confirmButtonText: 'Entendido'
    }).then(() => {
        window.location.href = '../html/index.html';
    });
}else{
    // Mostrar el nombre del usuario en el encabezado
    usernameDisplay.textContent = `${currentUser.username}`;
    avatarCtn.textContent = currentUser.username.charAt(0).toUpperCase(); // Mostrar la primera letra del nombre como avatar

    if(currentUser.isGuest){
        usernameDisplay.textContent = `Invitado`;
        avatarCtn.textContent = 'I';
    }
}

//Evento para cerrar sesión
logoutBtn.addEventListener('click', () => {
    //Mensaje de advertencia al cerrar sesión
    Swal.fire({
        title: '¿Está seguro de que desea cerrar sesión?',
        text: "Se eliminará su sesión actual y será redirigido a la página de inicio de sesión, si es invitado perderá sus datos al cerrar esta ventana.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
             // Eliminar la sesión del usuario
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            // Redirigir al usuario a la página de inicio de sesión
            window.location.href = '../html/index.html';
        }
    });
});

// Cargar datos en la tabla al iniciar la aplicación
window.addEventListener('DOMContentLoaded', () => {

    const sessionUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    
    if (sessionUser) {
        const currentUser = JSON.parse(sessionUser);


        if (currentUser && currentUser.gastos) {
            currentUser.gastos.forEach(gasto => {
                const newRow = document.createElement('tr');

                newRow.innerHTML = `
                    <td>${gasto.id}</td>
                    <td>${gasto.name}</td>
                    <td>$${gasto.amount.toFixed(2)}</td>
                    <td>${gasto.date}</td>
                `;
                
                gastosTableBody.appendChild(newRow);
                //Cargar total de gastos actual
                const totalGastos = currentUser.gastos.reduce((total, gasto) => total + gasto.amount, 0);
                totalGastosCell.textContent = `$${totalGastos.toFixed(2)}`;
            });
        }
    }
});

//Evento para agregar gasto
addGastoBtn.addEventListener('click', () => {
    Swal.fire({
        title: 'Agregar nuevo gasto',
        html:`
        <form id="add-gasto-form">
            <div class="form-group">
                <label for="gasto-name">Nombre del gasto</label>
                <input type="text" id="gasto-name" name="gasto-name" required>
            </div>
            <div class="form-group">
                <label for="gasto-amount">Monto</label>
                <input type="number" id="gasto-amount" name="gasto-amount" required>
            </div>
        </form>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Agregar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#28a745',

        //Evento para validar los datos del formulario
        preConfirm: () => {
            const gastoName = document.getElementById('gasto-name').value.trim();
            const gastoAmount = document.getElementById('gasto-amount').value.trim();

            if(!gastoName || !gastoAmount || isNaN(gastoAmount) || parseFloat(gastoAmount) <= 0){
                Swal.showValidationMessage('Por favor, ingrese un nombre y un monto válidos para el gasto.');
                return false;
            }

            return { name: gastoName, amount: parseFloat(gastoAmount) };
        }
    }).then((result)=>{
        if(result.isConfirmed){
            const newGasto = result.value;

            const gasto = {
                id: Date.now(),
                name: newGasto.name,
                amount: newGasto.amount,
                date: new Date().toISOString()
            }

            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${Date.now()}</td>
                <td>${newGasto.name}</td>
                <td>$${newGasto.amount.toFixed(2)}</td>
                <td>${new Date().toLocaleDateString()}</td>
            `;
            gastosTableBody.appendChild(newRow);

            //Cálculo del total de gastos
            const totalGastos = currentUser.gastos ? currentUser.gastos.reduce((total, gasto) => total + gasto.amount, 0) + newGasto.amount : newGasto.amount;
            totalGastosCell.textContent = `$${totalGastos.toFixed(2)}`;

            // Agregando la data al perfil del usuario logeado
            if (currentUser.isGuest) {
                if (!currentUser.gastos) {
                    currentUser.gastos = [];
                }

                // Añadir gasto al perfil del invitado
                currentUser.gastos.push(gasto);
                // Actualizar la sesión del usuario invitado
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
                
            } else {
                currentUser.gastos = currentUser.gastos || [];
                currentUser.gastos.push(gasto);
                
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                const listaUsuariosRaw = localStorage.getItem('users');
                
                if (listaUsuariosRaw) {
                    const usuarios = JSON.parse(listaUsuariosRaw);
                    
                    // Buscamos al usuario real en la lista permanente
                    const usuarioIndex = usuarios.findIndex(u => u.username === currentUser.username && u.password === currentUser.password);
                    
                    if (usuarioIndex !== -1) {
                        // Sincronizamos los gastos en su perfil permanente
                        usuarios[usuarioIndex].gastos = currentUser.gastos;
                        
                        // Guardamos la lista de usuarios actualizada de vuelta en el localStorage
                        localStorage.setItem('users', JSON.stringify(usuarios));
                    }
                }
            }


            Swal.fire({
                title: 'Gasto agregado exitosamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }
    })
});