export function databaseAdapterUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  if (["127.0.0.1", "localhost", "::1"].includes(url.hostname)) {
    url.searchParams.set("allowPublicKeyRetrieval", "true");
  }
  return url.toString();
}
