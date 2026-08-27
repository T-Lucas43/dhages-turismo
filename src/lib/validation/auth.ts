import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido.").transform((value) => value.trim().toLowerCase()),
  password: z.string().min(10, "A senha deve ter pelo menos 10 caracteres.").max(200),
});
