import React from 'react';

interface Props {
    currentStep: number;
}

const StepIndicator: React.FC<Props> = ({ currentStep }) => {
    const steps = [
        { num: 1, label: '现状' },
        { num: 2, label: '能力' },
        { num: 3, label: '目标' }
    ];

    const progressWidth = currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%';

    return (
        <div className="flex justify-between mb-8 relative px-4 select-none">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 rounded mx-4" />
            
            {/* Active Line */}
            <div 
                className="absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded mx-4 transition-all duration-300" 
                style={{ width: progressWidth }}
            />

            {steps.map((step) => {
                const isActive = step.num <= currentStep;
                return (
                    <div key={step.num} className="flex flex-col items-center">
                        <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-300 ${
                                isActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                            }`}
                        >
                            {step.num}
                        </div>
                        <span className={`text-xs mt-1 font-medium ${isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default StepIndicator;