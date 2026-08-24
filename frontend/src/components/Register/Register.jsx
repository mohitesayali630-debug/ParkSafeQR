import React, { useState } from "react";

import StepOne from "./StepOne";
import OTPVerification from "./OTPVerification";
import StepTwo from "./StepTwo";
import GenerateQR from "./GenerateQR";

function Register() {

    const [step, setStep] = useState(1);

    return (

        <>

            {step === 1 && (
                <StepOne
                    nextStep={() => setStep(2)}
                />
            )}

            {step === 2 && (
                <OTPVerification
                    nextStep={() => setStep(3)}
                    prevStep={() => setStep(1)}
                />
            )}

            {step === 3 && (
                <StepTwo
                    nextStep={() => setStep(4)}
                    prevStep={() => setStep(2)}
                />
            )}

            {step === 4 && (
                <GenerateQR />
            )}

        </>

    );
}

export default Register;