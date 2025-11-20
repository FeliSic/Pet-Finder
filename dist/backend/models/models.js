"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = exports.Pet = exports.User = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../controllers/db/db"));
// ============================================
// USER MODEL
// ============================================
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    modelName: 'User',
    tableName: 'Users',
});
class Pet extends sequelize_1.Model {
}
exports.Pet = Pet;
Pet.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    bio: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lastSeenLocation: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "lost",
        validate: {
            isIn: [['lost', 'found']],
        },
    },
    imgUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'id',
        },
        allowNull: false,
    },
    // Agregá estos dos para que TypeScript no se queje
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: db_1.default,
    modelName: "Pet",
    tableName: 'Pets',
    timestamps: true
});
User.hasMany(Pet, { as: 'Pets', foreignKey: 'userId' });
Pet.belongsTo(User, { foreignKey: 'userId' });
// ============================================
// REPORT MODEL
// ============================================
class Report extends sequelize_1.Model {
}
exports.Report = Report;
Report.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    reporterName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    reporterPhone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    location: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    petId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Pets',
            key: 'id',
        },
    },
    ownerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
}, {
    sequelize: db_1.default,
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
db_1.default.sync({ force: true })
    .then(() => {
    console.log("All models were synchronized successfully.");
})
    .catch((error) => {
    console.error("Error synchronizing models:", error);
});
