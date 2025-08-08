import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";

interface UploadResult {
  success: boolean;
  message: string;
  totalRows: number;
  validRows: number;
  insertedRows: number;
  errors: string[];
}

export function ExcelUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "파일 선택 필요",
        description: "업로드할 엑셀 파일을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('excelFile', selectedFile);

    try {
      const response = await fetch('/api/upload-excel', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult(result);
        toast({
          title: "업로드 성공",
          description: `${result.insertedRows}개의 데이터가 성공적으로 저장되었습니다.`,
        });
      } else {
        throw new Error(result.error || '업로드 실패');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "업로드 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const clearResults = () => {
    setSelectedFile(null);
    setUploadResult(null);
    // Reset file input
    const fileInput = document.getElementById('excel-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <FileSpreadsheet className="h-6 w-6" />
          고령자 재취업 데이터 업로드
        </CardTitle>
        <CardDescription>
          엑셀 파일(.xlsx, .xls)로 고령자 재취업 성공 사례를 업로드하세요
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File Selection */}
        <div className="space-y-2">
          <label htmlFor="excel-file-input" className="text-sm font-medium">
            엑셀 파일 선택
          </label>
          <div className="flex gap-2">
            <Input
              id="excel-file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              disabled={uploading}
              className="flex-1"
              data-testid="input-excel-file"
            />
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="min-w-[100px]"
              data-testid="button-upload-excel"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  업로드
                </>
              )}
            </Button>
          </div>
        </div>

        {/* File Info */}
        {selectedFile && (
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertDescription>
              <strong>선택된 파일:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>파일 업로드 및 데이터 처리 중...</span>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {/* Upload Results */}
        {uploadResult && (
          <div className="space-y-4">
            <Alert className={uploadResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {uploadResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>{uploadResult.message}</strong></p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">총 행 수:</span> {uploadResult.totalRows}개
                    </div>
                    <div>
                      <span className="font-medium">유효한 행:</span> {uploadResult.validRows}개
                    </div>
                    <div>
                      <span className="font-medium">저장된 행:</span> {uploadResult.insertedRows}개
                    </div>
                    <div>
                      <span className="font-medium">오류 행:</span> {(uploadResult.totalRows - uploadResult.validRows)}개
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {/* Error Details */}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">처리 중 발생한 오류 (최대 10개):</p>
                    <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                      {uploadResult.errors.map((error, index) => (
                        <li key={index} className="list-disc list-inside">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Actions */}
            {uploadResult.success && (
              <div className="flex justify-center">
                <Button onClick={clearResults} variant="outline" data-testid="button-upload-another">
                  다른 파일 업로드
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Expected Format Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">예상 엑셀 컬럼 형식:</p>
              <div className="text-sm grid grid-cols-2 gap-1">
                <span>• 나이, 성별, 지역, 학력</span>
                <span>• 이전직종, 이전직책, 이전연봉</span>
                <span>• 새직종, 새직책, 새연봉</span>
                <span>• 고용형태, 근무형태</span>
                <span>• 구직기간, 구직방법</span>
                <span>• 만족도, 워라밸, 연봉변화율</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                * 컬럼명은 한글 또는 영문으로 입력 가능합니다. 일부 컬럼이 누락되어도 처리됩니다.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}