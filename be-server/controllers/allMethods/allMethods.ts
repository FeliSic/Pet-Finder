import { User, Pet, Report } from "../../models/models";
import { Jwt } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail } from "./resend";   


// ============================================
// USER METHODS
// ============================================

// Create a new user
export const createUser = async (userData: any) => {
  try { 
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await User.create({
      ...userData,
      password: hashedPassword,
    });
    return newUser;
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const user = await User.findOne({ where: { email } });  
    if (!user) {
      throw new Error("User not found");
    } 
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    return user;
  } catch (error) {
    throw error;
  }
};


// Get user by ID
export const getUserById = async (id: number) => {
  try {
    const user = await User.findByPk(id);
    return user;
  } catch (error) {
    throw error;
  }
};




// Update Password user by ID


// Cambiar contraseña
export const changePassword = async (
  userId: number, 
  currentPassword: string, 
  newPassword: string
) => {
  const user = await User.findByPk(userId);
  
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Verificar contraseña actual
  if (currentPassword) {
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new Error('Contraseña actual incorrecta');
    }
  }

  // Hashear la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Actualizar
  await user.update({ password: hashedPassword });

  return { 
    message: 'Contraseña actualizada correctamente',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      updatedAt: user.updatedAt
    }
  };
};


// Actualizar otros datos del usuario
export const updateUser = async (userId: number, updateData: any) => {
  const user = await User.findByPk(userId);
  
  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Actualizar solo los campos permitidos
  const allowedFields = ['name', 'email', 'location'];
  const filteredData: any = {};
  
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }

  await user.update(filteredData);

  return {
    message: 'Usuario actualizado correctamente',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      location: user.location,
      updatedAt: user.updatedAt
    }
  };
};


// ============================================
// PET METHODS
// ============================================



// Create a new pet
interface CreatePetData {
  userId: number;
  name: string;
  bio: string;
  lastSeenLocation: {
    name: string;
    lat: number;
    lng: number;
  };
  status: string;
  imgUrl: string;
}



// Crear un nuevo reporte de mascota
export const createPet = async (petData: Pet) => {
  try {
    // Verificar que el usuario existe
    const user = await User.findByPk(petData.userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const newPet = await Pet.create(petData);

    return {
      message: 'Reporte de mascota creado exitosamente',
      pet: {
        id: newPet.id,
        userId: newPet.userId,
        name: newPet.name,
        bio: newPet.bio,
        lastSeenLocation: newPet.lastSeenLocation,
        status: newPet.status,
        imgUrl: newPet.imgUrl,
        createdAt: newPet.createdAt,
        updatedAt: newPet.updatedAt,
      },
    };
  } catch (error) {
    throw error;
  }
};

// Obtener todos los reportes de un usuario
export const getPetsByUserId = async (userId: number) => {
  try {
    const pets = await Pet.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']], // Más recientes primero
    });

    return {
      message: 'Reportes obtenidos exitosamente',
      pets,
      count: pets.length,
    };
  } catch (error) {
    throw error;
  }
};

// Obtener un reporte específico por ID
export const getPetById = async (petId: number, userId: number) => {
  try {
    const pet = await Pet.findOne({
      where: { id: petId, userId }, // Verificar que pertenezca al usuario
    });

    if (!pet) {
      throw new Error('Reporte no encontrado o no tienes acceso');
    }

    return pet;
  } catch (error) {
    throw error;
  }
};

// Actualizar un reporte
export const updatePet = async (petId: number, userId: number, updateData: Partial<CreatePetData>) => {
  try {
    const pet = await Pet.findOne({
      where: { id: petId, userId },
    });

    if (!pet) {
      throw new Error('Reporte no encontrado o no tienes acceso');
    }

    await pet.update(updateData);

    return {
      message: 'Reporte actualizado exitosamente',
      pet,
    };
  } catch (error) {
    throw error;
  }
};

// Eliminar un reporte
export const deletePet = async (petId: number, userId: number) => {
  try {
    const pet = await Pet.findOne({
      where: { id: petId, userId },
    });

    if (!pet) {
      throw new Error('Reporte no encontrado o no tienes acceso');
    }

    await pet.destroy();

    return {
      message: 'Reporte eliminado exitosamente',
    };
  } catch (error) {
    throw error;
  }
};

// Obtener todos los reportes (para mapa general - opcional)
export const getAllPets = async (status?: 'lost' | 'found') => {
  try {
    const whereClause = status ? { status } : {};
    
    const pets = await Pet.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'], // Solo info necesaria
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return {
      message: 'Reportes obtenidos exitosamente',
      pets,
      count: pets.length,
    };
  } catch (error) {
    throw error;
  }
};

// ============================================
// REPORTS METHODS
// ============================================

interface CreateReportData {
  reporterName: string;
  reporterPhone: string;
  message: string;
  location: string;
  petId: number;
}

// Crear un nuevo reporte de avistaje
export const createReport = async (reportData: CreateReportData) => {
  try {
    // 1. Buscar la mascota y verificar que existe
    const pet = await Pet.findByPk(reportData.petId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!pet) {
      throw new Error('Mascota no encontrada');
    }

    const owner = (pet as any).user;
    if (!owner) {
      throw new Error('No se pudo encontrar al dueño de la mascota');
    }

    // 2. Crear el reporte en la base de datos
    const newReport = await Report.create({
      reporterName: reportData.reporterName,
      reporterPhone: reportData.reporterPhone,
      message: reportData.message || 'Sin mensaje adicional',
      location: reportData.location,
      petId: reportData.petId,
      ownerId: owner.id,
    });

    // 3. Enviar email al dueño
    try {
      await sendEmail({
        to: owner.email,
        subject: `🐾 ¡Alguien vio a ${pet.name}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
            <h1 style="color: #5982FF; text-align: center;">¡Buenas noticias, ${owner.name}!</h1>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #FF7D7D; margin-top: 0;">🎉 ¡Alguien reportó haber visto a ${pet.name}!</h2>
              
              <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; margin: 15px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">📞 Información de contacto:</h3>
                <p style="margin: 5px 0;"><strong>Nombre:</strong> ${reportData.reporterName}</p>
                <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${reportData.reporterPhone}</p>
                <p style="margin: 5px 0;"><strong>Ubicación del avistaje:</strong> ${reportData.location}</p>
              </div>

              ${reportData.message ? `
                <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0;">
                  <h3 style="color: #e65100; margin-top: 0;">💬 Mensaje del reportante:</h3>
                  <p style="margin: 0; color: #555;">${reportData.message}</p>
                </div>
              ` : ''}

              <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  <strong>⏰ Fecha del reporte:</strong> ${new Date().toLocaleString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #666; font-size: 14px;">
                Te recomendamos contactar al reportante lo antes posible.
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 20px;">
                Este email fue enviado automáticamente por Pet Finder App
              </p>
            </div>
          </div>
        `,
      });

      console.log(`✅ Email enviado a ${owner.email}`);
    } catch (emailError) {
      console.error('❌ Error al enviar email:', emailError);
      // No lanzar error, el reporte ya se guardó
    }

    return {
      message: 'Reporte creado exitosamente',
      report: {
        id: newReport.id,
        reporterName: newReport.reporterName,
        reporterPhone: newReport.reporterPhone,
        message: newReport.message,
        location: newReport.location,
        petId: newReport.petId,
        ownerId: newReport.ownerId,
        createdAt: newReport.createdAt,
      },
    };
  } catch (error) {
    throw error;
  }
};

// Obtener todos los reportes de un dueño (mascotas que le reportaron)
export const getReportsByOwnerId = async (ownerId: number) => {
  try {
    const reports = await Report.findAll({
      where: { ownerId },
      include: [
        {
          model: Pet,
          attributes: ['id', 'name', 'imgUrl', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return {
      message: 'Reportes obtenidos exitosamente',
      reports,
      count: reports.length,
    };
  } catch (error) {
    throw error;
  }
};

// Obtener reportes de una mascota específica
export const getReportsByPetId = async (petId: number, userId: number) => {
  try {
    // Verificar que la mascota pertenezca al usuario
    const pet = await Pet.findOne({
      where: { id: petId, userId },
    });

    if (!pet) {
      throw new Error('Mascota no encontrada o no tienes acceso');
    }

    const reports = await Report.findAll({
      where: { petId },
      order: [['createdAt', 'DESC']],
    });

    return {
      message: 'Reportes obtenidos exitosamente',
      reports,
      count: reports.length,
    };
  } catch (error) {
    throw error;
  }
};

