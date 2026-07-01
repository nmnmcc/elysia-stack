export const todoQueryKeys = {
  all: () => ["todos"],
  list: () => ["todos", "list", { offset: 0 }],
  detail: (id: string) => ["todos", "detail", id],
};
