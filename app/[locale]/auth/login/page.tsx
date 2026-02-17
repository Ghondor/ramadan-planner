import { LoginForm } from "@/components/login-form";
import { MainLogo } from "@/components/icon";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <MainLogo width={64} height={64} />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
