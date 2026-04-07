'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSettingsIndex() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/admin-settings/staff');
  }, [router]);

  return null;
}
