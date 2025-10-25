import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

interface LoginFormProps extends React.ComponentProps<"div"> {
  onLoginSuccess: (token: string) => void;
}

export function LoginForm({
  className,
  onLoginSuccess,
  ...props
}: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Panggil API login di port 7557
      const response = await api.post("/login", {
        username: username,
        password: password,
      });

      console.log("response", response);

      // Ambil token dari respons
      const token = response.data.token;

      if (token) {
        onLoginSuccess(token); // Kirim token ke App.tsx
        navigate("/home"); // Redirect to home after login
      } else {
        setError("Login gagal: Token tidak diterima.");
      }
    } catch (err) {
      console.error("Login gagal:", err);
      setError("Login gagal! Cek username atau password Bos.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="flex flex-col justify-center items-center">
          <CardTitle className="font-bold text-2xl">
            Login to your account
          </CardTitle>
          <img
            src="/vite.svg"
            alt="Vite Logo"
            width="20"
            height="20"
            loading="lazy"
            className=""
          />
          <CardDescription>
            Enter your username below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="amdaja"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Field>
                <Button type="submit">Login</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
