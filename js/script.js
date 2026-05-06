//Funcion para volver visible la contraseña
//Extracción de elementos del DOM
const toggleIcon = document.getElementById('toggle-pswrd');
const passwordInput = document.getElementById('password');
//Añadir un event listener al icono
toggleIcon.addEventListener('click', togglePassword);
function togglePassword() {
    if(passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    }else{
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}