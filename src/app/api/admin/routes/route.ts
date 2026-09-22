import { routeHandlers } from "@/lib/server/content-handlers";

export async function POST(req: Request) {
  return routeHandlers.create(req);
}
