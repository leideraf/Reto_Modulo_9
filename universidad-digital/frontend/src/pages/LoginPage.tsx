import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "../layouts/AuthLayout";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { useAuth } from "../hooks/useAuth";
import { sanitizeText } from "../utils/sanitize";

const loginSchema = z.object({
  email: z.string().email("Ingresa un email valido."),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres.")
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (values: LoginForm) => {
    const email = sanitizeText(values.email);
    const password = sanitizeText(values.password);
    await login(email, password);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout>
      <div className="login-panel">
        <div className="login-heading">
          <span className="login-eyebrow">Bienvenido</span>
          <h2>Inicia sesion</h2>
          <p>Ingresa con tus credenciales para continuar en Universidad Digital.</p>
        </div>
        {error ? <Alert message={error} /> : null}
        <form onSubmit={handleSubmit(onSubmit)} className="grid login-form">
          <Input
            label="Correo electronico"
            type="email"
            placeholder="correo@universidad.edu"
            autoComplete="email"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Contrasena"
            type="password"
            placeholder="Ingresa tu contrasena"
            autoComplete="current-password"
            {...register("password")}
            error={errors.password?.message}
          />
          <Button type="submit" disabled={isSubmitting} className="login-submit">
            {isSubmitting ? "Ingresando..." : "Entrar al sistema"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
