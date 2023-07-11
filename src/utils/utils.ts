import { Request } from "express";

/**
 * Возвращает полный URL пользовательского запроса вместе с параметрами
 * @param request
 * @returns
 */
export const get_full_url = (request: Request) => {
  const protocol: string = request.protocol;
  const host: string = request.hostname;

  const url: string = request.originalUrl;
  const port = process.env.PORT || 4000;

  return `${protocol}://${host}:${port}${url}`;
}
