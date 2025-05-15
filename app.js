// Configuración de Firebase
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

// Elementos del DOM
const DOM = {
    sections: {
        login: document.getElementById("login"),
        mainMenu: document.getElementById("main-menu"),
        nuevoClienteView: document.getElementById("nuevo-cliente-view"),
        nuevoPedidoView: document.getElementById("nuevo-pedido-view"),
        clientesView: document.getElementById("clientes-view"),
        pedidosView: document.getElementById("pedidos-view")
    },
    buttons: {
        login: document.getElementById("loginForm"),
        logout: document.getElementById("logoutBtn"),
        nuevoCliente: document.getElementById("nuevoClienteBtn"),
        nuevoPedido: document.getElementById("nuevoPedidoBtn"),
        buscarCliente: document.getElementById("buscarClienteBtn"),
        verClientes: document.getElementById("verClientesBtn"),
        verPedidos: document.getElementById("verPedidosBtn"),
        configuracion: document.getElementById("configuracionBtn")
    },
    forms: {
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
        correoLogin: document.getElementById("correoLogin"),
        password: document.getElementById("password")
    },
    lists: {
        clientes: document.getElementById("listaClientes"),
        pedidosContent: document.getElementById("pedidosContent")
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
        showSection(DOM.sections.mainMenu);
        hideSection(DOM.sections.login);
    } else {
        // Usuario no autenticado
        showSection(DOM.sections.login);
        hideSection(DOM.sections.mainMenu);
        hideAllViews();
    }
});

// Funciones de ayuda
function showSection(section) {
    section.classList.remove("hidden");
}

function hideSection(section) {
    section.classList.add("hidden");
}

function hideAllViews() {
    Object.values(DOM.sections).forEach(section => {
        if (section.id !== "login" && section.id !== "main-menu") {
            hideSection(section);
        }
    });
}

function resetForms() {
    Object.values(DOM.forms).forEach(form => form.reset());
}

function showView(view) {
    hideAllViews();
    showSection(view);
}

// Event Listeners para navegación
DOM.buttons.nuevoCliente.addEventListener("click", () => {
    showView(DOM.sections.nuevoClienteView);
});

DOM.buttons.nuevoPedido.addEventListener("click", () => {
    showView(DOM.sections.nuevoPedidoView);
});

DOM.buttons.verClientes.addEventListener("click", () => {
    showView(DOM.sections.clientesView);
    cargarClientes();
});

DOM.buttons.verPedidos.addEventListener("click", () => {
    showView(DOM.sections.pedidosView);
    cargarPedidos();
});

DOM.buttons.buscarCliente.addEventListener("click", () => {
    alert("Funcionalidad de búsqueda en desarrollo");
});

DOM.buttons.configuracion.addEventListener("click", () => {
    alert("Configuración del sistema en desarrollo");
});

// Botones de volver
document.querySelectorAll(".back-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        showView(DOM.sections.mainMenu);
    });
});

// Cerrar sesión
DOM.buttons.logout.addEventListener("click", () => {
    auth.signOut()
        .then(() => console.log("Sesión cerrada"))
        .catch((error) => console.error("Error al cerrar sesión:", error));
});

// Inicio de sesión
DOM.buttons.login.addEventListener("submit", (e) => {
    e.preventDefault();
    const { correoLogin, password } = DOM.inputs;
    const submitBtn = DOM.buttons.login.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = "Verificando...";

    auth.signInWithEmailAndPassword(correoLogin.value, password.value)
        .then(() => {
            console.log("Sesión iniciada");
            resetForms();
        })
        .catch((error) => {
            console.error("Error al iniciar sesión:", error);
            alert("Error al iniciar sesión: " + error.message);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
});

// Registro de cliente
DOM.forms.cliente.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { nombre, email, direccion, telefono, dni } = DOM.inputs;
    const submitBtn = DOM.forms.cliente.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Validaciones
    if (!/^\d{7,8}$/.test(dni.value)) {
        alert("Error: El DNI debe contener entre 7 y 8 dígitos numéricos");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        alert("Por favor ingrese un email válido");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Verificando DNI...";

    try {
        // Verificar si el DNI ya existe
        const snapshot = await db.ref('clientes')
            .orderByChild('dni')
            .equalTo(dni.value)
            .once('value');

        if (snapshot.exists()) {
            let clienteExistente = "";
            snapshot.forEach((childSnapshot) => {
                const cliente = childSnapshot.val();
                clienteExistente = `Cliente existente: ${cliente.nombre} (Tel: ${cliente.telefono})`;
            });
            throw new Error(`El DNI ${dni.value} ya está registrado.\n${clienteExistente}`);
        }

        // Registrar nuevo cliente
        const nuevoCliente = {
            nombre: nombre.value,
            email: email.value,
            direccion: direccion.value,
            telefono: telefono.value,
            dni: dni.value,
            fechaRegistro: new Date().toISOString()
        };

        await db.ref('clientes').push(nuevoCliente);
        
        alert("Cliente registrado exitosamente!");
        resetForms();
        showView(DOM.sections.mainMenu);

    } catch (error) {
        console.error("Error al registrar cliente:", error);
        alert(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Registro de pedido
DOM.forms.pedido.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { clientePedido, producto, estado } = DOM.inputs;
    const submitBtn = DOM.forms.pedido.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Validaciones
    if (!clientePedido.value || !producto.value || !estado.value) {
        alert("Todos los campos son obligatorios");
        return;
    }

    if (!/^\d{7,8}$/.test(clientePedido.value)) {
        alert("El DNI debe contener 7 u 8 dígitos numéricos");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Validando cliente...";

    try {
        // Buscar cliente por DNI
        const clientesSnapshot = await db.ref('clientes')
            .orderByChild('dni')
            .equalTo(clientePedido.value)
            .once('value');

        if (!clientesSnapshot.exists()) {
            throw new Error(`No existe ningún cliente con DNI ${clientePedido.value}. Registre al cliente primero.`);
        }

        // Obtener datos del cliente
        let clienteId = null;
        let clienteNombre = "";
        let clienteEmail = "";
        
        clientesSnapshot.forEach((child) => {
            clienteId = child.key;
            clienteNombre = child.val().nombre;
            clienteEmail = child.val().email || '';
            return true;
        });

        // Crear pedido
        submitBtn.textContent = "Creando pedido...";
        const pedidosRef = db.ref(`pedidos/${clienteId}`);
        
        await pedidosRef.push({ 
            producto: producto.value, 
            estado: estado.value, 
            fecha: new Date().toISOString(),
            clienteDNI: clientePedido.value,
            clienteNombre: clienteNombre,
            clienteEmail: clienteEmail
        });
        
        alert(`Pedido creado exitosamente para ${clienteNombre} (DNI: ${clientePedido.value})`);
        resetForms();
        showView(DOM.sections.mainMenu);

    } catch (error) {
        console.error("Error al crear pedido:", error);
        alert(error.message);
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
                    <td><button class="action-btn" onclick="cargarPedidosCliente('${id}')">Ver Pedidos</button></td>
                `;
                DOM.lists.clientes.appendChild(tr);
            });
        } else {
            const tr = document.createElement("tr");
            tr.innerHTML = '<td colspan="6" style="text-align: center;">No hay clientes registrados</td>';
            DOM.lists.clientes.appendChild(tr);
        }
    });
}

// Cargar pedidos de un cliente específico
window.cargarPedidosCliente = async function(clienteId) {
    try {
        // Verificar que el cliente existe
        const clienteSnapshot = await db.ref(`clientes/${clienteId}`).once('value');
        if (!clienteSnapshot.exists()) {
            throw new Error("El cliente no existe");
        }

        // Obtener datos del cliente
        const cliente = clienteSnapshot.val();
        
        // Cargar pedidos del cliente
        const pedidosRef = db.ref(`pedidos/${clienteId}`);
        pedidosRef.on('value', (snapshot) => {
            DOM.lists.pedidosContent.innerHTML = "";
            
            // Encabezado con información del cliente
            const header = document.createElement('div');
            header.className = 'cliente-header';
            header.innerHTML = `
                <h3>Pedidos de: ${cliente.nombre} | Tel: ${cliente.telefono}</h3>
                <p>Email: ${cliente.email || 'No especificado'} | DNI: ${cliente.dni || 'No especificado'}</p>
            `;
            DOM.lists.pedidosContent.appendChild(header);
            
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
            DOM.lists.pedidosContent.appendChild(table);
            
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
        });

        showView(DOM.sections.pedidosView);

    } catch (error) {
        console.error("Error al cargar pedidos:", error);
        alert(`Error: ${error.message}`);
    }
};

// Cargar todos los pedidos
function cargarPedidos() {
    // Obtener todos los clientes para mapear IDs a datos
    db.ref('clientes').once('value').then((clientesSnapshot) => {
        const clientes = clientesSnapshot.val() || {};
        
        // Obtener todos los pedidos
        db.ref('pedidos').on("value", (pedidosSnapshot) => {
            DOM.lists.pedidosContent.innerHTML = "<h3>TODOS LOS PEDIDOS</h3>";
            
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
            DOM.lists.pedidosContent.appendChild(table);
            
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
