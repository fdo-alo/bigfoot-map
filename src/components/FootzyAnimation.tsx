
import { useEffect, useRef } from "react";
import AnimationService from "../services/AnimationService";
import {assetUrl} from "../utils/assetUrl.ts";

interface FootzyAnimationProps {
    spriteUrl?: string;
}

export default function FootzyAnimation({
                                            spriteUrl = assetUrl("sprites/footzy-s_spritesheet.png")
                                        }: FootzyAnimationProps) {
    const containerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const animation = new AnimationService(spriteUrl);

        container.appendChild(animation.getElement());
        animation.playRandomSequence();

        return () => {
            animation.stopSequence();
            animation.destroy();
        };
    }, [spriteUrl]);

    useEffect(() => {
        const directions = ["n", "s", "e", "w"];

        directions.forEach(direction => {
            const image = new Image();
            image.src = assetUrl(`sprites/footzy-${direction}_spritesheet.png`);
        });
    }, []);

    return (
        <div
            ref={containerRef}
            className="footzy-animation"
            aria-hidden="true"
        />
    );
}
