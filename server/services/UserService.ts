import User from "../models/User";

export default class UserService {
    static create(username, password) {
        User.sync({force: true}).then(() => {
            let user = User.create({
                username: username,
                password: password
            });

            console.log(user);
        });
    }
}