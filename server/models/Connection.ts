import * as Sequelize from "sequelize";
const config = require('../../../config.json');
const sequelize = new Sequelize(config.database.dbname, config.database.dbuser, config.database.dbpassword);
export default sequelize;
