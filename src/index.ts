import express from "express";
import user_router from "./routes/routes.user.js";

const PORT = 4000;

const main = async (): Promise<void> => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/v1/users/", user_router);

  app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}/`);
  });
}


main()
  .catch((error: Error) => {
    console.error(`[ERROR ${new Date().toLocaleString()}]: ${error.message}`);
  });
