import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { JobCategory } from '@shared/schema';
import { Info } from 'lucide-react';

interface JobCategorySelectorProps {
  categories: JobCategory[];
  selectedCategories: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onComplete: () => void;
  isLoading?: boolean;
}

export function JobCategorySelector({
  categories,
  selectedCategories,
  onSelectionChange,
  onComplete,
  isLoading = false
}: JobCategorySelectorProps) {
  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    let newSelection: string[];
    
    if (checked) {
      // Add category if under limit
      if (selectedCategories.length < 2) {
        newSelection = [...selectedCategories, categoryId];
      } else {
        // Replace oldest selection
        newSelection = [selectedCategories[1], categoryId];
      }
    } else {
      // Remove category
      newSelection = selectedCategories.filter(id => id !== categoryId);
    }
    
    onSelectionChange(newSelection);
  };

  const canSelect = (categoryId: string) => {
    return selectedCategories.includes(categoryId) || selectedCategories.length < 2;
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-white rounded-2xl p-6 border border-[#F5F5DC] shadow-sm">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-[#D4B896] mt-0.5" />
          <div className="text-[#2F3036]">
            <strong>경험이 있거나 도전해보고 싶으신 직종</strong>을 1~2개 선택해주세요.
            선택하신 직종을 바탕으로 맞춤 회사를 추천해드립니다.
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedCategories.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-[#F5F5DC] shadow-sm">
          <p className="text-sm text-[#2F3036]/70 mb-3 text-center">선택한 직종:</p>
          <div className="flex justify-center flex-wrap gap-2">
            {selectedCategories.map((categoryId) => {
              const category = categories.find(c => c.id === categoryId);
              return category ? (
                <Badge key={categoryId} className="bg-[#F5F5DC] text-[#2F3036] hover:bg-[#D4B896]">
                  {category.displayName}
                </Badge>
              ) : null;
            })}
          </div>
          <p className="text-xs text-[#2F3036]/50 mt-2 text-center">
            {selectedCategories.length}/2 선택됨
          </p>
        </div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          const isSelectable = canSelect(category.id);
          
          return (
            <div 
              key={category.id}
              className={`bg-white rounded-2xl p-6 border transition-all cursor-pointer ${
                isSelected 
                  ? 'border-[#D4B896] bg-[#FFFEF0] shadow-md' 
                  : isSelectable 
                    ? 'border-gray-200 hover:border-[#D4B896] hover:shadow-md' 
                    : 'border-gray-200 opacity-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (isSelectable) {
                  handleCategoryToggle(category.id, !isSelected);
                }
              }}
              data-testid={`card-category-${category.name}`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{category.displayName}</h3>
                <Checkbox
                  checked={isSelected}
                  disabled={!isSelectable}
                  data-testid={`checkbox-category-${category.name}`}
                  className="text-[#D4B896]"
                />
              </div>
              <p className="text-sm text-gray-600">
                {category.description || '관련 경험이나 관심이 있는 분야입니다.'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Complete Button */}
      <div className="text-center pt-8">
        <Button 
          onClick={onComplete}
          disabled={selectedCategories.length === 0 || isLoading}
          className="bg-[#D4B896] hover:bg-[#D4B896]/90 text-white px-8 py-3 text-lg font-medium rounded-xl"
          data-testid="button-complete-selection"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              저장 중...
            </>
          ) : (
            <>
              맞춤 기업 찾기 ({selectedCategories.length}/2)
            </>
          )}
        </Button>
        
        {selectedCategories.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            최소 1개의 직종을 선택해주세요
          </p>
        )}
      </div>
    </div>
  );
}