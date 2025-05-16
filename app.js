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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Selección de elementos del DOM
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

function showSection(section) {
  section.classList.remove("hidden");
}

function hideSection(section) {
  section.classList.add("hidden");
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
    showSection(DOM.sections.dashboard);
    hideSection(DOM.sections.login);
    hideSection(DOM.sections.registro);
    cargarClientes();
  } else {
    showSection(DOM.sections.login);
    hideSection(DOM.sections.dashboard);
    hideSection(DOM.sections.registro);
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
    })
    .catch(error => {
      console.error("Error al crear cuenta:", error);
      alert("Error al crear cuenta: " + error.message);
    });
});

DOM.forms.login.addEventListener("submit", (e) => {
  e.preventDefault();
  const { correoLogin, password } = DOM.inputs;

  auth.signInWithEmailAndPassword(correoLogin.value, password.value)
    .then(() => {
      console.log("Sesión iniciada");
      resetForms();
    })
    .catch(error => {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión: " + error.message);
    });
});

DOM.links.crearCuenta.addEventListener("click", (e) => {
  e.preventDefault();
  showSection(DOM.sections.registro);
  hideSection(DOM.sections.login);
});

DOM.links.volverLogin.addEventListener("click", (e) => {
  e.preventDefault();
  showSection(DOM.sections.login);
  hideSection(DOM.sections.registro);
});

DOM.buttons.logout.addEventListener("click", () => {
  auth.signOut()
    .then(() => console.log("Sesión cerrada"))
    .catch(error => console.error("Error al cerrar sesión:", error));
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
  DOM.sections.registroContainer.classList.toggle("hidden");
  hideSection(DOM.sections.clientesLista);
  hideSection(DOM.sections.pedidosLista);
});

DOM.forms.cliente.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { nombre, email, direccion, telefono, dni } = DOM.inputs;
  const editId = DOM.forms.cliente.getAttribute("data-edit-id");

  if (!/^[0-9]{7,8}$/.test(dni.value)) return alert("DNI inválido");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return alert("Email inválido");

  const clienteData = {
    nombre: nombre.value,
    email: email.value,
    direccion: direccion.value,
    telefono: telefono.value,
    dni: dni.value
  };

  if (editId) {
    await db.ref(`clientes/${editId}`).update(clienteData);
    alert("Cliente actualizado");
    DOM.forms.cliente.removeAttribute("data-edit-id");
    DOM.inputs.dni.disabled = false;
  } else {
    const snapshot = await db.ref('clientes').orderByChild('dni').equalTo(dni.value).once('value');
    if (snapshot.exists()) return alert("Ya existe un cliente con ese DNI");

    clienteData.fechaRegistro = new Date().toISOString();
    await db.ref('clientes').push(clienteData);
    alert("Cliente registrado exitosamente");
  }

  resetForms();
  cargarClientes();
});


function cargarClientes() {
  db.ref('clientes').once('value').then(snapshot => {
    DOM.lists.clientes.innerHTML = "";
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
          <td>
            <button onclick="cargarPedidosCliente('${id}')">Ver Pedidos</button>
            <button onclick="editarCliente('${id}')">Editar</button>
            <button onclick="eliminarCliente('${id}')">Eliminar</button>
          </td>
        `;
        DOM.lists.clientes.appendChild(tr);
      });
    }
  });
}

window.editarCliente = function(id) {
  db.ref(`clientes/${id}`).once('value').then(snapshot => {
    const cliente = snapshot.val();
    if (!cliente) return alert("Cliente no encontrado");

    DOM.inputs.nombre.value = cliente.nombre;
    DOM.inputs.email.value = cliente.email;
    DOM.inputs.direccion.value = cliente.direccion;
    DOM.inputs.telefono.value = cliente.telefono;
    DOM.inputs.dni.value = cliente.dni;
    DOM.inputs.dni.disabled = true;

    DOM.forms.cliente.setAttribute("data-edit-id", id);
    DOM.sections.registroContainer.classList.remove("hidden");
  });
};

window.eliminarCliente = function(id) {
  if (confirm("¿Estás seguro de eliminar este cliente y sus pedidos?")) {
    db.ref(`clientes/${id}`).remove()
      .then(() => db.ref(`pedidos/${id}`).remove())
      .then(() => {
        alert("Cliente y pedidos eliminados");
        cargarClientes();
      })
      .catch(err => alert("Error: " + err.message));
  }
};


window.cargarPedidosCliente = function (clienteId) {
 db.ref(`clientes/${clienteId}`).once('value').then(clienteSnap => {
    const cliente = clienteSnap.val();
    if (!cliente) return alert("Cliente no encontrado");

db.ref(`pedidos/${clienteId}`).once('value').then(pedidosSnap => {
      DOM.sections.pedidosContent.innerHTML = "";
      const pedidos = pedidosSnap.val();

      const header = document.createElement("div");
      header.className = "cliente-header";
      header.innerHTML = `
        <h4>Pedidos de: ${cliente.nombre} | Tel: ${cliente.telefono}</h4>
        <p>Email: ${cliente.email} | DNI: ${cliente.dni}</p>
      `;
      DOM.sections.pedidosContent.appendChild(header);

      const table = document.createElement("table");
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
      DOM.sections.pedidosContent.appendChild(table);

      const tbody = document.getElementById("listaPedidosBody");

      if (!pedidos) {
        const tr = document.createElement("tr");
        tr.innerHTML = '<td colspan="3">No hay pedidos registrados</td>';
        tbody.appendChild(tr);
        return;
      }

      Object.values(pedidos).forEach(pedido => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${pedido.producto}</td>
          <td>${pedido.estado}</td>
          <td>${new Date(pedido.fecha).toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
      });
    });
  });
}

DOM.forms.pedido.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { clientePedido, producto, estado } = DOM.inputs;
  const editId = DOM.forms.pedido.getAttribute("data-edit-id");
  const clienteIdFromAttr = DOM.forms.pedido.getAttribute("data-cliente-id");

  if (!/^[0-9]{7,8}$/.test(clientePedido.value)) return alert("DNI inválido");

  const clientesSnap = await db.ref('clientes').orderByChild('dni').equalTo(clientePedido.value).once('value');
  if (!clientesSnap.exists()) return alert("Cliente no encontrado");

  const clienteId = Object.keys(clientesSnap.val())[0];
  const cliente = clientesSnap.val()[clienteId];

  const pedidoData = {
    producto: producto.value,
    estado: estado.value,
    fecha: new Date().toISOString(),
    clienteDNI: cliente.dni,
    clienteNombre: cliente.nombre,
    clienteEmail: cliente.email || ''
  };

  if (editId) {
    await db.ref(`pedidos/${clienteIdFromAttr}/${editId}`).update(pedidoData);
    alert("Pedido actualizado");
    DOM.forms.pedido.removeAttribute("data-edit-id");
    DOM.forms.pedido.removeAttribute("data-cliente-id");
  } else {
    await db.ref(`pedidos/${clienteId}`).push(pedidoData);
    alert("Pedido creado exitosamente");
  }

  resetForms();
  cargarPedidosCliente(clienteId);
});


function cargarPedidos() {
  db.ref('clientes').once('value').then(clientesSnap => {
    const clientes = clientesSnap.val() || {};

    db.ref('pedidos').once('value').then(pedidosSnap => {
      DOM.sections.pedidosContent.innerHTML = "";
      const pedidosData = pedidosSnap.val();

      const table = document.createElement("table");
      table.innerHTML = `
        <thead>
          <tr>
            <th>Cliente</th>
            <th>DNI</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="listaPedidosBody"></tbody>
      `;
      DOM.sections.pedidosContent.appendChild(table);

      const tbody = document.getElementById("listaPedidosBody");
      if (!pedidosData) {
        const tr = document.createElement("tr");
        tr.innerHTML = '<td colspan="6">No hay pedidos registrados</td>';
        tbody.appendChild(tr);
        return;
      }

      Object.entries(pedidosData).forEach(([clienteId, pedidos]) => {
        const cliente = clientes[clienteId] || {};
        Object.entries(pedidos).forEach(([pedidoId, pedido]) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${cliente.nombre || 'Cliente desconocido'}</td>
            <td>${cliente.dni || ''}</td>
            <td>${pedido.producto}</td>
            <td>${pedido.estado}</td>
            <td>${new Date(pedido.fecha).toLocaleString()}</td>
            <td>
              <button onclick="editarPedido('${clienteId}', '${pedidoId}')">Editar</button>
              <button onclick="eliminarPedido('${clienteId}', '${pedidoId}')">Eliminar</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      });
    });
  });
}

window.editarPedido = function(clienteId, pedidoId) {
  db.ref(`pedidos/${clienteId}/${pedidoId}`).once('value').then(snapshot => {
    const pedido = snapshot.val();
    if (!pedido) return alert("Pedido no encontrado");

    DOM.inputs.clientePedido.value = pedido.clienteDNI;
    DOM.inputs.producto.value = pedido.producto;
    DOM.inputs.estado.value = pedido.estado;

    DOM.forms.pedido.setAttribute("data-edit-id", pedidoId);
    DOM.forms.pedido.setAttribute("data-cliente-id", clienteId);
    DOM.sections.registroContainer.classList.remove("hidden");
  });
};

window.eliminarPedido = function(clienteId, pedidoId) {
  if (confirm("¿Eliminar este pedido?")) {
    db.ref(`pedidos/${clienteId}/${pedidoId}`).remove()
      .then(() => {
        alert("Pedido eliminado");
        cargarPedidosCliente(clienteId);
      })
      .catch(err => alert("Error: " + err.message));
  }
};


async function eliminarPedidosHuerfanos() {
  const clientesSnap = await db.ref('clientes').once('value');
  const clientes = clientesSnap.val() || {};

  const pedidosSnap = await db.ref('pedidos').once('value');
  const pedidosData = pedidosSnap.val() || {};

  let borrados = 0;

  for (const clienteId in pedidosData) {
    if (!clientes[clienteId]) {
      await db.ref(`pedidos/${clienteId}`).remove();
      console.log(`Pedidos de clienteId ${clienteId} eliminados`);
      borrados++;
    }
  }

  alert(`Pedidos huérfanos eliminados: ${borrados}`);
}

