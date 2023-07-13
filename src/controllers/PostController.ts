import { DataSource, Repository } from "typeorm";
import { RequestHandler } from "express";
import { get_full_url } from "../utils/utils.js";
import User from "../entities/User.js";
import Post from "../entities/Post.js";
import Category from "../entities/Category.js";

/**
 * Контроллер, обрабатывающий запросы, связанные с сущностью Post
 */
export default class PostController {
  private _limit: number = 10;
  private _repository: Repository<Post>;

  public constructor(data_source: DataSource) {
    this._repository = data_source.getRepository(Post);
  }

  /**
   * Добавляет публикацию в базу данных
   * @param request
   * @param response
   */
  public create: RequestHandler = async (request, response) => {
    console.log(`[${new Date().toLocaleString()}]: POST ${get_full_url(request)}`);

    /*========== ВАЛИДАЦИЯ ДАННЫХ ==========*/
    const errors: string[] = [];

    if (!request.body.title || request.body.title.length === 0) {
      errors.push("Не указано название публикации!");
    }
    if (!request.body.content || request.body.content.length === 0) {
      errors.push("Публикация должна что-то содержать!");
    }
    if (!request.body.author_id) {
      errors.push("Публикация должна иметь автора!");
    }
    if (!request.body.categories || request.body.categories.length === 0) {
      errors.push("У публикации должна быть хотя бы 1 категория!");
    }

    if (errors.length !== 0) {
      response.status(400);

      response.json({
        errors: errors,
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: Указаны неверные данные для публикации!`);
      return;
    }

    /*========== ДОБАВЛЕНИЕ ПУБЛИКАЦИИ ==========*/
    const title: string = request.body.title;
    const content: string = request.body.content;
    const author_id: number = request.body.author_id;
    const categories: number[] = request.body.categories;

    const author: User = new User();
    author.user_id = author_id;

    const post_categories: Category[] = categories.map((category_id: number) => {
      const category: Category = new Category();
      category.category_id = category_id;
      return category;
    });

    const post: Post = new Post();

    post.title = title;
    post.content = content;
    post.author = author;
    post.categories = post_categories;

    try {
      const created_post: Post = await this._repository.save(post);

      response.status(201);
      response.json(created_post);

      console.log(`[${new Date().toLocaleString()}]: Публикация была успешно добавлена!`);
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
   * Возвращает список публикаций
   * @param request
   * @param response
   */
  public get_all: RequestHandler = async (request, response) => {
    console.log(`[${new Date().toLocaleString()}]: GET ${get_full_url(request)}`);

    let query: any = {
      select: {
        post_id: true,
        title: true,
        author: {
          user_id: true,
          username: true,
        },
        categories: {
          category_id: true,
          name: true,
        },
        created_at: true,
        updated_at: true,
      },
      relations: {
        author: true,
        categories: true,
      },
    };

    const page = parseInt(request.query.page as string);

    if (page && page > 0) {
      const offset: number = (page - 1) * this._limit;

      query.skip = offset;
      query.take = this._limit;
    }

    try {
      const posts: Post[] = await this._repository.find(query);

      response.status(200);
      response.json(posts);

      console.log(`[${new Date().toLocaleString()}]: Данные публикаций получены!`);
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
   * Возвращает данные указанной публикации
   * @param request
   * @param response
   */
  public get_one: RequestHandler = async (request, response) => {
    console.log(`[${new Date().toLocaleString()}]: GET ${get_full_url(request)}`);

    if (!request.params.id || !parseInt(request.params.id)) {
      response.status(404);

      response.json({
        errors: ["Некорректный идентификатор публикации!"],
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: Некорректный идентификатор публикации!`);
      return;
    }

    const post_id: number = parseInt(request.params.id);

    try {
      const post = await this._repository.findOne({
        relations: {
          author: true,
          categories: true,
        },
        select: {
          post_id: true,
          title: true,
          content: true,
          author: {
            user_id: true,
            username: true,
            email: true,
          },
          categories: {
            category_id: true,
            name: true,
          },
          created_at: true,
          updated_at: true,
        },
        where: {
          post_id: post_id,
        }
      });

      if (!post) {
        response.status(404);

        response.json({
          errors: [`Публикация с id = ${post_id} не найдена!`],
        });

        console.error(`[ERROR ${new Date().toLocaleString()}]: Публикация с id = ${post_id} не найдена!`);
        return;
      }

      response.status(200);
      response.json(post);

      console.log(`[${new Date().toLocaleString()}]: Данные публикации получены!`);
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
   * Обновляет данные указанной публикации
   * @param request
   * @param response
   */
  public update: RequestHandler = async (request, response) => {
    console.log(`[${new Date().toLocaleString()}]: PUT ${get_full_url(request)}`);

    if (!request.params.id || !parseInt(request.params.id)) {
      response.status(404);

      response.json({
        errors: ["Некорректный идентификатор публикации!"],
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: Некорректный идентификатор публикации!`);
      return;
    }

    const post: Post = new Post();
    post.post_id = parseInt(request.params.id);

    if (request.body.title && request.body.title.length !== 0) {
      post.title = request.body.title;
    }
    if (request.body.content && request.body.content.length !== 0) {
      post.content = request.body.content;
    }
    if (request.body.author_id && parseInt(request.body.author_id)) {
      const author: User = new User();

      author.user_id = parseInt(request.body.author_id);
      post.author = author;
    }
    if (request.body.categories && request.body.categories.length !== 0) {
      const post_categories: Category[] = request.body.categories.map((category_id: number) => {
        const category: Category = new Category();
        category.category_id = category_id;
        return category;
      });

      post.categories = post_categories;
    }

    try {
      const updated_post = await this._repository.save(post);

      response.status(200);
      response.json(updated_post);

      console.log(`[${new Date().toLocaleString()}]: Данные публикации были успешно обновлены!`);
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
   * Удаляет данные публикации из базы данных
   * @param request
   * @param response
   * @returns
   */
  public delete: RequestHandler = async (request, response) => {
    console.log(`[${new Date().toLocaleString()}]: DELETE ${get_full_url(request)}`);

    if (!request.params.id || !parseInt(request.params.id)) {
      response.status(404);

      response.json({
        errors: ["Некорректный идентификатор публикации!"],
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: Некорректный идентификатор публикации!`);
      return;
    }

    const delete_result = await this._repository.delete(request.params.id);

    if (delete_result.affected === 0) {
      response.status(404);

      response.json({
        errors: [`Публикация с id = ${request.params.id} не найдена!`],
      });

      console.error(`[ERROR ${new Date().toLocaleString()}]: Публикация с id = ${request.params.id} не найдена!`);
      return;
    }

    response.status(200);
    response.json(delete_result);

    console.log(`[${new Date().toLocaleString()}]: Удаление публикации с id = ${request.params.id} прошло успешно!`);
  }
}
