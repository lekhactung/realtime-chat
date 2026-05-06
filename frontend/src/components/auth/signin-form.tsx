import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "../ui/label"
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useAuthStore } from "@/stores/useAuthStore"
import { useNavigate } from "react-router"

const signInSchema = z.object({
  username: z.string().min(1, 'Username can not be empty'),
  password: z.string().min(1, 'Password can not be empty')
})

type SignInFormValues = z.infer<typeof signInSchema>
export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useAuthStore()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema)
  })
  const onSubmit = async (data: SignInFormValues) => {
    const { username, password } = data
    await signIn(username, password)
    navigate("/")

  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border" >
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8 " onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/" className="mx-auto block w-fit text-center">
                  <img src="/logo.svg" alt="logo" />
                </a>
                <h1 className="text-2xl font-bold">
                  Welcome back!
                </h1>
                <p className="text-muted-foreground text-balance">Login to your existed account </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm">Username</label>
                  <Input type="text" id="username" {...register("username")} />
                  {errors.username && (
                    <p className="text-destructive text-sm">
                      {errors.username.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm">
                    Password
                  </label>
                  <Input type="password" id="password" {...register("password")} />
                  {errors.password && (
                    <p className="text-destructive text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >Sign in
                </Button>
                <div className="text-center text-sm">
                  Not having an account yet?
                  <a
                    href="/signup"
                    className="underline underline-4 font-bold">
                    Sign up
                  </a>
                </div>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="../public/placeholder.png"
              alt="Image"
              className="absolute top-1/2 -translate-y-1/2 object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-xs text-balance px-6 text-center *:[a]:hover:text-primary *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}