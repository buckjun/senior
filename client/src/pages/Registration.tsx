import { useState } from "react";

export default function Registration() {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    birthday: '',
    gender: 'female',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 상태바 */}
      <div className="flex justify-between items-center px-6 py-2 text-black text-sm font-medium">
        <span>1:47</span>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-black rounded-full"></div>
            <div className="w-1 h-3 bg-black rounded-full"></div>
            <div className="w-1 h-3 bg-black rounded-full"></div>
            <div className="w-1 h-3 bg-black/50 rounded-full"></div>
          </div>
          <div className="w-6 h-3 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* 헤더 */}
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-black">회원가입</h1>
      </div>

      {/* 폼 */}
      <div className="flex-1 px-6 space-y-6">
        {/* 아이디 */}
        <div>
          <label className="block text-black font-medium mb-2">아이디</label>
          <input
            type="text"
            placeholder="abcd1234"
            value={formData.id}
            onChange={(e) => handleChange('id', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-400"
          />
        </div>

        {/* 이름 */}
        <div>
          <label className="block text-black font-medium mb-2">이름</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full p-3 rounded-lg border-2 border-blue-500 focus:border-blue-600 outline-none"
            style={{ borderColor: formData.name ? '#3b82f6' : '#d1d5db' }}
          />
        </div>

        {/* 생년월일 */}
        <div>
          <label className="block text-black font-medium mb-2">생년월일</label>
          <input
            type="text"
            placeholder="1977/01/01"
            value={formData.birthday}
            onChange={(e) => handleChange('birthday', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-400"
          />
        </div>

        {/* 성별 */}
        <div>
          <label className="block text-black font-medium mb-2">성별</label>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-5 h-5 mr-2"
              />
              <span className="text-lg">여성</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-5 h-5 mr-2"
              />
              <span className="text-lg">남성</span>
            </label>
          </div>
        </div>

        {/* 전화번호 */}
        <div>
          <label className="block text-black font-medium mb-2">전화번호</label>
          <input
            type="tel"
            placeholder="010-1234-1234"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-400"
          />
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block text-black font-medium mb-2">비밀번호</label>
          <div className="relative">
            <input
              type="password"
              placeholder="비밀번호 생성"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-400 pr-10"
            />
            <button className="absolute right-3 top-3 text-gray-400">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 비밀번호 재확인 */}
        <div>
          <div className="relative">
            <input
              type="password"
              placeholder="비밀번호 재확인"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 placeholder-gray-400 pr-10"
            />
            <button className="absolute right-3 top-3 text-gray-400">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 약관 동의 */}
        <div className="flex items-start space-x-3">
          <input type="checkbox" className="mt-1 w-4 h-4" />
          <p className="text-sm text-gray-600">
            저는 이용약관과 개인정보 처리방침을 읽었으며,
            이에 동의합니다.
          </p>
        </div>

        {/* 가입하기 버튼 */}
        <button
          onClick={() => window.location.href = '/api/login'}
          className="w-full bg-gray-800 text-white py-4 rounded-lg text-lg font-medium"
        >
          가입하기
        </button>
      </div>
    </div>
  );
}