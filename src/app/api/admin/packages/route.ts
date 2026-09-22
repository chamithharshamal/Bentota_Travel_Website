import { packageHandlers } from "@/lib/server/content-handlers";

export async function POST(req: Request) {
  return packageHandlers.create(req);
}
