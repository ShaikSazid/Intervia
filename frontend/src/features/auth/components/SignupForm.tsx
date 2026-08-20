import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupFormData } from "../schemas/signup.schema";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
            confirmPassword: ""
        }
    });

    const { signup, isPending, error } = useSignup();

    const onSubmit = async (data: SignupFormData): Promise<void> => {
        const { confirmPassword, ...registerdata } = data;
        await signup(registerdata);
        navigate("/login", { replace: true });
        console.log("Created");
    }

    return (
        <Card className="mx-auto w-full max-w-md">
            <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">
                    Create an account
                </CardTitle>

                <CardDescription>
                    Enter your information below to create your account.
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
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Controller name="username" control={form.control}
                            render={({ field, fieldState }) => {
                                return (
                                    <Field>
                                        <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            placeholder="Enter your username"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Controller name="password" control={form.control}
                            render={({ field, fieldState }) => {
                                return (
                                    <Field>
                                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="password"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Controller name="confirmPassword" control={form.control}
                            render={({ field, fieldState }) => {
                                return (
                                    <Field>
                                        <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            type="password"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )
                            }}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isPending}
                    >
                        {isPending ? "Creating Account" : "Create Account"}
                    </Button>

                </form>
            </CardContent>
        </Card>
    );
}