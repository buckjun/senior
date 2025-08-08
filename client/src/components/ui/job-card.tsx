import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Heart, Building } from 'lucide-react';
import type { JobPosting } from '@shared/schema';

interface JobCardProps {
  job: JobPosting & { 
    company?: { companyName: string; logoUrl?: string; };
    matchingScore?: number;
    isSaved?: boolean;
  };
  onSave?: (jobId: string) => void;
  onUnsave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  showMatchingScore?: boolean;
  className?: string;
}

export function JobCard({ 
  job, 
  onSave, 
  onUnsave, 
  onApply, 
  showMatchingScore = false,
  className = "" 
}: JobCardProps) {
  const handleSaveToggle = () => {
    if (job.isSaved && onUnsave) {
      onUnsave(job.id);
    } else if (!job.isSaved && onSave) {
      onSave(job.id);
    }
  };

  const getMatchingScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-600';
    if (score >= 90) return 'bg-secondary/10 text-secondary';
    if (score >= 80) return 'bg-accent/10 text-accent';
    return 'bg-primary/10 text-primary';
  };

  const formatSalary = () => {
    if (!job.salaryAmount) return null;
    const amount = parseFloat(job.salaryAmount);
    const type = job.salaryType;
    
    if (type === 'monthly') return `월 ${amount.toLocaleString()}만원`;
    if (type === 'annual') return `연 ${amount.toLocaleString()}만원`;
    if (type === 'hourly') return `시급 ${amount.toLocaleString()}원`;
    return `${amount.toLocaleString()}원`;
  };

  return (
    <div className={`card-mobile ${className}`} data-testid={`job-card-${job.id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-body font-bold mb-1" data-testid="job-title">
            {job.title}
          </h4>
          <div className="flex items-center text-gray-600 mb-2">
            {job.company ? (
              <>
                <Building className="w-4 h-4 mr-1" />
                <span data-testid="company-name">{job.company.companyName}</span>
              </>
            ) : (
              <span data-testid="company-name">회사명</span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1" />
            <span data-testid="job-location">{job.location}</span>
            {job.workSchedule === 'flexible' && (
              <>
                <span className="mx-2">·</span>
                <Clock className="w-4 h-4 mr-1" />
                <span>시간협의가능</span>
              </>
            )}
          </div>
        </div>
        
        <div className="text-right">
          {showMatchingScore && job.matchingScore && (
            <Badge 
              className={`status-badge mb-2 ${getMatchingScoreColor(job.matchingScore)}`}
              data-testid="matching-score"
            >
              {job.matchingScore}% 매칭
            </Badge>
          )}
          {job.prefersSeniors && (
            <Badge className="status-badge bg-accent/10 text-accent">
              시니어 우대
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-accent font-bold text-body" data-testid="job-salary">
          {formatSalary() || '급여협의'}
        </span>
        
        <div className="flex space-x-2">
          {(onSave || onUnsave) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveToggle}
              className="w-10 h-10 p-0"
              data-testid={`button-${job.isSaved ? 'unsave' : 'save'}-job`}
            >
              <Heart className={`w-5 h-5 ${job.isSaved ? 'fill-current text-destructive' : 'text-gray-400'}`} />
            </Button>
          )}
          
          {onApply && (
            <Button
              onClick={() => onApply(job.id)}
              className="btn-primary px-6 py-2"
              data-testid="button-apply-job"
            >
              지원하기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
