import * as Sequelize from "sequelize";
import sequelize from "./Connection";

export interface MasterLocationAttributes {
    ip_from?: Number;
    ip_to?: Number;
    country_code?: string;
    country_name?: string;
    region_name?: string;
    city_name?: string;
    latitude?: Number;
    longitude?: Number;
    zip_code?: string;
}

export interface MasterLocationInstance extends Sequelize.Instance<MasterLocationAttributes> {
    ip_from?: Number;
    ip_to?: Number;
    country_code?: string;
    country_name?: string;
    region_name?: string;
    city_name?: string;
    latitude?: Number;
    longitude?: Number;
    zip_code?: string;
}

const MasterLocation = sequelize.define<MasterLocationInstance, MasterLocationAttributes>('MasterLocation', {
    ip_from: Sequelize.INTEGER,
    ip_to: Sequelize.INTEGER,
    country_code: Sequelize.STRING(2),
    country_name: Sequelize.STRING(64),
    region_name: Sequelize.STRING(128),
    city_name: Sequelize.STRING(128),
    latitude: Sequelize.DOUBLE,
    longitude: Sequelize.DOUBLE,
    zip_code: Sequelize.STRING(30)
}, {
    tableName: 'cmc_master_location',
    timestamps: false
});

export default MasterLocation;
