// Asegurar que el script se ejecuta después de que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM cargado");

    // Inicializar Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyAHTfYQXgWb3l5DqCar3ooOv2yzzsww9Ek",
        authDomain: "bd-fondini-aridos.firebaseapp.com",
        databaseURL: "https://bd-fondini-aridos-default-rtdb.firebaseio.com",
        projectId: "bd-fondini-aridos",
        storageBucket: "bd-fondini-aridos.firebasestorage.app",
        messagingSenderId: "1038135881192",
        appId: "1:1038135881192:web:215908840951025da9485d"
    };
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database();

    // 🔹 Seleccionar elementos asegurando que existen
    const dashboardSection = document.getElementById("dashboard");
    const listaClientes = document.getElementById("listaClientes");
    const listaPedidos = document.getElementById("listaPedidos");
    const registroContainer = document.getElementById("registroContainer");
    const clienteForm = document.getElementById("clienteForm");
    const pedidoForm = document.getElementById("pedidoForm");

    const btnMostrarClientes = document.getElementById("mostrarClientes");
    const btnMostrarPedidos = document.getElementById("mostrarPedidos");
    const btnNuevoRegistro = document.getElementById("nuevoRegistroBtn");
    const btnLogout = document.getElementById("logoutBtn");

    // 🔹 Verificar si los botones existen antes de asignar eventos
    if (btnMostrarClientes) {
        btnMostrarClientes.addEventListener("click", () => {
            console.log("Botón 'Mostrar Clientes' presionado");
            cargarClientes();
        });
    }

    if (btnMostrarPedidos) {
        btnMostrarPedidos.addEventListener("click", () => {
            console.log("Botón 'Mostrar Pedidos' presionado");
            cargarPedidos();
        });
    }

    if (btnNuevoRegistro) {
        btnNuevoRegistro.addEventListener("click", () => {
            registroContainer.classList.toggle("hidden");
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            auth.signOut().then(() => {
                console.log("Sesión cerrada");
            });
        });
    }

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
document.getElementById("clienteForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const direccion = document.getElementById("direccion").value;
  const telefono = document.getElementById("telefono").value;
  const dni = document.getElementById("dni").value;

  const clientesRef = db.ref('clientes');
  const newClienteRef = clientesRef.push();
  newClienteRef.set({ nombre, direccion, telefono, dni })
    .then(() => {
      alert("Cliente agregado");
      cargarClientes();
    })
    .catch((error) => alert("Error: " + error.message));
});

// 🔹 Cargar clientes en la lista
function cargarClientes() {
  const clientesRef = db.ref('clientes');
  clientesRef.on("value", (snapshot) => {
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

// 🔹 Agregar pedido
document.getElementById("pedidoForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const clientePedido = document.getElementById("clientePedido").value;
  const producto = document.getElementById("producto").value;
  const estado = document.getElementById("estado").value;

  const pedidosRef = db.ref(pedidos/${clientePedido});
  const newPedidoRef = pedidosRef.push();
  newPedidoRef.set({ producto, estado, fecha: new Date().toISOString() })
    .then(() => {
      alert("Pedido agregado");
      cargarPedidos(clientePedido);
    })
    .catch((error) => alert("Error: " + error.message));
});


    
