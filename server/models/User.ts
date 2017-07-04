import * as Sequelize from "sequelize";
import sequelize from "./Connection";

export interface UserAttributes {
    username?: string;
    password?: string;
    email?: string;
    role?: number;
}

export interface UserInstance extends Sequelize.Instance<UserAttributes> {
    createdAt: Date
    updatedAt: Date
    username?: string;
    password?: string;
    email?: string;
    role?: number;
}

const User = sequelize.define<UserInstance, UserAttributes>('User', {
    username: Sequelize.STRING(255),
    password: Sequelize.STRING(50),
    email: Sequelize.STRING(50),
    role: Sequelize.INTEGER
});

export default User;
