import "reflect-metadata";
import { DataSource } from "typeorm";
import User from "./entities/User.js";

const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "alastor_cool",
  database: "ts-api",
  entities: [User],
  synchronize: true,
  logging: true,
});

AppDataSource
  .initialize()
  .then(() => {
    console.log(`[${new Date().toLocaleString()}]: Подключение к базе данных прошло успешно!`)
  })
  .catch((error: Error) => {
    console.error(`[ERROR ${new Date().toLocaleString()}]: ${error.message}`);
  });

export default AppDataSource;
