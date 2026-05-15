//obtener los controles del formulario
const form = document.getElementById('login-monedero');

form.addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar el envío del formulario

    //Obtener los valores de los campos de entrada
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log(username, password);
    //obtener los datos en localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    //Buscar si el usuario existe en el localStorage
    const userExists = users.find(u => u.username === username);

    //validación de sesión o crear el usuario
    if(!userExists){
        //Caso de registro, el usuario no existe
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
        })
    }else{
        if(userExists.password === password){
            //Caso de inicio de sesión exitoso
            // Crear current user para guardar la sesión y poder hacer logout
            localStorage.setItem('currentUser', JSON.stringify(userExists));

            Swal.fire({
                title: 'Inicio de sesión exitoso',
                text: `Bienvenido de nuevo, ${username}`,
                icon: 'success',
                confirmButtonText: 'Continuar'
            });
        }else{
            //Caso de contraseña incorrecta
            Swal.fire({
                title: 'Error de inicio de sesión',
                text: 'Contraseña incorrecta. Inténtalo de nuevo.',
                icon: 'error',
                confirmButtonText: 'Reintentar'
            });
        }
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