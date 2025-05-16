// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHTfYQXgWb3l5DqCar3ooOv2yzzsww9Ek",
  authDomain: "bd-fondini-aridos.firebaseapp.com",
  databaseURL: "https://bd-fondini-aridos-default-rtdb.firebaseio.com",
  projectId: "bd-fondini-aridos",
  storageBucket: "bd-fondini-aridos.firabasestorage.app",
  messagingSenderId: "1038135881192",
  appId: "1:1038135881192:web:215908840951025da9485d"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// DOM Elements
const DOM = {
  sections: {
    login: document.getElementById("login"),
    registro: document.getElementById("registro"),
    dashboard: document.getElementById("dashboard"),
    menu: document.getElementById("mainMenu"),
    registroContainer: document.getElementById("registroContainer"),
    clientesLista: document.getElementById("clientesLista"),
    pedidosLista: document.getElementById("pedidosLista"),
    pedidosContent: document.getElementById("pedidosContent")
  },
  buttons: {
    logout: document.getElementById("logoutBtn"),
    volverMenuDesdeRegistro: document.getElementById("volverMenuDesdeRegistro"),
    volverMenuDesdeClientes: document.getElementById("volverMenuDesdeClientes"),
    volverMenuDesdePedidos: document.getElementById("volverMenuDesdePedidos")
  },
  forms: {
    login: document.getElementById("loginForm"),
    registro: document.getElementById("registroForm"),
    cliente: document.getElementById("clienteForm"),
    pedido: document.getElementById("pedidoForm")
  },
  inputs: {
    nombreCompleto: document.getElementById("nombreCompleto"),
    correo: document.getElementById("correo"),
    nuevaPassword: document.getElementById("nuevaPassword"),
    correoLogin: document.getElementById("correoLogin"),
    password: document.getElementById("password"),
    nombre: document.getElementById("nombre"),
    email: document.getElementById("email"),
    direccion: document.getElementById("direccion"),
    telefono: document.getElementById("telefono"),
    dni: document.getElementById("dni"),
    clientePedido: document.getElementById("clientePedido"),
    producto: document.getElementById("producto"),
    estado: document.getElementById("estado")
  },
  links: {
    crearCuenta: document.getElementById("crearCuentaLink"),
    volverLogin: document.getElementById("volverLogin")
  },
  lists: {
    clientes: document.getElementById("listaClientes"),
    pedidos: document.getElementById("listaPedidosBody")
  }
};

// Helper Functions
function showSection(section) {
  Object.values(DOM.sections).forEach(sec => sec.classList.add("hidden"));
  section.classList.remove("hidden");
}

function resetForms() {
  Object.values(DOM.forms).forEach(f => f.reset());
}

// Auth State Listener
auth.onAuthStateChanged(user => {
  if (user) showSection(DOM.sections.menu);
  else showSection(DOM.sections.login);
});

// Registration
DOM.forms.registro.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { nombreCompleto, correo, nuevaPassword } = DOM.inputs;
  try {
    const cred = await auth.createUserWithEmailAndPassword(correo.value, nuevaPassword.value);
    await db.ref(`users/${cred.user.uid}`).set({
      nombre: nombreCompleto.value,
      email: correo.value
    });
    alert("Cuenta creada exitosamente");
    resetForms();
    showSection(DOM.sections.login);
  } catch (error) {
    console.error("Error al registrar:", error);
    alert("Error al crear la cuenta: " + error.message);
  }
});

// Login
DOM.forms.login.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { correoLogin, password } = DOM.inputs;
  try {
    await auth.signInWithEmailAndPassword(correoLogin.value, password.value);
    resetForms();
    showSection(DOM.sections.menu);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("Error al iniciar sesión: " + error.message);
  }
});

// Navigation
DOM.links.crearCuenta.addEventListener("click", e => {
  e.preventDefault();
  showSection(DOM.sections.registro);
});

DOM.links.volverLogin.addEventListener("click", e => {
  e.preventDefault();
  showSection(DOM.sections.login);
});

DOM.buttons.logout.addEventListener("click", () => {
  auth.signOut().then(() => showSection(DOM.sections.login));
});

DOM.buttons.volverMenuDesdeRegistro.addEventListener("click", () => showSection(DOM.sections.menu));
DOM.buttons.volverMenuDesdeClientes.addEventListener("click", () => showSection(DOM.sections.menu));
DOM.buttons.volverMenuDesdePedidos.addEventListener("click", () => showSection(DOM.sections.menu));

// Menu Actions
document.querySelectorAll(".menu-card").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    showSection(DOM.sections.dashboard);
    DOM.sections.menu.classList.add("hidden");

    DOM.sections.registroContainer.classList.add("hidden");
    DOM.sections.clientesLista.classList.add("hidden");
    DOM.sections.pedidosLista.classList.add("hidden");

    if (action === "crear-cliente" || action === "crear-pedido") {
      DOM.sections.registroContainer.classList.remove("hidden");
    } else if (action === "ver-clientes") {
      DOM.sections.clientesLista.classList.remove("hidden");
      cargarClientes();
    } else if (action === "ver-pedidos") {
      DOM.sections.pedidosLista.classList.remove("hidden");
      cargarPedidos();
    } else {
      alert("Esta sección no está disponible.");
    }
  });
});

// Client Management
DOM.forms.cliente.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { nombre, email, direccion, telefono, dni } = DOM.inputs;
  try {
    const snap = await db.ref('clientes').orderByChild('dni').equalTo(dni.value).once('value');
    if (snap.exists()) return alert("Ya existe un cliente con este DNI");
    
    await db.ref('clientes').push({
      nombre: nombre.value,
      email: email.value,
      direccion: direccion.value,
      telefono: telefono.value,
      dni: dni.value,
      fecha: new Date().toISOString()
    });
    alert("Cliente agregado exitosamente");
    resetForms();
    cargarClientes();
  } catch (error) {
    console.error("Error al agregar cliente:", error);
    alert("Error al agregar cliente: " + error.message);
  }
});

function cargarClientes() {
  db.ref('clientes').once('value').then(snapshot => {
    const data = snapshot.val();
    DOM.lists.clientes.innerHTML = "";
    if (data) {
      Object.entries(data).forEach(([id, c]) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${c.nombre}</td><td>${c.email}</td><td>${c.direccion}</td>
          <td>${c.telefono}</td><td>${c.dni}</td>
          <td><button onclick="cargarPedidosCliente('${id}')">Ver Pedidos</button></td>`;
        DOM.lists.clientes.appendChild(tr);
      });
    } else {
      DOM.lists.clientes.innerHTML = '<tr><td colspan="6">No hay clientes registrados</td></tr>';
    }
  }).catch(error => {
    console.error("Error al cargar clientes:", error);
    DOM.lists.clientes.innerHTML = '<tr><td colspan="6">Error al cargar clientes</td></tr>';
  });
}

// Order Management - CORREGIDO PARA TU ESTRUCTURA DE DATOS
DOM.forms.pedido.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { clientePedido, producto, estado } = DOM.inputs;
  
  try {
    // Buscar cliente por DNI
    const snap = await db.ref('clientes').orderByChild('dni').equalTo(clientePedido.value).once('value');
    if (!snap.exists()) {
      alert("Cliente no encontrado");
      return;
    }
    
    // Obtener datos del cliente
    const clienteId = Object.keys(snap.val())[0];
    const cliente = snap.val()[clienteId];
    
    // Crear el pedido con la estructura que estás usando
    await db.ref('pedidos').push({
      clienteDNI: cliente.dni,
      clienteEmail: cliente.email,
      clienteNombre: cliente.nombre,
      estado: estado.value,
      fecha: new Date().toISOString(),
      producto: producto.value
    });
    
    alert("Pedido registrado correctamente");
    resetForms();
    cargarPedidos();
  } catch (error) {
    console.error("Error al registrar pedido:", error);
    alert("Ocurrió un error al registrar el pedido: " + error.message);
  }
});

function cargarPedidos() {
  console.log("CargarPedidos llamada"); // DEBUG

  db.ref('pedidos').once('value').then(snapshot => {
    const pedidos = snapshot.val();
    const tbody = document.getElementById("listaPedidosBody");
    tbody.innerHTML = "";

    if (!pedidos) {
      tbody.innerHTML = '<tr><td colspan="5">No hay pedidos registrados</td></tr>';
      return;
    }

    console.log("Pedidos obtenidos:", pedidos); // DEBUG

    Object.entries(pedidos).forEach(([pedidoId, pedido]) => {
      console.log("Pedido individual:", pedidoId, pedido); // DEBUG

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${pedido.clienteNombre ?? 'Sin nombre'}</td>
        <td>${pedido.clienteDNI ?? 'Sin DNI'}</td>
        <td>${pedido.producto ?? 'Sin producto'}</td>
        <td>${pedido.estado ?? 'Sin estado'}</td>
        <td>${pedido.fecha ? new Date(pedido.fecha).toLocaleString() : 'Sin fecha'}</td>`;
      tbody.appendChild(tr);
    });

    // ✅ Forzar visibilidad de la sección
    DOM.sections.dashboard.classList.remove("hidden");
    DOM.sections.menu.classList.add("hidden");
    DOM.sections.registroContainer.classList.add("hidden");
    DOM.sections.clientesLista.classList.add("hidden");
    DOM.sections.pedidosLista.classList.remove("hidden");
  }).catch(error => {
    console.error("Error al cargar pedidos:", error);
    const tbody = document.getElementById("listaPedidosBody");
    tbody.innerHTML = '<tr><td colspan="5">Error al cargar los pedidos</td></tr>';
  });
}



// Cargar pedidos de un cliente específico - CORREGIDO
window.cargarPedidosCliente = function (clienteId) {
  db.ref(`clientes/${clienteId}`).once('value').then(cSnap => {
    const cliente = cSnap.val();
    if (!cliente) return alert("Cliente no encontrado");

    // Buscar pedidos por DNI del cliente
    db.ref('pedidos').orderByChild('clienteDNI').equalTo(cliente.dni).once('value').then(pSnap => {
      const pedidos = pSnap.val();
      const tbody = document.getElementById("listaPedidosBody");
      tbody.innerHTML = "";

      if (!pedidos) {
        tbody.innerHTML = '<tr><td colspan="5">No hay pedidos para este cliente</td></tr>';
      } else {
        Object.entries(pedidos).forEach(([pedidoId, pedido]) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${cliente.nombre}</td>
            <td>${cliente.dni}</td>
            <td>${pedido.producto}</td>
            <td>${pedido.estado}</td>
            <td>${new Date(pedido.fecha).toLocaleString()}</td>`;
          tbody.appendChild(tr);
        });
      }

      showSection(DOM.sections.dashboard);
      DOM.sections.registroContainer.classList.add("hidden");
      DOM.sections.clientesLista.classList.add("hidden");
      DOM.sections.pedidosLista.classList.remove("hidden");
    });
  }).catch(error => {
    console.error("Error al cargar pedidos del cliente:", error);
    const tbody = document.getElementById("listaPedidosBody");
    tbody.innerHTML = '<tr><td colspan="5">Error al cargar pedidos</td></tr>';
  });
};
