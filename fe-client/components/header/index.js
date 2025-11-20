export function initHeader() {
    if (!customElements.get('custom-header')) {
        class Header extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
                this.isMenuOpen = false; // Inicializar la propiedad
                this.render();
            }
            toggleMenu() {
                this.isMenuOpen = !this.isMenuOpen;
                const menu = this.shadowRoot.querySelector('.menu'); // Afirmación de tipo
                if (this.isMenuOpen) {
                    menu.style.display = 'flex';
                    menu.style.flexDirection = 'column';
                    menu.style.justifyContent = 'space-between';
                }
                else {
                    menu.style.display = 'none';
                }
            }
            render() {
                const style = `
          <style>
            header {
              background-color: #16244D;
              color: white;
              padding: 0 20px;
              margin: 0;
              height: 50px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              position: relative;
            }
            h1 {
              margin: 0;
            }
            button.hamburger {
              background: none;
              border: none;
              color: white;
              font-size: 24px;
              cursor: pointer;
            }
            .menu {
              display: none; /* Ocultar por defecto */
              position: fixed; /* Fijo para ocupar toda la pantalla */
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(18, 18, 19, 0.97); /* Fondo semi-transparente */
              flex-direction: column;
              align-items: flex-end; /* Alinear el contenido a la derecha */
              box-shadow: 0 2px 5px rgba(0,0,0,0.3);
              z-index: 10;
            }
            .menu a {
              color: white;
              padding: 10px 15px;
              text-decoration: none;
              border-bottom: 1px solid #2c3e50;
              width: 100%; /* Para que el enlace ocupe todo el ancho */
              text-align: center; /* Centrar texto */
            }
            .menu a:hover {
              background-color: #1b2a5a;
            }
            .close-button {
              background: none;
              border: none;
              color: white;
              font-size: 24px;
              cursor: pointer;
              margin-right: 20px;
              margin-bottom: 20px; /* Espacio debajo de la X */
            }
          </style>
        `;
                this.shadowRoot.innerHTML = style + `
          <header>
            <h1>Mi App</h1>
            <button class="hamburger" aria-label="Toggle menu">&#9776;</button>
            <nav class="menu">
              <button class="close-button" aria-label="Close menu">X</button>
              <a class="datos">Mis datos</a>
              <a class="reportes" href="/mis-mascotas">Reportes</a>
              <a class="misReportes" href="/reportar-mascota">Mis mascotas reportadas</a>
            </nav>
          </header>
        `;
                // Agregar el evento para el enlace de inicio de sesión
                const dataLink = this.shadowRoot.querySelector('.datos');
                const reportes = this.shadowRoot.querySelector('.reportes');
                const misReportes = this.shadowRoot.querySelector('.misReportes');
                dataLink.addEventListener('click', (e) => {
                    e.preventDefault(); // Evitar el comportamiento por defecto
                    console.log('Click en Mis datos');
                    this.toggleMenu();
                    window.history.pushState({}, '', '/menu'); // Cambiar la URL
                    window.dispatchEvent(new PopStateEvent('popstate')); // Disparar el evento
                });
                reportes.addEventListener('click', (e) => {
                    e.preventDefault(); // Evitar el comportamiento por defecto
                    console.log('Click en Reportes');
                    this.toggleMenu();
                    window.history.pushState({}, '', '/home'); // Cambiar la URL
                    window.dispatchEvent(new PopStateEvent('popstate')); // Disparar el evento
                });
                misReportes.addEventListener('click', (e) => {
                    e.preventDefault(); // Evitar el comportamiento por defecto
                    console.log('Click en Mis Reportes');
                    this.toggleMenu();
                    window.history.pushState({}, '', '/myPets'); // Cambiar la URL
                    window.dispatchEvent(new PopStateEvent('popstate')); // Disparar el evento
                });
                this.shadowRoot.querySelector('button.hamburger')
                    .addEventListener('click', () => this.toggleMenu());
                this.shadowRoot.querySelector('.close-button')
                    .addEventListener('click', () => this.toggleMenu()); // Cerrar el menú al hacer click en la X
            }
        }
        customElements.define('custom-header', Header);
    }
}
