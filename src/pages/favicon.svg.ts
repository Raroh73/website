import { svg } from "@utils/favicon";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  return new Response(await svg());
};
