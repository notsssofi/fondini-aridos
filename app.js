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
    password: document.getElementById("password")
  },
  links: {
    crearCuenta: document.getElementById("crearCuentaLink"),
    volverLogin: document.getElementById("volverLogin")
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
      showSection(DOM.sections.menu);
    })
    .catch(error => {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión: " + error.message);
    });
});

DOM.links.crearCuenta.addEventListener("click", (e) => {
  e.preventDefault();
  showSection(DOM.sections.registro);
});

DOM.links.volverLogin.addEventListener("click", (e) => {
  e.preventDefault();
  showSection(DOM.sections.login);
});

DOM.buttons.logout.addEventListener("click", () => {
  auth.signOut()
    .then(() => {
      console.log("Sesión cerrada");
      showSection(DOM.sections.login);
    })
    .catch(error => console.error("Error al cerrar sesión:", error));
});

// Menú principal
const menuButtons = document.querySelectorAll(".menu-card");
menuButtons.forEach(button => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    switch (action) {
      case "crear-cliente":
        showSection(DOM.sections.registroContainer);
        break;
      case "crear-pedido":
        showSection(DOM.sections.registroContainer);
        break;
      case "ver-clientes":
        showSection(DOM.sections.clientesLista);
        break;
      case "ver-pedidos":
        showSection(DOM.sections.pedidosLista);
        break;
      case "calculadora":
      case "configuracion":
        alert("Esta sección aún no está disponible.");
        break;
    }
  });
});
