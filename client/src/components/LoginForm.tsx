import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LoginFormProps {
  isIndividual: boolean;
}

export function LoginForm({ isIndividual }: LoginFormProps) {
  const [formData, setFormData] = useState({
    id: "",
    password: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 기존 Replit Auth 사용
    window.location.href = "/api/login";
  };

  const handleNaverLogin = () => {
    // 네이버 로그인은 현재 Replit Auth로 처리
    window.location.href = "/api/login";
  };

  return (
    <div className="w-full max-w-sm mx-auto px-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 아이디 입력 */}
        <div>
          <Input
            type="text"
            placeholder="아이디"
            value={formData.id}
            onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
            className="w-full h-12 px-4 bg-white border border-[#2F3036]/20 rounded-lg text-[#2F3036] placeholder-[#2F3036]/50"
            data-testid="input-login-id"
          />
        </div>

        {/* 비밀번호 입력 */}
        <div>
          <Input
            type="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full h-12 px-4 bg-white border border-[#2F3036]/20 rounded-lg text-[#2F3036] placeholder-[#2F3036]/50"
            data-testid="input-login-password"
          />
        </div>

        {/* 로그인 버튼 */}
        <Button
          type="submit"
          className="w-full h-12 bg-[#2F3036] text-white rounded-lg font-medium hover:bg-[#2F3036]/90 transition-colors"
          data-testid="button-login"
        >
          로그인
        </Button>
      </form>

      {/* 하단 링크들 */}
      <div className="flex justify-center space-x-6 mt-6 text-sm text-[#2F3036]/70">
        <button 
          className="hover:text-[#2F3036] transition-colors"
          data-testid="link-signup"
          onClick={() => window.location.href = "/api/login"}
        >
          회원가입
        </button>
        <button 
          className="hover:text-[#2F3036] transition-colors"
          data-testid="link-find-id"
          onClick={() => window.location.href = "/api/login"}
        >
          아이디 찾기
        </button>
        <button 
          className="hover:text-[#2F3036] transition-colors"
          data-testid="link-find-password"
          onClick={() => window.location.href = "/api/login"}
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
        >
          <span className="text-white font-bold text-lg">N</span>
        </button>
      </div>
    </div>
  );
}