
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { ChromeIcon } from 'lucide-react'; // Assuming you want a Google-like icon

export function LoginForm() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="space-y-6">
      <Button 
        onClick={signInWithGoogle} 
        disabled={loading} 
        className="w-full"
      >
        {loading ? (
          "Signing in..."
        ) : (
          <>
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5 fill-white"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.58 2.4-5.77 2.4-4.84 0-8.84-3.97-8.84-8.84s3.99-8.84 8.84-8.84c2.63 0 4.51.99 5.77 2.19l2.62-2.58C18.09.96 15.47 0 12.48 0 5.88 0 0 5.88 0 12.48s5.88 12.48 12.48 12.48c7.28 0 12.09-4.79 12.09-12.65.00-.89-.08-1.77-.2-2.64H12.48z"/></svg>
            Sign in with Google
          </>
        )}
      </Button>
      {/* You can add more sign-in options here, like email/password */}
    </div>
  );
}
