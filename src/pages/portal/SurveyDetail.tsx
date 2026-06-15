import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, type Survey } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Upload, 
  MapPin, 
  Loader2, 
  X,
  AlertTriangle,
  Save,
  CheckCircle2
} from 'lucide-react';

export default function SurveyDetail() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadSurvey() {
      if (!surveyId) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('surveys')
          .select('*')
          .eq('id', surveyId)
          .single();

        if (error) throw error;
        setSurvey(data);
        setRemarks(data.remarks || '');
      } catch (err) {
        console.error('Error fetching survey details:', err);
        setErrorMsg('Failed to load survey details.');
      } finally {
        setIsLoading(false);
      }
    }

    loadSurvey();
  }, [surveyId]);

  // Upload photo to Supabase storage bucket
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !survey) return;

    setIsUploading(true);
    setErrorMsg('');
    setSuccessMsg('');
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${survey.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error } = await supabase.storage
          .from('survey-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: publicData } = supabase.storage
          .from('survey-photos')
          .getPublicUrl(fileName);

        if (publicData?.publicUrl) {
          uploadedUrls.push(publicData.publicUrl);
        }
      }

      // Update local state and DB immediately
      const newPhotos = [...(survey.photos || []), ...uploadedUrls];
      const { data: updatedSurvey, error: dbError } = await supabase
        .from('surveys')
        .update({ 
          photos: newPhotos,
          status: survey.status === 'Assigned' ? 'In Progress' : survey.status 
        })
        .eq('id', survey.id)
        .select()
        .single();

      if (dbError) throw dbError;
      setSurvey(updatedSurvey);
    } catch (err: any) {
      console.error('Error uploading site photos:', err);
      setErrorMsg(err.message || 'Error uploading files. Make sure the storage bucket is configured.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove photo from survey
  const handleRemovePhoto = async (indexToRemove: number) => {
    if (!survey) return;
    const newPhotos = survey.photos.filter((_, idx) => idx !== indexToRemove);

    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { data, error } = await supabase
        .from('surveys')
        .update({ photos: newPhotos })
        .eq('id', survey.id)
        .select()
        .single();

      if (error) throw error;
      setSurvey(data);
    } catch (err) {
      console.error('Error removing photo:', err);
      setErrorMsg('Failed to remove photo.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Remarks only (draft save)
  const handleSaveDraft = async () => {
    if (!survey) return;
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const nextStatus = survey.status === 'Assigned' ? 'In Progress' : survey.status;
      const { data, error } = await supabase
        .from('surveys')
        .update({ 
          remarks: remarks.trim(),
          status: nextStatus
        })
        .eq('id', survey.id)
        .select()
        .single();

      if (error) throw error;
      setSurvey(data);
      setSuccessMsg('Remarks draft saved successfully!');
    } catch (err) {
      console.error('Error saving draft:', err);
      setErrorMsg('Failed to save remarks draft.');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit survey as Completed
  const handleSubmitSurvey = async () => {
    if (!survey) return;
    
    // Validation
    if (survey.photos.length === 0) {
      setErrorMsg('Please upload at least one photo of the site.');
      return;
    }
    if (!remarks.trim()) {
      setErrorMsg('Please write your remarks / findings.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { error } = await supabase
        .from('surveys')
        .update({ 
          status: 'Completed',
          remarks: remarks.trim()
        })
        .eq('id', survey.id);

      if (error) throw error;
      navigate('/portal/technician/surveys');
    } catch (err) {
      console.error('Error completing survey:', err);
      setErrorMsg('Failed to mark survey completed.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="space-y-4 max-w-md mx-auto text-center py-12">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Survey Not Found</h2>
        <p className="text-muted-foreground text-xs">The survey details could not be found.</p>
        <Button onClick={() => navigate('/portal/technician/surveys')} variant="outline" className="text-xs">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  const isEditable = survey.status === 'Assigned' || survey.status === 'In Progress';

  return (
    <div className="space-y-6 max-w-md mx-auto pb-12">
      {/* Back Button */}
      <div>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/portal/technician/surveys')}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Surveys
        </Button>
      </div>

      {/* Simplified Site Card */}
      <Card className="shadow-xs border-border/60">
        <CardContent className="p-5 space-y-4">
          <div>
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Customer Name</span>
            <h1 className="text-xl font-black text-foreground mt-0.5">{survey.customer_name}</h1>
          </div>
          
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span>{survey.location}</span>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      {errorMsg && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-xs text-destructive flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Upload Photos Section */}
      <Card className="shadow-xs">
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Upload Photos</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Take or select photos of the site layout.</p>
          </div>

          {/* Thumbnail Grid */}
          {survey.photos && survey.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {survey.photos.map((url, idx) => (
                <div key={idx} className="group relative aspect-square rounded-md border overflow-hidden bg-muted">
                  <img 
                    src={url} 
                    alt={`Site view ${idx + 1}`} 
                    className="h-full w-full object-cover"
                  />
                  {isEditable && (
                    <button
                      onClick={() => handleRemovePhoto(idx)}
                      disabled={isSaving}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 shadow-md backdrop-blur-xs"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {isEditable ? (
            <div>
              <input
                type="file"
                multiple
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                className="hidden"
                id="tech-photo-upload"
              />
              <Button
                variant="outline"
                className="w-full py-8 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 flex flex-col gap-2 font-medium cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-xs">Uploading images...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs font-bold">Tap to Upload Site Photos</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            survey.photos.length === 0 && (
              <p className="text-xs text-muted-foreground italic text-center py-2">No photos uploaded for this survey.</p>
            )
          )}
        </CardContent>
      </Card>

      {/* Remarks Section */}
      <Card className="shadow-xs">
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Remarks & Observations</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Note wiring needs, smart lock status, router positions, etc.</p>
          </div>

          {isEditable ? (
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter details about wire distances, camera angles, obstacles, etc."
              className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring text-foreground"
              disabled={isSaving}
            />
          ) : (
            <div className="rounded-md bg-muted p-3.5 text-xs text-foreground whitespace-pre-wrap leading-relaxed">
              {survey.remarks || <span className="italic text-muted-foreground">No remarks provided.</span>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isEditable ? (
        <div className="flex gap-3 pt-2">
          {/* Save Draft Button */}
          <Button
            onClick={handleSaveDraft}
            variant="outline"
            className="flex-1 py-5 font-bold cursor-pointer border-border hover:bg-muted text-foreground"
            disabled={isSaving || isUploading}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                Save Draft
              </>
            )}
          </Button>

          {/* Complete Button */}
          <Button
            onClick={handleSubmitSurvey}
            className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            disabled={isSaving || isUploading}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Mark Completed
              </>
            )}
          </Button>
        </div>
      ) : (
        <Card className="bg-slate-100 dark:bg-slate-900 border-border/60">
          <CardContent className="p-4 text-center text-xs font-semibold text-muted-foreground">
            {survey.status === 'Completed' && 'Submitted. Pending manager approval.'}
            {survey.status === 'Approved' && (
              <span className="text-emerald-600 dark:text-emerald-400">Approved and ready for quotation.</span>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
