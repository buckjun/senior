import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { JobCategorySelector } from '@/components/JobCategorySelector';
import { useToast } from '@/hooks/use-toast';
import { JobCategory } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export default function JobCategorySelectionPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch all job categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<JobCategory[]>({
    queryKey: ['/api/job-categories'],
  });

  // Check if user has already selected categories
  const { data: userCategories = [] } = useQuery<JobCategory[]>({
    queryKey: ['/api/user/job-categories'],
  });

  // Save user selected categories
  const saveCategories = useMutation({
    mutationFn: async (categoryIds: string[]) => {
      return await apiRequest('POST', '/api/user/job-categories', { categoryIds });
    },
    onSuccess: () => {
      toast({
        title: "직종 선택 완료",
        description: "선택하신 직종이 저장되었습니다. 이제 이력서를 작성해주세요.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/job-categories'] });
      
      // Redirect to company recommendations
      setLocation('/individual/company-recommendations');
    },
    onError: (error: any) => {
      toast({
        title: "오류 발생",
        description: "직종 선택을 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error('Error saving categories:', error);
    },
  });

  const handleSelectionChange = (newSelection: string[]) => {
    setSelectedCategories(newSelection);
  };

  const handleComplete = () => {
    if (selectedCategories.length === 0) {
      toast({
        title: "선택 필요",
        description: "최소 1개의 직종을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    saveCategories.mutate(selectedCategories);
  };

  useEffect(() => {
    // If user has already selected categories, initialize with them
    if (userCategories.length > 0) {
      setSelectedCategories(userCategories.map(cat => cat.id));
    }
  }, [userCategories]);

  if (categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">직종 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              맞춤 직종 선택
            </h1>
            <p className="text-gray-600">
              경험과 관심 분야에 맞는 직종을 선택하면 일있슈가 최적의 기업을 추천해드립니다
            </p>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-8 flex items-center justify-center space-x-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                1
              </div>
              <span className="ml-3 text-blue-600 font-medium">직종 선택</span>
            </div>
            <div className="w-16 h-0.5 bg-blue-200"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-200 text-blue-400 flex items-center justify-center font-medium">
                2
              </div>
              <span className="ml-3 text-gray-500">기업 추천</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Previous selection indicator */}
          {userCategories.length > 0 && (
            <div className="mb-6 bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
              <p className="text-sm text-gray-600 mb-3">
                이전에 선택하신 직종:
              </p>
              <div className="flex flex-wrap gap-2">
                {userCategories.map((category) => (
                  <span 
                    key={category.id}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {category.displayName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job Category Selector */}
          <JobCategorySelector
            categories={categories}
            selectedCategories={selectedCategories}
            onSelectionChange={handleSelectionChange}
            onComplete={handleComplete}
            isLoading={saveCategories.isPending}
          />
        </div>
      </div>
    </div>
  );
}