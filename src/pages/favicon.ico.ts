import { ico } from "@utils/favicon.ts";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  return new Response(await ico());
};
