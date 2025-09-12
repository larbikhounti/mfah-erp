"use client";

import { memo, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthService } from "@/services/auth.service";
import { useAuth } from "@/hooks/use-auth";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  className?: string;
}

// Memoized input field component to prevent unnecessary re-renders
const FormField = memo<{
  register: ReturnType<typeof useForm<LoginFormData>>["register"];
  name: keyof LoginFormData;
  label: string;
  type: string;
  placeholder?: string;
}>(({ register, name, label, type, placeholder }) => (
  <div className="grid gap-3">
    <Label htmlFor={name}>{label}</Label>
    <Input
      {...register(name)}
      id={name}
      type={type}
      placeholder={placeholder}
    />
  </div>
));

FormField.displayName = "FormField";

// Memoized submit button to prevent re-renders
const SubmitButton = memo<{ isSubmitting: boolean }>(({ isSubmitting }) => (
  <Button type="submit" className="w-full" disabled={isSubmitting}>
    {isSubmitting ? "Logging in..." : "Login"}
  </Button>
));

SubmitButton.displayName = "SubmitButton";

export const LoginForm = memo<LoginFormProps>(({ className }) => {
  const router = useRouter();
  const isSubmittingRef = useRef(false);

  const { register, handleSubmit, formState } = useForm<LoginFormData>({
    mode: "onSubmit", // Only validate on submit to prevent re-renders during typing
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Only subscribe to isSubmitting to minimize re-renders
  const isSubmitting = formState.isSubmitting;

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;

      try {
        const response = await AuthService.login(data);

        // Store the access token
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("user_email", response.email);
        localStorage.setItem("user_name", response.name);

        // Show success message
        toast.success("Login successful!", {
          description: `Welcome back, ${response.name}!`,
        });

        // Navigate to dashboard
        router.push("/dashboard");
      } catch {
        toast.error("Login failed", {
          description: "Invalid email or password.",
        });
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [router]
  );

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>ADMIN LOGIN</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-6">
              <FormField
                register={register}
                name="email"
                label="Email"
                type="email"
                placeholder="m@example.com"
              />

              <FormField
                register={register}
                name="password"
                label="Password"
                type="password"
              />

              <div className="flex flex-col gap-3">
                <SubmitButton isSubmitting={isSubmitting} />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});

LoginForm.displayName = "LoginForm";
