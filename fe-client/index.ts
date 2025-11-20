// Importar todos los componentes
import "./pages/pageLogin/Register/index";
import "./pages/pageLogin/InicioSesion/index";
import "./pages/pageProfile/pageMenu/index";
import "./pages/pageProfile/pageDatosPersonales/index";
import "./pages/pageProfile/PageContraseña/index";
import "./pages/pageHome/Home/index";
import "./pages/pageHome/HomeMascotas/index";
import "./pages/pageMisreports/pageMisreportes/index";
import "./pages/pageMisreports/pageAvisoReportes/index";
import "./pages/pageMisreports/pageReportar/index";

// Router simple integrado
class SimpleRouter {
  private routes: Map<string, string> = new Map();
  private rootElement: HTMLElement;

  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
    this.setupRoutes();
    this.setupListeners();
    this.navigate(window.location.pathname);
  }

  private setupRoutes() {
    this.routes.set('/', 'register-component');
    this.routes.set('/Log-in', 'login-component');
    this.routes.set('/menu', 'menu-component');
    this.routes.set('/personal-dates', 'personaldates-component');
    this.routes.set('/changepass-dates', 'changepass-component');
    this.routes.set('/home', 'home-component');
    this.routes.set('/nearby', 'nearby-component');
    this.routes.set('/myReports', 'my-reports-component');
    this.routes.set('/create-report', 'create-report-component');
    
  
  }
  private setupListeners() {
    // Interceptar clicks en links
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const path = new URL(link.href).pathname;
        this.navigate(path);
      }
    });

    // Manejar navegación con history API
    window.addEventListener('popstate', () => {
      this.navigate(window.location.pathname, false);
    });
  }

  navigate(path: string, pushState: boolean = true) {
    if (pushState) {
      window.history.pushState({}, '', path);
    }

    const componentName = this.routes.get(path);
    
    if (!componentName) {
      console.error(`No se encontró ruta para: ${path}`);
      this.navigate('/', true);
      return;
    }

    this.rootElement.innerHTML = '';
    const component = document.createElement(componentName);
    this.rootElement.appendChild(component);
  }
}

(function main() {
  const root = document.querySelector('#root');
  if (!root) {
    console.error('El elemento #root no se encontró en el DOM.');
    return;
  }
  
  new SimpleRouter(root as HTMLElement);
})();
