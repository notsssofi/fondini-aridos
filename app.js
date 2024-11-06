// Importa e inicializa Firebase
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, push, onValue } from "firebase/database";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBw2XLVQTZE5XJAusfiZ16HjoTJJkNZLvg",
    authDomain: "fondini-aridos.firebaseapp.com",
    databaseURL: "https://fondini-aridos-default-rtdb.firebaseio.com",
    projectId: "fondini-aridos",
    storageBucket: "fondini-aridos.firebaseapp.com",
    messagingSenderId: "60588617990",
    appId: "1:60588617990:web:bc0c7cbc8a98e524d3ae87",
    measurementId: "G-MBSSKYWQTM"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Función para iniciar sesión
function iniciarSesion() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            alert("Inicio de sesión exitoso");
            console.log("Usuario:", user);
        })
        .catch((error) => {
            console.error("Error al iniciar sesión:", error);
            alert("Error al iniciar sesión: " + error.message);
        });
}

// Función para agregar datos a la base de datos
function agregarDatos() {
    const nombre = document.getElementById("nombre").value;
    const pedido = document.getElementById("pedido").value;

    if (nombre && pedido) {
        const referencia = ref(database, 'clientes/');
        push(referencia, {
            nombre: nombre,
            pedido: pedido
        })
        .then(() => {
            alert("Datos agregados correctamente");
            obtenerDatos(); // Actualizar la lista de pedidos
        })
        .catch((error) => {
            console.error("Error al agregar datos:", error);
            alert("Error al agregar datos: " + error.message);
        });
    } else {
        alert("Por favor, llena todos los campos");
    }
}

// Función para obtener y mostrar los datos de la base de datos
function obtenerDatos() {
    const listaPedidos = document.getElementById("listaPedidos");
    listaPedidos.innerHTML = ""; // Limpiar la lista

    const referencia = ref(database, 'clientes/');
    onValue(referencia, (snapshot) => {
        const data = snapshot.val();
        listaPedidos.innerHTML = ""; // Limpiar la lista antes de mostrar
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const li = document.createElement("li");
                li.textContent = `${data[key].nombre}: ${data[key].pedido}`;
                listaPedidos.appendChild(li);
            }
        }
    });
}

// Llamar a obtenerDatos para mostrar la lista inicial
obtenerDatos();
