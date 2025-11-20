import { initHeader } from "../../../components/header/index.js";

interface UserData {
  id: number;
  name: string;
  email: string;
  location?: LocationData | null;
  password: string;
  createdAt: string;
  updatedAt: string;
}

interface LocationData {
  name: string;
  lat: number;
  lng: number;
}

interface UpdateUserData {
  name: string;
  location?: LocationData;
}

interface GeocodeResponse {
  results: Array<{
    formatted_address: string;
  }>;
}

//declare const google: typeof import("google.maps");

class Datos extends HTMLElement {
  private selectedLat: number | null = null;
  private selectedLng: number | null = null;
  private locationName: string = "";
  private map: google.maps.Map | null = null;
  private marker: google.maps.Marker | null = null;

  connectedCallback(): void {
    this.render();
  }

  async fetchUserData(userId: string): Promise<UserData | null> {
    try {
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error al obtener los datos del usuario");
      }
      const userData: UserData = await response.json();
      console.log("Datos del usuario:", userData);
      return userData;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }

  async getUserLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalización no soportada"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async getLocationName(lat: number, lng: number): Promise<string> {
    try {
      const apiKey = "YOUR_GOOGLE_MAPS_API_KEY"; // Reemplazar con tu API key
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data: GeocodeResponse = await response.json();
      if (data.results && data.results[0]) {
        return data.results[0].formatted_address;
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error("Error al obtener el nombre de la ubicación:", error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  updateLocationDisplay(name: string): void {
    const locationDisplay = this.querySelector<HTMLParagraphElement>(".location-display");
    const locationInfo = this.querySelector<HTMLDivElement>(".location-info");

    if (locationDisplay && locationInfo) {
      locationDisplay.textContent = name;
      locationInfo.style.backgroundColor = "#e8f5e9";
      locationInfo.style.borderColor = "#4caf50";
      const infoText = locationInfo.querySelector<HTMLParagraphElement>("p");
      if (infoText) {
        infoText.style.color = "#2e7d32";
        infoText.textContent = "✅ Ubicación actualizada:";
      }
    }
  }

  initMap(lat: number, lng: number): void {
    const mapElement = this.querySelector<HTMLElement>("#location-map");
    if (!mapElement) return;

    this.map = new google.maps.Map(mapElement, {
      center: { lat, lng },
      zoom: 15,
    });

    this.marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
      draggable: true,
    });

    // Evento cuando arrastran el marcador
    this.marker.addListener("dragend", async () => {
      if (!this.marker) return;
      const position = this.marker.getPosition();
      if (!position) return;
      
      this.selectedLat = position.lat();
      this.selectedLng = position.lng();
      this.locationName = await this.getLocationName(
        this.selectedLat,
        this.selectedLng
      );
      this.updateLocationDisplay(this.locationName);
    });

    // Evento cuando hacen clic en el mapa
    this.map.addListener("click", async (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;
      
      this.selectedLat = event.latLng.lat();
      this.selectedLng = event.latLng.lng();
      this.marker?.setPosition(event.latLng);
      this.locationName = await this.getLocationName(
        this.selectedLat,
        this.selectedLng
      );
      this.updateLocationDisplay(this.locationName);
    });
  }

  async render(): Promise<void> {
    console.log("Renderizando el componente Datos");
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

    // Obtener datos existentes del usuario
    const currentName = userData?.name || "";
    const currentLocation = userData?.location;

    if (currentLocation) {
      this.selectedLat = currentLocation.lat;
      this.selectedLng = currentLocation.lng;
      this.locationName = currentLocation.name;
    }

    this.innerHTML = `
      <custom-header></custom-header>
      <form class="editProfileForm" style="width: 90%; max-width: 600px; display: flex; flex-direction: column; gap: 20px; align-items: center; margin: 80px auto 40px; padding: 30px; border: 1px solid #ccc; border-radius: 8px; background-color: #f9f9f9;">
        <h1 style="color: #5982FF;">Datos personales</h1>
        
        <div style="width: 100%;">
          <label for="nombre" style="font-weight: bold; display: block; margin-bottom: 5px;">Nombre</label>
          <input type="text" class="nombre" name="nombre" placeholder="John Doe" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
        </div>

        <div style="width: 100%; border-top: 2px solid #ddd; margin: 10px 0;"></div>
        
        <h3 style="color: #666; text-align: center; margin: 10px 0;">📍 Mi Ubicación</h3>
        <p style="color: #888; font-size: 14px; text-align: center; margin: 0 0 15px;">
          ${
            currentLocation
              ? "Actualizá tu ubicación si te mudaste"
              : "Agregá tu ubicación para ver mascotas cercanas"
          }
        </p>

        <div style="width: 100%; display: flex; gap: 10px; margin-bottom: 15px;">
          <button type="button" class="get-location-btn" style="flex: 1; padding: 10px; background-color: #8CD48D; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
            📍 Usar mi ubicación actual
          </button>
          <button type="button" class="show-map-btn" style="flex: 1; padding: 10px; background-color: #5982FF; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
            🗺️ Seleccionar en mapa
          </button>
        </div>

        <div class="map-container" style="display: none; width: 100%;">
          <p style="color: #666; font-size: 14px; margin-bottom: 10px;">Hacé clic en el mapa o arrastrá el marcador para seleccionar tu ubicación</p>
          <div id="location-map" style="width: 100%; height: 300px; border-radius: 8px; overflow: hidden; border: 1px solid #ccc; margin-bottom: 10px;"></div>
        </div>

        <div class="location-info" style="width: 100%; padding: 10px; background-color: ${
          currentLocation ? "#e8f5e9" : "#fff3e0"
        }; border-radius: 4px; border: 1px solid ${
      currentLocation ? "#4caf50" : "#ff9800"
    };">
          <p style="margin: 0; color: ${
            currentLocation ? "#2e7d32" : "#e65100"
          }; font-weight: bold;">
            ${currentLocation ? "✅ Ubicación guardada:" : "⚠️ Sin ubicación"}
          </p>
          <p class="location-display" style="margin: 5px 0 0; color: #555; font-size: 14px;">
            ${
              currentLocation
                ? currentLocation.name
                : "No se ha configurado una ubicación"
            }
          </p>
        </div>

        <button class="saveButton" type="submit" style="width: 100%; padding: 12px; background-color: #5982FF; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px; margin-top: 20px;">
          💾 Guardar Cambios
        </button>
        <button type="button" class="backButton" style="width: 100%; padding: 12px; background-color: #ff5959ff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px;"> 
          ← Volver al inicio
        </button>
        <div class="success-message" style="display: none; color: #4caf50; text-align: center; width: 100%; font-weight: bold;"></div>
        <div class="error-message" style="display: none; color: #FF4C4C; text-align: center; width: 100%;"></div>
      </form>
    `;

    // Rellenar el formulario con los datos del usuario
    const nombreInput = this.querySelector<HTMLInputElement>(".nombre");
    if (nombreInput) {
      nombreInput.value = currentName;
    }

    // Botón para obtener ubicación actual
    const getLocationBtn = this.querySelector<HTMLButtonElement>(".get-location-btn");
    getLocationBtn?.addEventListener("click", async () => {
      if (!getLocationBtn) return;
      
      getLocationBtn.textContent = "🔄 Obteniendo...";
      getLocationBtn.disabled = true;

      try {
        const position = await this.getUserLocation();
        this.selectedLat = position.lat;
        this.selectedLng = position.lng;
        this.locationName = await this.getLocationName(
          this.selectedLat,
          this.selectedLng
        );

        this.updateLocationDisplay(this.locationName);

        getLocationBtn.textContent = "✅ Ubicación actualizada";
        getLocationBtn.style.backgroundColor = "#4caf50";

        // Si el mapa está visible, actualizar el marcador
        if (this.map && this.marker) {
          this.map.setCenter({ lat: this.selectedLat, lng: this.selectedLng });
          this.marker.setPosition({
            lat: this.selectedLat,
            lng: this.selectedLng,
          });
        }

        setTimeout(() => {
          getLocationBtn.textContent = "📍 Usar mi ubicación actual";
          getLocationBtn.style.backgroundColor = "#8CD48D";
          getLocationBtn.disabled = false;
        }, 2000);
      } catch (error) {
        alert(
          "No se pudo obtener tu ubicación. Verificá los permisos del navegador."
        );
        getLocationBtn.textContent = "📍 Usar mi ubicación actual";
        getLocationBtn.disabled = false;
      }
    });

    // Botón para mostrar/ocultar mapa
    const showMapBtn = this.querySelector<HTMLButtonElement>(".show-map-btn");
    const mapContainer = this.querySelector<HTMLDivElement>(".map-container");
    let mapVisible = false;

    showMapBtn?.addEventListener("click", () => {
      if (!showMapBtn || !mapContainer) return;
      
      mapVisible = !mapVisible;
      mapContainer.style.display = mapVisible ? "block" : "none";
      showMapBtn.textContent = mapVisible
        ? "🔼 Ocultar mapa"
        : "🗺️ Seleccionar en mapa";

      if (mapVisible && !this.map) {
        // Inicializar el mapa con la ubicación guardada o una predeterminada
        const lat = this.selectedLat || -34.6037;
        const lng = this.selectedLng || -58.3816;
        this.initMap(lat, lng);
      }
    });

    // Submit del formulario
    const form = this.querySelector<HTMLFormElement>(".editProfileForm");
    const saveButton = this.querySelector<HTMLButtonElement>(".saveButton");
    const backButton = this.querySelector<HTMLButtonElement>(".backButton");
    const successMessage = this.querySelector<HTMLDivElement>(".success-message");
    const errorMessage = this.querySelector<HTMLDivElement>(".error-message");

    form?.addEventListener("submit", async (e: Event) => {
      e.preventDefault();

      if (!nombreInput || !saveButton || !errorMessage || !successMessage) return;

      const name = nombreInput.value.trim();

      if (!name) {
        errorMessage.textContent = "❌ El nombre no puede estar vacío";
        errorMessage.style.display = "block";
        setTimeout(() => (errorMessage.style.display = "none"), 3000);
        return;
      }

      const updateData: UpdateUserData = { name };

      // Solo enviar location si se configuró una
      if (
        this.selectedLat !== null &&
        this.selectedLng !== null &&
        this.locationName
      ) {
        updateData.location = {
          name: this.locationName,
          lat: this.selectedLat,
          lng: this.selectedLng,
        };
      }

      console.log("Datos a actualizar:", updateData);

      saveButton.textContent = "💾 Guardando...";
      saveButton.disabled = true;
      errorMessage.style.display = "none";
      successMessage.style.display = "none";

      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${userId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Error al actualizar los datos");
        }

        console.log("Respuesta del servidor:", result);

        successMessage.textContent = "✅ Cambios guardados exitosamente";
        successMessage.style.display = "block";
        saveButton.textContent = "💾 Guardar Cambios";
        saveButton.disabled = false;

        setTimeout(() => {
          successMessage.style.display = "none";
        }, 3000);
      } catch (error) {
        console.error("Error:", error);
        errorMessage.textContent = `❌ ${(error as Error).message}`;
        errorMessage.style.display = "block";
        saveButton.textContent = "💾 Guardar Cambios";
        saveButton.disabled = false;

        setTimeout(() => {
          errorMessage.style.display = "none";
        }, 5000);
      }
    });

    backButton?.addEventListener("click", () => {
      window.history.pushState({}, "", "/menu");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  }
}

customElements.define("personaldates-component", Datos);