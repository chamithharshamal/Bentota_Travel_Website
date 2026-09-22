import { routeHandlers } from "@/lib/server/content-handlers";
import type { IdContext } from "@/lib/server/crud";

export async function PUT(req: Request, ctx: IdContext) {
  return routeHandlers.update(req, ctx);
}

export async function DELETE(req: Request, ctx: IdContext) {
  return routeHandlers.remove(req, ctx);
}
