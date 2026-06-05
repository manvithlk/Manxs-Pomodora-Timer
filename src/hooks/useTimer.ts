import { useState, useEffect, useRef, useCallback } from 'react';

export interface TimerState {
    secondsRemaining: number;
    isActive: boolean;
    start: () => void;
    pause: () => void;
    reset: (newSeconds?: number) => void;
}

export const useTimer = (initialSeconds: number, onComplete: () => void): TimerState => {
    const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<any>(null);
    const expectedTimeRef = useRef<number | null>(null);

    const start = useCallback(() => {
        if (isActive) return;
        setIsActive(true);
        expectedTimeRef.current = Date.now() + 1000;
    }, [isActive]);

    const pause = useCallback(() => {
        setIsActive(false);
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const reset = useCallback((newSeconds?: number) => {
        setIsActive(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        setSecondsRemaining(newSeconds !== undefined ? newSeconds : initialSeconds);
        expectedTimeRef.current = null;
    }, [initialSeconds]);

    useEffect(() => {
        if (!isActive) return;

        const tick = () => {
            setSecondsRemaining((prev) => {
                if (prev <= 1) {
                    setIsActive(false);
                    onComplete();
                    return 0;
                }
                return prev - 1;
            });

            if (expectedTimeRef.current !== null) {
                const drift = Date.now() - expectedTimeRef.current;
                expectedTimeRef.current += 1000;
                timerRef.current = setTimeout(tick, Math.max(0, 1000 - drift));
            }
        };

        timerRef.current = setTimeout(tick, 1000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isActive, onComplete]);

    return { secondsRemaining, isActive, start, pause, reset };
};
