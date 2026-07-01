"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { createTodo, deleteTodo, listTodos, updateTodo } from "../api";
import { todoQueryKeys } from "../query-keys";

export function useTodos() {
  return useQuery({
    queryKey: todoQueryKeys.list(),
    queryFn: listTodos,
  });
}

export function useTodoMutations() {
  const queryClient = useQueryClient();
  const refreshTodos = useCallback(
    () => queryClient.invalidateQueries({ queryKey: todoQueryKeys.all() }),
    [queryClient],
  );

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: refreshTodos,
  });

  const updateMutation = useMutation({
    mutationFn: updateTodo,
    onSuccess: (todo) => {
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.all() });
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.detail(todo.id) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: refreshTodos,
  });

  return {
    createTodo: createMutation,
    deleteTodo: deleteMutation,
    updateTodo: updateMutation,
  };
}
