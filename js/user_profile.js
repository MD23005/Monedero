//Cargar las sesiones activas
const localUser = JSON.parse(localStorage.getItem('currentUser'));
const guestUser = JSON.parse(sessionStorage.getItem('currentUser'));

//Cargando el avatar
const avatarCtn = document.getElementById('avatar');
//contenedor del nombre en el encabezado
const usernameDisplay = document.getElementById('username-display');
//Cargar el botón de logout
const logoutBtn = document.querySelectorAll('.btn-logout');

//Cargar el contenedor del nombre del usuario logeado
const usrDisplayBody = document.getElementById('username-display-body');

//Cargar el primer usuario que se encuentre
let currentUser = guestUser || localUser;

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
logoutBtn.forEach((boton)=>{
    boton.addEventListener('click', () => {
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
})

document.addEventListener('DOMContentLoaded',()=>{
    let username = currentUser.username;

    usrDisplayBody.textContent = username;
});