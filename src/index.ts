import express from "express";

const PORT = 4000;

const main = async (): Promise<void> => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (_, response) => {
    response.json({
      message: "Всё работает!",
    });
  });

  app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}/`);
  });
}


main()
  .catch((error: Error) => {
    console.error(error.message);
  });
