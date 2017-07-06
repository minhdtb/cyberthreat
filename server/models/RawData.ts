import * as Sequelize from "sequelize";
import sequelize from "./Connection";

export interface DataAttributes {
    name?: string;
    domain?: string;
    publicIP?: string;
    location?: string;
    remoteHost?: string;
    macAddress?: string;
    regionCode?: string;
    countryCode?: string;
}

export interface DataInstance extends Sequelize.Instance<DataAttributes> {
    createdAt: Date
    updatedAt: Date
    name?: string;
    domain?: string;
    publicIP?: string;
    location?: string;
    remoteHost?: string;
    macAddress?: string;
    regionCode?: string;
    countryCode?: string;
}

const RawData = sequelize.define<DataInstance, DataAttributes>('Data', {
    name: Sequelize.STRING(255),
    domain: Sequelize.STRING(255),
    publicIP: Sequelize.STRING(32),
    location: Sequelize.STRING(255),
    remoteHost: Sequelize.STRING(255),
    macAddress: Sequelize.STRING(17),
    regionCode: Sequelize.STRING(8),
    countryCode: Sequelize.STRING(8)
});

export default RawData;