// app.js completo y comentado

// Configuración de Firebase
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

// Elementos del DOM
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
  Object.values(DOM.forms).forEach(form => form.reset());
}

const AppState = {
  currentUser: null
};

auth.onAuthStateChanged(user => {
  AppState.currentUser = user;
  if (user) {
    showSection(DOM.sections.menu);
  } else {
    showSection(DOM.sections.login);
  }
});

DOM.forms.registro.addEventListener("submit", (e) => {
  e.preventDefault();
  const { nombreCompleto, correo, nuevaPassword } = DOM.inputs;

  auth.createUserWithEmailAndPassword(correo.value, nuevaPassword.value)
    .then(userCredential => {
      return db.ref('users/' + userCredential.user.uid).set({
        nombre: nombreCompleto.value,
        email: correo.value
      });
    })
    .then(() => {
      alert("Cuenta creada con éxito");
      resetForms();
      showSection(DOM.sections.login);
    })
    .catch(error => {
      alert("Error: " + error.message);
    });
});

DOM.forms.login.addEventListener("submit", (e) => {
  e.preventDefault();
  const { correoLogin, password } = DOM.inputs;

  auth.signInWithEmailAndPassword(correoLogin.value, password.value)
    .then(() => {
      resetForms();
      showSection(DOM.sections.menu);
    })
    .catch(error => alert("Error: " + error.message));
});

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

// Botones volver
DOM.buttons.volverMenuDesdeRegistro.addEventListener("click", () => showSection(DOM.sections.menu));
DOM.buttons.volverMenuDesdeClientes.addEventListener("click", () => showSection(DOM.sections.menu));
DOM.buttons.volverMenuDesdePedidos.addEventListener("click", () => showSection(DOM.sections.menu));

// Menú principal
const menuButtons = document.querySelectorAll(".menu-card");
menuButtons.forEach(button => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    showSection(DOM.sections.dashboard);

    switch (action) {
      case "crear-cliente":
      case "crear-pedido":
        DOM.sections.registroContainer.classList.remove("hidden");
        DOM.sections.clientesLista.classList.add("hidden");
        DOM.sections.pedidosLista.classList.add("hidden");
        break;
      case "ver-clientes":
        DOM.sections.registroContainer.classList.add("hidden");
        DOM.sections.clientesLista.classList.remove("hidden");
        DOM.sections.pedidosLista.classList.add("hidden");
        cargarClientes();
        break;
      case "ver-pedidos":
        DOM.sections.registroContainer.classList.add("hidden");
        DOM.sections.clientesLista.classList.add("hidden");
        DOM.sections.pedidosLista.classList.remove("hidden");
        cargarPedidos();
        break;
      case "calculadora":
      case "configuracion":
        alert("Esta sección aún no está disponible.");
        break;
    }
  });
});

// Funciones recuperar clientes/pedidos
document.getElementById("clienteForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const { nombre, email, direccion, telefono, dni } = DOM.inputs;
  const snapshot = await db.ref('clientes').orderByChild('dni').equalTo(dni.value).once('value');
  if (snapshot.exists()) return alert("Ya existe un cliente con ese DNI");

  const cliente = { nombre: nombre.value, email: email.value, direccion: direccion.value, telefono: telefono.value, dni: dni.value, fecha: new Date().toISOString() };
  await db.ref('clientes').push(cliente);
  alert("Cliente agregado");
  resetForms();
  cargarClientes();
});

function cargarClientes() {
  db.ref('clientes').once('value').then(snapshot => {
    const tbody = DOM.lists.clientes;
    tbody.innerHTML = "";
    const data = snapshot.val();
    if (data) {
      Object.entries(data).forEach(([id, cliente]) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${cliente.nombre}</td>
          <td>${cliente.email}</td>
          <td>${cliente.direccion}</td>
          <td>${cliente.telefono}</td>
          <td>${cliente.dni}</td>
          <td><button onclick="cargarPedidosCliente('${id}')">Ver Pedidos</button></td>`;
        tbody.appendChild(tr);
      });
    }
  });
}

window.cargarPedidosCliente = function(clienteId) {
  db.ref(`clientes/${clienteId}`).once('value').then(clienteSnap => {
    const cliente = clienteSnap.val();
    db.ref(`pedidos/${clienteId}`).once('value').then(pedidosSnap => {
      const container = DOM.sections.pedidosContent;
      container.innerHTML = "";

      const header = document.createElement("div");
      header.className = "cliente-header";
      header.innerHTML = `<h4>Pedidos de: ${cliente.nombre}</h4><p>${cliente.email} - ${cliente.telefono}</p>`;
      container.appendChild(header);

      const table = document.createElement("table");
      table.innerHTML = `
        <thead><tr><th>Producto</th><th>Cantidad</th><th>Fecha</th></tr></thead>
        <tbody id="listaPedidosBody"></tbody>`;
      container.appendChild(table);

      const tbody = document.getElementById("listaPedidosBody");
      const pedidos = pedidosSnap.val();

      if (!pedidos) {
        const tr = document.createElement("tr");
        tr.innerHTML = '<td colspan="3">No hay pedidos registrados</td>';
        tbody.appendChild(tr);
        return;
      }

      Object.values(pedidos).forEach(pedido => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${pedido.producto}</td><td>${pedido.estado}</td><td>${new Date(pedido.fecha).toLocaleString()}</td>`;
        tbody.appendChild(tr);
      });
    });
  });
}

document.getElementById("pedidoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const { clientePedido, producto, estado } = DOM.inputs;
  const snap = await db.ref('clientes').orderByChild('dni').equalTo(clientePedido.value).once('value');
  if (!snap.exists()) return alert("Cliente no encontrado");
  const clienteId = Object.keys(snap.val())[0];
  const nuevoPedido = { producto: producto.value, estado: estado.value, fecha: new Date().toISOString() };
  await db.ref(`pedidos/${clienteId}`).push(nuevoPedido);
  alert("Pedido registrado");
  resetForms();
  cargarPedidosCliente(clienteId);
});

function cargarPedidos() {
  db.ref('clientes').once('value').then(clientesSnap => {
    const clientes = clientesSnap.val() || {};
    db.ref('pedidos').once('value').then(pedidosSnap => {
      const container = DOM.sections.pedidosContent;
      container.innerHTML = "";
      const table = document.createElement("table");
      table.innerHTML = `
        <thead><tr><th>Cliente</th><th>DNI</th><th>Producto</th><th>Cantidad</th><th>Fecha</th></tr></thead>
        <tbody id="listaPedidosBody"></tbody>`;
      container.appendChild(table);

      const tbody = document.getElementById("listaPedidosBody");
      const data = pedidosSnap.val();
      if (!data) {
        tbody.innerHTML = '<tr><td colspan="5">No hay pedidos</td></tr>';
        return;
      }

      Object.entries(data).forEach(([clienteId, pedidos]) => {
        const cliente = clientes[clienteId] || {};
        Object.values(pedidos).forEach(pedido => {
          const tr = document.createElement("tr");
          tr.innerHTML = `<td>${cliente.nombre || 'Desconocido'}</td><td>${cliente.dni || ''}</td><td>${pedido.producto}</td><td>${pedido.estado}</td><td>${new Date(pedido.fecha).toLocaleString()}</td>`;
          tbody.appendChild(tr);
        });
      });
    });
  });
}
