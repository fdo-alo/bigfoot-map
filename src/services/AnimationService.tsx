import {assetUrl} from "../utils/assetUrl.ts";

export type AnimationName =
    | "idle"
    | "walk"
    | "run"
    | "jump"
    | "hurt"
    | "attack"
    | "wave"
    | "celebrate"
    | "skip"
    | "hop"
    | "sweep"
    | "throw"
    | "bigjab";

interface AnimationDef {
    start: number;
    count: number;
    ms: number[];
}

const ANIMATION_DIRECTIONS: Record<
    AnimationName,
    FootzyDirection[]
> = {
    idle: ["s", "e", "w", "n"],
    walk: ["e", "w", "n", "s"],
    run: ["e", "w"],
    jump: ["s", "e", "w"],
    hurt: ["s", "e", "w"],
    attack: ["e", "w"],
    wave: ["s"],
    celebrate: ["s", "e", "w"],
    skip: ["e", "w"],
    hop: ["s", "e", "w"],
    sweep: ["e", "w"],
    throw: ["e", "w"],
    bigjab: ["e", "w"]
};

export type FootzyDirection = "n" | "s" | "e" | "w";

const ANIMATIONS: Record<AnimationName, AnimationDef> = {
    idle: {
        start: 0,
        count: 6,
        ms: [620, 480, 560, 480, 620, 560]
    },
    walk: {
        start: 6,
        count: 6,
        ms: [240, 190, 250, 240, 190, 250]
    },
    run: {
        start: 12,
        count: 6,
        ms: [150, 115, 165, 150, 115, 165]
    },
    jump: {
        start: 18,
        count: 6,
        ms: [260, 300, 130, 190, 200, 230]
    },
    hurt: {
        start: 24,
        count: 4,
        ms: [110, 190, 230, 210]
    },
    attack: {
        start: 28,
        count: 5,
        ms: [280, 240, 120, 210, 260]
    },
    wave: {
        start: 33,
        count: 3,
        ms: [320, 260, 300]
    },
    celebrate: {
        start: 36,
        count: 4,
        ms: [300, 260, 300, 340]
    },
    skip: {
        start: 40,
        count: 4,
        ms: [260, 180, 260, 180]
    },
    hop: {
        start: 44,
        count: 4,
        ms: [220, 120, 160, 240]
    },
    sweep: {
        start: 48,
        count: 4,
        ms: [300, 140, 240, 260]
    },
    throw: {
        start: 52,
        count: 4,
        ms: [300, 120, 220, 260]
    },
    bigjab: {
        start: 56,
        count: 4,
        ms: [300, 120, 220, 260]
    }
};

export class AnimationService {
    private readonly element: HTMLDivElement;
    private readonly frameWidth = 44;

    private timer: ReturnType<typeof setTimeout> | null = null;
    private generation = 0;

    private sequenceTimer: ReturnType<typeof setTimeout> | null = null;
    private sequenceId = 0;

    private direction: FootzyDirection = "s";


    constructor(spriteUrl: string) {
        this.element = document.createElement("div");

        Object.assign(this.element.style, {
            width: "44px",
            height: "44px",
            backgroundImage: `url("${spriteUrl}")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "0px 0px",
            imageRendering: "pixelated",
            pointerEvents: "none"
        });

        this.element.className = "footzy-marker";
    }

    getElement(): HTMLDivElement {
        return this.element;
    }

    setDirection(direction: FootzyDirection): void {
        if (this.direction === direction) return;
        this.direction = direction;

        this.element.style.backgroundImage =
            `url("${assetUrl(`sprites/footzy-${direction}_spritesheet.png`)}")`;
    }

    private setFrame(index: number): void {
        const x = -(index * this.frameWidth);
        this.element.style.backgroundPosition = `${x}px 0px`;
    }

    stop(): void {
        this.generation++;

        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }


    play(
        name: AnimationName,
        loop = false,
        onComplete?: () => void
    ): void {
        this.stop();

        const animation = ANIMATIONS[name];
        const generation = this.generation;

        let frame = 0;

        const nextFrame = () => {
            if (generation !== this.generation) return;

            this.setFrame(animation.start + frame);

            const delay = animation.ms[frame] ?? 200;
            frame++;

            this.timer = setTimeout(() => {
                if (generation !== this.generation) return;

                if (frame >= animation.count) {
                    if (loop) {
                        frame = 0;
                    } else {
                        this.timer = null;
                        onComplete?.();
                        return;
                    }
                }

                nextFrame();
            }, delay);
        };

        nextFrame();
    }

    private selectRandomDirection(
        animation: AnimationName
    ): FootzyDirection {
        const directions = ANIMATION_DIRECTIONS[animation];

        return directions[
            Math.floor(Math.random() * directions.length)
            ];
    }


    playRandomSequence(): void {
        this.stopSequence();

        const sequenceId = this.sequenceId;

        const randomAnimations: AnimationName[] = [
            "walk",
            "run",
            "jump",
            "hurt",
            "attack",
            "wave",
            "celebrate",
            "skip",
            "hop",
            "sweep",
            "throw",
            "bigjab"
        ];

        const randomAnimation = (): AnimationName => {
            const index = Math.floor(
                Math.random() * randomAnimations.length
            );

            return randomAnimations[index];
        };

        const schedule = (
            animationName: AnimationName,
            delay = 0
        ) => {
            if (sequenceId !== this.sequenceId) return;

            this.sequenceTimer = setTimeout(() => {
                if (sequenceId !== this.sequenceId) return;

                // Change direction only for actual actions.
                // Idle keeps the previous orientation.
                if (animationName !== "idle") {
                    this.setDirection(
                        this.selectRandomDirection(animationName)
                    );
                }

                this.play(animationName, false, () => {
                    if (sequenceId !== this.sequenceId) return;

                    if (animationName === "idle") {
                        const pause = 400 + Math.random() * 1200;
                        schedule(randomAnimation(), pause);
                    } else {
                        schedule("idle", 0);
                    }
                });
            }, delay);
        };

        // Always greet first
        schedule("wave");
    }

    stopSequence(): void {
        this.sequenceId++;

        if (this.sequenceTimer !== null) {
            clearTimeout(this.sequenceTimer);
            this.sequenceTimer = null;
        }

        this.stop();
    }



    waveThenIdle(): void {
        this.stop();

        const wave = ANIMATIONS.wave;
        const generation = this.generation;
        let frame = 0;

        const nextWaveFrame = () => {
            if (generation !== this.generation) return;

            this.setFrame(wave.start + frame);

            const delay = wave.ms[frame] ?? 200;
            frame++;

            this.timer = setTimeout(() => {
                if (generation !== this.generation) return;

                if (frame >= wave.count) {
                    this.play("idle", true);
                } else {
                    nextWaveFrame();
                }
            }, delay);
        };

        nextWaveFrame();
    }


    destroy(): void {
        this.stop();
        this.element.remove();
    }
}

export default AnimationService;
