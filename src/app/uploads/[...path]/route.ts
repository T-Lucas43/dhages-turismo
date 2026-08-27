import { fileTypeFromBuffer } from "file-type";
import { storageProvider } from "@/lib/storage/local-storage-provider";

export async function GET(_request: Request, context: RouteContext<"/uploads/[...path]">) {
  try {
    const { path } = await context.params;
    const data = await storageProvider.read(path.join("/"));
    const type = await fileTypeFromBuffer(data);
    return new Response(new Uint8Array(data), { headers: { "Content-Type": type?.mime ?? "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return new Response("Mídia não encontrada.", { status: 404 });
  }
}
