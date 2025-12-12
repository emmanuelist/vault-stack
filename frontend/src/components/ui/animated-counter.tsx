import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter = ({
  value,
  duration = 1,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  const springValue = useSpring(prevValueRef.current, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  });

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [springValue]);

  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  const formattedValue = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};

interface CountdownTickerProps {
  targetBlock: number;
  currentBlock: number;
  blocksPerMinute?: number;
  className?: string;
}

export const CountdownTicker = ({
  targetBlock,
  currentBlock,
  blocksPerMinute = 0.1,
  className = '',
}: CountdownTickerProps) => {
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const blocksRemaining = Math.max(0, targetBlock - currentBlock);
    const minutesRemaining = blocksRemaining / blocksPerMinute;
    const totalSeconds = minutesRemaining * 60;

    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    setTimeRemaining({ days, hours, minutes, seconds });

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              hours = 23;
              days--;
              if (days < 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
              }
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetBlock, currentBlock, blocksPerMinute]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-secondary/80 rounded-lg px-2 sm:px-3 py-1 sm:py-2 min-w-[2.5rem] sm:min-w-[3rem]"
      >
        <span className="font-mono text-lg sm:text-2xl font-semibold text-foreground tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
      </motion.div>
      <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );

  return (
    <div className={`flex items-center gap-1 sm:gap-2 ${className}`}>
      <TimeUnit value={timeRemaining.days} label="Days" />
      <span className="text-xl sm:text-2xl text-muted-foreground font-light">:</span>
      <TimeUnit value={timeRemaining.hours} label="Hrs" />
      <span className="text-xl sm:text-2xl text-muted-foreground font-light">:</span>
      <TimeUnit value={timeRemaining.minutes} label="Min" />
      <span className="text-xl sm:text-2xl text-muted-foreground font-light">:</span>
      <TimeUnit value={timeRemaining.seconds} label="Sec" />
    </div>
  );
};
