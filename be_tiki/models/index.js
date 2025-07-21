import fs from "fs";
import path from "path";
import { Sequelize, DataTypes } from "sequelize";
import process from "process";
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
import config from "../config/config.js";
const currentConfig = config[env];

const db = {};

let sequelize;
if (currentConfig.url) {
  sequelize = new Sequelize(currentConfig.url, currentConfig);
} else {
  throw new Error(
    "Connection string (url) is required for PostgreSQL connection. Please check your environment variables and config/config.js."
  );
}

// Thu thập tất cả các promise từ việc import model
const modelPromises = fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .map(async (file) => {
    const modelPath = path.join(__dirname, file);
    const modelUrl = pathToFileURL(modelPath).href;
    const model = (await import(modelUrl)).default(
      sequelize,
      DataTypes
    );
    db[model.name] = model;
    
  });

// Chờ tất cả các model được load trước khi gọi associate
Promise.all(modelPromises).then(() => {
  
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
      
    }
  });
  
}).catch(err => {
  console.error("Error during model loading or association:", err);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
