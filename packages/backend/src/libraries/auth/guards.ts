import type { Auth } from "../../services/auth";

type Session = NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>;

export type SessionGuardResult =
  | {
      readonly isAuthenticated: true;
      readonly session: Session;
    }
  | {
      readonly isAuthenticated: false;
    };

export async function requireSession(auth: Auth, request: Request): Promise<SessionGuardResult> {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return { isAuthenticated: false };
  }

  return { isAuthenticated: true, session };
}
