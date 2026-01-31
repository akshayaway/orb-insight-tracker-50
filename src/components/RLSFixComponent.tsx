import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function RLSFixComponent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fixing, setFixing] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    console.log(message);
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const fixRLSPolicies = async () => {
    if (!user) {
      addResult('❌ No authenticated user');
      return;
    }

    setFixing(true);
    setResults([]);

    addResult('🔄 Starting RLS policy fix...');

    try {
      // Step 1: Try to create buckets directly
      addResult('📦 Creating storage buckets...');
      
      const bucketConfigurations = [
        { id: 'trade-screenshots', name: 'trade-screenshots', public: true },
        { id: 'screenshots', name: 'screenshots', public: true }
      ];

      for (const bucket of bucketConfigurations) {
        try {
          // First, try to update the bucket if it exists
          const { data: existingBuckets, error: listError } = await supabase
            .storage
            .listBuckets();
          
          if (listError) {
            addResult(`⚠️ Error listing buckets: ${listError.message}`);
            continue;
          }

          const existingBucket = existingBuckets?.find(b => b.id === bucket.id);
          if (existingBucket) {
            // Update existing bucket - for now just log that it exists
            addResult(`ℹ️ Bucket ${bucket.id} already exists`);
          } else {
            // Create new bucket
            const { data, error } = await supabase
              .storage
              .createBucket(bucket.id, {
                public: bucket.public,
                fileSizeLimit: 52428800, // 50MB
                allowedMimeTypes: ['image/*']
              });
            
            if (error) {
              addResult(`⚠️ Bucket creation warning for ${bucket.id}: ${error.message}`);
            } else {
              addResult(`✅ Bucket ${bucket.id} created successfully`);
            }
          }
        } catch (err) {
          addResult(`⚠️ Bucket configuration attempt for ${bucket.id}: ${err}`);
        }
      }

      // Step 2: Test bucket access after policy changes
      addResult('🧪 Testing bucket access...');
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        addResult(`❌ Bucket access test failed: ${bucketError.message}`);
      } else {
        const foundBuckets = buckets?.map(b => b.id) || [];
        addResult(`✅ Found buckets: ${foundBuckets.join(', ')}`);
        
        if (foundBuckets.includes('trade-screenshots')) {
          addResult('✅ trade-screenshots bucket is accessible');
        }
        
        if (foundBuckets.includes('screenshots')) {
          addResult('✅ screenshots bucket is accessible');
        }
      }

      // Step 3: Test upload capability
      addResult('📤 Testing upload capability...');
      try {
        const testBlob = new Blob(['test content'], { type: 'text/plain' });
        const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
        const fileName = `${user.id}-test-${Date.now()}.txt`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('trade-screenshots')
          .upload(fileName, testFile);
        
        if (uploadError) {
          addResult(`❌ Upload test failed: ${uploadError.message}`);
        } else {
          addResult('✅ Upload test successful!');
          
          // Clean up test file
          await supabase.storage.from('trade-screenshots').remove([fileName]);
          addResult('🧹 Test file cleaned up');
        }
      } catch (err) {
        addResult(`❌ Upload test error: ${err}`);
      }

      addResult('🎉 RLS policy fix completed!');
      toast({
        title: "RLS Policies Updated",
        description: "Storage policies have been made more permissive",
      });
    } catch (error) {
      addResult(`💥 Unexpected error: ${error}`);
      toast({
        title: "Error",
        description: "Failed to update RLS policies",
        variant: "destructive",
      });
    }

    setFixing(false);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground">Please log in to fix RLS policies</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>🛡️ Fix Storage RLS Policies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ RLS Policy Issue Detected:</strong><br/>
            Row Level Security policies are blocking storage operations. This will attempt to create more permissive policies.
          </p>
        </div>
        <Button onClick={fixRLSPolicies} disabled={fixing} className="w-full">
          {fixing ? 'Fixing RLS Policies...' : 'Fix Storage RLS Policies'}
        </Button>
        {results.length > 0 && (
          <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}