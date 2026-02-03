interface Props {
  currentStep: 1 | 2;
}

export function StepIndicator({ currentStep }: Props) {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}
        >
          1
        </div>
        <div className="w-12 h-1 bg-gray-200 mx-2">
          <div
            className={`h-full transition-all ${currentStep >= 2 ? 'bg-blue-600 w-full' : 'w-0'}`}
          />
        </div>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}
        >
          2
        </div>
      </div>
    </div>
  );
}
