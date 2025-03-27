// 🔹 Inicializar Firebase (Usar firebase.initializeApp en compat)
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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Selección de elementos del DOM
const loginSection = document.getElementById("login");
const registroSection = document.getElementById("registro");
const dashboardSection = document.getElementById("dashboard");
const listaClientes = document.getElementById("listaClientes");
const listaPedidos = document.getElementById("listaPedidos");
const registroContainer = document.getElementById("registroContainer");

// 🔹 Manejar estado de sesión
auth.onAuthStateChanged((user) => {
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

// 🔹 Registrar usuario
document.getElementById("registroForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombreCompleto").value;
  const email = document.getElementById("correo").value;
  const password = document.getElementById("nuevaPassword").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return db.ref('users/' + userCredential.user.uid).set({ nombre, email });
    })
    .then(() => {
      alert("Cuenta creada con éxito");
    })
    .catch((error) => alert(error.message));
});

// 🔹 Iniciar sesión
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("correoLogin").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => console.log("Sesión iniciada"))
    .catch((error) => alert("Error: " + error.message));
});

// 🔹 Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut();
});

// 🔹 Alternar entre login y registro
document.getElementById("crearCuentaLink").addEventListener("click", () => {
  loginSection.style.display = "none";
  registroSection.style.display = "block";
});
document.getElementById("volverLogin").addEventListener("click", () => {
  registroSection.style.display = "none";
  loginSection.style.display = "block";
});
// 🔹 Agregar cliente
clienteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const direccion = document.getElementById("direccion").value;
  const telefono = document.getElementById("telefono").value;
  const dni = document.getElementById("dni").value;

  db.ref("clientes").push({ nombre, direccion, telefono, dni })
    .then(() => alert("Cliente agregado"))
    .catch((error) => alert("Error: " + error.message));
});

// 🔹 Agregar pedido
pedidoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const clientePedido = document.getElementById("clientePedido").value;
  const producto = document.getElementById("producto").value;
  const estado = document.getElementById("estado").value;

  db.ref(`pedidos/${clientePedido}`).push({ producto, estado, fecha: new Date().toISOString() })
    .then(() => alert("Pedido agregado"))
    .catch((error) => alert("Error: " + error.message));
});

// 🔹 Mostrar clientes al presionar botón
btnMostrarClientes.addEventListener("click", () => {
  db.ref("clientes").once("value", (snapshot) => {
    listaClientes.innerHTML = "";
    const data = snapshot.val();
    if (data) {
      Object.entries(data).forEach(([id, cliente]) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${cliente.nombre}</strong> - ${cliente.direccion} - ${cliente.telefono}`;
        listaClientes.appendChild(li);
      });
    }
  });
});

// 🔹 Mostrar pedidos al presionar botón
btnMostrarPedidos.addEventListener("click", () => {
  const clienteId = document.getElementById("clientePedido").value;
  db.ref(`pedidos/${clienteId}`).once("value", (snapshot) => {
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
});
