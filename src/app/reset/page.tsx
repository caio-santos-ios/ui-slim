"use client";

import { FormResetPassword } from "@/components/Auth/ResetPassword";
import { Autorization } from "@/components/Global/Autorization";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";
import { useAtom } from "jotai";

export default function Reset() {
  const [userLogger] = useAtom(userLoggerAtom);

  return (
    <>
      <Autorization path="reset-password" />
      {
        !userLogger &&
        <main className="h-dvh slim-bg-secondary">
          <div className="w-11/12 h-12/12 lg:max-w-md m-auto flex flex-col justify-center">
            <FormResetPassword />
          </div>
        </main>
      }
    </>
  );
}
