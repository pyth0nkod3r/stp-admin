import { fetchUsers } from "@/services/apiUsers";
import { useQuery } from "@tanstack/react-query";

export function useUsers(page: number = 1, perPage: number = 10) {
  // Request one extra item to determine if a next page exists
  const { data, isLoading, error } = useQuery({
    queryKey: ["users", page, perPage],
    queryFn: () => fetchUsers(page, perPage + 1),
  });

  const allItems = data?.data ?? [];
  const hasNextPage = allItems.length > perPage;
  const users = hasNextPage ? allItems.slice(0, perPage) : allItems;

  return {
    data: data ? { ...data, data: users } : data,
    isLoading,
    error,
    hasNextPage,
  };
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["users-all"],
    queryFn: () => fetchUsers(1, 10000),
    staleTime: 5 * 60 * 1000,
  });
}
