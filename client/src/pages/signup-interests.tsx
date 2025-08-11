import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const interests = [
  { id: "manufacturing", name: "제조업", image: "🏭" },
  { id: "marketing", name: "마케팅", image: "📊" },
  { id: "service", name: "서비스업", image: "🏢" },
  { id: "information_technology", name: "정보통신", image: "💻" },
  { id: "medical", name: "의료", image: "⚕️" },
  { id: "logistics", name: "운수 및 창고업", image: "🚛" },
  { id: "science_technology", name: "과학기술", image: "🔬" },
  { id: "construction", name: "건설업", image: "🏗️" },
  { id: "arts", name: "예술", image: "🎨" }
];

export default function SignupInterestsPage() {
  const [, setLocation] = useLocation();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveInterestsMutation = useMutation({
    mutationFn: async (interests: string[]) => {
      const response = await apiRequest("POST", "/api/user/interests", {
        interests
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "저장 실패",
        description: "관심 분야 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  });

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        // Remove if already selected
        return prev.filter(id => id !== interestId);
      } else if (prev.length < 2) {
        // Add if less than 2 selected
        return [...prev, interestId];
      } else {
        // Replace the first one if already 2 selected
        return [prev[1], interestId];
      }
    });
  };

  const handleComplete = () => {
    if (selectedInterests.length === 0) {
      toast({
        title: "선택 필요",
        description: "최소 1개의 관심 분야를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    saveInterestsMutation.mutate(selectedInterests);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-600 mb-2">최소 2개에서 최대 3개를 선택해주세요</p>
          <h1 className="text-lg font-bold text-gray-800">
            <span className="text-black">회원아이디님</span>
            <span className="text-gray-600">이 관심있거나 경력이 있는</span>
          </h1>
          <h1 className="text-lg font-bold text-gray-800">
            분야의 <span className="text-red-500">키워드</span>를 선택해주세요
          </h1>
        </div>

        {/* Interest Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {interests.map((interest) => (
            <button
              key={interest.id}
              onClick={() => handleInterestToggle(interest.id)}
              className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all ${
                selectedInterests.includes(interest.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              data-testid={`interest-${interest.id}`}
            >
              {/* Background Image Placeholder */}
              <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-blue-100 to-blue-200">
                {interest.image}
              </div>
              
              {/* Selection Indicator */}
              {selectedInterests.includes(interest.id) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 py-1">
                <p className="text-xs font-medium text-gray-800 text-center">
                  {interest.name}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Selection Counter */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            {selectedInterests.length}/2 선택됨
          </p>
        </div>

        {/* Complete Button */}
        <Button
          onClick={handleComplete}
          disabled={selectedInterests.length === 0 || saveInterestsMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-medium disabled:opacity-50"
          data-testid="button-complete"
        >
          {saveInterestsMutation.isPending ? "저장 중..." : "완료"}
        </Button>
      </div>
    </div>
  );
}