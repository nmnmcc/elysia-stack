"use client";

import { authClient } from "@/lib/auth-client";
import { CheckIcon, Loader2Icon, PlusIcon, TrashIcon } from "lucide-react";
import { useCallback, useState, type FormEvent } from "react";

import { useTodoMutations, useTodos } from "../hooks/use-todos";

export function TodosPanel() {
  const { data: session } = authClient.useSession();
  const [newTitle, setNewTitle] = useState("");
  const todos = useTodos();
  const todoMutations = useTodoMutations();

  const handleCreate = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const title = newTitle.trim();
      if (title.length === 0) return;
      todoMutations.createTodo.mutate(title);
      setNewTitle("");
    },
    [newTitle, todoMutations.createTodo],
  );

  const handleToggle = useCallback(
    (id: string, isCompleted: boolean) => {
      todoMutations.updateTodo.mutate({ id, isCompleted: !isCompleted });
    },
    [todoMutations.updateTodo],
  );

  const handleDelete = useCallback(
    (id: string) => {
      todoMutations.deleteTodo.mutate(id);
    },
    [todoMutations.deleteTodo],
  );

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">Todos</h1>

      {session && (
        <form className="mb-6 flex gap-2" onSubmit={handleCreate}>
          <input
            className="border-input bg-background ring-ring/20 flex-1 rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            disabled={todoMutations.createTodo.isPending}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="What needs to be done?"
            type="text"
            value={newTitle}
          />
          <button
            className="bg-primary text-primary-foreground inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium disabled:opacity-60"
            disabled={todoMutations.createTodo.isPending}
            type="submit"
          >
            {todoMutations.createTodo.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <PlusIcon className="size-4" />
            )}
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
                disabled={todoMutations.updateTodo.isPending}
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
                  disabled={todoMutations.deleteTodo.isPending}
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
