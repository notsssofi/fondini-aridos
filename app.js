import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getDatabase, ref, set, get, push, update, remove } from "firebase/database";

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
    const correo = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, correo, password)
        .then(() => {
            document.getElementById("login").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
        })
        .catch(() => alert("Usuario o contraseña incorrectos. Si no tienes una cuenta, regístrate."));
});

// --- Cerrar Sesión ---
document.getElementById("logoutBtn").addEventListener("click", function () {
    signOut(auth).then(() => {
        document.getElementById("dashboard").style.display = "none";
        document.getElementById("login").style.display = "block";
    });
});

// --- Agregar o Editar Cliente ---
document.getElementById("clienteForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const direccion = document.getElementById("direccion").value;
    const telefono = document.getElementById("telefono").value;
    const dni = document.getElementById("dni").value;

    if (editandoCliente) {
        update(ref(db, 'clientes/' + editandoCliente.id), { nombre, direccion, telefono, dni });
        editandoCliente = null;
    } else {
        const newClientRef = push(ref(db, 'clientes'));
        set(newClientRef, { nombre, direccion, telefono, dni });
    }
    this.reset();
    mostrarClientes();
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

// --- Editar Cliente ---
function editarCliente(id) {
    get(ref(db, 'clientes/' + id)).then((snapshot) => {
        if (snapshot.exists()) {
            const cliente = snapshot.val();
            document.getElementById("nombre").value = cliente.nombre;
            document.getElementById("direccion").value = cliente.direccion;
            document.getElementById("telefono").value = cliente.telefono;
            document.getElementById("dni").value = cliente.dni;
            editandoCliente = { id, ...cliente };
        }
    });
}

// --- Eliminar Cliente ---
function eliminarCliente(id) {
    remove(ref(db, 'clientes/' + id));
    mostrarClientes();
}

// --- Agregar o Editar Pedido ---
document.getElementById("pedidoForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const clientePedido = document.getElementById("clientePedido").value;
    const producto = document.getElementById("producto").value;
    const estado = document.getElementById("estado").value;

    if (editandoPedido) {
        update(ref(db, 'pedidos/' + editandoPedido.id), { clientePedido, producto, estado });
        editandoPedido = null;
    } else {
        const newOrderRef = push(ref(db, 'pedidos'));
        set(newOrderRef, { clientePedido, producto, estado });
    }
    this.reset();
    mostrarPedidos();
});

// --- Mostrar Pedidos ---
function mostrarPedidos() {
    const listaPedidos = document.getElementById("listaPedidos");
    listaPedidos.innerHTML = "";
    get(ref(db, 'pedidos')).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const pedido = childSnapshot.val();
                const id = childSnapshot.key;
                const li = document.createElement("li");
                li.innerHTML = `${pedido.clientePedido} - ${pedido.producto} - ${pedido.estado}
                                <button onclick="editarPedido('${id}')">Editar</button>
                                <button onclick="eliminarPedido('${id}')">Eliminar</button>`;
                listaPedidos.appendChild(li);
            });
        } else {
            listaPedidos.innerHTML = "No hay pedidos.";
        }
    });
}

// --- Editar Pedido ---
function editarPedido(id) {
    get(ref(db, 'pedidos/' + id)).then((snapshot) => {
        if (snapshot.exists()) {
            const pedido = snapshot.val();
            document.getElementById("clientePedido").value = pedido.clientePedido;
            document.getElementById("producto").value = pedido.producto;
            document.getElementById("estado").value = pedido.estado;
            editandoPedido = { id, ...pedido };
        }
    });
}

// --- Eliminar Pedido ---
function eliminarPedido(id) {
    remove(ref(db, 'pedidos/' + id));
    mostrarPedidos();
}

// Cargar clientes y pedidos al cargar la página
window.onload = function() {
    mostrarClientes();
    mostrarPedidos();
};
