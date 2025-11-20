import { initHeader } from "../../../components/header/index.js";
class Changepass extends HTMLElement {
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
          },
        }
      );
      if (!response.ok) {
        throw new Error("Error al obtener los datos del usuario");
      }
      const userData = await response.json();
      console.log("Datos del usuario:", userData);
      return userData;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }
  async render() {
    console.log("Renderizando el componente Changepass");
    const userId = localStorage.getItem("userId");
    if (!userId) {
      this.innerHTML = "<p>Error: No se encontró el ID de usuario</p>";
      return;
    }
    const userData = await this.fetchUserData(userId);
    if (!userData) {
      this.innerHTML = "<p>Error al cargar los datos del usuario</p>";
      return;
    }
    initHeader();
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    this.innerHTML = `
    <custom-header></custom-header>

    <form class="editProfileForm" style="width: 90%; max-width: 600px; display: flex; flex-direction: column; gap: 20px; align-items: center; margin: 80px auto 40px; padding: 30px; border: 1px solid #ccc; border-radius: 8px; background-color: #f9f9f9;">
      <h1 style="color: #5982FF;">Cambiar Contraseña</h1>
      
      <div style="width: 100%;">
        <label for="contraseñaActual" style="font-weight: bold; display: block; margin-bottom: 5px;">Contraseña Actual</label>
        <input type="password" class="contraseñaActual" id="contraseñaActual" placeholder="Tu contraseña actual" required minlength="8" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
      </div>

      <div style="width: 100%;">
        <label for="contraseñaNueva" style="font-weight: bold; display: block; margin-bottom: 5px;">Nueva Contraseña</label>
        <input type="password" class="contraseñaNueva" id="contraseñaNueva" placeholder="Mínimo 8 caracteres" required minlength="8" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
      </div>

      <div style="width: 100%;">
        <label for="confirmContraseña" style="font-weight: bold; display: block; margin-bottom: 5px;">Confirmar Nueva Contraseña</label>
        <input type="password" class="confirmContraseña" id="confirmContraseña" placeholder="Repite la nueva contraseña" required minlength="8" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
      </div>

      <button class="menu1Button" type="submit" style="width: 100%; padding: 12px; background-color: #5982FF; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px; margin-top: 20px;">
        💾 Guardar Cambios
      </button>
      
      <button type="button" class="backButton" style="width: 100%; padding: 12px; background-color: #ff5959ff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px;"> 
        ← Volver al inicio
      </button>
    </form>
    `;
    const form = this.querySelector(".editProfileForm");
    const backButton = this.querySelector(".backButton");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Submit del form disparado");
        const contraseñaActual = this.querySelector(".contraseñaActual");
        const contraseñaNueva = this.querySelector(".contraseñaNueva");
        const confirmarContraseña = this.querySelector(".confirmContraseña");
        if (!contraseñaActual || !contraseñaNueva || !confirmarContraseña) {
          console.error("No se encontraron los inputs");
          return;
        }
        console.log("User ID:", userId);
        // Validación: Las nuevas contraseñas deben coincidir
        if (contraseñaNueva.value !== confirmarContraseña.value) {
          alert("Las contraseñas nuevas no coinciden");
          return;
        }
        // Validación: Longitud mínima
        if (contraseñaNueva.value.length < 8) {
          alert("La contraseña debe tener al menos 8 caracteres");
          return;
        }
        // Validación: La nueva contraseña no puede ser igual a la actual
        if (contraseñaActual.value === contraseñaNueva.value) {
          alert("La nueva contraseña debe ser diferente a la actual");
          return;
        }
        try {
          const requestBody = {
            currentPassword: contraseñaActual.value,
            newPassword: contraseñaNueva.value,
          };
          const response = await fetch(
            `https://pet-finder-1.onrender.com/api/users/${userId}/password`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(requestBody),
            }
          );
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || "Error al cambiar la contraseña");
          }
          console.log(result.message);
          // Mostrar mensaje de éxito
          form.innerHTML = "";
          const successMsg = document.createElement("h2");
          successMsg.textContent = "Contraseña cambiada con éxito 🎉";
          successMsg.style.color = "#4caf50";
          successMsg.style.textAlign = "center";
          const newBackButton = document.createElement("button");
          newBackButton.textContent = "← Volver al inicio";
          newBackButton.className = "backButton";
          newBackButton.style.cssText =
            "width: 100%; padding: 12px; background-color: #5982FF; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px; margin-top: 20px;";
          newBackButton.addEventListener("click", () => {
            window.history.pushState({}, "", "/menu");
            window.dispatchEvent(new PopStateEvent("popstate"));
          });
          form.appendChild(successMsg);
          form.appendChild(newBackButton);
        } catch (error) {
          console.error("Error:", error);
          // Mostrar error al usuario
          const errorMsg = document.createElement("p");
          errorMsg.textContent = `❌ ${error.message}`;
          errorMsg.style.cssText =
            "color: #FF4C4C; background-color: #ffe6e6; padding: 10px; border-radius: 4px; text-align: center; font-weight: bold;";
          // Remover errores previos
          const prevError = form.querySelector(".error-display");
          if (prevError) prevError.remove();
          errorMsg.className = "error-display";
          form.insertBefore(errorMsg, form.firstChild);
          // Remover mensaje de error después de 5 segundos
          setTimeout(() => errorMsg.remove(), 5000);
        }
      });
      // Botón de volver original
      if (backButton) {
        backButton.addEventListener("click", () => {
          window.history.pushState({}, "", "/menu");
          window.dispatchEvent(new PopStateEvent("popstate"));
        });
      }
    }
  }
}
customElements.define("changepass-component", Changepass);
