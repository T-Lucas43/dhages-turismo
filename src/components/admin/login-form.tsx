"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { z } from "zod";
import { loginSchema } from "@/lib/validation/auth";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setServerError(payload.error ?? "Não foi possível entrar.");
      return;
    }
    router.replace(returnTo);
    router.refresh();
  }

  return (
    <form className="admin-login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label>
        <span>E-mail administrativo</span>
        <div className="login-field"><Mail /><input type="email" autoComplete="username" placeholder="seu@email.com" {...register("email")} /></div>
        {errors.email && <small role="alert">{errors.email.message}</small>}
      </label>
      <label>
        <span>Senha</span>
        <div className="login-field"><LockKeyhole /><input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Sua senha segura" {...register("password")} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff /> : <Eye />}</button></div>
        {errors.password && <small role="alert">{errors.password.message}</small>}
      </label>
      {serverError && <div className="login-error" role="alert">{serverError}</div>}
      <button className="button button-primary button-block" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <><LoaderCircle className="spin" /> Entrando...</> : "Entrar no painel"}
      </button>
      <p>O acesso é exclusivo para administradores autorizados.</p>
    </form>
  );
}
