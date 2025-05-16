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
    menu: document.getElementById("mainMenu"),
    registroContainer: document.getElementById("registroContainer"),
    clientesLista: document.getElementById("clientesLista"),
    pedidosLista: document.getElementById("pedidosLista"),
    pedidosContent: document.getElementById("pedidosContent")
  },
  buttons: {
    logout: document.getElementById("logoutBtn")
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
    pedidos: document.getElementById("listaPedidos")
  }
};

// Función para mostrar una sección y ocultar las demás
function showSection(section) {
  Object.values(DOM.sections).forEach(sec => sec.classList.add("hidden"));
  section.classList.remove("hidden");
}

// Función para resetear todos los formularios
function resetForms() {
  Object.values(DOM.forms).forEach(form => form.reset());
}

const AppState = {
  currentUser: null
};

// Monitorea el estado de autenticación
auth.onAuthStateChanged(user => {
  AppState.currentUser = user;
  if (user) {
    showSection(DOM.sections.menu);
  } else {
    showSection(DOM.sections.login);
  }
});

// Registro de nuevo usuario
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
      console.error("Error al crear cuenta:", error);
      alert("Error al crear cuenta: " + error.message);
    });
});

// Inicio de sesión
DOM.forms.login.addEventListener("submit", (e) => {
  e.preventDefault();
  const { correoLogin, password } = DOM.inputs;

  auth.signInWithEmailAndPassword(correoLogin.value, password.value)
    .then(() => {
      console.log("Sesión iniciada");
      resetForms();
      showSection(DOM.sections.menu);
    })
    .catch(error => {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión: " + error.message);
    });
});

// Navegación entre login y registro
DOM.links.crearCuenta.addEventListener("click", (e) => {
  e.preventDefault();
  showSection(DOM.sections.registro);
});

DOM.links.volverLogin.addEventListener("click", (e) => {
  e.preventDefault();
  showSection(DOM.sections.login);
});

// Cierre de sesión
DOM.buttons.logout.addEventListener("click", () => {
  auth.signOut()
    .then(() => {
      console.log("Sesión cerrada");
      showSection(DOM.sections.login);
    })
    .catch(error => console.error("Error al cerrar sesión:", error));
});

// Evento de menú principal
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

// Función para cargar la lista de clientes desde Firebase
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
          <td><button onclick="cargarPedidosCliente('${id}')">Ver Pedidos</button></td>
        `;
        DOM.lists.clientes.appendChild(tr);
      });
    }
  });
}

// Función para cargar todos los pedidos desde Firebase
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
          </tr>
        </thead>
        <tbody id="listaPedidosBody"></tbody>
      `;
      DOM.sections.pedidosContent.appendChild(table);

      const tbody = document.getElementById("listaPedidosBody");
      if (!pedidosData) {
        const tr = document.createElement("tr");
        tr.innerHTML = '<td colspan="5">No hay pedidos registrados</td>';
        tbody.appendChild(tr);
        return;
      }

      Object.entries(pedidosData).forEach(([clienteId, pedidos]) => {
        const cliente = clientes[clienteId] || {};
        Object.values(pedidos).forEach(pedido => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${cliente.nombre || 'Cliente desconocido'}</td>
            <td>${cliente.dni || ''}</td>
            <td>${pedido.producto}</td>
            <td>${pedido.estado}</td>
            <td>${new Date(pedido.fecha).toLocaleString()}</td>
          `;
          tbody.appendChild(tr);
        });
      });
    });
  });
} 
