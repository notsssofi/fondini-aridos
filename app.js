// 🔥 Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBw2XLVQTZE5XJAusfiZ16HjoTJJkNZLvg",
    authDomain: "fondini-aridos.firebaseapp.com",
    databaseURL: "https://fondini-aridos-default-rtdb.firebaseio.com",
    projectId: "fondini-aridos",
    storageBucket: "fondini-aridos.appspot.com",
    messagingSenderId: "60588617990",
    appId: "1:60588617990:web:bc0c7cbc8a98e524d3ae87",
    measurementId: "G-MBSSKYWQTM"
};

// 🔥 Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// 🔹 Cambiar entre login y registro
document.getElementById("crearCuentaLink").addEventListener("click", function () {
    document.getElementById("login").style.display = "none";
    document.getElementById("registro").style.display = "block";
});
document.getElementById("volverLogin").addEventListener("click", function () {
    document.getElementById("registro").style.display = "none";
    document.getElementById("login").style.display = "block";
});

// --- Registro ---
document.getElementById("registroForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const nombreCompleto = document.getElementById("nombreCompleto").value;
    const correo = document.getElementById("correo").value;
    const password = document.getElementById("nuevaPassword").value;

    auth.createUserWithEmailAndPassword(correo, password)
        .then((userCredential) => {
            const user = userCredential.user;
            db.ref('usuarios/' + user.uid).set({ nombre: nombreCompleto, correo: correo });
            alert("Cuenta creada con éxito.");
            document.getElementById("registro").style.display = "none";
            document.getElementById("login").style.display = "block";
        })
        .catch((error) => alert("Error: " + error.message));
});

// --- Inicio de Sesión ---
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const correo = document.getElementById("correoLogin").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(correo, password)
        .then(() => {
            alert("Inicio de sesión exitoso");
            document.getElementById("login").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
            mostrarClientes();
            mostrarPedidos();
        })
        .catch((error) => alert("Usuario o contraseña incorrectos."));
});

// --- Cerrar Sesión ---
document.getElementById("logoutBtn").addEventListener("click", function () {
    auth.signOut().then(() => {
        alert("Sesión cerrada");
        document.getElementById("dashboard").style.display = "none";
        document.getElementById("login").style.display = "block";
    });
});

// --- Agregar Cliente ---
document.getElementById("clienteForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const direccion = document.getElementById("direccion").value;
    const telefono = document.getElementById("telefono").value;
    const dni = document.getElementById("dni").value;

    db.ref('clientes').push({ nombre, direccion, telefono, dni }).then(() => {
        alert("Cliente agregado con éxito.");
        mostrarClientes();
    });
});

// --- Mostrar Clientes ---
function mostrarClientes() {
    const listaClientes = document.getElementById("listaClientes");
    listaClientes.innerHTML = "";
    db.ref('clientes').once('value').then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const cliente = childSnapshot.val();
                const id = childSnapshot.key;
                const li = document.createElement("li");
                li.innerHTML = `${cliente.nombre} - ${cliente.direccion} - ${cliente.telefono} - ${cliente.dni}
                                <button onclick="eliminarCliente('${id}')">Eliminar</button>`;
                listaClientes.appendChild(li);
            });
        } else {
            listaClientes.innerHTML = "No hay clientes.";
        }
    });
}

// --- Eliminar Cliente ---
function eliminarCliente(id) {
    db.ref('clientes/' + id).remove().then(() => {
        alert("Cliente eliminado.");
        mostrarClientes();
    });
}

// --- Agregar Pedido ---
document.getElementById("pedidoForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const clientePedido = document.getElementById("clientePedido").value;
    const producto = document.getElementById("producto").value;
    const estado = document.getElementById("estado").value;

    db.ref('pedidos').push({ clientePedido, producto, estado }).then(() => {
        alert("Pedido agregado con éxito.");
        mostrarPedidos();
    });
});

// --- Mostrar Pedidos ---
function mostrarPedidos() {
    const listaPedidos = document.getElementById("listaPedidos");
    listaPedidos.innerHTML = "";
    db.ref('pedidos').once('value').then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const pedido = childSnapshot.val();
                const id = childSnapshot.key;
                const li = document.createElement("li");
                li.innerHTML = `${pedido.clientePedido} - ${pedido.producto} - ${pedido.estado}
                                <button onclick="eliminarPedido('${id}')">Eliminar</button>`;
                listaPedidos.appendChild(li);
            });
        } else {
            listaPedidos.innerHTML = "No hay pedidos.";
        }
    });
}

// --- Eliminar Pedido ---
function eliminarPedido(id) {
    db.ref('pedidos/' + id).remove().then(() => {
        alert("Pedido eliminado.");
        mostrarPedidos();
    });
}

// --- Cargar datos al iniciar ---
window.onload = function () {
    mostrarClientes();
    mostrarPedidos();
};
