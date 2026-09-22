import { destinationHandlers } from "@/lib/server/content-handlers";

export async function POST(req: Request) {
  return destinationHandlers.create(req);
}
