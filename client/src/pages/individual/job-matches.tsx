
import { MobileLayout } from '@/components/layout/MobileLayout';
import { MobileButton } from '@/components/ui/mobile-card';
import { useLocation } from 'wouter';
import { Heart, MapPin, Clock, TrendingUp, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function JobMatches() {
  const [, setLocation] = useLocation();
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const jobs = [
    {
      id: '1',
      company: '주식회사 고잔점',
      position: '자동차정비 엔지니어',
      match: 91,
      location: '서울 강남구',
      type: '정규직',
      salary: '3,000-4,000만원'
    },
    {
      id: '2', 
      company: '(주)글로벌스카우트',
      position: 'SCM Manager',
      match: 75,
      location: '경기 성남시',
      type: '정규직',
      salary: '4,500-5,500만원'
    },
    {
      id: '3',
      company: '테크솔루션',
      position: '품질관리 담당자',
      match: 68,
      location: '인천 남동구',
      type: '정규직',
      salary: '3,500-4,200만원'
    }
  ];

  const toggleSave = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  return (
    <MobileLayout showHeader={false} showBottomNav={true}>
      <div className="flex-1 flex flex-col" style={{ backgroundColor: '#FEF7E6' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-orange-200">
          <button onClick={() => setLocation('/individual/dashboard')}>
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">맞춤 일자리</h1>
          <button onClick={() => setLocation('/individual/search')}>
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Match Summary */}
        <div className="bg-white mx-4 mt-4 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">오늘의 추천 일자리</h3>
              <p className="text-sm text-gray-600">총 {jobs.length}개의 맞춤 일자리를 찾았습니다</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-500">{jobs.length}</div>
              <div className="text-xs text-gray-500">NEW</div>
            </div>
          </div>
        </div>

        {/* Job List */}
        <div className="flex-1 px-4 py-4 space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm">
              {/* Company & Match */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">{job.company}</h3>
                  <h4 className="font-bold text-gray-900 text-base mt-1">{job.position}</h4>
                </div>
                <button 
                  onClick={() => toggleSave(job.id)}
                  className="p-2"
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      savedJobs.includes(job.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-400'
                    }`} 
                  />
                </button>
              </div>

              {/* Match Percentage */}
              <div className="flex items-center mb-3">
                <div className="flex items-center bg-green-100 px-2 py-1 rounded-full">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-semibold text-green-600">{job.match}% 매칭</span>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{job.type} • {job.salary}</span>
                </div>
              </div>

              {/* Action Button */}
              <MobileButton
                fullWidth
                size="sm"
                variant="outline"
                className="border-orange-400 text-orange-600 hover:bg-orange-50"
              >
                자세히 보기
              </MobileButton>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
}
