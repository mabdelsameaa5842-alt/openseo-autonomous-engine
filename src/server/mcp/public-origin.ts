function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function getForwardedProtocol(request: Request) {
  const protocol = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  return protocol === "http" || protocol === "https" ? protocol : null;
}

export function getPublicOrigin(request: Request) {
  const host = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const protocol = getForwardedProtocol(request) || "https";

  if (host) {
    try {
      return new URL(`${protocol}://${host}`).origin;
    } catch {
      // fall back to request url
    }
  }

  const url = new URL(request.url);
  return url.origin;
}

export function requestWithPublicOrigin(request: Request) {
  const url = new URL(request.url);
  const publicOrigin = getPublicOrigin(request);

  if (url.origin === publicOrigin) {
    return request;
  }

  const publicUrl = new URL(
    `${url.pathname}${url.search}${url.hash}`,
    publicOrigin,
  );
  return new Request(publicUrl, request);
}
