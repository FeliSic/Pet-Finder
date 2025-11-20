"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const models_1 = require("../models/models");
const allMethods_1 = require("../controllers/allMethods/allMethods");
const path_1 = __importDefault(require("path"));
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(
  express_1.default.static(path_1.default.join(__dirname, "../../fe-client"))
); // Serve static files from the frontend build directory
// ============================================
// USER ENDPOINTS
// ============================================
app.post("/register", async (req, res) => {
  // Logic to create a new user
  const { name, email, password } = req.body;
  try {
    const newUser = await (0, allMethods_1.createUser)({
      name,
      email,
      password,
    });
    res.status(201).json({
      "Usuario y Auth creados": newUser,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.post("/login", async (req, res) => {
  // Logic to log in a user
  const { email, password } = req.body;
  try {
    const user = await (0, allMethods_1.loginUser)(email, password);
    res.status(200).json({
      "Usuario logueado": user,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.get("/users/:id", async (req, res) => {
  // Logic to get user by ID
  const userId = req.params.id;
  console.log(`User with ID: ${userId}`);
  try {
    const user = await (0, allMethods_1.getUserById)(Number(userId));
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
  res.status(200).send(`User with ID: ${req.params.id}`);
});
// Cambiar contraseña
app.put("/api/users/:id/password", async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;
  try {
    const result = await (0, allMethods_1.changePassword)(
      Number(userId),
      currentPassword,
      newPassword
    );
    res.status(200).json(result);
  } catch (error) {
    // Manejar diferentes tipos de errores
    if (error.message === "Usuario no encontrado") {
      res.status(404).json({ error: error.message });
    } else if (error.message === "Contraseña actual incorrecta") {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});
// Actualizar otros datos del usuario
app.put("/api/users/:id", async (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;
  try {
    // Prevenir actualización de contraseña por este endpoint
    if (updateData.password) {
      return res.status(400).json({
        error:
          "Use el endpoint /api/users/:id/password para cambiar la contraseña",
      });
    }
    const result = await (0, allMethods_1.updateUser)(
      Number(userId),
      updateData
    );
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Usuario no encontrado") {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});
// ============================================
// PETS ENDPOINTS
// ============================================
// Crear mascota
app.post("/post-pets", async (req, res) => {
  try {
    const pet = await (0, allMethods_1.createPet)(req.body);
    res.status(201).json(pet);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Obtener mascotas de un usuario
app.get("/users/:userId/pets", async (req, res) => {
  try {
    const pets = await (0, allMethods_1.getPetsByUserId)(
      Number(req.params.userId)
    );
    res.json(pets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Actualizar mascota
app.put("/users/:userId/pets/:petId", async (req, res) => {
  try {
    const updated = await (0, allMethods_1.updatePet)(
      Number(req.params.petId),
      Number(req.params.userId),
      req.body
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Eliminar mascota
app.delete("/users/:userId/pets/:petId", async (req, res) => {
  try {
    const deleted = await (0, allMethods_1.deletePet)(
      Number(req.params.petId),
      Number(req.params.userId)
    );
    res.json(deleted);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Obtener todas las mascotas (opcional filtro por status)
app.get("/pets", async (req, res) => {
  try {
    const status = req.query.status;
    const pets = await (0, allMethods_1.getAllPets)(
      status ? String(status) : undefined
    );
    res.json(pets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// ============================================
// REPORTS ENDPOINTS
// ============================================
// Crear un reporte de avistaje
app.post("/report/:petId", async (req, res) => {
  try {
    const petId = Number(req.params.petId);
    const { reporterName, reporterPhone, location, message } = req.body;
    if (!reporterName || !reporterPhone || !location) {
      return res.status(400).json({
        error: "Faltan datos requeridos: reporterName, reporterPhone, location",
      });
    }
    const result = await (0, allMethods_1.createReport)({
      reporterName,
      reporterPhone,
      location,
      message,
      petId,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error("Error en /report/:petId:", error);
    res.status(400).json({ error: error.message });
  }
});
// Obtener todos los reportes de un usuario (como dueño)
app.get("/users/:userId/reports", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const result = await (0, allMethods_1.getReportsByOwnerId)(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Obtener reportes de una mascota específica
app.get("/pets/:petId/reports", async (req, res) => {
  try {
    const petId = Number(req.params.petId);
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ error: "userId es requerido" });
    }
    const result = await (0, allMethods_1.getReportsByPetId)(petId, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// Buscar mascotas cercanas (nearby-pets)
app.post("/nearby-pets", async (req, res) => {
  try {
    const { lat, lng, radius } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ error: "lat y lng son requeridos" });
    }
    const radiusInKm = radius || 5; // Radio por defecto 5km
    // Obtener todas las mascotas perdidas
    const pets = await models_1.Pet.findAll({
      where: { status: "lost" },
      include: [
        {
          model: models_1.User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    // Filtrar mascotas dentro del radio
    const nearbyPets = pets.filter((pet) => {
      const petLat = pet.lastSeenLocation.lat;
      const petLng = pet.lastSeenLocation.lng;
      const distance = calculateDistance(lat, lng, petLat, petLng);
      return distance <= radiusInKm;
    });
    // Formatear respuesta
    const formattedPets = nearbyPets.map((pet) => ({
      id: pet.id,
      nombre: pet.name,
      bio: pet.bio,
      location: pet.lastSeenLocation,
      status: pet.status,
      img: pet.imgUrl,
      User: pet.user,
    }));
    res.status(200).json({
      pets: formattedPets,
      userLocation: { lat, lng },
      radius: radiusInKm,
    });
  } catch (error) {
    console.error("Error en /nearby-pets:", error);
    res.status(400).json({ error: error.message });
  }
});
// Función auxiliar para calcular distancia (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distancia en km
}
// ============================================
// EXPRESS CONNECTION
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
