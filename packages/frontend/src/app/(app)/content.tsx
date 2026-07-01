"use client";

import { api } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, Loader2Icon, PlusIcon, TrashIcon } from "lucide-react";
import { useCallback, useState, type FormEvent } from "react";

const PAGE_SIZE = 25;
const todosKey = ["todos"] as const;

export function TodosContent() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const [newTitle, setNewTitle] = useState("");

  const todos = useQuery({
    queryKey: [...todosKey, { offset: 0 }],
    queryFn: async () => {
      const { data, error } = await api.api.todos.get({
        query: { limit: PAGE_SIZE, offset: 0 },
      });

      if (error) throw error;
      return data;
    },
  });

  const refreshTodos = useCallback(() => queryClient.invalidateQueries({ queryKey: todosKey }), [queryClient]);

  const createTodo = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await api.api.todos.post({ title });
      if (error) throw error;
      return data;
    },
    onSuccess: refreshTodos,
  });

  const updateTodo = useMutation({
    mutationFn: async (input: { readonly id: string; readonly isCompleted: boolean }) => {
      const { data, error } = await api.api.todos({ id: input.id }).patch({
        isCompleted: input.isCompleted,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (todo) => {
      queryClient.invalidateQueries({ queryKey: todosKey });
      queryClient.invalidateQueries({ queryKey: ["todo", todo.id] });
    },
  });

  const deleteTodo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.api.todos({ id }).delete();
      if (error) throw error;
    },
    onSuccess: refreshTodos,
  });

  const handleCreate = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const title = newTitle.trim();
      if (title.length === 0) return;
      createTodo.mutate(title);
      setNewTitle("");
    },
    [createTodo, newTitle],
  );

  const handleToggle = useCallback(
    (id: string, isCompleted: boolean) => {
      updateTodo.mutate({ id, isCompleted: !isCompleted });
    },
    [updateTodo],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteTodo.mutate(id);
    },
    [deleteTodo],
  );

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">Todos</h1>

      {session && (
        <form className="mb-6 flex gap-2" onSubmit={handleCreate}>
          <input
            className="border-input bg-background ring-ring/20 flex-1 rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            disabled={createTodo.isPending}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="What needs to be done?"
            type="text"
            value={newTitle}
          />
          <button
            className="bg-primary text-primary-foreground inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium disabled:opacity-60"
            disabled={createTodo.isPending}
            type="submit"
          >
            {createTodo.isPending ? <Loader2Icon className="size-4 animate-spin" /> : <PlusIcon className="size-4" />}
            Add
          </button>
        </form>
      )}

      {todos.isLoading && (
        <div className="flex justify-center py-8">
          <Loader2Icon className="text-muted-foreground size-6 animate-spin" />
        </div>
      )}

      {todos.isError && <p className="text-destructive rounded-md border px-4 py-3 text-sm">Could not load todos.</p>}

      {todos.isSuccess && (
        <ul className="divide-border divide-y rounded-md border">
          {todos.data.length === 0 && (
            <li className="text-muted-foreground px-4 py-8 text-center text-sm">No todos yet.</li>
          )}
          {todos.data.map((todo) => (
            <li className="flex items-center gap-3 px-4 py-3" key={todo.id}>
              <button
                className={`flex size-5 shrink-0 items-center justify-center rounded border disabled:opacity-60 ${todo.isCompleted ? "bg-primary border-primary text-primary-foreground" : "border-input"}`}
                disabled={updateTodo.isPending}
                onClick={() => handleToggle(todo.id, todo.isCompleted)}
                type="button"
              >
                {todo.isCompleted && <CheckIcon className="size-3" />}
              </button>
              <span
                className={`min-w-0 flex-1 truncate text-sm ${todo.isCompleted ? "text-muted-foreground line-through" : ""}`}
              >
                {todo.title}
              </span>
              {session && (
                <button
                  className="text-muted-foreground hover:text-destructive shrink-0 disabled:opacity-60"
                  disabled={deleteTodo.isPending}
                  onClick={() => handleDelete(todo.id)}
                  type="button"
                >
                  <TrashIcon className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {!session && (
        <p className="text-muted-foreground mt-4 text-center text-sm">Sign in to create and manage todos.</p>
      )}
    </div>
  );
}
