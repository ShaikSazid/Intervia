import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormData } from "../schemas/signup.schema";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignup } from "../hooks/useSignup";
import { useNavigate } from "react-router-dom";

export default function SignupForm() {
  const navigate = useNavigate();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { signup, isPending, error } = useSignup();

  const onSubmit = async (data: SignupFormData): Promise<void> => {
    const { confirmPassword, ...registerdata } = data;
    await signup(registerdata);
    navigate("/login", { replace: true });
    console.log("Created");
  };

  return (
    <Card className="border-[#26272C] bg-[#16171A]/80 backdrop-blur-xl shadow-2xl shadow-black/60 text-[#EDEAE4] rounded-lg overflow-hidden">
      {/* Hairline top edge, echoes the scorecard document quality */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9A24B]/70 to-transparent" />

      <CardHeader className="space-y-2 pb-5 pt-6">
        <span className="font-data text-[10px] tracking-[0.2em] text-[#C9A24B] uppercase">
          Get your first scorecard free
        </span>
        <CardTitle className="font-display text-2xl font-medium text-[#F5F3EE] pt-1">
          Create your account
        </CardTitle>
        <CardDescription className="font-body text-xs text-[#8B8A85]">
          No card required. Cancel any time.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-1 pb-7">
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Email */}
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="space-y-1.5">
                <FieldLabel htmlFor={field.name} className="font-data text-[10px] font-medium tracking-[0.12em] text-[#8B8A85] uppercase">
                  Email
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  placeholder="john@example.com"
                  autoComplete="email"
                  className="h-9 rounded-none border-0 border-b border-[#2A2B31] bg-transparent px-0 font-body text-sm text-[#EDEAE4] placeholder:text-[#4A4B51] focus-visible:border-[#C9A24B] focus-visible:ring-0"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} className="text-[11px] text-[#C0665A]" />
                )}
              </Field>
            )}
          />

          {/* Username */}
          <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="space-y-1.5">
                <FieldLabel htmlFor={field.name} className="font-data text-[10px] font-medium tracking-[0.12em] text-[#8B8A85] uppercase">
                  Username
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="johndoe"
                  autoComplete="username"
                  className="h-9 rounded-none border-0 border-b border-[#2A2B31] bg-transparent px-0 font-body text-sm text-[#EDEAE4] placeholder:text-[#4A4B51] focus-visible:border-[#C9A24B] focus-visible:ring-0"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} className="text-[11px] text-[#C0665A]" />
                )}
              </Field>
            )}
          />

          {/* Password Fields in a compact 2-column layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Password */}
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="space-y-1.5">
                  <FieldLabel htmlFor={field.name} className="font-data text-[10px] font-medium tracking-[0.12em] text-[#8B8A85] uppercase">
                    Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="h-9 rounded-none border-0 border-b border-[#2A2B31] bg-transparent px-0 font-body text-sm text-[#EDEAE4] placeholder:text-[#4A4B51] focus-visible:border-[#C9A24B] focus-visible:ring-0"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} className="text-[11px] text-[#C0665A]" />
                  )}
                </Field>
              )}
            />

            {/* Confirm Password */}
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="space-y-1.5">
                  <FieldLabel htmlFor={field.name} className="font-data text-[10px] font-medium tracking-[0.12em] text-[#8B8A85] uppercase">
                    Confirm
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="h-9 rounded-none border-0 border-b border-[#2A2B31] bg-transparent px-0 font-body text-sm text-[#EDEAE4] placeholder:text-[#4A4B51] focus-visible:border-[#C9A24B] focus-visible:ring-0"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} className="text-[11px] text-[#C0665A]" />
                  )}
                </Field>
              )}
            />
          </div>

          {/* Server Error Alert */}
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-[#C0665A]/30 bg-[#C0665A]/[0.08] px-3 py-2.5 font-body text-xs text-[#D89A8D]">
              <svg className="h-4 w-4 shrink-0 text-[#C0665A]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-10 rounded-md bg-[#C9A24B] hover:bg-[#DAB768] text-[#111214] font-body font-semibold text-xs tracking-wide shadow-lg shadow-[#C9A24B]/15 transition-all active:scale-[0.99] disabled:opacity-40 mt-2"
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account…
              </span>
            ) : (
              "Create free account →"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}