import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  ArrowLeft, 
  Send, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';

export default function SubmitReport() {
  const { employee } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [location, setLocation] = useState('');
  const [reportType, setReportType] = useState('Site Inspection');
  const [description, setDescription] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee?.id) return;

    if (!customerName.trim() || !location.trim() || !description.trim()) {
      setErrorMsg('Please fill in all the required report fields.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.from('reports').insert({
        submitted_by: employee.id,
        customer_name: customerName.trim(),
        location: location.trim(),
        report_type: reportType,
        description: description.trim(),
      });

      if (error) throw error;
      
      alert('Field report submitted successfully!');
      navigate('/portal/technician/dashboard');
    } catch (err: any) {
      console.error('Error submitting report:', err);
      setErrorMsg(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto pb-12">
      {/* Back Button */}
      <div>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/portal/technician/dashboard')}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Form Card */}
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5.5 w-5.5 text-primary shrink-0" />
            Submit Field Report
          </CardTitle>
          <CardDescription>
            Report site inspection summaries, wiring layouts, hazard notices, or other operations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-xs text-destructive flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Customer Name */}
            <div className="space-y-1.5">
              <Label htmlFor="cust-name" className="text-sm font-semibold">Customer / Site Name *</Label>
              <Input
                id="cust-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. City Hall, ACME Corp"
                disabled={isSaving}
                className="py-5"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label htmlFor="loc" className="text-sm font-semibold">Location / Address *</Label>
              <Input
                id="loc"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Room 402, 123 Main St"
                disabled={isSaving}
                className="py-5"
              />
            </div>

            {/* Report Type */}
            <div className="space-y-1.5">
              <Label htmlFor="rep-type" className="text-sm font-semibold">Report Type *</Label>
              <select
                id="rep-type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent px-3 py-3.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground bg-card"
                disabled={isSaving}
              >
                <option value="Site Inspection">Site Inspection</option>
                <option value="Wiring Status">Wiring Status</option>
                <option value="Site Hazard Notice">Site Hazard Notice</option>
                <option value="Equipment Troubleshooting">Equipment Troubleshooting</option>
                <option value="Other Observation">Other Observation</option>
              </select>
            </div>

            {/* Description Details */}
            <div className="space-y-1.5">
              <Label htmlFor="desc" className="text-sm font-semibold">Observations & Details *</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you observed, installations completed, or details about the field issue..."
                className="min-h-[140px] leading-relaxed text-sm"
                disabled={isSaving}
              />
            </div>

            {/* Submit Actions */}
            <div className="pt-2 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/portal/technician/dashboard')}
                className="flex-1 py-5 cursor-pointer font-bold"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 py-5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-bold"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
