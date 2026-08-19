const contenedorUsuarios = document.getElementById("contenedor-usuarios");
const contenedorFavoritos = document.getElementById("contenedor-favoritos");

cargarUsuarios();

function cargarUsuarios() {
    const usuariosGuardados = localStorage.getItem("usuarios");

    if (usuariosGuardados) {
        const usuarios = JSON.parse(usuariosGuardados);
        migrarFavoritosAntiguos(usuarios);
        mostrarUsuarios(usuarios);
        mostrarFavoritos(usuarios);
        return;
    }

    fetch("https://randomuser.me/api/?results=100")
        .then(response => response.json())
        .then(data => {
            const usuarios = data.results;

            localStorage.setItem("usuarios", JSON.stringify(usuarios));
            localStorage.setItem("favoritos", JSON.stringify([]));

            mostrarUsuarios(usuarios);
            mostrarFavoritos(usuarios);
        })
        .catch(error => {
            console.error("Error al obtener los usuarios:", error);
        });
}

function mostrarUsuarios(usuarios) {
    contenedorUsuarios.innerHTML = "";
    const favoritos = obtenerFavoritos();

    usuarios.forEach(usuario => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("tarjeta");

        const uuid = usuario.login.uuid;
        const esFavorito = favoritos.includes(uuid);

        tarjeta.innerHTML = `
            <button
                class="boton-favorito ${esFavorito ? "favorito" : ""}"
                onclick="cambiarFavorito('${uuid}')"
                title="${esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}"
            >
                ${esFavorito ? "★" : "☆"}
            </button>

            <img
                src="${usuario.picture.large}"
                alt="Foto de ${usuario.name.first}"
            >

            <h2>
                ${usuario.name.first} ${usuario.name.last}
            </h2>

            <a
                class="boton"
                href="perfil.html?usuario=${encodeURIComponent(uuid)}"
            >
                Ver usuario
            </a>
        `;

        contenedorUsuarios.appendChild(tarjeta);
    });
}

function cambiarFavorito(uuid) {
    let favoritos = obtenerFavoritos();

    if (favoritos.includes(uuid)) {
        favoritos = favoritos.filter(favorito => favorito !== uuid);
    } else {
        favoritos.push(uuid);
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));

    // IMPORTANTE: nunca volvemos a consultar la API al cambiar favoritos.
    const usuarios = JSON.parse(localStorage.getItem("usuarios"));

    mostrarUsuarios(usuarios);
    mostrarFavoritos(usuarios);
}

function obtenerFavoritos() {
    const favoritos = localStorage.getItem("favoritos");
    return favoritos ? JSON.parse(favoritos) : [];
}

function mostrarFavoritos(usuarios) {
    contenedorFavoritos.innerHTML = "";

    const favoritos = obtenerFavoritos();

    if (favoritos.length === 0) {
        contenedorFavoritos.innerHTML = `
            <p class="mensaje-sin-favoritos">
                Todavía no tienes usuarios favoritos.
            </p>
        `;
        return;
    }

    favoritos.forEach(uuid => {
        const usuario = usuarios.find(u => u.login.uuid === uuid);

        if (!usuario) return;

        const miniTarjeta = document.createElement("div");
        miniTarjeta.classList.add("mini-favorito");

        miniTarjeta.innerHTML = `
            <img
                src="${usuario.picture.thumbnail}"
                alt="Foto de ${usuario.name.first}"
            >
            <h3>${usuario.name.first} ${usuario.name.last}</h3>
        `;

        contenedorFavoritos.appendChild(miniTarjeta);
    });
}

/*
 * Convierte una versión antigua de favoritos guardados por índice
 * a UUID. Solo se ejecuta si los favoritos antiguos todavía existen.
 */
function migrarFavoritosAntiguos(usuarios) {
    const guardados = localStorage.getItem("favoritos");

    if (!guardados) return;

    try {
        const favoritos = JSON.parse(guardados);

        if (!Array.isArray(favoritos)) return;

        const sonUUID = favoritos.every(
            favorito => typeof favorito === "string"
        );

        if (sonUUID) return;

        const convertidos = favoritos
            .filter(indice => Number.isInteger(indice) && usuarios[indice])
            .map(indice => usuarios[indice].login.uuid);

        localStorage.setItem("favoritos", JSON.stringify(convertidos));
    } catch (error) {
        localStorage.setItem("favoritos", JSON.stringify([]));
    }
}
