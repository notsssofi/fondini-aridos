// Función para manejar el cambio de tema
function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  
  if (!themeToggle) {
    console.error("El botón de toggle de tema no existe en el DOM");
    return;
  }
  
  // Verificar si hay una preferencia guardada
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    console.log("Tema cargado desde localStorage:", savedTheme);
  } else {
    // Si no hay preferencia guardada, establecer el tema oscuro por defecto
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
  
  // Manejar el clic en el botón de toggle
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Cambiar el tema
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Guardar la preferencia
    localStorage.setItem('theme', newTheme);
    
    console.log("Tema cambiado a:", newTheme);
    
    // Actualizar las partículas si es necesario
    updateParticlesColor(newTheme);
  });
}
// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAHTfYQXgWb3l5DqCar3ooOv2yzzsww9Ek",
  authDomain: "bd-fondini-aridos.firebaseapp.com",
  databaseURL: "https://bd-fondini-aridos-default-rtdb.firebaseio.com",
  projectId: "bd-fondini-aridos",
  storageBucket: "bd-fondini-aridos.firebasestorage.app",
  messagingSenderId: "1038135881192",
  appId: "1:1038135881192:web:215908840951025da9485d",
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM completamente cargado");
  
  // Configurar el toggle de tema
  setupThemeToggle();
  
  // Initialize Firebase
  if (typeof firebase !== 'undefined') {
    console.log("Firebase está definido");
    const firebaseApp = firebase.initializeApp(firebaseConfig);
    const auth = firebaseApp.auth();
    const db = firebaseApp.database();
    
    // Inicializar la aplicación
    initApp(auth, db);
  } else {
    console.error("Firebase no está definido. Verifica que los scripts se carguen correctamente.");
  }
});

// Función principal de inicialización
function initApp(auth, db) {
  console.log("Inicializando aplicación");
  
  // Selección de elementos del DOM
  const DOM = {
    sections: {
      login: document.getElementById("login"),
      registro: document.getElementById("registro"),
      dashboard: document.getElementById("dashboard"),
      registroContainer: document.getElementById("registroContainer"),
      clientesLista: document.getElementById("clientesLista"),
      pedidosLista: document.getElementById("pedidosLista"),
      pedidosContent: document.getElementById("pedidosContent"),
      calculadora: document.getElementById("calculadora"),
    },
    lists: {
      clientes: document.getElementById("listaClientes"),
      pedidos: document.getElementById("listaPedidos"),
    },
    buttons: {
      mostrarClientes: document.getElementById("mostrarClientes"),
      mostrarPedidos: document.getElementById("mostrarPedidos"),
      nuevoRegistro: document.getElementById("nuevoRegistroBtn"),
      logout: document.getElementById("logoutBtn"),
      calculadora: document.getElementById("btnCalculadora"),
      themeToggle: document.getElementById("themeToggle"),
    },
    forms: {
      login: document.getElementById("loginForm"),
      registro: document.getElementById("registroForm"),
      cliente: document.getElementById("clienteForm"),
      pedido: document.getElementById("pedidoForm"),
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
      password: document.getElementById("password"),
    },
    links: {
      crearCuenta: document.getElementById("crearCuentaLink"),
      volverLogin: document.getElementById("volverLogin"),
    },
    modal: {
      overlay: document.getElementById("modalOverlay"),
      emailInput: document.getElementById("email"),
      form: document.getElementById("form"),
      submitBtn: document.getElementById("button"),
    }
  }

  // Verificar que los elementos del DOM existan
  console.log("Formulario de login:", DOM.forms.login);
  console.log("Botón de login:", DOM.forms.login ? DOM.forms.login.querySelector('button[type="submit"]') : null);

  function showSection(section) {
    if (section) section.classList.remove("hidden");
  }

  function hideSection(section) {
    if (section) section.classList.add("hidden");
  }

  function resetForms() {
    Object.values(DOM.forms).forEach((form) => {
      if (form) form.reset();
    });
  }

  const AppState = {
    currentUser: null,
  }

  // Modificar la función auth.onAuthStateChanged para mostrar la información del usuario
  auth.onAuthStateChanged((user) => {
    console.log("Estado de autenticación cambiado:", user ? "Usuario autenticado" : "No autenticado");
    AppState.currentUser = user;
    if (user) {
      showSection(DOM.sections.dashboard);
      hideSection(DOM.sections.login);
      hideSection(DOM.sections.registro);

      // Cargar y mostrar la información del usuario
      db.ref("users/" + user.uid)
        .once("value")
        .then((snapshot) => {
          const userData = snapshot.val();
          const userName = userData?.nombre || user.email;

          // Crear o actualizar el elemento de información del usuario
          let userInfo = document.getElementById("userInfo");
          if (!userInfo) {
            userInfo = document.createElement("div");
            userInfo.id = "userInfo";
            userInfo.className = "user-info";
            
            // Colocar el userInfo en el theme-toggle-container en lugar del dashboard
            const themeToggleContainer = document.querySelector('.theme-toggle-container');
            if (themeToggleContainer) {
              themeToggleContainer.insertBefore(userInfo, themeToggleContainer.firstChild);
            } else {
              console.error("No se encontró el contenedor del toggle de tema");
              DOM.sections.dashboard.insertBefore(userInfo, DOM.sections.dashboard.firstChild);
            }
          }

          userInfo.innerHTML = `
        <div class="user-logo">
          <span>${userName.charAt(0).toUpperCase()}</span>
        </div>
        <div class="user-name">${userName}</div>
      `;
        });

      cargarClientes();
    } else {
      showSection(DOM.sections.login);
      hideSection(DOM.sections.dashboard);
      hideSection(DOM.sections.registro);
      // Asegurarse de ocultar la calculadora al cerrar sesión
      hideSection(DOM.sections.calculadora);
      
      // Eliminar el userInfo si existe
      const userInfo = document.getElementById("userInfo");
      if (userInfo) {
        userInfo.remove();
      }
    }
  });

  // Verificar que el formulario de registro exista antes de agregar el event listener
  if (DOM.forms.registro) {
    DOM.forms.registro.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("Formulario de registro enviado");
      const { nombreCompleto, correo, nuevaPassword } = DOM.inputs;

      if (!correo || !nuevaPassword || !nombreCompleto) {
        console.error("Faltan campos en el formulario de registro");
        return;
      }

      auth
        .createUserWithEmailAndPassword(correo.value, nuevaPassword.value)
        .then((userCredential) => {
          return db.ref("users/" + userCredential.user.uid).set({
            nombre: nombreCompleto.value,
            email: correo.value,
          });
        })
        .then(() => {
          alert("Cuenta creada con éxito");
          resetForms();
        })
        .catch((error) => {
          console.error("Error al crear cuenta:", error);
          alert("Error al crear cuenta: " + error.message);
        });
    });
  } else {
    console.error("El formulario de registro no existe en el DOM");
  }

  // Verificar que el formulario de login exista antes de agregar el event listener
  if (DOM.forms.login) {
    DOM.forms.login.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("Formulario de login enviado");
      const { correoLogin, password } = DOM.inputs;

      if (!correoLogin || !password) {
        console.error("Faltan campos en el formulario de login");
        return;
      }

      console.log("Intentando iniciar sesión con:", correoLogin.value);
      
      auth
        .signInWithEmailAndPassword(correoLogin.value, password.value)
        .then(() => {
          console.log("Sesión iniciada con éxito");
          resetForms();
        })
        .catch((error) => {
          console.error("Error al iniciar sesión:", error);
          alert("Error al iniciar sesión: " + error.message);
        });
    });
  } else {
    console.error("El formulario de login no existe en el DOM");
  }

  // Verificar que los enlaces existan antes de agregar los event listeners
  if (DOM.links.crearCuenta) {
    DOM.links.crearCuenta.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Enlace 'Crear cuenta' clickeado");
      showSection(DOM.sections.registro);
      hideSection(DOM.sections.login);
    });
  } else {
    console.error("El enlace 'Crear cuenta' no existe en el DOM");
  }

  if (DOM.links.volverLogin) {
    DOM.links.volverLogin.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Enlace 'Volver al login' clickeado");
      showSection(DOM.sections.login);
      hideSection(DOM.sections.registro);
    });
  } else {
    console.error("El enlace 'Volver al login' no existe en el DOM");
  }

  if (DOM.buttons.logout) {
    DOM.buttons.logout.addEventListener("click", () => {
      console.log("Botón de logout clickeado");
      auth
        .signOut()
        .then(() => {
          console.log("Sesión cerrada con éxito");
          // Asegurarse de ocultar la calculadora al cerrar sesión
          hideSection(DOM.sections.calculadora);
        })
        .catch((error) => console.error("Error al cerrar sesión:", error));
    });
  } else {
    console.error("El botón de logout no existe en el DOM");
  }

  if (DOM.buttons.mostrarClientes) {
    DOM.buttons.mostrarClientes.addEventListener("click", () => {
      console.log("Botón 'Mostrar clientes' clickeado");
      showSection(DOM.sections.clientesLista);
      hideSection(DOM.sections.pedidosLista);
      hideSection(DOM.sections.registroContainer);
      hideSection(DOM.sections.calculadora);
      cargarClientes();
    });
  }

  if (DOM.buttons.mostrarPedidos) {
    DOM.buttons.mostrarPedidos.addEventListener("click", () => {
      console.log("Botón 'Mostrar pedidos' clickeado");
      showSection(DOM.sections.pedidosLista);
      hideSection(DOM.sections.clientesLista);
      hideSection(DOM.sections.registroContainer);
      hideSection(DOM.sections.calculadora);
      cargarPedidos();
    });
  }

  if (DOM.buttons.nuevoRegistro) {
    DOM.buttons.nuevoRegistro.addEventListener("click", () => {
      console.log("Botón 'Nuevo registro' clickeado");
      DOM.sections.registroContainer.classList.toggle("hidden");
      hideSection(DOM.sections.clientesLista);
      hideSection(DOM.sections.pedidosLista);
      hideSection(DOM.sections.calculadora);
    });
  }

  if (DOM.buttons.calculadora) {
    DOM.buttons.calculadora.addEventListener("click", () => {
      console.log("Botón 'Calculadora' clickeado");
      showSection(DOM.sections.calculadora);
      hideSection(DOM.sections.clientesLista);
      hideSection(DOM.sections.pedidosLista);
      hideSection(DOM.sections.registroContainer);
    });
  }

  if (DOM.forms.cliente) {
    DOM.forms.cliente.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Formulario de cliente enviado");
      const { nombre, email, direccion, telefono, dni } = DOM.inputs;
      const editId = DOM.forms.cliente.getAttribute("data-edit-id");

      if (!/^[0-9]{7,8}$/.test(dni.value)) return alert("DNI inválido");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return alert("Email inválido");

      const clienteData = {
        nombre: nombre.value,
        email: email.value,
        direccion: direccion.value,
        telefono: telefono.value,
        dni: dni.value,
      };

      if (editId) {
        await db.ref(`clientes/${editId}`).update(clienteData);
        alert("Cliente actualizado");
        DOM.forms.cliente.removeAttribute("data-edit-id");
        DOM.inputs.dni.disabled = false;
      } else {
        const snapshot = await db.ref("clientes").orderByChild("dni").equalTo(dni.value).once("value");
        if (snapshot.exists()) return alert("Ya existe un cliente con ese DNI");

        clienteData.fechaRegistro = new Date().toISOString();
        await db.ref("clientes").push(clienteData);
        alert("Cliente registrado exitosamente");
      }

      resetForms();
      cargarClientes();
    });
  }

  function cargarClientes() {
    if (!DOM.lists.clientes) {
      console.error("La lista de clientes no existe en el DOM");
      return;
    }
    
    db.ref("clientes")
      .once("value")
      .then((snapshot) => {
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

  window.editarCliente = (id) => {
    db.ref(`clientes/${id}`)
      .once("value")
      .then((snapshot) => {
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

  window.eliminarCliente = (id) => {
    if (confirm("¿Estás seguro de eliminar este cliente y sus pedidos?")) {
      db.ref(`clientes/${id}`)
        .remove()
        .then(() => db.ref(`pedidos/${id}`).remove())
        .then(() => {
          alert("Cliente y pedidos eliminados");
          cargarClientes();
        })
        .catch((err) => alert("Error: " + err.message));
    }
  };

  window.cargarPedidosCliente = (clienteId) => {
    db.ref(`clientes/${clienteId}`)
      .once("value")
      .then((clienteSnap) => {
        const cliente = clienteSnap.val();
        if (!cliente) return alert("Cliente no encontrado");

        db.ref(`pedidos/${clienteId}`)
          .once("value")
          .then((pedidosSnap) => {
            // Mostrar sólo la sección de pedidos
            showSection(DOM.sections.pedidosLista);
            hideSection(DOM.sections.clientesLista);
            hideSection(DOM.sections.registroContainer);
            hideSection(DOM.sections.calculadora);

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

            Object.values(pedidos).forEach((pedido) => {
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
  };

  if (DOM.forms.pedido) {
    DOM.forms.pedido.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Formulario de pedido enviado");
      const { clientePedido, producto, estado } = DOM.inputs;
      const editId = DOM.forms.pedido.getAttribute("data-edit-id");
      const clienteIdFromAttr = DOM.forms.pedido.getAttribute("data-cliente-id");

      if (!/^[0-9]{7,8}$/.test(clientePedido.value)) return alert("DNI inválido");

      const clientesSnap = await db.ref("clientes").orderByChild("dni").equalTo(clientePedido.value).once("value");
      if (!clientesSnap.exists()) return alert("Cliente no encontrado");

      const clienteId = Object.keys(clientesSnap.val())[0];
      const cliente = clientesSnap.val()[clienteId];

      const pedidoData = {
        producto: producto.value,
        estado: estado.value,
        fecha: new Date().toISOString(),
        clienteDNI: cliente.dni,
        clienteNombre: cliente.nombre,
        clienteEmail: cliente.email || "",
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
      window.cargarPedidosCliente(clienteId);
    });
  }

  function cargarPedidos() {
    if (!DOM.sections.pedidosContent) {
      console.error("La sección de pedidos no existe en el DOM");
      return;
    }
    
    db.ref("clientes")
      .once("value")
      .then((clientesSnap) => {
        const clientes = clientesSnap.val() || {};

        db.ref("pedidos")
          .once("value")
          .then((pedidosSnap) => {
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
              <td>${cliente.nombre || "Cliente desconocido"}</td>
              <td>${cliente.dni || ""}</td>
              <td>${pedido.producto}</td>
              <td>${pedido.estado}</td>
              <td>${new Date(pedido.fecha).toLocaleString()}</td>
              <td>
                <button onclick="editarPedido('${clienteId}', '${pedidoId}')">Editar</button>
                <button onclick="eliminarPedido('${clienteId}', '${pedidoId}')">Eliminar</button>
                <button onclick="mostrarFormularioEmail('${cliente.email}', '${pedido.producto}')">Confirmar Pedido</button>
              </td>
            `;
                tbody.appendChild(tr);
              });
            });
          });
      });
  }

  // Función para mostrar el modal con el email del cliente
  window.mostrarFormularioEmail = (email, producto) => {
    console.log("Mostrando formulario de email para:", email, producto);
    // Establecer el email en el campo
    document.getElementById("email").value = email;
    
    // Mostrar el modal
    document.getElementById("modalOverlay").classList.remove("hidden");
    
    // Prevenir el scroll del body mientras el modal está abierto
    document.body.style.overflow = 'hidden';
  };

  // Función para cerrar el modal
  window.cerrarModal = () => {
    console.log("Cerrando modal");
    document.getElementById("modalOverlay").classList.add("hidden");
    document.body.style.overflow = 'auto';
  };

  window.editarPedido = (clienteId, pedidoId) => {
    db.ref(`pedidos/${clienteId}/${pedidoId}`)
      .once("value")
      .then((snapshot) => {
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

  window.eliminarPedido = (clienteId, pedidoId) => {
    if (confirm("¿Eliminar este pedido?")) {
      db.ref(`pedidos/${clienteId}/${pedidoId}`)
        .remove()
        .then(() => {
          alert("Pedido eliminado");
          window.cargarPedidosCliente(clienteId);
        })
        .catch((err) => alert("Error: " + err.message));
    }
  };

  window.calcularPresupuesto = () => {
    const materiales = Number.parseFloat(document.getElementById("materiales").value) || 0;
    const transporte = Number.parseFloat(document.getElementById("transporte").value) || 0;
    const margen = Number.parseFloat(document.getElementById("margen").value) || 0;
    const iva = 0.21;

    const subtotal = materiales + transporte;
    const ganancia = subtotal * (margen / 100);
    const totalSinIVA = subtotal + ganancia;
    const totalConIVA = totalSinIVA * (1 + iva);

    // Actualizar los valores en la calculadora moderna
    document.getElementById("subtotal-value").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("ganancia-value").textContent = `$${ganancia.toFixed(2)} (${margen}%)`;
    document.getElementById("sin-iva-value").textContent = `$${totalSinIVA.toFixed(2)}`;
    document.getElementById("con-iva-value").textContent = `$${totalConIVA.toFixed(2)}`;

    // Mostrar el resultado
    document.getElementById("resultado-calculadora").classList.remove("hidden");

    // Animar el resultado
    const resultadoElement = document.getElementById("resultado-calculadora");
    resultadoElement.classList.add("animate__animated", "animate__fadeIn");

    // Remover la clase de animación después de que termine
    setTimeout(() => {
      resultadoElement.classList.remove("animate__animated", "animate__fadeIn");
    }, 1000);
  };

  // Configurar el formulario de email para cerrar el modal después de enviar
  const emailForm = document.getElementById('form');
  if (emailForm) {
    emailForm.addEventListener('submit', function(event) {
      event.preventDefault();
      console.log("Formulario de email enviado");
      
      const btn = document.getElementById('button');
      btn.value = 'Enviando...';
      
      const serviceID = 'default_service';
      const templateID = 'template_k55fuhb';
      
      if (typeof emailjs !== 'undefined') {
        emailjs.sendForm(serviceID, templateID, this)
          .then(() => {
            btn.value = 'Enviar Email';
            alert('¡Enviado!');
            // Cerrar el modal después de enviar
            window.cerrarModal();
          }, (err) => {
            btn.value = 'Enviar Email';
            alert(JSON.stringify(err));
          });
      } else {
        console.error("EmailJS no está definido. Verifica que los scripts se carguen correctamente.");
        btn.value = 'Enviar Email';
        alert('Error: EmailJS no está disponible');
      }
    });
  }
  
  // Cerrar el modal si se hace clic fuera del contenido
  document.addEventListener('click', function(event) {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalContainer = document.querySelector('.modal-container');
    
    if (modalOverlay && !modalOverlay.classList.contains('hidden') && 
        event.target === modalOverlay && modalContainer && !modalContainer.contains(event.target)) {
      window.cerrarModal();
    }
  });
  
  // Cerrar el modal con la tecla Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && 
        document.getElementById('modalOverlay') && 
        !document.getElementById('modalOverlay').classList.contains('hidden')) {
      window.cerrarModal();
    }
  });
}
