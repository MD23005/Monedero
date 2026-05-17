//obtener los controles del formulario
const form = document.getElementById('login-monedero');
const sessionLessbtn = document.getElementById('btn-continuar');

form.addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar el envío del formulario

    try {
        // Obtener los valores de los campos de entrada y quitar espacios extras
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        console.log(username, password);

        // VALIDACIÓN: Lanzar error si algún campo está vacío o es nulo
        if (!username || !password) {
            throw new Error('Todos los campos son obligatorios.');
        }

        // Obtener los datos en localStorage (protegido también por el try-catch)
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // Buscar si el usuario existe en el localStorage
        const userExists = users.find(u => u.username === username);

        // Validación de sesión o crear el usuario
        if (!userExists) {
            // Caso de registro, el usuario no existe
            const newUser = { username: username, password: password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            // Crear current user para guardar la sesión y poder hacer logout
            localStorage.setItem('currentUser', JSON.stringify(newUser));

            Swal.fire({
                title: 'Usuario nuevo registrado',
                text: 'Bienvenido a Monedero',
                icon: 'success',
                confirmButtonText: 'Continuar'
            }).then(() => {
                // Redirigir a la página principal después de registrarse
                window.location.href = '../html/home.html';
            });
        } else {
            if (userExists.password === password) {
                // Caso de inicio de sesión exitoso
                localStorage.setItem('currentUser', JSON.stringify(userExists));

                Swal.fire({
                    title: 'Inicio de sesión exitoso',
                    text: `Bienvenido de nuevo, ${username}`,
                    icon: 'success',
                    confirmButtonText: 'Continuar'
                }).then(() => {
                    // Redirigir a la página principal después de iniciar sesión
                    window.location.href = '../html/home.html';
                });
            } else {
                // Caso de contraseña incorrecta
                Swal.fire({
                    title: 'Error de inicio de sesión',
                    text: 'Contraseña incorrecta. Inténtalo de nuevo.',
                    icon: 'error',
                    confirmButtonText: 'Reintentar'
                });
            }
        }

    } catch (error) {
        // El bloque catch atrapa el error lanzado manualmente o cualquier fallo del JSON.parse
        console.error("Error en el formulario:", error.message);
        
        Swal.fire({
            title: 'Campos incompletos',
            text: error.message,
            icon: 'warning',
            confirmButtonText: 'Entendido'
        });
    }
});


function logout() {
    Swal.fire({
        title: '¿Cerrar sesión?',
        text: "Tendrás que volver a ingresar tus datos para entrar.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Remover usuario actual
            localStorage.removeItem('currentUser');

            // Limpiar datos temporales
            sessionStorage.clear(); 

            // Redirijir a la pagina principal
            window.location.href = '../html/index.html'; 
        }
    });
}

sessionLessbtn.addEventListener('click', function() {
    Swal.fire({
        title: '¿Continuar sin sesión?',
        text: "Al continuar sin sesión, no se guardará la información.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {  
            //crear la sesión de prueba o invitado
            const guestUser = {
                username: 'Invitado',
                isGuest: true
            };

            //almacenarlo en sessionStorage para que se borre al cerrar la pestaña
            sessionStorage.setItem('currentUser', JSON.stringify(guestUser));

            // Redirigir a la página principal sin iniciar sesión
            window.location.href = '../html/home.html';
        }
    });
});
