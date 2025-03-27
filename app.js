// Configuración e inicialización de Firebase
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
const clientesLista = document.getElementById("clientesLista");
const pedidosLista = document.getElementById("pedidosLista");

// Botones
const btnMostrarClientes = document.getElementById("mostrarClientes");
const btnMostrarPedidos = document.getElementById("mostrarPedidos");
const btnNuevoRegistro = document.getElementById("nuevoRegistroBtn");
const btnLogout = document.getElementById("logoutBtn");

// Formularios
const loginForm = document.getElementById("loginForm");
const registroForm = document.getElementById("registroForm");
const clienteForm = document.getElementById("clienteForm");
const pedidoForm = document.getElementById("pedidoForm");

// Enlaces
const crearCuentaLink = document.getElementById("crearCuentaLink");
const volverLogin = document.getElementById("volverLogin");

// Manejar estado de autenticación
auth.onAuthStateChanged((user) => {
    if (user) {
        // Usuario autenticado
        loginSection.classList.add("hidden");
        registroSection.classList.add("hidden");
        dashboardSection.classList.remove("hidden");
        cargarClientes();
    } else {
        // Usuario no autenticado
        loginSection.classList.remove("hidden");
        registroSection.classList.add("hidden");
        dashboardSection.classList.add("hidden");
    }
});

// Evento para crear cuenta
registroForm.addEventListener("submit", (e) => {
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
            registroForm.reset();
        })
        .catch((error) => {
            console.error("Error al crear cuenta:", error);
            alert("Error al crear cuenta: " + error.message);
        });
});

// Evento para iniciar sesión
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("correoLogin").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            console.log("Sesión iniciada");
            loginForm.reset();
        })
        .catch((error) => {
            console.error("Error al iniciar sesión:", error);
            alert("Error al iniciar sesión: " + error.message);
        });
});

// Evento para cerrar sesión
btnLogout.addEventListener("click", () => {
    auth.signOut()
        .then(() => console.log("Sesión cerrada"))
        .catch((error) => console.error("Error al cerrar sesión:", error));
});

// Alternar entre login y registro
crearCuentaLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginSection.classList.add("hidden");
    registroSection.classList.remove("hidden");
});

volverLogin.addEventListener("click", (e) => {
    e.preventDefault();
    registroSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
});

// Mostrar/ocultar secciones
btnMostrarClientes.addEventListener("click", () => {
    clientesLista.classList.remove("hidden");
    pedidosLista.classList.add("hidden");
    registroContainer.classList.add("hidden");
    cargarClientes();
});

btnMostrarPedidos.addEventListener("click", () => {
    pedidosLista.classList.remove("hidden");
    clientesLista.classList.add("hidden");
    registroContainer.classList.add("hidden");
    cargarPedidos();
});

btnNuevoRegistro.addEventListener("click", () => {
    registroContainer.classList.toggle("hidden");
    clientesLista.classList.add("hidden");
    pedidosLista.classList.add("hidden");
});

// Agregar cliente con validación de DNI mejorada
clienteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Obtener valores del formulario
    const nombre = document.getElementById("nombre").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const dni = document.getElementById("dni").value.trim();

    // Validación básica del DNI
    if (!/^\d{7,8}$/.test(dni)) {
        alert("Error: El DNI debe contener entre 7 y 8 dígitos numéricos");
        return;
    }

    // Mostrar mensaje de carga
    const submitBtn = clienteForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Verificando DNI...";

    try {
        // Verificar si el DNI ya existe en la base de datos
        const snapshot = await db.ref('clientes')
            .orderByChild('dni')
            .equalTo(dni)
            .once('value');

        if (snapshot.exists()) {
            // Obtener datos del cliente existente
            let clienteExistente = "";
            snapshot.forEach((childSnapshot) => {
                const cliente = childSnapshot.val();
                clienteExistente = `Cliente existente: ${cliente.nombre} (Tel: ${cliente.telefono})`;
            });
            throw new Error(`El DNI ${dni} ya está registrado.\n${clienteExistente}`);
        }

        // Si no existe, proceder con el registro
        const nuevoCliente = {
            nombre,
            direccion,
            telefono,
            dni,
            fechaRegistro: new Date().toISOString()
        };

        await db.ref('clientes').push(nuevoCliente);
        
        alert("Cliente registrado exitosamente!");
        clienteForm.reset();
        cargarClientes();

    } catch (error) {
        console.error("Error al registrar cliente:", error);
        alert(error.message);
    } finally {
        // Restaurar el botón
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Cargar clientes
function cargarClientes() {
    const clientesRef = db.ref('clientes');
    clientesRef.on("value", (snapshot) => {
        listaClientes.innerHTML = "";
        const data = snapshot.val();
        
        if (data) {
            Object.entries(data).forEach(([id, cliente]) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${cliente.nombre || ''}</td>
                    <td>${cliente.direccion || ''}</td>
                    <td>${cliente.telefono || ''}</td>
                    <td>${cliente.dni || ''}</td>
                    <td><button onclick="cargarPedidosCliente('${id}')">Ver Pedidos</button></td>
                `;
                listaClientes.appendChild(tr);
            });
        }
    });
}

// Agregar pedido - CORRECCIÓN
pedidoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const clienteId = document.getElementById("clientePedido").value;
    const producto = document.getElementById("producto").value;
    const estado = document.getElementById("estado").value;

    if (!clienteId) {
        alert("Por favor, ingrese un ID de cliente válido");
        return;
    }

    const pedidosRef = db.ref(`pedidos/${clienteId}`);  // <-- Usar backticks aquí
    pedidosRef.push({ 
        producto, 
        estado, 
        fecha: new Date().toISOString() 
    })
    .then(() => {
        alert("Pedido agregado");
        pedidoForm.reset();
        cargarPedidosCliente(clienteId);
    })
    .catch((error) => {
        console.error("Error al agregar pedido:", error);
        alert("Error al agregar pedido: " + error.message);
    });
});

// Cargar pedidos de un cliente específico - CORRECCIÓN
window.cargarPedidosCliente = function(clienteId) {
    const pedidosRef = db.ref(`pedidos/${clienteId}`);  // <-- Usar backticks aquí
    pedidosRef.on("value", (snapshot) => {
        listaPedidos.innerHTML = "";
        const data = snapshot.val();
        
        if (data) {
            Object.values(data).forEach((pedido) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${clienteId}</td>
                    <td>${pedido.producto || ''}</td>
                    <td>${pedido.estado || ''}</td>
                    <td>${new Date(pedido.fecha).toLocaleString() || ''}</td>
                `;
                listaPedidos.appendChild(tr);
            });
        }
        
        pedidosLista.classList.remove("hidden");
        clientesLista.classList.add("hidden");
        registroContainer.classList.add("hidden");
    });
};

// Cargar todos los pedidos (versión simplificada)
function cargarPedidos() {
    const pedidosRef = db.ref('pedidos');
    pedidosRef.on("value", (snapshot) => {
        listaPedidos.innerHTML = "";
        const data = snapshot.val();
        
        if (data) {
            Object.entries(data).forEach(([clienteId, pedidos]) => {
                Object.values(pedidos).forEach((pedido) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${clienteId}</td>
                        <td>${pedido.producto || ''}</td>
                        <td>${pedido.estado || ''}</td>
                        <td>${new Date(pedido.fecha).toLocaleString() || ''}</td>
                    `;
                    listaPedidos.appendChild(tr);
                });
            });
        }
    });
}
