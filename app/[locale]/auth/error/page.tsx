import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLogo } from "@/components/icon";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;
  const t = await getTranslations("auth");

  return (
    <>
      {params?.error ? (
        <p className="text-sm text-muted-foreground">
          {t("codeError", { error: params.error })}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("unspecifiedError")}
        </p>
      )}
    </>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
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
                {t("errorTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
