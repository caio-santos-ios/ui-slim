"use cliente";

import Image from "next/image"

type TProp = {
    width: number;
    height: number
}
export const Logo = ({width, height}: TProp) => {
    return (
        <div>
            <Image
                src="/assets/images/logo.png"
                alt="Logo"
                width={width}
                height={height}
                />
        </div>
    )
}