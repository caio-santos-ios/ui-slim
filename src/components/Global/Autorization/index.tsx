"use client";

import "./style.css";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { userLoggerAtom } from "@/jotai/auth/auth.jotai";

type TProp = {
    path?: string;
}

export const Autorization = ({path}: TProp) => {
    const [_, setUserLogger] = useAtom(userLoggerAtom);
    const router = useRouter();

    useEffect(() => {
        const localToken = localStorage.getItem("token");
        const token = localToken ? localToken : "";
        if(!token) {
            setUserLogger(false);
            if(path != "reset-password") {
                router.push("/");
            };
        } else {
            setUserLogger(true);
            if(path == "login" || path == "reset-password") {
                router.push("/dashboard");
            };
        };
    }, []);

    return <></>
}