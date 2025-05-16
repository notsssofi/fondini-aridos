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

// Campos del formulario de cliente
const nombreInput = document.getElementById("nombre");
const emailInput = document.getElementById("email");
const direccionInput = document.getElementById("direccion");
const telefonoInput = document.getElementById("telefono");
const dniInput = document.getElementById("dni");

// Enlaces
const crearCuentaLink = document.getElementById("crearCuentaLink");
const volverLogin = document.getElementById("volverLogin");

// Manejar estado de autenticación
// Elementos del DOM
const DOM = {
    sections: {
        login: document.getElementById("login"),
        registro: document.getElementById("registro"),
        dashboard: document.getElementById("dashboard"),
        registroContainer: document.getElementById("registroContainer"),
        clientesLista: document.getElementById("clientesLista"),
        pedidosLista: document.getElementById("pedidosLista"),
        pedidosContent: document.getElementById("pedidosContent")
    },
    lists: {
        clientes: document.getElementById("listaClientes"),
        pedidos: document.getElementById("listaPedidos")
    },
    buttons: {
        mostrarClientes: document.getElementById("mostrarClientes"),
        mostrarPedidos: document.getElementById("mostrarPedidos"),
        nuevoRegistro: document.getElementById("nuevoRegistroBtn"),
        logout: document.getElementById("logoutBtn")
    },
    forms: {
        login: document.getElementById("loginForm"),
        registro: document.getElementById("registroForm"),
        cliente: document.getElementById("clienteForm"),
        pedido: document.getElementById("pedidoForm")
    },
    inputs: {
        nombre: document.getElementById("nombre"),
        email: document.getElementById("email"),
        direccion: document.getElementById("direccion"),
        telefono: document.getElementById("telefono"),
        dni: document.getElementById("dni"),
        clientePedido: document.getElementById("clientePedido"),
        producto: document.getElementById("producto"),
        estado: document.getElementById("estado"),
        nombreCompleto: document.getElementById("nombreCompleto"),
        correo: document.getElementById("correo"),
        nuevaPassword: document.getElementById("nuevaPassword"),
        correoLogin: document.getElementById("correoLogin"),
        password: document.getElementById("password")
    },
    links: {
        crearCuenta: document.getElementById("crearCuentaLink"),
        volverLogin: document.getElementById("volverLogin")
    }
};

// Estado de la aplicación
const AppState = {
    currentUser: null,
    currentCliente: null
};

// Manejo de autenticación
auth.onAuthStateChanged((user) => {
    AppState.currentUser = user;
    
    if (user) {
        // Usuario autenticado
        loginSection.classList.add("hidden");
        registroSection.classList.add("hidden");
        dashboardSection.classList.remove("hidden");
        showSection(DOM.sections.dashboard);
        hideSection(DOM.sections.login);
        hideSection(DOM.sections.registro);
        cargarClientes();
    } else {
        // Usuario no autenticado
        loginSection.classList.remove("hidden");
        registroSection.classList.add("hidden");
        dashboardSection.classList.add("hidden");
        showSection(DOM.sections.login);
        hideSection(DOM.sections.registro);
        hideSection(DOM.sections.dashboard);
    }
});

// Evento para crear cuenta
registroForm.addEventListener("submit", (e) => {
// Funciones de ayuda
function showSection(section) {
    section.classList.remove("hidden");
}

function hideSection(section) {
    section.classList.add("hidden");
}

function toggleSection(section) {
    section.classList.toggle("hidden");
}

function resetForms() {
    Object.values(DOM.forms).forEach(form => form.reset());
}

// Event Listeners
DOM.links.crearCuenta.addEventListener("click", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombreCompleto").value;
    const email = document.getElementById("correo").value;
    const password = document.getElementById("nuevaPassword").value;
    hideSection(DOM.sections.login);
    showSection(DOM.sections.registro);
});

DOM.links.volverLogin.addEventListener("click", (e) => {
    e.preventDefault();
    hideSection(DOM.sections.registro);
    showSection(DOM.sections.login);
});

DOM.buttons.logout.addEventListener("click", () => {
    auth.signOut()
        .then(() => console.log("Sesión cerrada"))
        .catch((error) => console.error("Error al cerrar sesión:", error));
});

DOM.buttons.mostrarClientes.addEventListener("click", () => {
    showSection(DOM.sections.clientesLista);
    hideSection(DOM.sections.pedidosLista);
    hideSection(DOM.sections.registroContainer);
    cargarClientes();
});

DOM.buttons.mostrarPedidos.addEventListener("click", () => {
    showSection(DOM.sections.pedidosLista);
    hideSection(DOM.sections.clientesLista);
    hideSection(DOM.sections.registroContainer);
    cargarPedidos();
});

DOM.buttons.nuevoRegistro.addEventListener("click", () => {
    toggleSection(DOM.sections.registroContainer);
    hideSection(DOM.sections.clientesLista);
    hideSection(DOM.sections.pedidosLista);
});

    auth.createUserWithEmailAndPassword(email, password)
// Registro de usuario
DOM.forms.registro.addEventListener("submit", (e) => {
    e.preventDefault();
    const { nombreCompleto, correo, nuevaPassword } = DOM.inputs;
    
    auth.createUserWithEmailAndPassword(correo.value, nuevaPassword.value)
        .then((userCredential) => {
            return db.ref('users/' + userCredential.user.uid).set({ nombre, email });
            return db.ref('users/' + userCredential.user.uid).set({ 
                nombre: nombreCompleto.value, 
                email: correo.value 
            });
        })
        .then(() => {
            alert("Cuenta creada con éxito");
            registroForm.reset();
            resetForms();
        })
        .catch((error) => {
            console.error("Error al crear cuenta:", error);
            alert("Error al crear cuenta: " + error.message);
        });
});

// Evento para iniciar sesión
loginForm.addEventListener("submit", (e) => {
// Inicio de sesión
DOM.forms.login.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("correoLogin").value;
    const password = document.getElementById("password").value;
    const { correoLogin, password } = DOM.inputs;

    auth.signInWithEmailAndPassword(email, password)
    auth.signInWithEmailAndPassword(correoLogin.value, password.value)
        .then(() => {
            console.log("Sesión iniciada");
            loginForm.reset();
            resetForms();
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
// Registro de cliente
DOM.forms.cliente.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { nombre, email, direccion, telefono, dni } = DOM.inputs;
    const submitBtn = DOM.forms.cliente.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Obtener valores del formulario
    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const direccion = direccionInput.value.trim();
    const telefono = telefonoInput.value.trim();
    const dni = dniInput.value.trim();

    // Validación básica del DNI
    if (!/^\d{7,8}$/.test(dni)) {
    // Validaciones
    if (!/^\d{7,8}$/.test(dni.value)) {
        alert("Error: El DNI debe contener entre 7 y 8 dígitos numéricos");
        return;
    }

    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        alert("Por favor ingrese un email válido");
        return;
    }

    // Mostrar estado de carga
    const submitBtn = clienteForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Verificando DNI...";

    try {
        // Verificar si el DNI ya existe en la base de datos
        // Verificar si el DNI ya existe
        const snapshot = await db.ref('clientes')
            .orderByChild('dni')
            .equalTo(dni)
            .equalTo(dni.value)
            .once('value');

        if (snapshot.exists()) {
            // Obtener datos del cliente existente
            let clienteExistente = "";
            snapshot.forEach((childSnapshot) => {
                const cliente = childSnapshot.val();
                clienteExistente = Cliente existente: ${cliente.nombre} (Tel: ${cliente.telefono});
            });
            throw new Error(El DNI ${dni} ya está registrado.\n${clienteExistente});
            throw new Error(El DNI ${dni.value} ya está registrado.\n${clienteExistente});
        }

        // Si no existe, proceder con el registro
        // Registrar nuevo cliente
        const nuevoCliente = {
            nombre,
            email,
            direccion,
            telefono,
            dni,
            nombre: nombre.value,
            email: email.value,
            direccion: direccion.value,
            telefono: telefono.value,
            dni: dni.value,
            fechaRegistro: new Date().toISOString()
        };

        await db.ref('clientes').push(nuevoCliente);

        alert("Cliente registrado exitosamente!");
        clienteForm.reset();
        resetForms();
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
                    <td>${cliente.email || ''}</td>
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
// Registro de pedido
DOM.forms.pedido.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { clientePedido, producto, estado } = DOM.inputs;
    const submitBtn = DOM.forms.pedido.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    const dniCliente = document.getElementById("clientePedido").value.trim();
    const producto = document.getElementById("producto").value.trim();
    const estado = document.getElementById("estado").value.trim();
    
    // Validar campos requeridos
    if (!dniCliente || !producto || !estado) {
    // Validaciones
    if (!clientePedido.value || !producto.value || !estado.value) {
        alert("Todos los campos son obligatorios");
        return;
    }

    // Validar formato de DNI
    if (!/^\d{7,8}$/.test(dniCliente)) {
    if (!/^\d{7,8}$/.test(clientePedido.value)) {
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
        // Buscar cliente por DNI
        const clientesSnapshot = await db.ref('clientes')
            .orderByChild('dni')
            .equalTo(dniCliente)
            .equalTo(clientePedido.value)
            .once('value');

        if (!clientesSnapshot.exists()) {
            throw new Error(No existe ningún cliente con DNI ${dniCliente}. Registre al cliente primero.);
            throw new Error(No existe ningún cliente con DNI ${clientePedido.value}. Registre al cliente primero.);
        }

        // 2. Obtener ID del cliente (tomamos el primero que coincida)
        // Obtener datos del cliente
        let clienteId = null;
        let clienteNombre = "";
        let clienteEmail = "";

        clientesSnapshot.forEach((child) => {
            clienteId = child.key;
            clienteNombre = child.val().nombre;
            clienteEmail = child.val().email || '';
            return true; // Solo tomamos el primer resultado
            return true;
        });

        // 3. Crear el pedido
        // Crear pedido
        submitBtn.textContent = "Creando pedido...";
        const pedidosRef = db.ref(pedidos/${clienteId});

        await pedidosRef.push({ 
            producto, 
            estado, 
            producto: producto.value, 
            estado: estado.value, 
            fecha: new Date().toISOString(),
            clienteDNI: dniCliente,
            clienteDNI: clientePedido.value,
            clienteNombre: clienteNombre,
            clienteEmail: clienteEmail
        });

        alert(Pedido creado exitosamente para ${clienteNombre} (DNI: ${dniCliente}));
        pedidoForm.reset();
        
        // 4. Mostrar los pedidos del cliente
        alert(Pedido creado exitosamente para ${clienteNombre} (DNI: ${clientePedido.value}));
        resetForms();
        cargarPedidosCliente(clienteId);

    } catch (error) {
        console.error("Error al crear pedido:", error);
        alert(error.message);
        
        // Mostrar la lista de clientes para registro
        clientesLista.classList.remove("hidden");
        pedidosLista.classList.add("hidden");
        
        showSection(DOM.sections.clientesLista);
        hideSection(DOM.sections.pedidosLista);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Cargar clientes
function cargarClientes() {
    const clientesRef = db.ref('clientes');
    clientesRef.on("value", (snapshot) => {
        DOM.lists.clientes.innerHTML = "";
        const data = snapshot.val();
        
        if (data) {
            Object.entries(data).forEach(([id, cliente]) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${cliente.nombre || ''}</td>
                    <td>${cliente.email || ''}</td>
                    <td>${cliente.direccion || ''}</td>
                    <td>${cliente.telefono || ''}</td>
                    <td>${cliente.dni || ''}</td>
                    <td><button onclick="cargarPedidosCliente('${id}')">Ver Pedidos</button></td>
                `;
                DOM.lists.clientes.appendChild(tr);
            });
        }
    });
}

// Cargar pedidos de un cliente específico
window.cargarPedidosCliente = async function(clienteId) {
    try {
        // 1. Verificar que el cliente existe
        // Verificar que el cliente existe
        const clienteSnapshot = await db.ref(clientes/${clienteId}).once('value');
        if (!clienteSnapshot.exists()) {
            throw new Error("El cliente no existe");
        }

        // 2. Obtener datos del cliente
        // Obtener datos del cliente
        const cliente = clienteSnapshot.val();

        // 3. Cargar los pedidos del cliente
        // Cargar pedidos del cliente
        const pedidosRef = db.ref(pedidos/${clienteId});
        pedidosRef.on('value', (snapshot) => {
            listaPedidos.innerHTML = "";
            DOM.sections.pedidosContent.innerHTML = "";
            
            // Encabezado con información del cliente
            const header = document.createElement('div');
            header.className = 'cliente-header';
            header.innerHTML = `
                <h4>Pedidos de: ${cliente.nombre} | Tel: ${cliente.telefono}</h4>
                <p>Email: ${cliente.email || 'No especificado'} | DNI: ${cliente.dni || 'No especificado'}</p>
            `;
            DOM.sections.pedidosContent.appendChild(header);

            // Crear tabla
            // Tabla de pedidos
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody id="listaPedidosBody"></tbody>
            `;
            listaPedidos.appendChild(table);
            
            // Encabezado con información del cliente
            const header = document.createElement('div');
            header.className = 'cliente-header';
            header.innerHTML = `
                <h4>Pedidos de: ${cliente.nombre} | Tel: ${cliente.telefono}</h4>
                <p>Email: ${cliente.email || 'No especificado'} | DNI: ${cliente.dni || 'No especificado'}</p>
            `;
            listaPedidos.insertBefore(header, table);
            DOM.sections.pedidosContent.appendChild(table);

            const tbody = document.getElementById("listaPedidosBody");
            const pedidos = snapshot.val() || {};

            if (Object.keys(pedidos).length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = '<td colspan="3" style="text-align: center;">No hay pedidos registrados</td>';
                tbody.appendChild(tr);
            } else {
                Object.values(pedidos).forEach((pedido) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${pedido.producto || 'Sin especificar'}</td>
                        <td>${pedido.estado || 'Pendiente'}</td>
                        <td>${new Date(pedido.fecha).toLocaleString() || 'Fecha no disponible'}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            // Mostrar la sección de pedidos
            pedidosLista.classList.remove('hidden');
            clientesLista.classList.add('hidden');
            registroContainer.classList.add('hidden');
            showSection(DOM.sections.pedidosLista);
            hideSection(DOM.sections.clientesLista);
            hideSection(DOM.sections.registroContainer);
        });

    } catch (error) {
        console.error("Error al cargar pedidos:", error);
        alert(Error: ${error.message});
        
        // Volver a mostrar la lista de clientes
        clientesLista.classList.remove('hidden');
        pedidosLista.classList.add('hidden');
        showSection(DOM.sections.clientesLista);
        hideSection(DOM.sections.pedidosLista);
    }
};

// Cargar todos los pedidos (versión actualizada)
// Cargar todos los pedidos
function cargarPedidos() {
    // Primero obtener todos los clientes para mapear IDs a datos
    // Obtener todos los clientes para mapear IDs a datos
    db.ref('clientes').once('value').then((clientesSnapshot) => {
        const clientes = clientesSnapshot.val() || {};

        // Luego obtener todos los pedidos
        // Obtener todos los pedidos
        db.ref('pedidos').on("value", (pedidosSnapshot) => {
            listaPedidos.innerHTML = "";
            DOM.sections.pedidosContent.innerHTML = "";

            // Crear tabla
            // Tabla de pedidos
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>DNI</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody id="listaPedidosBody"></tbody>
            `;
            listaPedidos.appendChild(table);
            DOM.sections.pedidosContent.appendChild(table);

            const tbody = document.getElementById("listaPedidosBody");
            const pedidosData = pedidosSnapshot.val();

            if (pedidosData) {
                Object.entries(pedidosData).forEach(([clienteId, pedidos]) => {
                    const cliente = clientes[clienteId] || {};

                    Object.values(pedidos).forEach((pedido) => {
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td>${cliente.nombre || 'Cliente no encontrado'}</td>
                            <td>${cliente.dni || 'DNI no disponible'}</td>
                            <td>${pedido.producto || ''}</td>
                            <td>${pedido.estado || ''}</td>
                            <td>${new Date(pedido.fecha).toLocaleString() || ''}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                });
            } else {
                const tr = document.createElement("tr");
                tr.innerHTML = '<td colspan="5" style="text-align: center;">No hay pedidos registrados</td>';
                tbody.appendChild(tr);
            }
        });
    });
}
