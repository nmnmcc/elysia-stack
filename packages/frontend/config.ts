const backendUrl = process.env["BACKEND_URL"];

export default {
  backend: {
    url: backendUrl ? new URL(backendUrl) : undefined,
  },
} as const;
