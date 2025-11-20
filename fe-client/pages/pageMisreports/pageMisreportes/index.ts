import { initHeader } from "../../../components/header/index";

interface Pet {
  id: number;
  nombre: string;
  bio: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  status: string;
  img: string;
}

class MyReports extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  async fetchMyReports(userId: string | null) {
    try {
      const response = await fetch(`http://localhost:3000//users/${userId}/pets`);
      if (!response.ok) throw new Error('Error al obtener mis reportes');
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
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

    this.innerHTML = `
      <div style="padding: 80px 20px 20px;">
        <h1 style="text-align: center; color: #5982FF;">🐾 Mis Mascotas Reportadas</h1>
        <p style="text-align: center; color: #666;">Cargando tus reportes...</p>
      </div>
    `;

    const header = document.createElement('custom-header');
    this.prepend(header);

    const userData = await this.fetchMyReports(userId);
    const myPets: Pet[] = userData?.Pets || [];

    this.innerHTML = `
      <div style="padding: 80px 20px 40px;">
        <h1 style="text-align: center; color: #5982FF; margin-bottom: 20px;">🐾 Mis Mascotas Reportadas</h1>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <button id="new-report-button" style="padding: 12px 30px; background-color: #5982FF; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 16px;">
            ➕ Reportar Nueva Mascota
          </button>
        </div>

        <div id="reports-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto;">
          ${myPets.length > 0 ? myPets.map((pet: Pet) => `
            <div class="pet-card" style="border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s;">
              <div style="position: relative;">
                <img src="${pet.img}" alt="${pet.nombre}" style="width: 100%; height: 200px; object-fit: cover;" />
                <span style="position: absolute; top: 10px; right: 10px; background-color: ${pet.status === 'lost' ? '#FF4C4C' : '#4caf50'}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                  ${pet.status === 'lost' ? '🔴 PERDIDO' : '✅ ENCONTRADO'}
                </span>
              </div>
              <div style="padding: 15px;">
                <h2 style="margin: 0 0 10px; color: #333;">${pet.nombre}</h2>
                <p style="color: #666; margin: 5px 0; font-size: 14px;"><strong>📍</strong> ${pet.location.name}</p>
                <p style="color: #666; margin: 10px 0; font-size: 14px;">${pet.bio}</p>
                
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                  <button 
                    class="edit-button" 
                    data-report-id="${pet.id}"
                    style="flex: 1; padding: 10px; background-color: #5982FF; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px;">
                    ✏️ Editar
                  </button>
                  <button 
                    class="toggle-status-button" 
                    data-report-id="${pet.id}"
                    data-current-status="${pet.status}"
                    style="flex: 1; padding: 10px; background-color: ${pet.status === 'lost' ? '#4caf50' : '#FF4C4C'}; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px;">
                    ${pet.status === 'lost' ? '✅ Marcar encontrado' : '🔴 Marcar perdido'}
                  </button>
                </div>
              </div>
            </div>
          `).join('') : `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background-color: #f5f5f5; border-radius: 10px;">
              <h2 style="color: #999; margin-bottom: 20px;">No tenés mascotas reportadas</h2>
              <p style="color: #666; margin-bottom: 30px;">Reportá una mascota perdida para que otros usuarios puedan ayudarte a encontrarla</p>
              <button class="new-report-inline" style="padding: 12px 30px; background-color: #5982FF; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 16px;">
                ➕ Reportar Mi Primera Mascota
              </button>
            </div>
          `}
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <button class="back-button" style="padding: 12px 30px; background-color: #666; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
            ← Volver al inicio
          </button>
        </div>
      </div>
    `;

    // Agregar estilos
    const style = document.createElement('style');
    style.textContent = `
      .pet-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .edit-button:hover {
        background-color: #4070ee;
      }
      .toggle-status-button:hover {
        opacity: 0.9;
      }
    `;
    this.appendChild(style);

    const header2 = document.createElement('custom-header');
    this.prepend(header2);

    // Botón nuevo reporte (header)
    const newReportButton = this.querySelector('#new-report-button');
    if (newReportButton) {
      newReportButton.addEventListener('click', () => {
        window.history.pushState({}, '', '/create-report');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
    }

    // Botón nuevo reporte (inline - si no hay mascotas)
    const newReportInline = this.querySelector('.new-report-inline');
    if (newReportInline) {
      newReportInline.addEventListener('click', () => {
        window.history.pushState({}, '', '/create-report');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
    }

    // Botones de editar
    this.addEditListeners();

    // Botones de cambiar estado
    this.addToggleStatusListeners();

    // Botón volver
    const backButton = this.querySelector('.back-button') as HTMLButtonElement;
    backButton.addEventListener('click', () => {
      window.history.pushState({}, '', '/home');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  }

  addEditListeners() {
    this.querySelectorAll('.edit-button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reportId = (e.target as HTMLButtonElement).dataset.reportId;
        window.history.pushState({}, '', `/edit-report/${reportId}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
    });
  }

  addToggleStatusListeners() {
    this.querySelectorAll('.toggle-status-button').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const button = e.target as HTMLButtonElement;
        const reportId = button.dataset.reportId;
        const currentStatus = button.dataset.currentStatus;
        const newStatus = currentStatus === 'lost' ? 'found' : 'lost';

        if (!confirm(`¿Estás seguro de que querés marcar esta mascota como ${newStatus === 'found' ? 'encontrada' : 'perdida'}?`)) {
          return;
        }

        button.textContent = '🔄 Actualizando...';
        button.disabled = true;

        try {
          const response = await fetch(`http://localhost:3000/pet-status/${reportId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });

          if (!response.ok) {
            throw new Error('Error al actualizar el estado');
          }

          alert(`✅ Estado actualizado a: ${newStatus === 'found' ? 'Encontrado' : 'Perdido'}`);
          this.render(); // Re-renderizar para mostrar el cambio
        } catch (error) {
          console.error('Error:', error);
          alert('❌ Error al actualizar el estado');
          button.disabled = false;
          button.textContent = currentStatus === 'lost' ? '✅ Marcar encontrado' : '🔴 Marcar perdido';
        }
      });
    });
  }
}

customElements.define('my-reports-component', MyReports);