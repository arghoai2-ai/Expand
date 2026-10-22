import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { formatLakhCroreNumber, formatStandardNumber } from '../../utils/money.ts';

interface AmountTextProps {
  minorUnits: number;
  showSign?: boolean;
  type?: 'neutral' | 'income' | 'expense';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export function AmountText({
  minorUnits,
  showSign = false,
  type = 'neutral',
  size = 'md',
  weight = 'semibold',
  className = '',
}: AmountTextProps) {
  const { settings } = useApp();

  const isNegative = minorUnits < 0;
  const absMinor = Math.abs(Math.round(minorUnits));
  const major = Math.floor(absMinor / 100);
  const minor = absMinor % 100;

  const formattedMajor = settings.numberGrouping === 'lakhCrore'
    ? formatLakhCroreNumber(major)
    : formatStandardNumber(major);

  const decimalPart = minor > 0 ? `.${minor.toString().padStart(2, '0')}` : '';

  let signText = '';
  if (showSign) {
    if (type === 'expense') {
      signText = '-';
    } else if (type === 'income') {
      signText = '+';
    } else if (minorUnits > 0) {
      signText = '+';
    } else if (minorUnits < 0) {
      signText = '-';
    }
  } else if (isNegative) {
    signText = '-';
  }

  const hasCustomTextColor = className.includes('text-');
  const colorStyle = hasCustomTextColor
    ? ''
    : {
        neutral: 'text-zinc-900 dark:text-zinc-100',
        income: 'text-emerald-600 dark:text-emerald-400',
        expense: 'text-rose-600 dark:text-rose-400',
      }[type];

  const sizeStyle = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-xl',
    '2xl': 'text-2xl tracking-tight',
  }[size];

  const weightStyle = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }[weight];

  const isTaka = settings.currencySymbol === '৳' || settings.currencySymbol === 'Tk';

  return (
    <span
      className={`tabular-nums inline-flex items-center gap-0.5 ${colorStyle} ${sizeStyle} ${weightStyle} ${className}`}
    >
      {signText && <span>{signText}</span>}
      {isTaka ? (
        <span className="inline-flex items-center mr-0.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-[0.8em] h-[0.8em] shrink-0"
            aria-label="Taka"
          >
            <path d="M7 6h10" />
            <path d="M12 6v12c0 1.5-1.2 2.5-3 2.5a2.5 2.5 0 0 1-2.5-2.5" />
            <path d="M8 12h8" />
          </svg>
        </span>
      ) : (
        <span className="mr-0.5">{settings.currencySymbol}</span>
      )}
      <span>
        {formattedMajor}
        {decimalPart}
      </span>
    </span>
  );
}
