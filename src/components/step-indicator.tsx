'use client';

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface StepIndicatorProps {
  step: number;
  currentStep: number;
  label: string;
  icon: React.ReactNode;
}

export function StepIndicator({ step, currentStep, label, icon }: StepIndicatorProps) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className="flex items-center gap-2">
      <div className={`
        flex items-center justify-center w-8 h-8 rounded-full
        ${isActive ? 'bg-blue-600 text-white' : ''}
        ${isCompleted ? 'bg-green-600 text-white' : ''}
        ${!isActive && !isCompleted ? 'bg-slate-800 text-slate-400' : ''}
      `}>
        {isCompleted ? <CheckCircle className="h-4 w-4" /> : icon}
      </div>
      <span className={`
        text-sm font-medium
        ${isActive ? 'text-white' : ''}
        ${isCompleted ? 'text-green-400' : ''}
        ${!isActive && !isCompleted ? 'text-slate-400' : ''}
      `}>
        {label}
      </span>
    </div>
  );
}
