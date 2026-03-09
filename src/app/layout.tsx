"use client";

import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/slim.css";
import "@/styles/slim-input.css";
import "@/styles/slim-btn.css";
import "@/styles/slim-select.css";
import "@/styles/slim-switch.css";
import "@/styles/slim-textarea.css";
import "@/styles/slim-text.css";
import "@/styles/slim-table.css";
import "@/styles/slim-logo.css";
import "@/styles/slim-label.css";
import "@/styles/slim-modal.css";
import "@/styles/login/login.css";
import { ToastContainer } from "react-toastify";
import { Loading } from "@/components/Global/Loading";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { WhatsAppModal } from "@/components/notification/whatsapp/WhatsAppModal";
import { MessageModal } from "@/components/notification/message/MessageModal";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
                    <HeroUIProvider>
                        <ToastContainer
                            position="top-right"
                            autoClose={3500}
                            hideProgressBar={false}
                            closeOnClick
                            pauseOnHover
                            toastStyle={{
                                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                                fontSize: "0.875rem",
                                borderRadius: "0.75rem",
                            }}
                        />
                        <Loading />
                        <WhatsAppModal />
                        <MessageModal />
                        {children}
                    </HeroUIProvider>
                </NextThemesProvider>
            </body>
        </html>
    );
}
