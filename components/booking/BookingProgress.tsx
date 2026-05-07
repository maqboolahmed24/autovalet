type BookingProgressProps = {
  currentStepIndex: number;
  totalSteps: number;
  currentLabel: string;
};

export function BookingProgress({ currentStepIndex, totalSteps, currentLabel }: BookingProgressProps) {
  const stepNumber = currentStepIndex + 1;
  const progressWidth = `${(stepNumber / totalSteps) * 100}%`;

  return (
    <div className="step-progress booking-progress" aria-label="Booking progress">
      <div className="step-progress__meta">
        <span>
          Step {stepNumber} of {totalSteps}
        </span>
        <span>{currentLabel}</span>
      </div>
      <div
        className="step-progress__track"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={stepNumber}
        aria-valuetext={`Step ${stepNumber} of ${totalSteps}: ${currentLabel}`}
      >
        <div className="step-progress__bar" style={{ width: progressWidth }} />
      </div>
    </div>
  );
}
