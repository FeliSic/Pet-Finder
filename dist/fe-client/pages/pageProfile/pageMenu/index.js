import { initHeader } from "../../../components/header/index.js";
class Menu extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  async fetchUserData(userId) {
    try {
      const response = await fetch(
        `https://pet-finder-1.onrender.com/users/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Si necesitas un token de autenticación, lo agregas aquí
            // 'Authorization': `Bearer ${token}`
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error al obtener los datos del usuario");
      }
      if (!userId) {
        console.error("No hay userId disponible");
        return null;
      }
      const userData = await response.json();
      console.log("Datos del usuario:", userData);
      return userData;
    } catch (error) {
      console.error("Error:", error);
    }
  }
  async render() {
    // Inicializar el header
    initHeader();
    // Quitar margin y padding del body
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    // Obtener el ID del usuario desde localStorage o donde lo guardes
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("No hay userId disponible");
      return; // Salir si no hay ID
    }
    // Llamar a la función para obtener los datos del usuario
    const userData = await this.fetchUserData(userId);
    console.log("Datos del usuario:", userData);
    this.innerHTML = `
      <div class="container" style="width: 400px; height: 550px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; margin: 0 auto;">
        <h1>Mis datos</h1>
        <div>
          <button class="menu1Button" type="submit" style="width: 100%; padding: 15px; margin-bottom: 20px; background-color: #5982FF; border: 5px solid #1B399E; border-radius: 5px; color: #eee">Modificar datos personales</button>
          <button class="menu2Button" type="submit" style="width: 100%; padding: 15px; background-color: #5982FF; border: 5px solid #1B399E; border-radius: 5px; color: #eee">Modificar contraseña</button>
        </div>
        <div style="text-align: center">
          <p>Email: ${userData.email}</p>
          <a href="#" class="logout">CERRAR SESIÓN</a>
        </div>
      </div>
    `;
    // Después creás y agregás el header
    const header = document.createElement("custom-header");
    this.prepend(header); // Lo ponés arriba del form
    // Agregar eventos a los botones
    this.addEventListeners();
  }
  addEventListeners() {
    const menu1Button = this.querySelector(".menu1Button");
    menu1Button.addEventListener("click", (e) => {
      e.preventDefault();
      window.history.pushState({}, "", "/personal-dates"); // Cambiar la URL
      window.dispatchEvent(new PopStateEvent("popstate")); // Disparar el evento
    });
    const menu2Button = this.querySelector(".menu2Button");
    menu2Button.addEventListener("click", (e) => {
      e.preventDefault();
      window.history.pushState({}, "", "/changepass-dates"); // Cambiar la URL
      window.dispatchEvent(new PopStateEvent("popstate")); // Disparar el evento
    });
    // Agregar el evento para el enlace de cierre de sesión
    const logoutLink = this.querySelector(".logout");
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault(); // Evitar el comportamiento por defecto
      // Aquí podrías agregar la lógica para cerrar sesión
      console.log("Cerrando sesión...");
      window.history.pushState({}, "", "/Log-in"); // Cambiar la URL
      window.dispatchEvent(new PopStateEvent("popstate")); // Disparar el evento
    });
  }
}
customElements.define("menu-component", Menu);
