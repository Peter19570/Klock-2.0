export class ApiError extends Error {
  detail: string;

  constructor(genericMsg: string, detail?: string) {
    super(genericMsg);
    this.name = "ApiError";
    this.detail = detail ?? genericMsg;
  }
}

interface ApiEnvelope<T> {
  msg?: string;
  data?: T;
}

export async function parseApiResponse<T>(res: Response): Promise<T> {
  let body: ApiEnvelope<unknown> | null = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const generic = body?.msg ?? `Request failed (${res.status})`;
    const detail =
      typeof body?.data === "string" && body.data.length > 0
        ? body.data
        : generic;
    throw new ApiError(generic, detail);
  }

  return (body?.data ?? undefined) as T;
}