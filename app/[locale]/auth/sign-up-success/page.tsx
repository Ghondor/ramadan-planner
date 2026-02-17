import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MainLogo } from "@/components/icon";
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("auth");

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center">
            <MainLogo width={64} height={64} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {t("signUpSuccess")}
              </CardTitle>
              <CardDescription>{t("checkEmailToConfirm")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("signUpSuccessDesc")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
