import * as Sequelize from "sequelize";
import sequelize from "./Connection";

export interface DataAttributes {
    name?: string;
    domain?: string;
    publicIP?: string;
    location?: string;
    remoteHost?: string;
    macAddress?: string;
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
}

const User = sequelize.define<DataInstance, DataAttributes>('Data', {
    name: Sequelize.STRING(255),
    domain: Sequelize.STRING(255),
    publicIP: Sequelize.STRING(255),
    location: Sequelize.STRING(255),
    remoteHost: Sequelize.STRING(255),
    macAddress: Sequelize.STRING(255)
});

export default User;
