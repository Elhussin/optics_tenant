import { useMutation, useQueryClient } from "@tanstack/react-query";

function useAddItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newItem: any) => {
      const res = await fetch("/api/items", {
        method: "POST",
        body: JSON.stringify(newItem),
        headers: { "Content-Type": "application/json" },
      });
      return res.json();
    },
    onSuccess: () => {
      // هنا بنعمل invalidate عشان يعيد الجلب
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}
