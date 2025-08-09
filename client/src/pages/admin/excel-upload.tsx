import { ExcelUploader } from "@/components/ExcelUploader";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Database, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExcelUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                홈으로
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                데이터 관리
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                고령자 재취업 데이터를 업로드하고 관리하세요
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">데이터 업로드</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">엑셀 파일</div>
              <p className="text-xs text-muted-foreground">
                .xlsx, .xls 형식 지원
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">데이터 활용</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">AI 분석</div>
              <p className="text-xs text-muted-foreground">
                패턴 분석 및 매칭 개선
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">보안</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">안전 보관</div>
              <p className="text-xs text-muted-foreground">
                개인정보 보호 준수
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Upload Section */}
        <ExcelUploader />

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>데이터 활용 방법</CardTitle>
            <CardDescription>
              업로드된 데이터는 다음과 같이 활용됩니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">매칭 알고리즘 개선</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• 성공 패턴 분석을 통한 추천 정확도 향상</li>
                  <li>• 연령대별, 지역별 취업 트렌드 파악</li>
                  <li>• 업종 전환 성공 사례 학습</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">통계 및 인사이트 제공</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• 대시보드 통계 업데이트</li>
                  <li>• 구직자에게 현실적인 기대치 제공</li>
                  <li>• 기업에게 고령자 채용 참고 자료</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}