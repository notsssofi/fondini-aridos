let clientes = [];
let pedidos = [];
let editandoCliente = null;
let editandoPedido = null;

document.getElementById("clienteForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const direccion = document.getElementById("direccion").value;
    const telefono = document.getElementById("telefono").value;
    const dni = document.getElementById("dni").value;

    if (editandoCliente) {
        // Editar cliente existente
        editandoCliente.nombre = nombre;
        editandoCliente.direccion = direccion;
        editandoCliente.telefono = telefono;
        editandoCliente.dni = dni;
        editandoCliente = null;
    } else {
        // Crear cliente nuevo
        const cliente = { id: Date.now(), nombre, direccion, telefono, dni };
        clientes.push(cliente);
    }
    mostrarClientes();
    this.reset();
});

document.getElementById("pedidoForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const clientePedido = document.getElementById("clientePedido").value;
    const producto = document.getElementById("producto").value;
    const estado = document.getElementById("estado").value;

    if (editandoPedido) {
        // Editar pedido existente
        editandoPedido.clientePedido = clientePedido;
        editandoPedido.producto = producto;
        editandoPedido.estado = estado;
        editandoPedido = null;
    } else {
        // Crear pedido nuevo
        const pedido = { id: Date.now(), clientePedido, producto, estado };
        pedidos.push(pedido);
    }
    mostrarPedidos();
    this.reset();
});

function mostrarClientes() {
    const listaClientes = document.getElementById("listaClientes");
    listaClientes.innerHTML = "";
    clientes.forEach(cliente => {
        const li = document.createElement("li");
        li.innerHTML = `${cliente.nombre} - ${cliente.direccion} - ${cliente.telefono} - ${cliente.dni}
                        <button class="edit" onclick="editarCliente(${cliente.id})">Editar</button>
                        <button class="delete" onclick="eliminarCliente(${cliente.id})">Eliminar</button>`;
        listaClientes.appendChild(li);
    });
}

function mostrarPedidos() {
    const listaPedidos = document.getElementById("listaPedidos");
    listaPedidos.innerHTML = "";
    pedidos.forEach(pedido => {
        const li = document.createElement("li");
        li.innerHTML = `${pedido.clientePedido} - ${pedido.producto} - ${pedido.estado}
                        <button class="edit" onclick="editarPedido(${pedido.id})">Editar</button>
                        <button class="delete" onclick="eliminarPedido(${pedido.id})">Eliminar</button>`;
        listaPedidos.appendChild(li);
    });
}

function editarCliente(id) {
    const cliente = clientes.find(cliente => cliente.id === id);
    if (cliente) {
        document.getElementById("nombre").value = cliente.nombre;
        document.getElementById("direccion").value = cliente.direccion;
        document.getElementById("telefono").value = cliente.telefono;
        document.getElementById("dni").value = cliente.dni;
        editandoCliente = cliente;
    }
}

function editarPedido(id) {
    const pedido = pedidos.find(pedido => pedido.id === id);
    if (pedido) {
        document.getElementById("clientePedido").value = pedido.clientePedido;
        document.getElementById("producto").value = pedido.producto;
        document.getElementById("estado").value = pedido.estado;
        editandoPedido = pedido;
    }
}

function eliminarCliente(id) {
    clientes = clientes.filter(cliente => cliente.id !== id);
    mostrarClientes();
}

function eliminarPedido(id) {
    pedidos = pedidos.filter(pedido => pedido.id !== id);
    mostrarPedidos();
}
