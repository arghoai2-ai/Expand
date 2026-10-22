import React from 'react';
import type { Ledger, FinanceSummary } from '../../types/index.ts';
import { AmountText } from '../common/AmountText.tsx';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface FinanceSummaryHeaderProps {
  ledger: Ledger;
  summary: FinanceSummary;
}

export function FinanceSummaryHeader({ ledger, summary }: FinanceSummaryHeaderProps) {
  const isBusiness = ledger === 'business';

  const balanceLabel = isBusiness ? 'Net Business Balance' : 'Current Wallet Balance';
  const incomeLabel = isBusiness ? 'Total Business Revenue' : 'Total Personal Income';
  const expenseLabel = isBusiness ? 'Operating Expenses' : 'Personal Expenses';

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-800/90 border border-zinc-800 dark:border-zinc-700/80 shadow-md space-y-4">
      {/* Net Balance (Largest) */}
      <div>
        <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
          <Wallet size={14} />
          <span>{balanceLabel}</span>
        </div>
        <div className="mt-1">
          <AmountText
            minorUnits={summary.netMinor}
            size="2xl"
            weight="bold"
            className="text-white text-3xl sm:text-4xl tracking-tight"
          />
        </div>
      </div>

      {/* Income & Expense Breakdown */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800 dark:border-zinc-700">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <TrendingUp size={12} className="text-emerald-400" />
            <span>{incomeLabel}</span>
          </div>
          <AmountText
            minorUnits={summary.incomeMinor}
            type="income"
            showSign={true}
            size="lg"
            weight="semibold"
          />
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <TrendingDown size={12} className="text-rose-400" />
            <span>{expenseLabel}</span>
          </div>
          <AmountText
            minorUnits={summary.expenseMinor}
            type="expense"
            showSign={false}
            size="lg"
            weight="semibold"
          />
        </div>
      </div>
    </div>
  );
}
