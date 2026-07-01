import type { Auth } from "../../services/auth";

export async function getSession(auth: Auth, request: Request) {
  return auth.api.getSession({ headers: request.headers });
}
