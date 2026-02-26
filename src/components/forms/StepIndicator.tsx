interface Props {
  currentStep: 1 | 2;
}

const STEP_LABELS = ['ご相談内容', 'お客様情報'];

export function StepIndicator({ currentStep }: Props) {
  return (
    <nav aria-label="入力ステップ" className="flex items-center justify-center mb-8">
      <ol className="flex items-center">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = (index + 1) as 1 | 2;
          const isActive = currentStep >= stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <li key={stepNumber} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ${
                    isActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                  aria-current={currentStep === stepNumber ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <span aria-hidden="true">&#10003;</span>
                  ) : (
                    stepNumber
                  )}
                </div>
                <span className={`text-xs mt-1 transition-colors duration-300 ${isActive ? 'text-primary font-medium' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {stepNumber < STEP_LABELS.length && (
                <div className="w-12 h-1 bg-gray-200 mx-2 rounded-full overflow-hidden self-start mt-4">
                  <div
                    className={`h-full bg-primary rounded-full transition-all duration-500 ease-out ${
                      currentStep >= stepNumber + 1 ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
