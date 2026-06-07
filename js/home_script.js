import { iniciarExportaciones } from './export.js';
import { consultarIA } from './ai_service.js';

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

//contenedor del nombre en el sidebar
const usernameDisplay = document.getElementById('username-display');

if (!currentUser) {
    Swal.fire({
        title: 'No posee una cuenta activa o de invitado',
        text: "Por favor, inicie sesión o continúe sin sesión para acceder a su monedero.",
        icon: 'warning',
        confirmButtonText: 'Entendido'
    }).then(() => {
        window.location.href = '../html/index.html';
    });
} else {
    // Mostrar el nombre del usuario en el encabezado
    usernameDisplay.textContent = `${currentUser.username}`;
    avatarCtn.textContent = currentUser.username.charAt(0).toUpperCase(); // Mostrar la primera letra del nombre como avatar

    if (currentUser.isGuest) {
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
                    <td>$${formatMoney(gasto.amount)}</td>
                    <td>${gasto.date}</td>
                    <td>
                        <button class="btn-edit" data-id="${gasto.id}"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-delete" data-id="${gasto.id}"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;

                gastosTableBody.appendChild(newRow);

                //Cargar total de gastos actual
                const totalGastos = currentUser.gastos.reduce((total, gasto) => total + gasto.amount, 0);
                totalGastosCell.textContent = `$${formatMoney(totalGastos)}`;
                renderBudgetDisplay();
                checkBudgetAlert(totalGastos);
            });
        }
    }
});

//Función para formato de cantidades
function formatMoney(amount) {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

//Función para revisar y mostrar alerta de presupuesto
function checkBudgetAlert(totalGastos) {
    const budget = currentUser.budget;
    const alertDiv = document.getElementById('budget-alert');
    const alertMsg = document.getElementById('budget-alert-msg');

    if (!budget || budget <= 0) {
        alertDiv.classList.add('hidden');
        alertDiv.classList.remove('danger');
        return;
    }

    const percentage = (totalGastos / budget) * 100;

    if (percentage >= 100) {
        alertDiv.classList.remove('hidden', 'danger');
        alertDiv.classList.add('danger');
        alertMsg.textContent = `¡Has superado tu presupuesto! Gastaste $${formatMoney(totalGastos)} de $${formatMoney(budget)}.`;
    } else if (percentage >= 80) {
        alertDiv.classList.remove('hidden', 'danger');
        alertMsg.textContent = `Advertencia: llevas el ${percentage.toFixed(0)}% de tu presupuesto ($${formatMoney(totalGastos)} de $${formatMoney(budget)}).`;
    } else {
        alertDiv.classList.add('hidden');
        alertDiv.classList.remove('danger');
    }
}

//mostrar presupuesto en pantalla
function renderBudgetDisplay() {
    const budgetDisplay = document.getElementById('budget-display');
    budgetDisplay.textContent = currentUser.budget
        ? `$${formatMoney(parseFloat(currentUser.budget))}`
        : 'No definido';
}


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

            if (!gastoName || !gastoAmount || isNaN(gastoAmount) || parseFloat(gastoAmount) <= 0) {
                Swal.showValidationMessage('Por favor, ingrese un nombre y un monto válidos para el gasto.');
                return false;
            }

            return { name: gastoName, amount: parseFloat(gastoAmount) };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const newGasto = result.value;

            const gasto = {
                id: Date.now(),
                name: newGasto.name,
                amount: newGasto.amount,
                date: new Date().toISOString().split('T')[0]
            }

            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${Date.now()}</td>
                <td>${newGasto.name}</td>
                <td>$${formatMoney(newGasto.amount)}</td>
                <td>${new Date().toLocaleDateString()}</td>
                <td>
                    <button class="btn-edit" data-id="${gasto.id}"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-delete" data-id="${gasto.id}"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            gastosTableBody.appendChild(newRow);

            //Cálculo del total de gastos
            const totalGastos = currentUser.gastos ? currentUser.gastos.reduce((total, gasto) => total + gasto.amount, 0) + newGasto.amount : newGasto.amount;
            totalGastosCell.textContent = `$${formatMoney(totalGastos)}`;
            checkBudgetAlert(totalGastos);

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

//Botón para definir presupuesto
document.getElementById('set-budget').addEventListener('click', () => {
    Swal.fire({
        title: 'Definir presupuesto',
        input: 'number',
        inputLabel: 'Monto del presupuesto mensual',
        inputValue: currentUser.budget || '',
        inputAttributes: { min: 1, step: '0.01' },
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#28a745',
        inputValidator: (value) => {
            if (!value || parseFloat(value) <= 0)
                return 'Ingresa un monto válido mayor a 0.';
        }
    }).then((result) => {
        if (result.isConfirmed) {
            currentUser.budget = parseFloat(result.value);

            // Persistir según tipo de usuario
            if (currentUser.isGuest) {
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            } else {
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                const listaUsuariosRaw = localStorage.getItem('users');
                if (listaUsuariosRaw) {
                    const usuarios = JSON.parse(listaUsuariosRaw);
                    const idx = usuarios.findIndex(u => u.username === currentUser.username && u.password === currentUser.password);
                    if (idx !== -1) {
                        usuarios[idx].budget = currentUser.budget;
                        localStorage.setItem('users', JSON.stringify(usuarios));
                    }
                }
            }

            renderBudgetDisplay();

            // Recalcular alerta con el total actual
            const totalGastos = currentUser.gastos
                ? currentUser.gastos.reduce((t, g) => t + g.amount, 0)
                : 0;
            checkBudgetAlert(totalGastos);

            Swal.fire({ title: 'Presupuesto guardado', icon: 'success', timer: 1500, showConfirmButton: false });
        }
    });
});

// Eliminar y editar gasto
gastosTableBody.addEventListener('click', (e) => {
    const btnDelete = e.target.closest('.btn-delete');
    const btnEdit = e.target.closest('.btn-edit');

    if (btnDelete) {
        const id = parseInt(btnDelete.dataset.id);
        Swal.fire({
            title: '¿Eliminar gasto?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                currentUser.gastos = currentUser.gastos.filter(g => g.id !== id);
                btnDelete.closest('tr').remove();

                const totalGastos = currentUser.gastos.reduce((t, g) => t + g.amount, 0);
                totalGastosCell.textContent = `$${formatMoney(totalGastos)}`;
                checkBudgetAlert(totalGastos);

                guardarUsuario();
                Swal.fire({ title: 'Gasto eliminado', icon: 'success', timer: 1500, showConfirmButton: false });
            }
        });
    }

    if (btnEdit) {
        const id = parseInt(btnEdit.dataset.id);
        const gasto = currentUser.gastos.find(g => g.id === id);
        if (!gasto) return;

        Swal.fire({
            title: 'Editar gasto',
            html: `
                <div class="form-group">
                    <label for="edit-name">Nombre del gasto</label>
                    <input type="text" id="edit-name" value="${gasto.name}">
                </div>
                <div class="form-group">
                    <label for="edit-amount">Monto</label>
                    <input type="number" id="edit-amount" value="${gasto.amount}">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            preConfirm: () => {
                const name = document.getElementById('edit-name').value.trim();
                const amount = document.getElementById('edit-amount').value.trim();
                if (!name || !amount || isNaN(amount) || parseFloat(amount) <= 0) {
                    Swal.showValidationMessage('Ingresa un nombre y monto válidos.');
                    return false;
                }
                return { name, amount: parseFloat(amount) };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                gasto.name = result.value.name;
                gasto.amount = result.value.amount;

                const row = btnEdit.closest('tr');
                row.cells[1].textContent = gasto.name;
                row.cells[2].textContent = `$${formatMoney(gasto.amount)}`;
                row.cells[3].textContent = new Date().toISOString().split('T')[0];

                const totalGastos = currentUser.gastos.reduce((t, g) => t + g.amount, 0);
                totalGastosCell.textContent = `$${formatMoney(totalGastos)}`;
                checkBudgetAlert(totalGastos);

                guardarUsuario();
                Swal.fire({ title: 'Gasto actualizado', icon: 'success', timer: 1500, showConfirmButton: false });
            }
        });
    }
});

// Guardar usuario en storage
function guardarUsuario() {
    if (currentUser.isGuest) {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        const listaUsuariosRaw = localStorage.getItem('users');
        if (listaUsuariosRaw) {
            const usuarios = JSON.parse(listaUsuariosRaw);
            const idx = usuarios.findIndex(u => u.username === currentUser.username && u.password === currentUser.password);
            if (idx !== -1) {
                usuarios[idx].gastos = currentUser.gastos;
                localStorage.setItem('users', JSON.stringify(usuarios));
            }
        }
    }
}

// Iniciar modulo de exportacion
iniciarExportaciones(currentUser);
consultarIA(currentUser);