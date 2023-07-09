import { Repository, DataSource } from "typeorm";
import { RequestHandler } from "express";
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
    console.log(`[${new Date().toLocaleString()}]: POST /api/v1/users/`);

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
    console.log(`[${new Date().toLocaleString()}]: GET /api/v1/users/`);

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
}
