const contenedorUsuarios = document.getElementById("contenedor-usuarios");
const contenedorFavoritos = document.getElementById("contenedor-favoritos");


// ========================================
// CARGAR LOS USUARIOS
// ========================================

cargarUsuarios();


function cargarUsuarios() {

    // Primero comprobamos si ya tenemos
    // los 100 usuarios guardados
    const usuariosGuardados = localStorage.getItem("usuarios");


    if (usuariosGuardados) {

        // Utilizamos los mismos usuarios
        const usuarios = JSON.parse(usuariosGuardados);

        mostrarUsuarios(usuarios);
        mostrarFavoritos(usuarios);

        return;
    }


    // Si no hay usuarios guardados,
    // consultamos la API UNA SOLA VEZ

    fetch("https://randomuser.me/api/?results=100")
        .then(response => response.json())
        .then(data => {

            const usuarios = data.results;


            // Guardamos estos mismos 100 usuarios
            localStorage.setItem(
                "usuarios",
                JSON.stringify(usuarios)
            );


            // Los mostramos
            mostrarUsuarios(usuarios);

            mostrarFavoritos(usuarios);

        })
        .catch(error => {

            console.error(
                "Error al obtener los usuarios:",
                error
            );

        });

}


// ========================================
// MOSTRAR LAS 100 TARJETAS
// ========================================

function mostrarUsuarios(usuarios) {

    contenedorUsuarios.innerHTML = "";


    const favoritos = obtenerFavoritos();


    usuarios.forEach((usuario, index) => {

        const tarjeta = document.createElement("div");

        tarjeta.classList.add("tarjeta");


        // Comprobamos si ya es favorito
        const esFavorito = favoritos.includes(index);


        tarjeta.innerHTML = `

            <button
                class="boton-favorito ${esFavorito ? "favorito" : ""}"
                onclick="cambiarFavorito(${index})"
                title="Agregar a favoritos"
            >
                ${esFavorito ? "★" : "☆"}
            </button>


            <img
                src="${usuario.picture.large}"
                alt="Foto de ${usuario.name.first}"
            >


            <h2>
                ${usuario.name.first}
                ${usuario.name.last}
            </h2>


            <a
                class="boton"
                href="perfil.html?usuario=${index}"
                target="_blank"
            >
                Ver usuario
            </a>

        `;


        contenedorUsuarios.appendChild(tarjeta);

    });

}


// ========================================
// AGREGAR / QUITAR FAVORITO
// ========================================

function cambiarFavorito(index) {

    let favoritos = obtenerFavoritos();


    // Si ya es favorito
    if (favoritos.includes(index)) {

        // Lo quitamos
        favoritos = favoritos.filter(
            favorito => favorito !== index
        );

    }

    else {

        // Lo agregamos
        favoritos.push(index);

    }


    // Guardamos la nueva lista
    localStorage.setItem(
        "favoritos",
        JSON.stringify(favoritos)
    );


    // IMPORTANTE:
    // Recuperamos LOS MISMOS 100 usuarios
    // que ya estaban guardados

    const usuarios = JSON.parse(
        localStorage.getItem("usuarios")
    );


    // Actualizamos las tarjetas
    mostrarUsuarios(usuarios);


    // Actualizamos favoritos
    mostrarFavoritos(usuarios);

}


// ========================================
// OBTENER FAVORITOS
// ========================================

function obtenerFavoritos() {

    const favoritos = localStorage.getItem("favoritos");


    if (favoritos) {

        return JSON.parse(favoritos);

    }


    return [];

}


// ========================================
// MOSTRAR FAVORITOS
// ========================================

function mostrarFavoritos(usuarios) {

    contenedorFavoritos.innerHTML = "";


    const favoritos = obtenerFavoritos();


    // Si todavía no hay favoritos
    if (favoritos.length === 0) {

        contenedorFavoritos.innerHTML = `
            <p class="mensaje-sin-favoritos">
                Todavía no tienes usuarios favoritos.
            </p>
        `;

        return;

    }


    // Recorremos los favoritos
    favoritos.forEach(index => {

        const usuario = usuarios[index];


        // Por seguridad
        if (!usuario) {
            return;
        }


        const miniTarjeta = document.createElement("div");

        miniTarjeta.classList.add("mini-favorito");


        miniTarjeta.innerHTML = `

            <img
                src="${usuario.picture.thumbnail}"
                alt="Foto de ${usuario.name.first}"
            >


            <h3>
                ${usuario.name.first}
                ${usuario.name.last}
            </h3>

        `;


        contenedorFavoritos.appendChild(miniTarjeta);

    });

}