import { initHeader } from "../../../components/header/index.js";
class Login extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  render() {
    // Inicializar el header
    initHeader();
    // Quitar margin y padding del body
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    this.innerHTML = `
          <form class="profileForm" style="width: 400px; display: flex; flex-direction: column; gap: 20px; align-items: center; margin: 80px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: #f9f9f9;">
        <h1 style="color: #5982FF;">inicio de sesión</h1>
        <h3 style="text-align: center; color: #666;">Ingresá los siguientes datos para realizar el inicio de sesión</h3>
        
        <label for="Email" style="align-self: flex-start; font-weight: bold;">Email:</label>
        <input type="email" class="email" name="Email" required placeholder="ejemplo@email.com" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />

        <label for="Password" style="align-self: flex-start; font-weight: bold;">Contraseña:</label>
        <input type="password" class="password" name="Password" required placeholder="Mínimo 8 caracteres" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
        
        
        <a  href="/" style="text-decoration: none; color: #5982FF; align-self: center;">
          ¿No tenes una cuenta? Registrate
        </a>

        <button class="saveButton" type="submit" style="width: 100%; padding: 12px; background-color: #5982FF; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px;">
          Iniciar sesión
        </button>
        
        <div class="error-message" style="display: none; color: #FF4C4C; text-align: center; width: 100%;"></div>
      </form>
    
    `;
    // Después creás y agregás el header
    const header = document.createElement("custom-header");
    this.prepend(header); // Lo ponés arriba del form
    // Agregar el evento para el enlace de inicio de sesión
    const loginLink = this.querySelector("a");
    loginLink.addEventListener("click", (e) => {
      e.preventDefault(); // Evitar el comportamiento por defecto
      window.history.pushState({}, "", "/"); // Cambiar la URL
      window.dispatchEvent(new PopStateEvent("popstate")); // Disparar el evento
    });
    // Form User ---------------------------------------------------------------------------------------------------------------
    const formUser = this.querySelector(".profileForm");
    const email = this.querySelector(".email");
    const password = this.querySelector(".password");
    formUser.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailValue = email.value;
      const passwordValue = password.value;
      const data = {
        email: emailValue,
        password: passwordValue,
      };
      console.log("Datos a enviar:", data);
      try {
        const response = await fetch(
          "https://pet-finder-1.onrender.com/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) {
          throw new Error("Error al guardar el usuario");
        }
        const result = await response.json();
        console.log("Usuario :", result);
        // Navegar a /menu
        window.history.pushState({}, "", "/menu");
        window.dispatchEvent(new PopStateEvent("popstate"));
      } catch (error) {
        console.error("Error:", error);
      }
    });
  }
}
customElements.define("login-component", Login);
// -------------------------------------------------------------------------------------------------------------------------
/*

import Dropzone from "dropzone";
import 'dropzone/dist/dropzone.css';

// ⚠️ IMPORTANTE: Desactivar auto-discover
Dropzone.autoDiscover = false;

class Form extends HTMLElement {
  myDropzone: Dropzone | null = null;
  uploadedImageUrl: string = '';

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    if (this.myDropzone) {
      this.myDropzone.destroy();
      this.myDropzone = null;
    }
  }

  render() {
    this.innerHTML = `
      <form id="profileForm" style="width: 200px; display: flex; flex-direction: column; gap: 30px; align-items: center; margin: 0 auto;">
        <label for="name">Nombre:</label>
        <input type="text" id="name" name="nombre" required placeholder="John Doe.." style="width: 100%;" />

        <label for="bio">Bio:</label>
        <textarea id="bio" name="bio" rows="4" maxlength="200" style="resize:none; width: 100%;"></textarea>

        <label>Foto de perfil:</label>
        <div id="my-dropzone" style="width: 100%; min-height: 150px; border: 2px dashed #0066cc; border-radius: 8px; padding: 20px; text-align: center; background: #f0f8ff; cursor: pointer;">
          <p style="margin: 0; color: #666;">Arrastrá una imagen o hacé click para seleccionar</p>
        </div>

        <img class="profile-picture" src="" alt="Vista previa" style="max-width: 150px; max-height: 150px; display:none; border-radius: 8px;" />

        <button class="saveButton" type="submit" style="width: 100%;">Guardar</button>

        <input type="text" id="userId" name="Id de usuario" placeholder="coloca el userid para traer su info" style="width: 100%;" />

        <button class="getButton" type="button" style="width: 100%;">Obtener</button>
      </form>
    `;

    const form = this.querySelector('#profileForm') as HTMLFormElement;
    const name = this.querySelector('#name') as HTMLInputElement;
    const bio = this.querySelector('#bio') as HTMLTextAreaElement;
    const userIdInput = this.querySelector('#userId') as HTMLInputElement;
    const preview = this.querySelector('.profile-picture') as HTMLImageElement;
    const dropzoneElement = this.querySelector('#my-dropzone') as HTMLElement;

    // Limpiar instancia anterior si existe
    if (dropzoneElement && (dropzoneElement as any).dropzone) {
      (dropzoneElement as any).dropzone.destroy();
    }

    if (this.myDropzone) {
      this.myDropzone.destroy();
      this.myDropzone = null;
    }

    // Esperar un tick para asegurar que el DOM está listo
    setTimeout(() => {
      const componentContext = this;

      // Crear Dropzone
      this.myDropzone = new Dropzone(dropzoneElement, {
        url: "https://api.cloudinary.com/v1_1/dwn17shai/image/upload",
        method: "post",
        paramName: "file",
        maxFiles: 1,
        uploadMultiple: false,
        autoProcessQueue: false,
        acceptedFiles: 'image/*',
        addRemoveLinks: true,
        clickable: true,
        dictDefaultMessage: "Arrastrá una imagen o hacé click",
        dictRemoveFile: "✖ Eliminar",
        init: function(this: Dropzone) {
          console.log('✅ Dropzone inicializado');
          const dropzoneInstance = this;

          this.on("addedfile", (file) => {
            console.log("📎 Archivo agregado:", file.name);
            if (dropzoneInstance.files.length > 1) {
              dropzoneInstance.removeFile(dropzoneInstance.files[0]);
            }
          });

          this.on("thumbnail", (file, dataUrl) => {
            console.log("🖼️ Thumbnail generado");
            preview.src = dataUrl;
            preview.style.display = "block";
          });

          this.on("sending", (file, xhr, formData) => {
            console.log("📤 Enviando a Cloudinary...");
            formData.append('upload_preset', 'ml_unsigned_upload');
            console.log('📋 FormData upload_preset:', formData.get('upload_preset'));
          });

          this.on("success", (file, response: any) => {
            const imageUrl = response.secure_url;
            console.log("✅ Imagen subida a Cloudinary:", imageUrl);
            componentContext.uploadedImageUrl = imageUrl;
          });

          this.on("error", (file, errorMessage: any) => {
            console.error("❌ Error al subir:", errorMessage);
            alert(`Error al subir imagen: ${errorMessage.error?.message || errorMessage}`);
          });
        }
      });

      // Submit del formulario
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = name.value.trim();
        const biografia = bio.value.trim();

        if (!nombre) {
          alert('El nombre es requerido');
          return;
        }

        if (!this.myDropzone || this.myDropzone.files.length === 0) {
          alert('Por favor seleccioná una imagen');
          return;
        }

        try {
          console.log('📤 Subiendo imagen a Cloudinary...');
          
          this.uploadedImageUrl = '';

          this.myDropzone.processQueue();

          await new Promise((resolve, reject) => {
            const successHandler = () => {
              this.myDropzone!.off("success", successHandler);
              this.myDropzone!.off("error", errorHandler);
              resolve(true);
            };

            const errorHandler = (file: any, message: any) => {
              this.myDropzone!.off("success", successHandler);
              this.myDropzone!.off("error", errorHandler);
              reject(new Error(message.error?.message || message));
            };

            this.myDropzone!.on("success", successHandler);
            this.myDropzone!.on("error", errorHandler);
          });

          if (!this.uploadedImageUrl) {
            throw new Error('No se pudo obtener la URL de la imagen');
          }

          console.log('💾 Guardando perfil...');

          const data = {
            nombre,
            bio: biografia,
            img: this.uploadedImageUrl
          };

          console.log('Datos a enviar:', data);

          const response = await fetch('http://localhost:3000/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al guardar el perfil');
          }

          const result = await response.json();
          console.log('✅ Perfil guardado:', result);
          alert(`✅ Perfil guardado exitosamente!\nID: ${result.id}`);

          form.reset();
          this.myDropzone.removeAllFiles();
          this.uploadedImageUrl = '';
          preview.style.display = 'none';

        } catch (error: any) {
          console.error('❌ Error:', error);
          alert(`Error: ${error.message}`);
        }
      });

      // Botón obtener perfil
      const getButton = this.querySelector('.getButton') as HTMLButtonElement;
      getButton.addEventListener('click', async () => {
        const userId = userIdInput.value.trim();

        if (!userId) {
          alert('Ingresá un ID de usuario');
          return;
        }

        try {
          console.log(`🔍 Buscando usuario ${userId}...`);

          const response = await fetch(`http://localhost:3000/profile/${userId}`, {
            method: 'GET',
          });

          if (!response.ok) {
            throw new Error('Usuario no encontrado');
          }

          const data = await response.json();
          name.value = data.nombre;
          bio.value = data.bio;
          preview.src = data.img;
          preview.style.display = 'block';

          console.log('✅ Perfil obtenido:', data);
          alert('✅ Perfil cargado exitosamente!');

        } catch (error: any) {
          console.error('❌ Error:', error);
          alert(`Error: ${error.message}`);
        }
      });

    }, 0);
  }
}

customElements.define('profile-form', Form);

const root = document.getElementById('root');
if (root) {
  const profileForm = document.createElement('profile-form');
  root.appendChild(profileForm);
} else {
  console.error('El elemento con id "root" no se encontró.');
}


*/
