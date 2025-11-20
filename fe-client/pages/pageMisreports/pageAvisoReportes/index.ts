import { initHeader } from "../../../components/header/index";

interface Report {
  id: number;
  reporterName: string;
  reporterPhone: string;
  message: string;
  location: string;
  createdAt: string;
  Pet: {
    id: number;
    name: string;
    imgUrl: string;
    status: string;
  };
}

class MyAdviseComponent extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  async fetchReports(userId: number): Promise<Report[]> {
    try {
      const response = await fetch(`http://localhost:3000/users/${userId}/reports`);
      
      if (!response.ok) {
        throw new Error('Error al obtener los reportes');
      }
      
      const result = await response.json();
      return result.reports;
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }

  async render() {
    initHeader();
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    const userId = Number(localStorage.getItem('userId'));
    if (!userId) {
      this.innerHTML = '<p>Error: No se encontró el ID de usuario</p>';
      return;
    }

    this.innerHTML = `
      <div style="padding: 80px 20px 20px;">
        <h1 style="text-align: center; color: #5982FF;">📧 Mis Reportes</h1>
        <p style="text-align: center; color: #666;">Cargando reportes...</p>
      </div>
    `;

    const header = document.createElement('custom-header');
    this.prepend(header);

    const reports = await this.fetchReports(userId);

    if (reports.length === 0) {
      this.innerHTML = `
        <div style="padding: 80px 20px; text-align: center;">
          <h1 style="color: #5982FF;">📧 Mis Reportes</h1>
          <p style="color: #666; margin: 20px 0;">Aún no recibiste reportes de avistajes de tus mascotas.</p>
          <button class="back-button" style="padding: 12px 30px; background-color: #5982FF; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
            ← Volver
          </button>
        </div>
      `;
      
      const backButton = this.querySelector('.back-button') as HTMLButtonElement;
      backButton.addEventListener('click', () => {
        window.history.pushState({}, '', '/menu');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      
      const header2 = document.createElement('custom-header');
      this.prepend(header2);
      return;
    }

    this.innerHTML = `
      <div style="padding: 80px 20px 20px; max-width: 1200px; margin: 0 auto;">
        <h1 style="text-align: center; color: #5982FF; margin-bottom: 10px;">📧 Mis Reportes</h1>
        <p style="text-align: center; color: #666; margin-bottom: 30px;">
          Recibiste ${reports.length} reporte${reports.length > 1 ? 's' : ''} de avistajes
        </p>
        
        <div style="display: grid; gap: 20px;">
          ${reports.map(report => `
            <div style="border: 1px solid #ddd; border-radius: 10px; padding: 20px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="display: flex; align-items: start; gap: 20px;">
                <img src="${report.Pet.imgUrl}" alt="${report.Pet.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;" />
                
                <div style="flex: 1;">
                  <h2 style="margin: 0 0 10px; color: #333;">🐾 ${report.Pet.name}</h2>
                  
                  <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 10px 0; border-radius: 4px;">
                    <h3 style="margin: 0 0 10px; color: #2e7d32;">📞 Información de contacto:</h3>
                    <p style="margin: 5px 0;"><strong>Nombre:</strong> ${report.reporterName}</p>
                    <p style="margin: 5px 0;"><strong>Teléfono:</strong> <a href="tel:${report.reporterPhone}" style="color: #5982FF;">${report.reporterPhone}</a></p>
                    <p style="margin: 5px 0;"><strong>Ubicación:</strong> ${report.location}</p>
                  </div>

                  ${report.message && report.message !== 'Sin mensaje adicional' ? `
                    <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 10px 0; border-radius: 4px;">
                      <h3 style="margin: 0 0 10px; color: #e65100;">💬 Mensaje:</h3>
                      <p style="margin: 0; color: #555;">${report.message}</p>
                    </div>
                  ` : ''}

                  <p style="color: #999; font-size: 14px; margin: 10px 0 0;">
                    ⏰ Reportado el ${new Date(report.createdAt).toLocaleString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <button class="back-button" style="padding: 12px 30px; background-color: #5982FF; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
            ← Volver al menú
          </button>
        </div>
      </div>
    `;

    const header3 = document.createElement('custom-header');
    this.prepend(header3);

    const backButton = this.querySelector('.back-button') as HTMLButtonElement;
    backButton.addEventListener('click', () => {
      window.history.pushState({}, '', '/menu');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
  }
}

customElements.define('myadvise-component', MyAdviseComponent);