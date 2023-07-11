import { Repository, DataSource } from "typeorm";
import { RequestHandler } from "express";
import { get_full_url } from "../utils/utils.js";
import argon2 from "argon2";
import User from "../entities/User.js";

/**
 * Контроллер, обрабатывающий все запросы, связанные с сущностью User
 */
export default class UserController {
  private _limit: number = 15;
  private _repository: Repository<User>;

  public constructor(data_source: DataSource) {
    this._repository = data_source.getRepository(User);
  }

  /**
   * Добавляет пользователя в базу данных
   * @param request
   * @param response
   * @returns
   */
  public create: RequestHandler = async (request, response) => {
    console.log(`[${new Date().toLocaleString()}]: POST ${get_full_url(request)}`);

    const username: string = request.body.username;
    const email: string = request.body.email;
    const password: string = request.body.password;

    /*========== ВАЛИДАЦИЯ ДАННЫХ ==========*/
    const errors: string[] = [];

    if (!username || username.length === 0) {
      errors.push("Не указано имя пользователя!");
    }
    if (!email || email.length === 0) {
      errors.push("Не указан email!");
    }
    if (!password || password.length === 0) {
      errors.push("Не указан пароль пользователя!");
    }
    else if (password.length < 6) {
      errors.push("Пароль должен содержать не менее 6 символов!");
    }

    // проверка на существующее имя пользователя
    const same_username_users: User[] = await this._repository.find({
      where: {
        username: username,
      },
    });

    if (same_username_users.length !== 0) {
      errors.push(`Имя ${username} уже занято!`);
    }

    if (errors.length !== 0) {
      response.status(400);

      response.json({
        errors: errors,
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: Пользователь выполнил неверный запрос!`);
      return;
    }

    /*========== ДОБАВЛЕНИЕ ДАННЫХ В БД ==========*/
    const user: User = new User();
    const hashed_password: string = await argon2.hash(password);

    user.username = username;
    user.email = email;
    user.password = hashed_password;

    try {
      const added_user = await this._repository.save(user);

      response.status(201);
      response.json(added_user);

      console.log(`[${new Date().toLocaleString()}]: Данные пользователя добавлены в БД!`);
    }
    catch (error) {
      response.json(500);

      response.json({
        errors: [error.message],
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: ${error.message}`);
    }
  }

  /**
   * Возвращает список пользователей из базы данных
   * @param request
   * @param response
   */
  public get_all: RequestHandler = async (request, response) => {
    console.log(`[${new Date().toLocaleString()}]: GET ${get_full_url(request)}`);

    let query: any = {
      select: {
        user_id: true,
        username: true,
        email: true,
        created_at: true,
        updated_at: true,
      },
    };

    const page = parseInt(request.query.page as string);

    if (page && page > 0) {
      const offset: number = (page - 1) * this._limit;

      query.skip = offset;
      query.take = this._limit;
    }

    try {
      const users: User[] = await this._repository.find(query);

      response.status(200);
      response.json(users);

      console.log(`[${new Date().toLocaleString()}]: Данные пользователей получены!`);
    }
    catch (error) {
      response.status(500);

      response.json({
        errors: [error.message],
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: ${error.message}`);
    }
  }

  /**
   * Возвращает данные указанного пользователя
   * @param request
   * @param response
   */
  public get_one: RequestHandler = async (request, response) => {
    console.log(`[${new Date().toLocaleString()}]: GET ${get_full_url(request)}`);

    if (!request.params.id || !parseInt(request.params.id)) {
      response.status(404);

      response.json({
        errors: ["Некорректный идентификатор пользователя!"],
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: Некорректный идентификатор пользователя!`);
      return;
    }

    const user_id: number = parseInt(request.params.id);

    try {
      const user = await this._repository.findOneBy({
        user_id: user_id,
      });

      if (!user) {
        response.status(404);

        response.json({
          errors: [`Пользователь с id = ${user_id} не найден!`],
        });

        console.error(`[ERROR ${new Date().toLocaleString()}]: Пользователь с id = ${user_id} не найден!`);
        return;
      }

      response.status(200);
      response.json(user);

      console.error(`[${new Date().toLocaleString()}]: Данные пользователя были успешно получены!`);
    }
    catch (error) {
      response.status(500);

      response.json({
        errors: [error.message],
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: ${error.message}`);
    }
  }

  /**
   * Обновляет данные указанного пользователя
   * @param request
   * @param response
   */
  public update: RequestHandler = async (request, response) => {
    console.log(`[${new Date().toLocaleString()}]: PUT ${get_full_url(request)}`);

    if (!request.params.id || !parseInt(request.params.id)) {
      response.status(404);

      response.json({
        errors: ["Некорректный идентификатор пользователя!"],
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: Некорректный идентификатор пользователя!`);
      return;
    }

    const user: User = new User();
    user.user_id = parseInt(request.params.id);

    if (request.body.username && request.body.username.length !== 0) {
      user.username = request.body.username;
    }
    if (request.body.email && request.body.email.length !== 0) {
      user.email = request.body.email;
    }
    if (request.body.password && request.body.password.length !== 0) {
      const hashed_password = await argon2.hash(request.body.password);
      user.password = hashed_password;
    }

    try {
      const updated_user = await this._repository.save(user);

      response.status(200);
      response.json(updated_user);

      console.log(`[${new Date().toLocaleString()}]: Обновление пользователя с id = ${user.user_id} прошло успешно!`);
    }
    catch (error) {
      response.status(500);

      response.json({
        errors: [error.message],
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: ${error.message}`);
    }
  }

  /**
   * Удаляет данные указанного пользователя из базы данных
   * @param request
   * @param response
   */
  public delete: RequestHandler = async (request, response) => {
    console.log(`[${new Date().toLocaleString()}]: DELETE ${get_full_url(request)}`);

    if (!request.params.id || !parseInt(request.params.id)) {
      response.status(404);

      response.json({
        errors: ["Некорректный идентификатор пользователя!"],
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: Некорректный идентификатор пользователя!`);
      return;
    }

    const delete_result = await this._repository.delete(request.params.id);

    if (delete_result.affected === 0) {
      response.status(404);

      response.json({
        errors: [`Пользователь с id = ${request.params.id} не найден!`],
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: Пользователь с id = ${request.params.id} не найден!`);
      return;
    }

    response.status(200);
    response.json(delete_result);

    console.log(`[${new Date().toLocaleString()}]: Удаление пользователя с id = ${request.params.id} прошло успешно!`);
  }

  /**
   * Выполняет проверку данных пользователя для авторизации
   * @param request
   * @param response
   */
  public login: RequestHandler = async (request, response) => {
    console.log(`[${new Date().toLocaleString()}]: POST ${get_full_url(request)}`);

    /*========== ВАЛИДАЦИЯ ДАННЫХ ==========*/
    const errors: string[] = [];

    if (!request.body.username_or_email || request.body.username_or_email.length === 0) {
      errors.push("Не заполнено поле \"Имя пользователя или email\"!");
    }
    if (!request.body.password || request.body.password.length === 0) {
      errors.push("Не заполнено поле \"Пароль\"!");
    }

    if (errors.length !== 0) {
      response.status(400);

      response.json({
        errors: errors,
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: Пользователь не заполнил обязательные поля!`);
      return;
    }

    const username_or_email: string = request.body.username_or_email;
    const password: string = request.body.password;

    /*========== ПРОВЕРКА ДАННЫХ ПОЛЬЗОВАТЕЛЯ ==========*/
    const field: string = (username_or_email.includes("@")) ? "email" : "username";
    const user = await this._repository.findOneBy({ [field]: username_or_email });

    if (!user) {
      response.status(403);

      response.json({
        login: false,
        message: `Пользователь с именем или email \"${username_or_email}\" не найден!`,
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: Пользователь ввёл неверное имя или неверный email!`);
      return;
    }

    const verification_result: boolean = await argon2.verify(user.password, password);

    if (!verification_result) {
      response.status(403);

      response.json({
        login: false,
        message: `Неправильный пароль!`,
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: Пользователь ввёл неправильный пароль!`);
      return;
    }

    response.status(200);

    response.json({
      login: true,
      message: `Авторизация прошла успешно!`,
    });

    console.log(`[${new Date().toLocaleString()}]: Авторизация прошла успешно!`);
  }
}
