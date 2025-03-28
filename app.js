// Configuración e inicialización de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBoOkpUMeYt5KVkP24eDgme2oy_L6xcNoc",
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

// Agregar pedido con validación por DNI
pedidoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const dniCliente = document.getElementById("clientePedido").value.trim();
    const producto = document.getElementById("producto").value.trim();
    const estado = document.getElementById("estado").value.trim();
    
    // Validar campos requeridos
    if (!dniCliente || !producto || !estado) {
        alert("Todos los campos son obligatorios");
        return;
    }

    // Validar formato de DNI
    if (!/^\d{7,8}$/.test(dniCliente)) {
        alert("El DNI debe contener 7 u 8 dígitos numéricos");
        return;
    }

    // Mostrar estado de carga
    const submitBtn = pedidoForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Validando cliente...";

    try {
        // 1. Buscar cliente por DNI
        const clientesSnapshot = await db.ref('clientes')
            .orderByChild('dni')
            .equalTo(dniCliente)
            .once('value');

        if (!clientesSnapshot.exists()) {
            throw new Error(`No existe ningún cliente con DNI ${dniCliente}. Registre al cliente primero.`);
        }

        // 2. Obtener ID del cliente (tomamos el primero que coincida)
        let clienteId = null;
        let clienteNombre = "";
        
        clientesSnapshot.forEach((child) => {
            clienteId = child.key;
            clienteNombre = child.val().nombre;
            return true; // Solo tomamos el primer resultado
        });

        // 3. Crear el pedido
        submitBtn.textContent = "Creando pedido...";
        const pedidosRef = db.ref(`pedidos/${clienteId}`);
        
        await pedidosRef.push({ 
            producto, 
            estado, 
            fecha: new Date().toISOString(),
            clienteDNI: dniCliente,
            clienteNombre: clienteNombre
        });
        
        alert(`Pedido creado exitosamente para ${clienteNombre} (DNI: ${dniCliente})`);
        pedidoForm.reset();
        
        // 4. Mostrar los pedidos del cliente
        cargarPedidosCliente(clienteId);

    } catch (error) {
        console.error("Error al crear pedido:", error);
        alert(error.message);
        
        // Mostrar la lista de clientes para registro
        clientesLista.classList.remove("hidden");
        pedidosLista.classList.add("hidden");
        
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Cargar pedidos de un cliente específico (versión corregida)
window.cargarPedidosCliente = async function(clienteId) {
    try {
        // Mostrar estado de carga
        const loadingText = "Cargando pedidos...";
        const originalText = btnMostrarPedidos.textContent;
        btnMostrarPedidos.disabled = true;
        btnMostrarPedidos.textContent = loadingText;

        // 1. Verificar que el cliente existe
        const clienteSnapshot = await db.ref(`clientes/${clienteId}`).once('value');
        if (!clienteSnapshot.exists()) {
            throw new Error("El cliente no existe");
        }

        // 2. Obtener datos del cliente
        const cliente = clienteSnapshot.val();
        
        // 3. Cargar los pedidos del cliente
        const pedidosRef = db.ref(`pedidos/${clienteId}`);
        pedidosRef.on('value', (snapshot) => {
            listaPedidos.innerHTML = "";
            
            // Encabezado con información del cliente
            const headerRow = document.createElement('tr');
            headerRow.className = 'cliente-header';
            headerRow.innerHTML = `
                <td colspan="4">
                    <strong>Pedidos de:</strong> ${cliente.nombre} | 
                    <strong>Tel:</strong> ${cliente.telefono} | 
                    <strong>DNI:</strong> ${cliente.dni}
                </td>
            `;
            listaPedidos.appendChild(headerRow);
            
            // Mostrar los pedidos
            const pedidos = snapshot.val() || {};
            
            if (Object.keys(pedidos).length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = '<td colspan="4" style="text-align: center;">No hay pedidos registrados</td>';
                listaPedidos.appendChild(emptyRow);
            } else {
                Object.entries(pedidos).forEach(([pedidoId, pedido]) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${pedido.producto || 'Sin especificar'}</td>
                        <td>${pedido.estado || 'Pendiente'}</td>
                        <td>${new Date(pedido.fecha).toLocaleString() || 'Fecha no disponible'}</td>
                        <td>
                            <button class="btn-accion" onclick="editarPedido('${clienteId}', '${pedidoId}')">Editar</button>
                            <button class="btn-accion" onclick="eliminarPedido('${clienteId}', '${pedidoId}')">Eliminar</button>
                        </td>
                    `;
                    listaPedidos.appendChild(tr);
                });
            }
            
            // Mostrar la sección de pedidos
            pedidosLista.classList.remove('hidden');
            clientesLista.classList.add('hidden');
            registroContainer.classList.add('hidden');
        });

    } catch (error) {
        console.error("Error al cargar pedidos:", error);
        alert(`Error: ${error.message}`);
        
        // Volver a mostrar la lista de clientes
        clientesLista.classList.remove('hidden');
        pedidosLista.classList.add('hidden');
        
    } finally {
        // Restaurar el botón
        if (btnMostrarPedidos) {
            btnMostrarPedidos.disabled = false;
            btnMostrarPedidos.textContent = originalText;
        }
    }
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
