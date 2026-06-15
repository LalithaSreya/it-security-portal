import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Survey } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, Calendar, MapPin, CheckCircle, Clock, PlayCircle } from 'lucide-react';

export default function MySurveys() {
  const { employee } = useAuth();
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'Assigned' | 'In Progress' | 'Completed' | 'Approved'>('all');

  useEffect(() => {
    async function fetchMySurveys() {
      if (!employee?.id) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('surveys')
          .select('*')
          .eq('assigned_technician', employee.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSurveys(data || []);
      } catch (err) {
        console.error('Error fetching surveys:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMySurveys();
  }, [employee]);

  const getStatusBadge = (status: Survey['status']) => {
    switch (status) {
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-500 border border-blue-500/20">
            <Clock className="h-3.5 w-3.5" />
            Assigned
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-500 border border-amber-500/20">
            <PlayCircle className="h-3.5 w-3.5" />
            In Progress
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
            <CheckCircle className="h-3.5 w-3.5" />
            Completed
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-500 border border-indigo-500/20">
            <CheckCircle className="h-3.5 w-3.5 text-indigo-500" />
            Approved
          </span>
        );
      default:
        return null;
    }
  };

  const filteredSurveys = surveys.filter(
    (survey) => activeTab === 'all' || survey.status === activeTab
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
          <div className="h-4 w-72 animate-pulse rounded bg-muted"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="h-6 w-1/3 rounded bg-muted"></div>
                    <div className="h-4 w-1/4 rounded bg-muted"></div>
                    <div className="h-4 w-1/2 rounded bg-muted"></div>
                  </div>
                  <div className="h-8 w-20 rounded bg-muted"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">My Assigned Surveys</h1>
        <p className="text-sm text-muted-foreground">
          View, update status, upload photos, and complete site surveys.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-border scrollbar-none">
        {(['all', 'Assigned', 'In Progress', 'Completed', 'Approved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'all' ? 'All Surveys' : tab}
          </button>
        ))}
      </div>

      {/* Surveys List */}
      {filteredSurveys.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground/60 mb-3" />
          <h3 className="font-semibold text-foreground text-md">No surveys found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You don't have any surveys in this category.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSurveys.map((survey) => (
            <Card 
              key={survey.id} 
              className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer shadow-sm"
              onClick={() => navigate(`/portal/my-surveys/${survey.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {/* Top line with Customer & Badge */}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground leading-tight">
                        {survey.customer_name}
                      </h3>
                      <p className="text-xs text-primary font-medium mt-0.5">
                        {survey.service_type}
                      </p>
                    </div>
                    {getStatusBadge(survey.status)}
                  </div>

                  {/* Details (Location, Date) */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{survey.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>Scheduled: {new Date(survey.survey_date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</span>
                    </div>
                  </div>

                  {/* Remarks preview if present */}
                  {survey.remarks && (
                    <div className="rounded-md bg-muted/50 p-3 text-xs italic text-muted-foreground border border-border/40 truncate">
                      <strong>Remarks: </strong>"{survey.remarks}"
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    <Button 
                      className="w-full text-sm font-semibold py-5"
                      variant={survey.status === 'Assigned' || survey.status === 'In Progress' ? 'default' : 'secondary'}
                    >
                      {survey.status === 'Assigned' && 'Start Survey'}
                      {survey.status === 'In Progress' && 'Continue Survey'}
                      {(survey.status === 'Completed' || survey.status === 'Approved') && 'View Survey Details'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
