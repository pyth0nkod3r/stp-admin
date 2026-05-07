// src/hooks/useLogin.ts
import { login, register, type RegisterPayload } from "@/services/apiAuth";
import { useMutation } from "@tanstack/react-query";

export function useLogin() {
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    mutationKey: ["login"],
  });

  return { mutate, isPending, error };
}

export function useRegisterAdmin() {
  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    mutationKey: ["register-admin"],
  });

  return { mutate, mutateAsync, isPending, error };
}
