import { useState, useEffect } from 'react';
import { Share2, Copy, Check, Globe, GlobeLock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function ShareJournalButton() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [journalSlug, setJournalSlug] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch current share status when dialog opens
  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('user_profiles')
        .select('share_id, is_public_journal')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setShareId(data.share_id);
        setIsPublic(data.is_public_journal ?? false);
      }
      setLoading(false);
    })();
  }, [open, user]);

  const togglePublic = async (checked: boolean) => {
    if (!user) return;
    setIsPublic(checked);
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_public_journal: checked })
      .eq('user_id', user.id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update sharing setting.', variant: 'destructive' });
      setIsPublic(!checked);
    } else {
      toast({
        title: checked ? 'Journal is now public' : 'Journal is now private',
        description: checked ? 'Anyone with the link can view your journal.' : 'Your journal is no longer publicly accessible.',
      });
    }
  };

  const shareUrl = shareId ? `${window.location.origin}/journal/share/${shareId}` : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: 'Link copied!', description: 'Share this link with anyone.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Error', description: 'Failed to copy link.', variant: 'destructive' });
    }
  };

  if (!user) return null;

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setOpen(true)}>
        <Share2 className="w-3.5 h-3.5" />
        Share Journal
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" /> Share Journal
            </DialogTitle>
            <DialogDescription>
              Allow others to view your trading journal with a secure read-only link.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-5">
              {/* Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  {isPublic ? <Globe className="w-4 h-4 text-green-500" /> : <GlobeLock className="w-4 h-4 text-muted-foreground" />}
                  <Label className="text-sm font-medium cursor-pointer">
                    {isPublic ? 'Public' : 'Private'}
                  </Label>
                </div>
                <Switch checked={isPublic} onCheckedChange={togglePublic} />
              </div>

              {/* Link */}
              {isPublic && shareId && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Shareable Link</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={shareUrl} className="text-xs" />
                    <Button size="sm" variant="secondary" className="shrink-0 gap-1.5" onClick={copyLink}>
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
              )}

              {!isPublic && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Enable public sharing to generate a read-only link to your journal.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
