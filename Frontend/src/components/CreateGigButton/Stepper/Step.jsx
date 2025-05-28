// src/components/CreateGigButton/Stepper/Step.jsx
import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid'; // ChevronRightIcon is removed

const Step = ({ number, name, status, isLastStep }) => {
  // status: 'current', 'completed', 'upcoming'
  
  // Default (upcoming) styles
  let circleClasses = 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 group-hover:border-gray-400 dark:group-hover:border-slate-500';
  let nameTextClasses = 'text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-200';
  let icon = <span className="font-medium text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-200">{number}</span>;
  let lineClasses = 'bg-gray-300 dark:bg-slate-600'; // Line after an upcoming/current step

  if (status === 'current') {
    circleClasses = 'border-indigo-600 dark:border-indigo-500 bg-indigo-600 dark:bg-indigo-500 ring-2 sm:ring-4 ring-indigo-200 dark:ring-indigo-500/40';
    // numberTextClasses remains for icon styling, but icon color is set directly
    nameTextClasses = 'text-indigo-600 dark:text-indigo-400 font-semibold';
    icon = <span className="font-medium text-white">{number}</span>;
    // Line after current step is still "upcoming" visually for the path
    lineClasses = 'bg-gray-300 dark:bg-slate-600'; 
  } else if (status === 'completed') {
    circleClasses = 'border-green-600 dark:border-green-500 bg-green-600 dark:bg-green-500';
    nameTextClasses = 'text-green-700 dark:text-green-400 group-hover:text-green-800 dark:group-hover:text-green-300 font-medium';
    icon = <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />;
    lineClasses = 'bg-green-600 dark:bg-green-500'; // Line after completed step is also "completed"
  }

  // To align the line with the center of the circles:
  // Circle height is h-8 (32px) or sm:h-10 (40px).
  // Line height is h-1 (4px).
  // Padding-top for line container = (CircleHeight/2) - (LineHeight/2)
  // For h-8 circle: (32/2) - (4/2) = 14px. (Tailwind: pt-[14px] or roughly pt-3.5)
  // For sm:h-10 circle: (40/2) - (4/2) = 18px. (Tailwind: pt-[18px] or roughly pt-4.5)
  const linePaddingTop = "pt-[14px] sm:pt-[18px]";

  return (
    // Each step (li) is a flex item. If not the last, it will grow to include the line.
    <li className={`flex items-start ${!isLastStep ? 'flex-1' : ''}`}>
      {/* Step visual part (circle and name) - fixed width to allow line to fill remaining space */}
      <div className="group flex flex-col items-center text-center relative flex-shrink-0 w-20 sm:w-24">
        <span // Changed outer span to a simple div for the circle for cleaner structure
          className={`flex h-8 w-8 sm:h-10 sm:h-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ease-in-out ${circleClasses}`}
        >
          {icon}
        </span>
        <span // Name of the step
          className={`mt-1.5 sm:mt-2 text-xs sm:text-sm w-full break-words transition-colors duration-300 ease-in-out ${nameTextClasses}`}
        >
          {name}
        </span>
      </div>

      {/* Connecting line (replaces ChevronRightIcon) */}
      {!isLastStep && (
        <div className={`flex-1 px-1 sm:px-2 ${linePaddingTop}`}> {/* flex-1 makes line take space, padding for vertical alignment */}
          <div
            className={`h-1 w-full rounded ${lineClasses} transition-colors duration-300 ease-in-out`}
            aria-hidden="true"
          />
        </div>
      )}
    </li>
  );
};

export default Step;