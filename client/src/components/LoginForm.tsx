import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LoginData } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface LoginFormProps {
  isIndividual: boolean;
  onShowSignup: () => void;
}

export function LoginForm({ isIndividual, onShowSignup }: LoginFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      const loginData: LoginData = {
        username: formData.username,
        password: formData.password,
        userType: isIndividual ? 'individual' : 'company'
      };

      const response = await apiRequest('POST', '/api/login', loginData);
      const result = await response.json();

      if (response.ok) {
        toast({
          title: "로그인 성공",
          description: result.message || "로그인되었습니다.",
        });
        
        // Update auth state
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        toast({
          title: "로그인 실패",
          description: result.message || "아이디 또는 비밀번호를 확인해주세요.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Login error details:', error instanceof Error ? error.message : 'Unknown error');
      toast({
        title: "로그인 실패",
        description: error instanceof Error ? error.message : "서버 연결에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNaverLogin = () => {
    // 추후 구현 예정
    toast({
      title: "준비 중",
      description: "네이버 로그인 기능은 준비 중입니다.",
    });
  };

  return (
    <div className="w-full max-w-sm mx-auto px-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 아이디 입력 */}
        <div>
          <Label htmlFor="username" className="text-sm text-[#2F3036] mb-1 block">
            아이디
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="아이디를 입력하세요"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="w-full h-12 px-4 bg-white border border-[#2F3036]/20 rounded-lg text-[#2F3036] placeholder-[#2F3036]/50"
            data-testid="input-login-username"
            required
          />
        </div>

        {/* 비밀번호 입력 */}
        <div>
          <Label htmlFor="password" className="text-sm text-[#2F3036] mb-1 block">
            비밀번호
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full h-12 px-4 bg-white border border-[#2F3036]/20 rounded-lg text-[#2F3036] placeholder-[#2F3036]/50"
            data-testid="input-login-password"
            required
          />
        </div>

        {/* 로그인 버튼 */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#2F3036] text-white rounded-lg font-medium hover:bg-[#2F3036]/90 transition-colors disabled:opacity-50"
          data-testid="button-login"
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </Button>
      </form>

      {/* 하단 링크들 */}
      <div className="flex justify-center space-x-6 mt-6 text-sm text-[#2F3036]/70">
        <button 
          className="hover:text-[#2F3036] transition-colors font-medium"
          data-testid="link-signup"
          onClick={onShowSignup}
        >
          회원가입
        </button>
        <button 
          className="hover:text-[#2F3036] transition-colors"
          data-testid="link-find-id"
          onClick={() => toast({ title: "준비 중", description: "아이디 찾기 기능은 준비 중입니다." })}
        >
          아이디 찾기
        </button>
        <button 
          className="hover:text-[#2F3036] transition-colors"
          data-testid="link-find-password"
          onClick={() => toast({ title: "준비 중", description: "비밀번호 찾기 기능은 준비 중입니다." })}
        >
          비밀번호 찾기
        </button>
      </div>

      {/* 네이버 로그인 버튼 */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleNaverLogin}
          className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
          data-testid="button-naver-login"
          title="네이버 로그인 (준비 중)"
        >
          <span className="text-white font-bold text-lg">N</span>
        </button>
      </div>
    </div>
  );
}