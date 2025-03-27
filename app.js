// Asegurar que el script se ejecuta después de que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM cargado");

    // Inicializar Firebase
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

    // 🔹 Seleccionar elementos asegurando que existen
    const dashboardSection = document.getElementById("dashboard");
    const listaClientes = document.getElementById("listaClientes");
    const listaPedidos = document.getElementById("listaPedidos");
    const registroContainer = document.getElementById("registroContainer");
    const clienteForm = document.getElementById("clienteForm");
    const pedidoForm = document.getElementById("pedidoForm");

    const btnMostrarClientes = document.getElementById("mostrarClientes");
    const btnMostrarPedidos = document.getElementById("mostrarPedidos");
    const btnNuevoRegistro = document.getElementById("nuevoRegistroBtn");
    const btnLogout = document.getElementById("logoutBtn");

    // 🔹 Verificar si los botones existen antes de asignar eventos
    if (btnMostrarClientes) {
        btnMostrarClientes.addEventListener("click", () => {
            console.log("Botón 'Mostrar Clientes' presionado");
            cargarClientes();
        });
    }

    if (btnMostrarPedidos) {
        btnMostrarPedidos.addEventListener("click", () => {
            console.log("Botón 'Mostrar Pedidos' presionado");
            cargarPedidos();
        });
    }

    if (btnNuevoRegistro) {
        btnNuevoRegistro.addEventListener("click", () => {
            registroContainer.classList.toggle("hidden");
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            auth.signOut().then(() => {
                console.log("Sesión cerrada");
            });
        });
    }

    // 🔹 Función para cargar clientes desde Firebase
    function cargarClientes() {
        listaClientes.innerHTML = "";
        db.ref("clientes").once("value", (snapshot) => {
            const data = snapshot.val();
            if (data) {
                Object.values(data).forEach((cliente) => {
                    const row = `<tr>
                        <td>${cliente.nombre}</td>
                        <td>${cliente.direccion}</td>
                        <td>${cliente.telefono}</td>
                        <td>${cliente.dni}</td>
                    </tr>`;
                    listaClientes.innerHTML += row;
                });
            } else {
                listaClientes.innerHTML = "<tr><td colspan='4'>No hay clientes registrados</td></tr>";
            }
        });
    }

    // 🔹 Función para cargar pedidos desde Firebase
    function cargarPedidos() {
        listaPedidos.innerHTML = "";
        db.ref("pedidos").once("value", (snapshot) => {
            const data = snapshot.val();
            if (data) {
                Object.values(data).forEach((pedido) => {
                    const row = `<tr>
                        <td>${pedido.cliente}</td>
                        <td>${pedido.producto}</td>
                        <td>${pedido.estado}</td>
                    </tr>`;
                    listaPedidos.innerHTML += row;
                });
            } else {
                listaPedidos.innerHTML = "<tr><td colspan='3'>No hay pedidos registrados</td></tr>";
            }
        });
    }

    // 🔹 Registrar cliente
    if (clienteForm) {
        clienteForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const nombre = document.getElementById("nombre").value;
            const direccion = document.getElementById("direccion").value;
            const telefono = document.getElementById("telefono").value;
            const dni = document.getElementById("dni").value;

            db.ref("clientes").push({ nombre, direccion, telefono, dni })
                .then(() => {
                    alert("Cliente agregado");
                    clienteForm.reset();
                    cargarClientes();
                })
                .catch((error) => alert("Error: " + error.message));
        });
    }

    // 🔹 Registrar pedido
    if (pedidoForm) {
        pedidoForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const clientePedido = document.getElementById("clientePedido").value;
            const producto = document.getElementById("producto").value;
            const estado = document.getElementById("estado").value;

            db.ref("pedidos").push({ cliente: clientePedido, producto, estado })
                .then(() => {
                    alert("Pedido agregado");
                    pedidoForm.reset();
                    cargarPedidos();
                })
                .catch((error) => alert("Error: " + error.message));
        });
    }
});
