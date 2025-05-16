// Firebase
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

// DOM
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

function showSection(section) {
  Object.values(DOM.sections).forEach(sec => sec.classList.add("hidden"));
  section.classList.remove("hidden");
}

function resetForms() {
  Object.values(DOM.forms).forEach(f => f.reset());
}

// Auth
auth.onAuthStateChanged(user => {
  if (user) showSection(DOM.sections.menu);
  else showSection(DOM.sections.login);
});

// Registro/Login
DOM.forms.registro.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { nombreCompleto, correo, nuevaPassword } = DOM.inputs;
  const cred = await auth.createUserWithEmailAndPassword(correo.value, nuevaPassword.value);
  await db.ref(`users/${cred.user.uid}`).set({
    nombre: nombreCompleto.value,
    email: correo.value
  });
  alert("Cuenta creada");
  resetForms();
  showSection(DOM.sections.login);
});

DOM.forms.login.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { correoLogin, password } = DOM.inputs;
  await auth.signInWithEmailAndPassword(correoLogin.value, password.value);
  resetForms();
  showSection(DOM.sections.menu);
});

// Navegación
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

// Menú
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

// Crear cliente
DOM.forms.cliente.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { nombre, email, direccion, telefono, dni } = DOM.inputs;
  const snap = await db.ref('clientes').orderByChild('dni').equalTo(dni.value).once('value');
  if (snap.exists()) return alert("DNI existente");
  await db.ref('clientes').push({
    nombre: nombre.value,
    email: email.value,
    direccion: direccion.value,
    telefono: telefono.value,
    dni: dni.value,
    fecha: new Date().toISOString()
  });
  alert("Cliente agregado");
  resetForms();
  cargarClientes();
});

// Crear pedido
DOM.forms.pedido.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { clientePedido, producto, estado } = DOM.inputs;
  const snap = await db.ref('clientes').orderByChild('dni').equalTo(clientePedido.value).once('value');
  if (!snap.exists()) return alert("Cliente no encontrado");
  const clienteId = Object.keys(snap.val())[0];
  await db.ref(`pedidos/${clienteId}`).push({
    producto: producto.value,
    estado: estado.value,
    fecha: new Date().toISOString()
  });
  alert("Pedido registrado");
  resetForms();
  cargarPedidosCliente(clienteId);
});

// Mostrar clientes
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
    }
  });
}

// Ver pedidos de un cliente
window.cargarPedidosCliente = function (clienteId) {
  db.ref(`clientes/${clienteId}`).once('value').then(cSnap => {
    const cliente = cSnap.val();
    db.ref(`pedidos/${clienteId}`).once('value').then(pSnap => {
      const pedidos = pSnap.val();
      const tbody = document.getElementById("listaPedidosBody");
      tbody.innerHTML = "";

      if (!pedidos) {
        tbody.innerHTML = '<tr><td colspan="5">No hay pedidos</td></tr>';
        return;
      }

      Object.values(pedidos).forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${cliente.nombre}</td>
          <td>${cliente.dni}</td>
          <td>${p.producto}</td>
          <td>${p.estado}</td>
          <td>${new Date(p.fecha).toLocaleString()}</td>`;
        tbody.appendChild(tr);
      });

      showSection(DOM.sections.dashboard);
      DOM.sections.registroContainer.classList.add("hidden");
      DOM.sections.clientesLista.classList.add("hidden");
      DOM.sections.pedidosLista.classList.remove("hidden");
    });
  });
};

// Ver todos los pedidos
function cargarPedidos() {
  db.ref('clientes').once('value').then(clientesSnap => {
    const clientes = clientesSnap.val() || {};
    db.ref('pedidos').once('value').then(pedidosSnap => {
      const tbody = document.getElementById("listaPedidosBody");
      tbody.innerHTML = "";

      const data = pedidosSnap.val();
      if (!data) {
        tbody.innerHTML = '<tr><td colspan="5">No hay pedidos</td></tr>';
        return;
      }

      Object.entries(data).forEach(([clienteId, pedidos]) => {
        const cliente = clientes[clienteId] || {};
        Object.values(pedidos).forEach(pedido => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${cliente.nombre || "Desconocido"}</td>
            <td>${cliente.dni || ""}</td>
            <td>${pedido.producto}</td>
            <td>${pedido.estado}</td>
            <td>${new Date(pedido.fecha).toLocaleString()}</td>`;
          tbody.appendChild(tr);
        });
      });
    });
  });
}
