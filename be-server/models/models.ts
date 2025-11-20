import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../controllers/db/db";


// ============================================
// USER MODEL
// ============================================

export class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string ;
  public password!: string;
  public location!: Object;
  public createdAt!: Date;
  public updatedAt!: Date;
} 

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
  type: DataTypes.JSON,
  allowNull: true,
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'Users',
});


// ============================================
// PET MODEL
// ============================================

// Interfaz con todos los atributos
interface PetAttributes {
  id: number;
  name: string;
  bio: string;
  lastSeenLocation: {
    name: string;
    lat: number;
    lng: number;
  };
  status: string;
  imgUrl: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PetCreationAttributes extends Optional<PetAttributes, 'id' | 'createdAt' | 'updatedAt'> {}


export class Pet extends Model<PetAttributes, PetCreationAttributes> implements PetAttributes {
  public id!: number;
  public name!: string;
  public bio!: string ;
  public lastSeenLocation!: {
    name: string;
    lat: number;
    lng: number;
  };
  public status!: string;
  public imgUrl!: string;
  public userId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
} 

Pet.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastSeenLocation: {
  type: DataTypes.JSON,
  allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "lost",
    validate: {
      isIn: [['lost', 'found']],
    },
  },
    imgUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users',
      key: 'id',
    },
    allowNull: false,
  },
    // Agregá estos dos para que TypeScript no se queje
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
},
 {
  sequelize,
  modelName: "Pet",
  tableName: 'Pets',
  timestamps: true
});

User.hasMany(Pet, { as: 'Pets', foreignKey: 'userId' });
Pet.belongsTo(User, { foreignKey: 'userId' });


// ============================================
// REPORT MODEL
// ============================================

export class Report extends Model {
  public id!: number;
  public reporterName!: string;
  public reporterPhone!: number;
  public message!: string;
  public location!: Object;
  public petId!: number;
  public ownerId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
} 

Report.init({
  id: { 
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  reporterName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  reporterPhone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  petId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Pets',
      key: 'id',
    },
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: "Report",
  tableName: 'Reports',
  timestamps: true,
});

// Relaciones de Report
Pet.hasMany(Report, { foreignKey: 'petId', as: 'Reports' });
Report.belongsTo(Pet, { foreignKey: 'petId' });

User.hasMany(Report, { foreignKey: 'ownerId', as: 'ReceivedReports' });
Report.belongsTo(User, { foreignKey: 'ownerId', as: 'Owner' });


// ============================================
// SYNC MODELS WITH DB
// ============================================ 

sequelize.sync({ force: true })
  .then(() => {
    console.log("All models were synchronized successfully."); 
  })
  .catch((error) => {
    console.error("Error synchronizing models:", error);
  });