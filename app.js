// Importar Firebase
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, push, onValue } from "firebase/database";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAHTfYQXgWb3l5DqCar3ooOv2yzzsww9Ek",
  authDomain: "bd-fondini-aridos.firebaseapp.com",
  databaseURL: "https://bd-fondini-aridos-default-rtdb.firebaseio.com",
  projectId: "bd-fondini-aridos",
  storageBucket: "bd-fondini-aridos.firebasestorage.app",
  messagingSenderId: "1038135881192",
  appId: "1:1038135881192:web:215908840951025da9485d"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Referencias a elementos HTML
const loginSection = document.getElementById("login");
const registroSection = document.getElementById("registro");
const dashboardSection = document.getElementById("dashboard");
const registroContainer = document.getElementById("registroContainer");
const listaClientes = document.getElementById("listaClientes");
const listaPedidos = document.getElementById("listaPedidos");

// Manejar estado de sesión
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.style.display = "none";
    registroSection.style.display = "none";
    dashboardSection.style.display = "block";
    cargarClientes();
  } else {
    loginSection.style.display = "block";
    registroSection.style.display = "none";
    dashboardSection.style.display = "none";
  }
});

// Registrar usuario
document.getElementById("registroForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreCompleto").value;
  const email = document.getElementById("correo").value;
  const password = document.getElementById("nuevaPassword").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      set(ref(db, 'users/' + userCredential.user.uid), { nombre, email });
      alert("Cuenta creada con éxito");
    })
    .catch((error) => alert(error.message));
});

// Iniciar sesión
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("correoLogin").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => console.log("Sesión iniciada"))
    .catch((error) => alert("Error: " + error.message));
});

//  Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth);
});

// Alternar entre login y registro
document.getElementById("crearCuentaLink").addEventListener("click", () => {
  loginSection.style.display = "none";
  registroSection.style.display = "block";
});
document.getElementById("volverLogin").addEventListener("click", () => {
  registroSection.style.display = "none";
  loginSection.style.display = "block";
});

// Agregar cliente
document.getElementById("clienteForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const direccion = document.getElementById("direccion").value;
  const telefono = document.getElementById("telefono").value;
  const dni = document.getElementById("dni").value;

  const clientesRef = ref(db, 'clientes');
  const newClienteRef = push(clientesRef);
  set(newClienteRef, { nombre, direccion, telefono, dni })
    .then(() => {
      alert("Cliente agregado");
      cargarClientes();
    })
    .catch((error) => alert("Error: " + error.message));
});

//  Cargar clientes en la lista
function cargarClientes() {
  const clientesRef = ref(db, 'clientes');
  onValue(clientesRef, (snapshot) => {
    listaClientes.innerHTML = "";
    const data = snapshot.val();
    if (data) {
      Object.entries(data).forEach(([id, cliente]) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${cliente.nombre}</strong> - ${cliente.direccion} - ${cliente.telefono} 
                        <button onclick="cargarPedidos('${id}')">Ver Pedidos</button>`;
        listaClientes.appendChild(li);
      });
    }
  });
}

//  Agregar pedido
document.getElementById("pedidoForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const clientePedido = document.getElementById("clientePedido").value;
  const producto = document.getElementById("producto").value;
  const estado = document.getElementById("estado").value;

  const pedidosRef = ref(db, `pedidos/${clientePedido}`);
  const newPedidoRef = push(pedidosRef);
  set(newPedidoRef, { producto, estado, fecha: new Date().toISOString() })
    .then(() => {
      alert("Pedido agregado");
      cargarPedidos(clientePedido);
    })
    .catch((error) => alert("Error: " + error.message));
});

//  Cargar pedidos en la lista
function cargarPedidos(clienteId) {
  const pedidosRef = ref(db, `pedidos/${clienteId}`);
  onValue(pedidosRef, (snapshot) => {
    listaPedidos.innerHTML = "";
    const data = snapshot.val();
    if (data) {
      Object.entries(data).forEach(([id, pedido]) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${pedido.producto}</strong> - ${pedido.estado} - ${new Date(pedido.fecha).toLocaleDateString()}`;
        listaPedidos.appendChild(li);
      });
    }
  });
}

//  Mostrar formulario de nuevo cliente/pedido
document.getElementById("nuevoRegistroBtn").addEventListener("click", () => {
  registroContainer.style.display = (registroContainer.style.display === "none") ? "block" : "none";
});
