// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBw2XLVQTZE5XJAusfiZ16HjoTJJkNZLvg",
  authDomain: "fondini-aridos.firebaseapp.com",
  databaseURL: "https://fondini-aridos-default-rtdb.firebaseio.com",
  projectId: "fondini-aridos",
  storageBucket: "fondini-aridos.firebasestorage.app",
  messagingSenderId: "60588617990",
  appId: "1:60588617990:web:bc0c7cbc8a98e524d3ae87",
  measurementId: "G-MBSSKYWQTM"
};

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database(app);

let editandoCliente = null;
let editandoPedido = null;

// Formulario de clientes
document.getElementById("clienteForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const direccion = document.getElementById("direccion").value;
    const telefono = document.getElementById("telefono").value;
    const dni = document.getElementById("dni").value;

    if (editandoCliente) {
        // Editar cliente existente en Firebase
        const clienteRef = db.ref('clientes/' + editandoCliente.id);
        clienteRef.update({
            nombre: nombre,
            direccion: direccion,
            telefono: telefono,
            dni: dni
        });
        editandoCliente = null;
    } else {
        // Crear nuevo cliente en Firebase
        const cliente = { nombre, direccion, telefono, dni };
        const clientesRef = db.ref('clientes');
        const newClientRef = clientesRef.push();
        newClientRef.set(cliente);
    }
    mostrarClientes();
    this.reset();
});

// Formulario de pedidos
document.getElementById("pedidoForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const clientePedido = document.getElementById("clientePedido").value;
    const producto = document.getElementById("producto").value;
    const estado = document.getElementById("estado").value;

    if (editandoPedido) {
        // Editar pedido existente en Firebase
        const pedidoRef = db.ref('pedidos/' + editandoPedido.id);
        pedidoRef.update({
            clientePedido: clientePedido,
            producto: producto,
            estado: estado
        });
        editandoPedido = null;
    } else {
        // Crear nuevo pedido en Firebase
        const pedido = { clientePedido, producto, estado };
        const pedidosRef = db.ref('pedidos');
        const newOrderRef = pedidosRef.push();
        newOrderRef.set(pedido);
    }
    mostrarPedidos();
    this.reset();
});

// Mostrar clientes desde Firebase
function mostrarClientes() {
    const listaClientes = document.getElementById("listaClientes");
    listaClientes.innerHTML = "";
    const clientesRef = db.ref('clientes');
    clientesRef.once('value', (snapshot) => {
        const clientes = snapshot.val();
        for (const id in clientes) {
            const cliente = clientes[id];
            const li = document.createElement("li");
            li.innerHTML = `${cliente.nombre} - ${cliente.direccion} - ${cliente.telefono} - ${cliente.dni}
                            <button class="edit" onclick="editarCliente('${id}')">Editar</button>
                            <button class="delete" onclick="eliminarCliente('${id}')">Eliminar</button>`;
            listaClientes.appendChild(li);
        }
    });
}

// Mostrar pedidos desde Firebase
function mostrarPedidos() {
    const listaPedidos = document.getElementById("listaPedidos");
    listaPedidos.innerHTML = "";
    const pedidosRef = db.ref('pedidos');
    pedidosRef.once('value', (snapshot) => {
        const pedidos = snapshot.val();
        for (const id in pedidos) {
            const pedido = pedidos[id];
            const li = document.createElement("li");
            li.innerHTML = `${pedido.clientePedido} - ${pedido.producto} - ${pedido.estado}
                            <button class="edit" onclick="editarPedido('${id}')">Editar</button>
                            <button class="delete" onclick="eliminarPedido('${id}')">Eliminar</button>`;
            listaPedidos.appendChild(li);
        }
    });
}

// Editar cliente desde Firebase
function editarCliente(id) {
    const clienteRef = db.ref('clientes/' + id);
    clienteRef.once('value', (snapshot) => {
        const cliente = snapshot.val();
        if (cliente) {
            document.getElementById("nombre").value = cliente.nombre;
            document.getElementById("direccion").value = cliente.direccion;
            document.getElementById("telefono").value = cliente.telefono;
            document.getElementById("dni").value = cliente.dni;
            editandoCliente = { id, ...cliente };
        }
    });
}

// Editar pedido desde Firebase
function editarPedido(id) {
    const pedidoRef = db.ref('pedidos/' + id);
    pedidoRef.once('value', (snapshot) => {
        const pedido = snapshot.val();
        if (pedido) {
            document.getElementById("clientePedido").value = pedido.clientePedido;
            document.getElementById("producto").value = pedido.producto;
            document.getElementById("estado").value = pedido.estado;
            editandoPedido = { id, ...pedido };
        }
    });
}

// Eliminar cliente desde Firebase
function eliminarCliente(id) {
    const clienteRef = db.ref('clientes/' + id);
    clienteRef.remove();
    mostrarClientes();
}

// Eliminar pedido desde Firebase
function eliminarPedido(id) {
    const pedidoRef = db.ref('pedidos/' + id);
    pedidoRef.remove();
    mostrarPedidos();
}

// Cargar clientes y pedidos al cargar la página
window.onload = function() {
    mostrarClientes();
    mostrarPedidos();
};
