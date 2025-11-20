import { initHeader } from "../../../components/header/index";

class Home extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  async fetchUserData(userId: string | null) {
    try {
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener los datos del usuario');
      }

      if (!userId) {
        console.error('No hay userId disponible');
        return null;
      }

      const userData = await response.json();
      console.log('Datos del usuario:', userData);
      return userData;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  getUserLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  async render() {
    initHeader();
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No hay userId disponible');
      return;
    }

    const userData = await this.fetchUserData(userId);

    this.innerHTML = `
      <div class="container" style="width: 400px; height: 550px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; margin: 0 auto;">
        <h1 style="color: #FF7D7D">Pet Finder App</h1>
        <div style="width: 100%;">
          <button class="menu1Button" type="button" style="width: 100%; padding: 15px; margin-bottom: 20px; background-color: #5982FF; border: 5px solid #1B399E; border-radius: 5px; color: #eee; cursor: pointer;">
            📍 Dar mi ubicación actual
          </button>
          <button class="menu3Button" type="button" style="width: 100%; padding: 15px; margin-bottom: 20px; background-color: #5982FF; border: 5px solid #1B399E; border-radius: 5px; color: #eee; cursor: pointer;">
            Ir a ver mis avisos de reporte
          </button>
          <button class="menu2Button" type="button" style="width: 100%; padding: 15px; background-color: #8CD48D; border: 5px solid #002900; border-radius: 5px; color: #eee; cursor: pointer;">
            ❓ ¿Cómo funciona Pet Finder?
          </button>
        </div>
      </div>
    `;

    const header = document.createElement('custom-header');
    this.prepend(header);
    const menu3Button = this.querySelector('.menu3Button') as HTMLButtonElement;
    menu3Button.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.pushState({}, '', '/advises-reports');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    const menu1Button = this.querySelector('.menu1Button') as HTMLButtonElement;
    menu1Button.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // Mostrar mensaje de carga
      menu1Button.textContent = '🔄 Obteniendo ubicación...';
      menu1Button.disabled = true;

      try {
        // Obtener ubicación del usuario
        const location = await this.getUserLocation();
        
        // Guardar en localStorage para usarla en el componente Pets
        localStorage.setItem('userLat', location.lat.toString());
        localStorage.setItem('userLng', location.lng.toString());

        console.log('Ubicación obtenida:', location);

        // Redirigir a la página de mascotas
        window.history.pushState({}, '', '/nearby');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch (error) {
        console.error('Error al obtener ubicación:', error);
        alert('No se pudo obtener tu ubicación. Por favor, permití el acceso a la ubicación en tu navegador.');
        menu1Button.textContent = '📍 Dar mi ubicación actual';
        menu1Button.disabled = false;
      }
    });

    const menu2Button = this.querySelector('.menu2Button') as HTMLButtonElement;
    menu2Button.addEventListener('click', (e) => {
      e.preventDefault();
      this.showTutorial();
    });
  }

  showTutorial() {
    this.innerHTML = '';
    initHeader();
    
    const header = document.createElement('custom-header');
    const tutorial = document.createElement('div');
    
    tutorial.innerHTML = `
      <div style="max-width: 600px; margin: 80px auto; padding: 20px; text-align: center;">
        <h2 style="color: #5982FF; margin-bottom: 20px;">¿Cómo funciona Pet Finder?</h2>
        
        <div style="text-align: left; line-height: 1.6;">
          <h3 style="color: #FF7D7D;">🔍 Perdiste tu mascota</h3>
          <p>Publicá un reporte con foto, descripción y ubicación donde la viste por última vez. Tu mascota aparecerá en el mapa para que otros usuarios puedan ayudarte.</p>
          
          <h3 style="color: #FF7D7D; margin-top: 30px;">👀 Encontraste una mascota</h3>
          <p>Buscá mascotas cercanas usando tu ubicación. Si reconocés a alguna, podés reportar el avistaje con tus datos de contacto. El dueño recibirá un email automático con tu información.</p>
          
          <h3 style="color: #FF7D7D; margin-top: 30px;">📧 Sistema de notificaciones</h3>
          <p>Cuando alguien reporta haber visto tu mascota, recibís un email inmediatamente con los datos de contacto y la ubicación del avistaje.</p>
          
          <h3 style="color: #FF7D7D; margin-top: 30px;">🗺️ Búsqueda por proximidad</h3>
          <p>El sistema muestra solo las mascotas perdidas cerca de tu ubicación (radio de 5km por defecto), haciendo más eficiente la búsqueda.</p>
        </div>
        
        <button class="back-button" style="margin-top: 30px; padding: 12px 30px; background-color: #5982FF; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
          ← Volver al inicio
        </button>
      </div>
    `;
    
    this.appendChild(header);
    this.appendChild(tutorial);
    
    const backButton = this.querySelector('.back-button') as HTMLButtonElement;
    backButton.addEventListener('click', () => {
      this.render();
    });
  }
}

customElements.define('home-component', Home);