import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { loginSchema, type LoginFormData } from "../schemas/login.schema";
import { useAuth } from "../providers/AuthProvider";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
    const navigate = useNavigate();

    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const { login, isLoading  } = useAuth();

    const onSubmit = async(data: LoginFormData): Promise<void> => {
        
        try {
            setError(null);
            await login(data);
            navigate("/dashboard", { replace: true });
        } catch (error) {
            if(axios.isAxiosError(error)) {
                setError(error.response?.data?.message ?? "Unable to login");
            } else {
                setError("Something went wrong");
            }
        }
    }

    return (
        <Card className="mx-auto w-full max-w-md">
            <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">
                    Login
                </CardTitle>
                <CardDescription>
                    Enter the information below to login
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-2">
                        <Controller name="email"
                            control={form.control}
                            render={({ field, fieldState }) => {
                                return (
                                    <Field>
                                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="email"
                                            placeholder="john@example.com"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]}/>
                                        )}
                                    </Field>
                                );
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Controller name="password"
                            control={form.control}
                            render={({ field, fieldState}) => {
                                return (
                                    <Field>
                                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="password"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]}/>
                                        )}
                                    </Field>
                                );
                            }}
                        />
                        <Button type="submit" className="w-full"
                            disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}