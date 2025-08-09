import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building, MapPin, Heart, ExternalLink } from "lucide-react";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    companyName?: string;
    location: string;
    employmentType?: string;
    salaryRange?: string;
    matchingScore?: number;
    isSaved?: boolean;
    company?: {
      companyName: string;
    };
  };
  onSave?: (jobId: string) => void;
  onUnsave?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  showMatchingScore?: boolean;
}

export function JobCard({ job, onSave, onUnsave, onApply, showMatchingScore = false }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(job.isSaved || false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved && onUnsave) {
      onUnsave(job.id);
      setIsSaved(false);
    } else if (!isSaved && onSave) {
      onSave(job.id);
      setIsSaved(true);
    }
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply?.(job.id);
  };

  const companyName = job.company?.companyName || job.companyName || '회사명';

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-body font-semibold mb-2 line-clamp-2">{job.title}</h3>
            
            <div className="flex items-center text-caption text-gray-500 space-x-4 mb-3">
              <div className="flex items-center">
                <Building className="w-3 h-3 mr-1" />
                {companyName}
              </div>
              <div className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {job.location}
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-3">
              {job.employmentType && (
                <Badge variant="secondary" className="text-xs">
                  {job.employmentType}
                </Badge>
              )}
              {job.salaryRange && (
                <Badge variant="outline" className="text-xs">
                  {job.salaryRange}
                </Badge>
              )}
            </div>

            {showMatchingScore && job.matchingScore && (
              <div className="mb-3">
                <Badge className="status-badge status-success">
                  매칭 {job.matchingScore}%
                </Badge>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end space-y-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="text-gray-400 hover:text-red-500"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            
            <Button size="sm" onClick={handleApply} className="text-xs px-3 py-1">
              지원하기
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}