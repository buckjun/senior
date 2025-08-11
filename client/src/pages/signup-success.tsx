import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function SignupSuccessPage() {
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    setLocation("/signup/interests");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8">
        {/* Success Icon */}
        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full flex items-center justify-center">
          <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center transform rotate-12">
            <svg 
              className="w-10 h-10 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">
            가입이 성공적으로
          </h1>
          <h1 className="text-2xl font-bold text-gray-800">
            완료되었습니다!
          </h1>
        </div>

        {/* Continue Button */}
        <div className="pt-16">
          <Button
            onClick={handleContinue}
            className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-medium"
            data-testid="button-continue"
          >
            계속
          </Button>
        </div>
      </div>
    </div>
  );
}