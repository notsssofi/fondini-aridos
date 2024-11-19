let clientes = [];
let pedidos = [];

document.getElementById("clienteForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const direccion = document.getElementById("direccion").value;
    const telefono = document.getElementById("telefono").value;
    const dni = document.getElementById("dni").value;

    const cliente = { id: Date.now(), nombre, direccion, telefono, dni };
    clientes.push(cliente);
    mostrarClientes();
    this.reset();
});

document.getElementById("pedidoForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const clientePedido = document.getElementById("clientePedido").value;
    const producto = document.getElementById("producto").value;
    const estado = document.getElementById("estado").value;

    const pedido = { id: Date.now(), clientePedido, producto, estado };
    pedidos.push(pedido);
    mostrarPedidos();
    this.reset();
});

function mostrarClientes() {
    const listaClientes = document.getElementById("listaClientes");
    listaClientes.innerHTML = "";
    clientes.forEach(cliente => {
        const li = document.createElement("li");
        li.innerHTML = `${cliente.nombre} - ${cliente.direccion} - ${cliente.telefono} - ${cliente.dni}
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
                        <button class="delete" onclick="eliminarPedido(${pedido.id})">Eliminar</button>`;
        listaPedidos.appendChild(li);
    });
}

function eliminarCliente(id) {
    clientes = clientes.filter(cliente => cliente.id !== id);
    mostrarClientes();
}

function eliminarPedido(id) {
    pedidos = pedidos.filter(pedido => pedido.id !== id);
    mostrarPedidos();
}
