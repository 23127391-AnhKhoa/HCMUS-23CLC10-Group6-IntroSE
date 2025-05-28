// src/components/Stepper/Stepper.jsx
import React from 'react';

const Stepper = ({ steps, currentStepId }) => {
  if (!steps || !steps.length) return null;
  const totalSteps = steps.length;

  // Đếm số bước đã hoàn thành
  let completedStepsCount = 0;
  for (const step of steps) {
    if (step.id < currentStepId) {
      completedStepsCount++;
    }
  }

  // Tính toán phần trăm thanh được tô màu
  const fillPercentage = totalSteps > 0 ? (completedStepsCount / totalSteps) * 100 : 0;

  return (
    <div className="w-full flex flex-col">
      {/* Thanh tiến trình chính (ống) */}
      <div className="relative w-full h-3 sm:h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
        {/* Phần đã tô màu của thanh (animate width) */}
        <div
          className="absolute top-0 left-0 h-full bg-green-500 dark:bg-green-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${fillPercentage}%` }}
          aria-hidden="true"
        />

        {/* Các vạch chia khúc (tùy chọn, để rõ hơn các segment) */}
        {totalSteps > 1 && Array.from({ length: totalSteps - 1 }).map((_, index) => (
          <div
            key={`divider-${index}`}
            className="absolute top-0 h-full w-px bg-white/60 dark:bg-slate-900/40" // Màu vạch chia
            style={{ left: `${((index + 1) / totalSteps) * 100}%` }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Tên các bước bên dưới thanh */}
      <div className="flex w-full mt-2.5 sm:mt-3">
        {steps.map((step) => {
          const isCompleted = step.id < currentStepId;
          const isCurrent = step.id === currentStepId;

          let nameClass = 'text-slate-500 dark:text-slate-400';
          let fontWeightClass = 'font-normal';

          if (isCurrent) {
            nameClass = 'text-indigo-600 dark:text-indigo-400';
            fontWeightClass = 'font-semibold';
          } else if (isCompleted) {
            // Tên của bước đã hoàn thành có thể giữ màu bình thường hoặc hơi mờ đi
            // vì thanh màu xanh lá đã thể hiện sự hoàn thành.
            nameClass = 'text-slate-600 dark:text-slate-300';
            // fontWeightClass = 'font-medium'; // Hoặc giữ 'font-normal'
          }

          return (
            <div
              key={`name-${step.id}`}
              className="flex-1 text-center px-0.5 sm:px-1" // flex-1 để chia đều không gian
            >
              <span className={`text-xs sm:text-sm truncate ${nameClass} ${fontWeightClass}`}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;