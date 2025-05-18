
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ProfileForm } from '@/components/profile/profile-form';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'userProfile';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedProfile = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedProfile) {
        try {
          setProfile(JSON.parse(storedProfile));
        } catch (error) {
          console.error("Error parsing profile from localStorage", error);
          setProfile({}); // Initialize with empty object if parsing fails
        }
      } else {
        setProfile({}); // Initialize with empty object if nothing in storage
      }
    }
  }, [isClient]);

  const handleSaveProfile = useCallback((data: UserProfile) => {
    setProfile(data);
    if (isClient) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      toast({
        title: "Profile Saved",
        description: "Your profile information has been updated.",
      });
    }
  }, [isClient, toast]);

  if (!isClient || profile === undefined) {
    // Show skeleton loaders while waiting for client-side hydration and data load
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <ProfileForm initialData={profile} onSave={handleSaveProfile} />
    </div>
  );
}
