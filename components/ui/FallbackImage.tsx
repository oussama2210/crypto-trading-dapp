'use client';

import Image from 'next/image';
import { useState } from 'react';

interface FallbackImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    fallbackSrc?: string;
}

/**
 * A client-side Image component with fallback support.
 * Use this instead of next/image when you need onError handling in Server Components.
 */
export default function FallbackImage({
    src,
    alt,
    width,
    height,
    className,
    fallbackSrc = '/logo.png',
}: FallbackImageProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(fallbackSrc);
        }
    };

    return (
        <Image
            src={imgSrc}
            alt={alt}
            width={width}
            height={height}
            className={className}
            onError={handleError}
        />
    );
}
