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
      setLocation('/individual/recommendations');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">직종 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            직종 선택하기
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            귀하의 경험과 관심 분야에 맞는 직종을 선택해주세요. 
            이를 바탕으로 맞춤 채용정보를 추천드립니다.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-blue-600 font-medium">직종 선택</span>
            </div>
            <div className="w-12 h-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-500 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-gray-500">이력서 작성</span>
            </div>
            <div className="w-12 h-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-500 flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-gray-500">회사 추천</span>
            </div>
          </div>
        </div>

        {/* Job Category Selector */}
        <JobCategorySelector
          categories={categories}
          selectedCategories={selectedCategories}
          onSelectionChange={handleSelectionChange}
          onComplete={handleComplete}
          isLoading={saveCategories.isPending}
        />

        {/* Previous selection indicator */}
        {userCategories.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              이전에 선택하신 직종:
            </p>
            <div className="flex justify-center gap-2">
              {userCategories.map((category) => (
                <span 
                  key={category.id}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                >
                  {category.displayName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}