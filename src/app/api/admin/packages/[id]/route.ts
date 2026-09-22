import { packageHandlers } from "@/lib/server/content-handlers";
import type { IdContext } from "@/lib/server/crud";

export async function PUT(req: Request, ctx: IdContext) {
  return packageHandlers.update(req, ctx);
}

export async function DELETE(req: Request, ctx: IdContext) {
  return packageHandlers.remove(req, ctx);
}
