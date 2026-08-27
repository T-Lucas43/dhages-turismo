"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { whatsappUrl } from "@/data/demo";

type ContactValues = { name: string; phone: string; email: string; message: string; consent: boolean };

export function ContactForm({ frontendOnly = false, whatsappNumber }: { frontendOnly?: boolean; whatsappNumber: string }) {
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactValues>({ defaultValues: { name: "", phone: "", email: "", message: "", consent: false } });
  async function submit(values: ContactValues) {
    setFeedback(null);
    if (frontendOnly) {
      const message = `Olá! Meu nome é ${values.name}. ${values.message} Meu telefone é ${values.phone}${values.email ? ` e meu e-mail é ${values.email}` : ""}.`;
      window.open(whatsappUrl(message, whatsappNumber), "_blank", "noopener,noreferrer");
      setFeedback({ ok: true, text: "Abrimos o WhatsApp com a sua mensagem pronta para enviar." });
      reset();
      return;
    }
    const response = await fetch("/api/leads", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...values, origin: "CONTACT_FORM" }) });
    const result = await response.json().catch(() => ({})) as { error?: string };
    setFeedback({ ok: response.ok, text: response.ok ? "Mensagem enviada. Nossa equipe entrará em contato." : result.error ?? "Não foi possível enviar." });
    if (response.ok) reset();
  }
  return <form className="contact-form" onSubmit={handleSubmit(submit)} noValidate><span className="eyebrow">Envie sua mensagem</span><h2>Conte como podemos ajudar</h2><label><span>Nome</span><input placeholder="Seu nome" {...register("name", { required: "Informe seu nome.", minLength: 2 })} />{errors.name && <small className="field-error">{errors.name.message}</small>}</label><label><span>Telefone</span><input inputMode="tel" placeholder="(91) 99999-9999" {...register("phone", { required: "Informe seu telefone.", minLength: 10 })} />{errors.phone && <small className="field-error">Informe um telefone com DDD.</small>}</label><label><span>E-mail <small>(opcional)</small></span><input type="email" placeholder="voce@email.com" {...register("email")} /></label><label><span>Mensagem</span><textarea rows={5} placeholder="Qual destino você gostaria de conhecer?" {...register("message", { required: true, minLength: 5 })} />{errors.message && <small className="field-error">Escreva uma mensagem breve.</small>}</label><label className="consent-field"><input type="checkbox" {...register("consent", { required: true })} /><span>Autorizo o uso destes dados apenas para retorno do contato.</span></label>{errors.consent && <small className="field-error">Marque a autorização para enviar.</small>}{feedback && <div className={feedback.ok ? "form-success" : "form-error"} role="status">{feedback.text}</div>}<button className="button button-primary button-block" type="submit" disabled={isSubmitting}>{isSubmitting ? "Enviando..." : "Enviar mensagem"}</button><small>Seus dados serão usados apenas para responder ao contato.</small></form>;
}
