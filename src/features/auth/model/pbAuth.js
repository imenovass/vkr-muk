// features/auth/model/pbAuth.js

import { pb } from "../../../shared/config/pb";

// loginFx - функция, которую вызываем из LoginPage
export async function loginFx({ login, password }) {
    try {
        // Допустим, коллекция называется "users2"
        // Если называется иначе, подставьте своё имя
        const authData = await pb
            .collection("users2")
            .authWithPassword(login, password);
        // authData содержит:
        // {
        //   record: {...},  // вся инфа о пользователе (username, role и т.д.)
        //   token: "JWT-токен"
        // }

        return authData; // вернём наверх
    } catch (error) {
        console.error("Ошибка логина PocketBase:", error);
        return null; // если что-то не так, вернём null
    }
}
