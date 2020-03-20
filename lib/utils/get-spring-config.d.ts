import { ISpringProps } from '../options';
export declare const getSpringConfig: (config: ISpringProps) => {
    stiffness: number | undefined;
    damping: number | undefined;
    mass: number | undefined;
    bounciness?: undefined;
    speed?: undefined;
    tension?: undefined;
    friction?: undefined;
} | {
    bounciness: number | undefined;
    speed: number | undefined;
    stiffness?: undefined;
    damping?: undefined;
    mass?: undefined;
    tension?: undefined;
    friction?: undefined;
} | {
    tension: number | undefined;
    friction: number | undefined;
    stiffness?: undefined;
    damping?: undefined;
    mass?: undefined;
    bounciness?: undefined;
    speed?: undefined;
};
