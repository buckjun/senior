import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface JobCategory {
  id: string;
  name: string;
  displayName: string;
  description?: string;
}

// Emoji mapping for categories
const categoryEmojis: Record<string, string> = {
  "manufacturing": "🏭",
  "marketing": "📊", 
  "supply": "🏢",
  "information_technology": "💻",
  "healthcare": "⚕️",
  "logistics": "🚛",
  "science_technology": "🔬",
  "construction": "🏗️",
  "arts": "🎨"
};

export default function SignupInterestsPage() {
  const [, setLocation] = useLocation();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch job categories from API
  const { data: categories = [], isLoading } = useQuery<JobCategory[]>({
    queryKey: ["/api/job-categories"],
  });

  const saveInterestsMutation = useMutation({
    mutationFn: async (interests: string[]) => {
      const response = await apiRequest("POST", "/api/user/interests", {
        interests
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "저장 완료",
        description: "관심 분야가 저장되었습니다!",
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      console.error('Save interests error:', error);
      toast({
        title: "저장 실패",
        description: error instanceof Error ? error.message : "관심 분야 저장 중 오류가 발생했습니다.",
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
          <p className="text-sm text-gray-600 mb-2">최소 1개에서 최대 2개를 선택해주세요</p>
          <h1 className="text-lg font-bold text-gray-800">
            <span className="text-black">관심있거나 경력이 있는</span>
          </h1>
          <h1 className="text-lg font-bold text-gray-800">
            분야를 <span className="text-red-500">선택</span>해주세요
          </h1>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">관심 분야를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {/* Interest Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleInterestToggle(category.id)}
                  className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all ${
                    selectedInterests.includes(category.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  data-testid={`interest-${category.id}`}
                >
                  {/* Background Image Placeholder */}
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-blue-100 to-blue-200">
                    {categoryEmojis[category.name] || "💼"}
                  </div>
                  
                  {/* Selection Indicator */}
                  {selectedInterests.includes(category.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 py-1">
                    <p className="text-xs font-medium text-gray-800 text-center">
                      {category.displayName}
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
          </>
        )}

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