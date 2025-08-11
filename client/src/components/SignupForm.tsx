import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SignupData } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft } from "lucide-react";

interface SignupFormProps {
  isIndividual: boolean;
  onBackToLogin: () => void;
}

export function SignupForm({ isIndividual, onBackToLogin }: SignupFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const signupData: SignupData & { userType: 'individual' | 'company' } = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: isIndividual ? 'individual' : 'company'
      };

      const response = await apiRequest('POST', '/api/signup', signupData);
      const result = await response.json();

      if (response.ok) {
        toast({
          title: "회원가입 성공",
          description: result.message || "회원가입이 완료되었습니다.",
        });
        
        // Update auth state
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        
        // Redirect to signup success page for 2-step signup process
        setTimeout(() => {
          window.location.href = '/signup/success';
        }, 1000);
      } else {
        toast({
          title: "회원가입 실패",
          description: result.message || "회원가입 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "회원가입 실패",
        description: "서버 연결에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto px-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBackToLogin}
          className="flex items-center gap-2 text-[#2F3036] hover:bg-[#F5F5DC] p-0"
          data-testid="button-back-login"
        >
          <ArrowLeft className="w-4 h-4" />
          로그인으로 돌아가기
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 아이디 입력 */}
        <div>
          <Label htmlFor="username" className="text-sm text-[#2F3036] mb-1 block">
            아이디 *
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="아이디 (3글자 이상)"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="w-full h-12 px-4 bg-white border border-[#2F3036]/20 rounded-lg text-[#2F3036] placeholder-[#2F3036]/50"
            data-testid="input-signup-username"
            required
          />
        </div>

        {/* 이메일 입력 */}
        <div>
          <Label htmlFor="email" className="text-sm text-[#2F3036] mb-1 block">
            이메일 *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="이메일 주소"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full h-12 px-4 bg-white border border-[#2F3036]/20 rounded-lg text-[#2F3036] placeholder-[#2F3036]/50"
            data-testid="input-signup-email"
            required
          />
        </div>

        {/* 비밀번호 입력 */}
        <div>
          <Label htmlFor="password" className="text-sm text-[#2F3036] mb-1 block">
            비밀번호 *
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호 (6글자 이상)"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full h-12 px-4 bg-white border border-[#2F3036]/20 rounded-lg text-[#2F3036] placeholder-[#2F3036]/50"
            data-testid="input-signup-password"
            required
          />
        </div>

        {/* 비밀번호 확인 입력 */}
        <div>
          <Label htmlFor="confirmPassword" className="text-sm text-[#2F3036] mb-1 block">
            비밀번호 확인 *
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="비밀번호 확인"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full h-12 px-4 bg-white border border-[#2F3036]/20 rounded-lg text-[#2F3036] placeholder-[#2F3036]/50"
            data-testid="input-signup-confirm-password"
            required
          />
        </div>

        {/* 전화번호 입력 */}
        <div>
          <Label htmlFor="phoneNumber" className="text-sm text-[#2F3036] mb-1 block">
            전화번호
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="전화번호 (예: 010-1234-5678)"
            value={formData.phoneNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
            className="w-full h-12 px-4 bg-white border border-[#2F3036]/20 rounded-lg text-[#2F3036] placeholder-[#2F3036]/50"
            data-testid="input-signup-phone"
          />
        </div>

        {/* 이름 입력 (선택사항) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName" className="text-sm text-[#2F3036] mb-1 block">
              성
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="성"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full h-12 px-4 bg-white border border-[#2F3036]/20 rounded-lg text-[#2F3036] placeholder-[#2F3036]/50"
              data-testid="input-signup-first-name"
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-sm text-[#2F3036] mb-1 block">
              이름
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="이름"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full h-12 px-4 bg-white border border-[#2F3036]/20 rounded-lg text-[#2F3036] placeholder-[#2F3036]/50"
              data-testid="input-signup-last-name"
            />
          </div>
        </div>

        {/* 회원가입 버튼 */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#2F3036] text-white rounded-lg font-medium hover:bg-[#2F3036]/90 transition-colors disabled:opacity-50"
          data-testid="button-signup"
        >
          {isLoading ? "가입 중..." : "회원가입"}
        </Button>
      </form>

      <div className="text-center mt-6 text-xs text-[#2F3036]/60">
        <p>회원가입 시 <span className="text-[#FF8C42] font-medium">일있슈</span>의 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.</p>
      </div>
    </div>
  );
}