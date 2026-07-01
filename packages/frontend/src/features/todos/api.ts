import { api } from "@/lib/api-client";

const PAGE_SIZE = 25;

export async function listTodos() {
  const { data, error } = await api.api.todos.get({
    query: { limit: PAGE_SIZE, offset: 0 },
  });

  if (error) throw error;
  return data;
}

export async function createTodo(title: string) {
  const { data, error } = await api.api.todos.post({ title });

  if (error) throw error;
  return data;
}

export async function updateTodo(input: { readonly id: string; readonly isCompleted: boolean }) {
  const { data, error } = await api.api.todos({ id: input.id }).patch({
    isCompleted: input.isCompleted,
  });

  if (error) throw error;
  return data;
}

export async function deleteTodo(id: string) {
  const { error } = await api.api.todos({ id }).delete();

  if (error) throw error;
}
