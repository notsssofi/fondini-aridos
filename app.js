
// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBw2XLVQTZE5XJAusfiZ16HjoTJJkNZLvg",
    authDomain: "fondini-aridos.firebaseapp.com",
    databaseURL: "https://fondini-aridos-default-rtdb.firebaseio.com",
    projectId: "fondini-aridos",
    storageBucket: "fondini-aridos.firebasestorage.app",
    messagingSenderId: "60588617990",
    appId: "1:60588617990:web:bc0c7cbc8a98e524d3ae87",
    measurementId: "G-MBSSKYWQTM"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let editandoCliente = null;
let editandoPedido = null;

// --- Registro de Usuario ---
document.getElementById("registroForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const nombreCompleto = document.getElementById("nombreCompleto").value;
    const correo = document.getElementById("correo").value;
    const password = document.getElementById("nuevaPassword").value;

    createUserWithEmailAndPassword(auth, correo, password)
        .then((userCredential) => {
            const user = userCredential.user;
            set(ref(db, 'usuarios/' + user.uid), { nombre: nombreCompleto, correo: correo });
            alert("Cuenta creada con éxito. Ahora puedes iniciar sesión.");
            document.getElementById("registro").style.display = "none";
            document.getElementById("login").style.display = "block";
        })
        .catch((error) => alert("Error: " + error.message));
});

// --- Inicio de Sesión ---
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const correo = document.getElementById("correoLogin").value; // Corregido
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, correo, password)
        .then(() => {
            console.log("Inicio de sesión exitoso");
            document.getElementById("login").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
        })
        .catch((error) => {
            console.error("Error en inicio de sesión:", error);
            alert("Usuario o contraseña incorrectos.");
        });
});

// --- Cerrar Sesión ---
document.getElementById("logoutBtn").addEventListener("click", function () {
    signOut(auth).then(() => {
        console.log("Sesión cerrada");
        document.getElementById("dashboard").style.display = "none";
        document.getElementById("login").style.display = "block";
    });
});

// --- Mostrar Clientes ---
function mostrarClientes() {
    const listaClientes = document.getElementById("listaClientes");
    listaClientes.innerHTML = "";
    get(ref(db, 'clientes')).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const cliente = childSnapshot.val();
                const id = childSnapshot.key;
                const li = document.createElement("li");
                li.innerHTML = `${cliente.nombre} - ${cliente.direccion} - ${cliente.telefono} - ${cliente.dni}
                                <button onclick="editarCliente('${id}')">Editar</button>
                                <button onclick="eliminarCliente('${id}')">Eliminar</button>`;
                listaClientes.appendChild(li);
            });
        } else {
            listaClientes.innerHTML = "No hay clientes.";
        }
    });
}

// --- Cargar clientes y pedidos al cargar la página ---
window.onload = function () {
    console.log("Página cargada");
    mostrarClientes();
};
