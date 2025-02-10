// features/auth/model/login.js
import { getAllUsers } from "../../../entities/user/model/usersStorage";

export function loginFx({ login, password }) {
    const allUsers = getAllUsers();
    const foundUser = allUsers.find(
        (user) => user.login === login && user.password === password
    );
    if (!foundUser) {
        return null;
    }
    return foundUser;
}
