// Importar todos los componentes
import "./pages/pageLogin/Register/index.js";
import "./pages/pageLogin/InicioSesion/index.js";
import "./pages/pageProfile/pageMenu/index.js";
import "./pages/pageProfile/pageDatosPersonales/index.js";
import "./pages/pageProfile/PageContraseña/index.js";
import "./pages/pageHome/Home/index.js";
import "./pages/pageHome/HomeMascotas/index.js";
import "./pages/pageMisreports/pageMisreportes/index.js";
import "./pages/pageMisreports/pageAvisoReportes/index.js";
import "./pages/pageMisreports/pageReportar/index.js";
// Router simple integrado
class SimpleRouter {
  constructor(rootElement) {
    this.routes = new Map();
    this.rootElement = rootElement;
    this.setupRoutes();
    this.setupListeners();
    this.navigate(window.location.pathname);
  }
  setupRoutes() {
    this.routes.set("/", "register-component");
    this.routes.set("/Log-in", "login-component");
    this.routes.set("/menu", "menu-component");
    this.routes.set("/personal-dates", "personaldates-component");
    this.routes.set("/changepass-dates", "changepass-component");
    this.routes.set("/home", "home-component");
    this.routes.set("/nearby", "nearby-component");
    this.routes.set("/myReports", "my-reports-component");
    this.routes.set("/advises-reports", "myadvise-component");
    this.routes.set("/create-report", "create-report-component");
  }
  setupListeners() {
    // Interceptar clicks en links
    document.addEventListener("click", (e) => {
      const target = e.target;
      const link = target.closest("a");
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const path = new URL(link.href).pathname;
        this.navigate(path);
      }
    });
    // Manejar navegación con history API
    window.addEventListener("popstate", () => {
      this.navigate(window.location.pathname, false);
    });
  }
  navigate(path, pushState = true) {
    if (pushState) {
      window.history.pushState({}, "", path);
    }
    const componentName = this.routes.get(path);
    if (!componentName) {
      console.error(`No se encontró ruta para: ${path}`);
      this.navigate("/", true);
      return;
    }
    this.rootElement.innerHTML = "";
    const component = document.createElement(componentName);
    this.rootElement.appendChild(component);
  }
}
(function main() {
  const root = document.querySelector("#root");
  if (!root) {
    console.error("El elemento #root no se encontró en el DOM.");
    return;
  }
  new SimpleRouter(root);
})();
