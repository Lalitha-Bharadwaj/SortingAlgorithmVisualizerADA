import { motion } from 'framer-motion';
import type { TraceStep } from '../types';
import { BAR_COLORS } from '../constants';

interface Props {
  array: number[];
  currentStep?: TraceStep;
  maxValue: number;
}

export function SortBars({ array, currentStep, maxValue }: Props) {
  const getColor = (index: number): string => {
    if (!currentStep) return BAR_COLORS.default;
    const action = currentStep.action;
    const indices = currentStep.indices;

    if (action === 'sorted') {
      if (indices.includes(index)) return BAR_COLORS.sorted;
    }
    if (action === 'pivot' && indices[0] === index) return BAR_COLORS.pivot;
    if ((action === 'swap' || action === 'compare') && indices.includes(index)) {
      return action === 'swap' ? BAR_COLORS.swap : BAR_COLORS.compare;
    }
    if (action === 'merge' && indices.includes(index)) return BAR_COLORS.merge;
    if (action === 'set' && indices.includes(index)) return BAR_COLORS.set;
    return BAR_COLORS.default;
  };

  const barWidth = Math.max(2, Math.min(40, Math.floor(600 / array.length) - 2));

  return (
    <div className="w-full h-64 flex items-end justify-center gap-0.5 px-2 overflow-hidden">
      {array.map((value, index) => {
        const heightPct = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const color = getColor(index);
        return (
          <motion.div
            key={index}
            layout
            style={{
              height: `${Math.max(2, heightPct)}%`,
              backgroundColor: color,
              width: barWidth,
              minWidth: 2,
              borderRadius: '3px 3px 0 0',
            }}
            animate={{ backgroundColor: color, height: `${Math.max(2, heightPct)}%` }}
            transition={{ duration: 0.05 }}
            title={`${value}`}
          />
        );
      })}
    </div>
  );
}
