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
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <Info className="w-4 h-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>경험이 있거나 도전해보고 싶으신 직종</strong>을 1~2개 선택해주세요.
          선택하신 직종을 바탕으로 맞춤 회사를 추천해드립니다.
        </AlertDescription>
      </Alert>

      {/* Selection Summary */}
      {selectedCategories.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">선택한 직종:</p>
          <div className="flex justify-center flex-wrap gap-2">
            {selectedCategories.map((categoryId) => {
              const category = categories.find(c => c.id === categoryId);
              return category ? (
                <Badge key={categoryId} variant="default" className="text-sm">
                  {category.displayName}
                </Badge>
              ) : null;
            })}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {selectedCategories.length}/2 선택됨
          </p>
        </div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          const isSelectable = canSelect(category.id);
          
          return (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50 dark:bg-blue-900/20' 
                  : isSelectable 
                    ? 'hover:border-blue-300 hover:shadow-md' 
                    : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (isSelectable) {
                  handleCategoryToggle(category.id, !isSelected);
                }
              }}
              data-testid={`card-category-${category.name}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{category.displayName}</CardTitle>
                  <Checkbox
                    checked={isSelected}
                    disabled={!isSelectable}
                    onChange={(checked) => {
                      if (isSelectable) {
                        handleCategoryToggle(category.id, checked as boolean);
                      }
                    }}
                    data-testid={`checkbox-category-${category.name}`}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Complete Button */}
      <div className="text-center pt-6">
        <Button 
          onClick={onComplete}
          disabled={selectedCategories.length === 0 || isLoading}
          size="lg"
          data-testid="button-complete-selection"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              저장 중...
            </>
          ) : (
            `선택 완료 (${selectedCategories.length}/2)`
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