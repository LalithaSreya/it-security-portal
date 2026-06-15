import { useEffect, useState } from 'react';
import { supabase, type GalleryItem, isUsingMock } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function GalleryManagement() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload/Edit Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formUrl, setFormUrl] = useState(''); // pasted URL (for mock / alternative)
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Delete Dialog State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error loading gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setFormTitle('');
    setFormDesc('');
    setFormUrl('');
    setUploadFile(null);
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setSelectedItem(item);
    setFormTitle(item.title);
    setFormDesc(item.description || '');
    setFormUrl(item.image_url);
    setUploadFile(null);
    setErrorMsg('');
    setIsOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
      // Revoke pasted URL if a file is picked
      setFormUrl('');
    }
  };

  const handleSaveItem = async () => {
    if (!formTitle.trim()) {
      setErrorMsg('Please enter an image title.');
      return;
    }
    if (!uploadFile && !formUrl.trim()) {
      setErrorMsg('Please upload a file or specify an image URL.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      let finalImageUrl = formUrl.trim();

      if (uploadFile) {
        if (!isUsingMock) {
          // 1. Real Supabase Upload to 'gallery-images' bucket
          const fileExt = uploadFile.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('gallery-images')
            .upload(filePath, uploadFile);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data } = supabase.storage
            .from('gallery-images')
            .getPublicUrl(filePath);

          finalImageUrl = data.publicUrl;
        } else {
          // 2. Mock Mode Upload
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Pick a random security themed unsplash image for mock visual interest
          const securityUnsplash = [
            'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&auto=format&fit=crop'
          ];
          const randomIdx = Math.floor(Math.random() * securityUnsplash.length);
          finalImageUrl = securityUnsplash[randomIdx];
        }
      }

      if (selectedItem) {
        // Edit Mode
        const { error } = await supabase
          .from('gallery')
          .update({
            title: formTitle.trim(),
            description: formDesc.trim(),
            image_url: finalImageUrl
          })
          .eq('id', selectedItem.id);

        if (error) throw error;
      } else {
        // Create Mode
        const { error } = await supabase
          .from('gallery')
          .insert({
            title: formTitle.trim(),
            description: formDesc.trim(),
            image_url: finalImageUrl
          });

        if (error) throw error;
      }

      setIsOpen(false);
      loadGallery();
    } catch (err: any) {
      console.error('Error saving gallery item:', err);
      setErrorMsg(err.message || 'Failed to save project image.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (item: GalleryItem) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;

      // Also delete from storage if real backend and was uploaded there
      if (!isUsingMock && itemToDelete.image_url.includes('gallery-images')) {
        const parts = itemToDelete.image_url.split('/');
        const fileName = parts[parts.length - 1];
        await supabase.storage
          .from('gallery-images')
          .remove([fileName]);
      }

      setIsDeleteOpen(false);
      loadGallery();
    } catch (err) {
      console.error('Error deleting gallery item:', err);
      alert('Failed to delete image from gallery.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-primary" />
            Project Gallery Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload and configure project installation photos. Images here automatically showcase on the public website.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="cursor-pointer">
          <Plus className="mr-1.5 h-4 w-4" />
          Upload Image
        </Button>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow group relative border-border/50 bg-card">
              <div className="h-48 w-full overflow-hidden bg-muted relative">
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full shadow-md bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                    onClick={() => handleOpenEdit(item)}
                  >
                    <Plus className="h-4 w-4 rotate-45" /> {/* Use general Lucide for edit since icon trigger */}
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8 rounded-full shadow-md cursor-pointer"
                    onClick={() => handleDeleteClick(item)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 space-y-1">
                <h3 className="text-sm font-bold text-foreground truncate">{item.title}</h3>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed rounded-xl py-16 bg-card">
          <ImageIcon className="h-12 w-12 text-muted-foreground/45 mb-2.5" />
          <p className="text-sm font-bold text-foreground">Gallery is empty</p>
          <p className="text-xs text-muted-foreground mt-0.5">Upload project photos to showcase them to your public customers.</p>
        </div>
      )}

      {/* UPLOAD / EDIT DIALOG */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-primary" />
              {selectedItem ? 'Edit Project Image' : 'Upload Showcase Image'}
            </DialogTitle>
            <DialogDescription>
              Configure image title, details, and upload the file to Supabase Storage.
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="bg-destructive/15 border border-destructive/20 text-destructive text-xs rounded-md p-3 font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4 text-xs py-2">
            <div className="space-y-1">
              <Label htmlFor="gal-title" className="text-foreground font-semibold">Project Title</Label>
              <Input 
                id="gal-title" 
                value={formTitle} 
                onChange={(e) => setFormTitle(e.target.value)} 
                placeholder="e.g. CCTV Camera Installation" 
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="gal-desc" className="text-foreground font-semibold">Project Description</Label>
              <Textarea 
                id="gal-desc" 
                value={formDesc} 
                onChange={(e) => setFormDesc(e.target.value)} 
                placeholder="Summarize the work done, site details, and systems installed..."
                rows={3}
              />
            </div>

            {/* File Upload OR Paste URL */}
            <div className="space-y-2.5 border-t pt-3.5">
              <div className="space-y-1">
                <Label htmlFor="gal-file" className="text-foreground font-semibold">Upload Image File</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="gal-file" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="cursor-pointer file:text-primary file:font-semibold" 
                  />
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-muted"></div>
                <span className="flex-shrink mx-3 text-[10px] text-muted-foreground uppercase font-bold">OR</span>
                <div className="flex-grow border-t border-muted"></div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="gal-url" className="text-foreground font-semibold">Paste Direct Image URL</Label>
                <Input 
                  id="gal-url" 
                  value={formUrl} 
                  onChange={(e) => { setFormUrl(e.target.value); setUploadFile(null); }} 
                  placeholder="https://images.unsplash.com/photo-..." 
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2.5">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveItem} disabled={isSaving}>
              {isSaving ? 'Uploading...' : 'Save & Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-md font-bold text-destructive flex items-center gap-1.5">
              <Trash2 className="h-5 w-5" />
              Remove Image from Gallery?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete '{itemToDelete?.title}'? This image will be removed from your public gallery immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2.5">
            <Button variant="ghost" size="sm" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button size="sm" variant="destructive" onClick={handleConfirmDelete} disabled={isSaving}>
              {isSaving ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
