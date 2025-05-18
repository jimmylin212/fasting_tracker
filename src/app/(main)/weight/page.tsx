
"use client";
// This page is deprecated and will be removed.
// Users should navigate to /body-metrics instead.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeprecatedWeightPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/body-metrics');
  }, [router]);

  return <p>Redirecting to Body Metrics page...</p>;
}
