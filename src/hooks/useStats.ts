import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface Stats {
  totalResidents: number;
  pendingRequests: number;
  openComplaints: number;
}

export function useStats(): Stats {
  const [stats, setStats] = useState<Stats>({
    totalResidents: 0,
    pendingRequests: 0,
    openComplaints: 0,
  });

  async function fetchStats() {
    const [residentsRes, requestsRes, complaintsRes] = await Promise.all([
      supabase.from('residents').select('id', { count: 'exact', head: true }),
      supabase.from('document_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('complaints').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    ]);

    setStats({
      totalResidents: residentsRes.count ?? 0,
      pendingRequests: requestsRes.count ?? 0,
      openComplaints: complaintsRes.count ?? 0,
    });
  }

  useEffect(() => {
    fetchStats();

    // Realtime subscription for live badge updates
    const channel = supabase
      .channel('stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'document_requests' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, fetchStats)
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, []);

  return stats;
}
