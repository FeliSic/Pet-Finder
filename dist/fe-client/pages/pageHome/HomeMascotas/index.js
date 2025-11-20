import { initHeader } from "../../../components/header/index.js";
class NearbyComponent extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  async fetchNearbyPets() {
    const lat = parseFloat(localStorage.getItem("userLat") || "0");
    const lng = parseFloat(localStorage.getItem("userLng") || "0");
    if (!lat || !lng) {
      throw new Error("No hay ubicación guardada");
    }
    try {
      const res = await fetch("https://pet-finder-1.onrender.com/nearby-pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, radius: 5 }), // 5km de radio
      });
      if (!res.ok) throw new Error("Error al obtener mascotas cercanas");
      return await res.json();
    } catch (e) {
      console.error(e);
      return { pets: [], userLocation: { lat, lng }, radius: 5 };
    }
  }
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  addReportListeners() {
    this.querySelectorAll(".report-button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const petId = e.target.dataset.petId;
        const petName = e.target.dataset.petName;
        if (petId) {
          this.showReportForm(petId, petName || "esta mascota");
        } else {
          console.error("No se encontró el ID de la mascota");
        }
      });
    });
  }
  showReportForm(petId, petName) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <style>
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 10px;
          max-width: 500px;
          width: 90%;
          position: relative;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        .close-button {
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 28px;
          font-weight: bold;
          color: #999;
          cursor: pointer;
          border: none;
          background: none;
        }
        .close-button:hover {
          color: #333;
        }
        .modal-content h2 {
          margin-top: 0;
          color: #5982FF;
        }
        .modal-content input, .modal-content textarea {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 14px;
        }
        .modal-content textarea {
          min-height: 80px;
          resize: vertical;
        }
        .modal-content button[type="submit"] {
          width: 100%;
          padding: 12px;
          background-color: #5982FF;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
          font-weight: bold;
        }
        .modal-content button[type="submit"]:hover {
          background-color: #4070ee;
        }
      </style>
      <div class="modal-content">
        <button class="close-button">&times;</button>
        <h2>🐾 Reportar avistaje de ${petName}</h2>
        <p style="color: #666; margin-bottom: 20px;">El dueño recibirá un email con tu información de contacto</p>
        <form id="report-form">
          <label for="reporterName" style="display: block; font-weight: bold; margin-bottom: 5px;">Tu nombre *</label>
          <input type="text" id="reporterName" placeholder="Ej: Juan Pérez" required />
          
          <label for="reporterPhone" style="display: block; font-weight: bold; margin-bottom: 5px;">Tu teléfono *</label>
          <input type="tel" id="reporterPhone" placeholder="Ej: +54 9 11 1234-5678" required />
          
          <label for="location" style="display: block; font-weight: bold; margin-bottom: 5px;">¿Dónde lo viste? *</label>
          <input type="text" id="location" placeholder="Ej: Av. Corrientes 1234, CABA" required />
          
          <label for="message" style="display: block; font-weight: bold; margin-bottom: 5px;">Mensaje adicional (opcional)</label>
          <textarea id="message" placeholder="Ej: Lo vi cerca del parque, parecía asustado..."></textarea>
          
          <button type="submit">📧 Enviar reporte</button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector(".close-button").addEventListener("click", () => {
      modal.remove();
    });
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    modal
      .querySelector("#report-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault();
        const reporterName = modal.querySelector("#reporterName").value;
        const reporterPhone = modal.querySelector("#reporterPhone").value;
        const location = modal.querySelector("#location").value;
        const message = modal.querySelector("#message").value;
        const submitButton = modal.querySelector('button[type="submit"]');
        submitButton.textContent = "📤 Enviando...";
        submitButton.disabled = true;
        try {
          const res = await fetch(
            `https://pet-finder-1.onrender.com/report/${petId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reporterName,
                reporterPhone,
                location,
                message,
              }),
            }
          );
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Error al enviar reporte");
          }
          alert(
            "✅ ¡Reporte enviado con éxito! El dueño recibirá un email con tu información."
          );
          modal.remove();
        } catch (error) {
          alert(`❌ Error al enviar reporte: ${error.message}`);
          submitButton.textContent = "📧 Enviar reporte";
          submitButton.disabled = false;
          console.error(error);
        }
      });
  }
  async render() {
    initHeader();
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("No hay userId disponible");
      return;
    }
    this.innerHTML = `
      <div style="padding: 80px 20px 20px;">
        <h1 style="text-align: center; color: #5982FF;">🐾 Mascotas perdidas cerca tuyo</h1>
        <p style="text-align: center; color: #666;">Cargando mascotas cercanas...</p>
      </div>
    `;
    const header = document.createElement("custom-header");
    this.prepend(header);
    try {
      const { pets, userLocation, radius } = await this.fetchNearbyPets();
      if (pets.length === 0) {
        this.innerHTML = `
          <div style="padding: 80px 20px; text-align: center;">
            <h1 style="color: #5982FF;">🐾 Mascotas perdidas cerca tuyo</h1>
            <p style="color: #666; margin: 20px 0;">No hay mascotas reportadas como perdidas en un radio de ${radius}km de tu ubicación.</p>
            <button class="back-button" style="padding: 12px 30px; background-color: #5982FF; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
              ← Volver al inicio
            </button>
          </div>
        `;
        const backButton = this.querySelector(".back-button");
        backButton.addEventListener("click", () => {
          window.history.pushState({}, "", "/home");
          window.dispatchEvent(new PopStateEvent("popstate"));
        });
        const header = document.createElement("custom-header");
        this.prepend(header);
        return;
      }
      this.innerHTML = `
        <div style="padding: 80px 20px 20px;">
          <h1 style="text-align: center; color: #5982FF; margin-bottom: 10px;">🐾 Mascotas perdidas cerca tuyo</h1>
          <p style="text-align: center; color: #666; margin-bottom: 30px;">
            Encontramos ${pets.length} mascota${
        pets.length > 1 ? "s" : ""
      } en un radio de ${radius}km
          </p>
          
          <div id="pets-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto;">
            ${pets
              .map((pet) => {
                const distance = this.calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  pet.lastSeenLocation.lat,
                  pet.lastSeenLocation.lng
                ).toFixed(1);
                return `
                <div class="pet-card" style="border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s;">
                  <img src="${pet.imgUrl}" alt="${pet.name}" style="width: 100%; height: 200px; object-fit: cover;" />
                  <div style="padding: 15px;">
                    <h2 style="margin: 0 0 10px; color: #333;">${pet.name}</h2>
                    <p style="color: #666; margin: 5px 0;"><strong>📍</strong> ${pet.lastSeenLocation.name}</p>
                    <p style="color: #5982FF; margin: 5px 0; font-weight: bold;">📏 A ${distance} km de distancia</p>
                    <p style="color: #666; margin: 10px 0; font-size: 14px;">${pet.bio}</p>
                    <button 
                      class="report-button" 
                      data-pet-id="${pet.id}"
                      data-pet-name="${pet.name}"
                      style="width: 100%; padding: 12px; background-color: #FF7D7D; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px; margin-top: 10px;">
                      📧 ¡Lo vi! Reportar
                    </button>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>
          
          <div style="text-align: center; margin-top: 40px;">
            <button class="back-button" style="padding: 12px 30px; background-color: #5982FF; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
              ← Volver al inicio
            </button>
          </div>
        </div>
      `;
      // Agregar efecto hover a las cards
      const style = document.createElement("style");
      style.textContent = `
        .pet-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .report-button:hover {
          background-color: #ff6666;
        }
      `;
      this.appendChild(style);
      const header2 = document.createElement("custom-header");
      this.prepend(header2);
      this.addReportListeners();
      const backButton = this.querySelector(".back-button");
      backButton.addEventListener("click", () => {
        window.history.pushState({}, "", "/home");
        window.dispatchEvent(new PopStateEvent("popstate"));
      });
    } catch (error) {
      console.error("Error:", error);
      this.innerHTML = `
        <div style="padding: 80px 20px; text-align: center;">
          <h1 style="color: #FF7D7D;">⚠️ Error</h1>
          <p>No se pudieron cargar las mascotas cercanas.</p>
          <button class="retry-button" style="padding: 12px 30px; background-color: #5982FF; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">
            Reintentar
          </button>
        </div>
      `;
      const retryButton = this.querySelector(".retry-button");
      retryButton.addEventListener("click", () => {
        this.render();
      });
      const header = document.createElement("custom-header");
      this.prepend(header);
    }
  }
}
customElements.define("nearby-component", NearbyComponent);
