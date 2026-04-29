export function StepProgress({ currentStep, steps }) {
  return (
    <ol className="step-progress" role="list">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const state =
          stepNumber < currentStep ? 'complete' : stepNumber === currentStep ? 'current' : 'upcoming';

        return (
          <li className={`step-progress__item step-progress__item--${state}`} key={step.label}>
            <span className="step-progress__bullet">{stepNumber}</span>
            <div className="step-progress__copy">
              <strong>{step.label}</strong>
              {step.description ? <span>{step.description}</span> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
