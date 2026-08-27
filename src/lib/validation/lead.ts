import { z } from "zod";

const optionalEmail = z.union([z.literal(""), z.email("Informe um e-mail válido.")]).optional();

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(120),
  phone: z.string().trim().min(10, "Informe um telefone com DDD.").max(30),
  email: optionalEmail,
  packageId: z.string().cuid().optional(),
  message: z.string().trim().min(5, "Conte brevemente como podemos ajudar.").max(3000),
  origin: z.enum(["CONTACT_FORM", "PACKAGE_FORM", "WAITING_LIST"]).default("CONTACT_FORM"),
  consent: z.literal(true, "É necessário aceitar o uso dos dados para receber o contato."),
});
