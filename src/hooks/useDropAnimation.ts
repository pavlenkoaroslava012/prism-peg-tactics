import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

export interface DropPoint {
  x: number;
  y: number;
}

interface Options {
  stepMs: number;
  reducedMotion: boolean;
  onComplete: () => void;
}

/**
 * Drives the orb hop by hop. Only transform values are animated, so the
 * native driver is safe. The busy flag is reset inside the completion
 * callback and every pending animation is cancelled on unmount.
 */
export function useDropAnimation({ stepMs, reducedMotion, onComplete }: Options) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const squash = useRef(new Animated.Value(1)).current;

  const pointsRef = useRef<DropPoint[]>([]);
  const runningRef = useRef(false);
  const cancelledRef = useRef(false);
  const stepMsRef = useRef(stepMs);
  const reducedRef = useRef(reducedMotion);
  const completeRef = useRef(onComplete);

  const [stepIndex, setStepIndex] = useState(0);

  stepMsRef.current = stepMs;
  reducedRef.current = reducedMotion;
  completeRef.current = onComplete;

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      translateX.stopAnimation();
      translateY.stopAnimation();
      squash.stopAnimation();
    };
  }, [translateX, translateY, squash]);

  const park = useCallback(
    (point: DropPoint) => {
      translateX.setValue(point.x);
      translateY.setValue(point.y);
      squash.setValue(1);
      setStepIndex(0);
    },
    [translateX, translateY, squash],
  );

  const runStep = useCallback(
    (index: number) => {
      if (cancelledRef.current) {return;}
      const points = pointsRef.current;
      if (index >= points.length) {
        runningRef.current = false;
        setStepIndex(points.length);
        completeRef.current();
        return;
      }
      setStepIndex(index);
      const target = points[index];
      const duration = stepMsRef.current;
      const animations: Animated.CompositeAnimation[] = [
        Animated.timing(translateX, {
          toValue: target.x,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: target.y,
          duration,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ];
      if (!reducedRef.current) {
        animations.push(
          Animated.sequence([
            Animated.timing(squash, {
              toValue: 0.78,
              duration: Math.max(40, Math.round(duration * 0.35)),
              useNativeDriver: true,
            }),
            Animated.timing(squash, {
              toValue: 1,
              duration: Math.max(40, Math.round(duration * 0.65)),
              useNativeDriver: true,
            }),
          ]),
        );
      }
      Animated.parallel(animations).start(({ finished }) => {
        // Read the live step from the argument, never from stale state.
        if (!finished || cancelledRef.current) {
          runningRef.current = false;
          return;
        }
        runStep(index + 1);
      });
    },
    [translateX, translateY, squash],
  );

  const start = useCallback(
    (points: DropPoint[]) => {
      if (runningRef.current || points.length < 2) {return;}
      cancelledRef.current = false;
      pointsRef.current = points.slice(1);
      runningRef.current = true;
      translateX.setValue(points[0].x);
      translateY.setValue(points[0].y);
      squash.setValue(1);
      runStep(0);
    },
    [runStep, translateX, translateY, squash],
  );

  const stop = useCallback(() => {
    cancelledRef.current = true;
    runningRef.current = false;
    translateX.stopAnimation();
    translateY.stopAnimation();
    squash.stopAnimation();
  }, [translateX, translateY, squash]);

  return { translateX, translateY, squash, stepIndex, start, stop, park };
}

export default useDropAnimation;
