"use cliente";

import Image from "next/image"

type TProp = {
    className?: string;
}

export const Logo = ({className}: TProp) => {
    return (
        <div className={`${className}`}>
            <img
                className="logo max-w-full max-h-full w-auto h-auto rounded-xl object-contain"
                src="/erp/assets/images/logo.png"
                alt="Logo"
            />

            <img
                className="logo-light max-w-full max-h-full w-auto h-auto rounded-xl object-contain"
                src="/erp/assets/images/logo-light.png"
                alt="Logo"
            />
        </div>
    )
}