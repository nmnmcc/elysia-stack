const backendUrl = process.env["BACKEND_URL"];

const config = {
  backend: {
    url: backendUrl ? new URL(backendUrl) : undefined,
  },
} satisfies {
  readonly backend: {
    readonly url: URL | undefined;
  };
};

export default config;
