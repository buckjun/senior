import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LoginFormProps {
  isIndividual: boolean;
}

export function LoginForm({ isIndividual }: LoginFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    id: "",
    password: ""
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/login', data);
      return response.json();
    },
    onSuccess: () => {
      // 사용자 정보 다시 가져오기
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation('/dashboard');
    },
    onError: (error) => {
      toast({
        title: "로그인 실패",
        description: "아이디 또는 비밀번호가 올바르지 않습니다.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력 검증
    if (!formData.id.trim() || !formData.password.trim()) {
      toast({
        title: "입력 오류",
        description: "아이디와 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate({
      email: formData.id,
      password: formData.password
    });
  };

  const handleNaverLogin = () => {
    // 네이버 로그인으로 바로 Replit Auth 진행
    window.location.href = "/api/login";
  };

  const handleSignup = () => {
    if (isIndividual) {
      setLocation('/individual/signup');
    } else {
      setLocation('/company/signup');
    }
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
            className="w-full h-12 px-4 bg-white border border-gray-200 rounded-lg text-gray-600 placeholder-gray-400"
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
            className="w-full h-12 px-4 bg-white border border-gray-200 rounded-lg text-gray-600 placeholder-gray-400"
            data-testid="input-login-password"
          />
        </div>

        {/* 로그인 버튼 */}
        <Button
          type="submit"
          className="w-full h-12 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
          data-testid="button-login"
        >
          로그인
        </Button>
      </form>

      {/* 하단 링크들 */}
      <div className="flex justify-center space-x-6 mt-6 text-sm text-gray-600">
        <button 
          className="hover:text-gray-800 transition-colors"
          data-testid="link-signup"
          onClick={handleSignup}
        >
          회원가입
        </button>
        <button 
          className="hover:text-gray-800 transition-colors"
          data-testid="link-find-id"
          onClick={() => window.location.href = "/api/login"}
        >
          아이디 찾기
        </button>
        <button 
          className="hover:text-gray-800 transition-colors"
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