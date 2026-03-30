import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trade, TradeStats } from './useTrades';
import { Account } from './useAccounts';
import { format } from 'date-fns';

interface PublicJournalData {
  profile: {
    discord_username: string | null;
    share_id: string;
  } | null;
  trades: Trade[];
  accounts: Account[];
  loading: boolean;
  error: string | null;
}

export function usePublicJournal(shareId: string | undefined) {
  const [profile, setProfile] = useState<PublicJournalData['profile']>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    async function fetchPublicData() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch profile by journal_slug or share_id (backward compat)
        const isHexId = /^[0-9a-f]{24}$/.test(shareId);
        const query = supabase
          .from('user_profiles')
          .select('user_id, discord_username, share_id, journal_slug, is_public_journal')
          .eq('is_public_journal', true);
        
        if (isHexId) {
          query.eq('share_id', shareId);
        } else {
          query.eq('journal_slug', shareId);
        }

        const { data: profileData, error: profileError } = await query.single();

        if (profileError || !profileData) {
          setError('This journal is not available or sharing is disabled.');
          setLoading(false);
          return;
        }

        setProfile({
          discord_username: profileData.discord_username,
          share_id: profileData.share_id!,
        });

        const userId = profileData.user_id!;

        // 2. Fetch accounts and trades in parallel
        const [accountsRes, tradesRes] = await Promise.all([
          supabase
            .from('accounts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true }),
          supabase
            .from('trades')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false }),
        ]);

        if (accountsRes.error) throw accountsRes.error;
        if (tradesRes.error) throw tradesRes.error;

        setAccounts((accountsRes.data as Account[]) || []);
        setTrades((tradesRes.data as Trade[]) || []);
      } catch (err) {
        console.error('Error fetching public journal:', err);
        setError('Failed to load journal data.');
      } finally {
        setLoading(false);
      }
    }

    fetchPublicData();
  }, [shareId]);

  const getActiveAccount = useCallback(() => {
    return accounts.find(a => a.is_active) || accounts[0] || null;
  }, [accounts]);

  const calculatePnL = useCallback((trade: Trade, account: Account | null) => {
    if (trade.pnl_dollar !== null && trade.pnl_dollar !== undefined) {
      return trade.pnl_dollar;
    }
    if (!account) return 0;
    const riskAmount = account.starting_balance * (account.risk_per_trade / 100);
    const rr = trade.rr || 0;
    if (trade.result.toLowerCase() === 'win') return riskAmount * rr;
    if (trade.result.toLowerCase() === 'loss') return -riskAmount;
    return 0;
  }, []);

  const calculateStats = useCallback((tradeList: Trade[]): TradeStats & { totalPnL: number; bestDayProfit: number } => {
    const account = getActiveAccount();
    const tradesWithPnL = tradeList.map(t => ({
      ...t,
      calculatedPnL: calculatePnL(t, account),
    }));

    const wins = tradesWithPnL.filter(t => t.result.toLowerCase() === 'win');
    const losses = tradesWithPnL.filter(t => t.result.toLowerCase() === 'loss');
    const breakevens = tradesWithPnL.filter(t => t.result.toLowerCase() === 'breakeven');

    const totalWinPnL = wins.reduce((sum, t) => sum + Math.abs(t.calculatedPnL), 0);
    const totalLossPnL = losses.reduce((sum, t) => sum + Math.abs(t.calculatedPnL), 0);
    const totalPnL = tradesWithPnL.reduce((sum, t) => sum + t.calculatedPnL, 0);

    const winRRs = wins.map(t => t.rr || 0).filter(rr => rr > 0);
    const avgWinRR = winRRs.length > 0 ? winRRs.reduce((a, b) => a + b, 0) / winRRs.length : 0;
    const avgLossRR = losses.length > 0 ? 1 : 0;
    const profitFactor = totalLossPnL > 0 ? totalWinPnL / totalLossPnL : totalWinPnL > 0 ? Infinity : 0;

    let currentWinStreak = 0;
    let currentLossStreak = 0;
    for (const t of tradesWithPnL) {
      const r = t.result.toLowerCase();
      if (r === 'win') { currentWinStreak++; currentLossStreak = 0; }
      else if (r === 'loss') { currentLossStreak++; currentWinStreak = 0; }
      else { currentWinStreak = 0; currentLossStreak = 0; }
    }

    const topWinRR = winRRs.length > 0 ? Math.max(...winRRs) : 0;

    const tradesByDate: Record<string, number> = {};
    tradesWithPnL.forEach(t => {
      const key = format(new Date(t.date), 'yyyy-MM-dd');
      tradesByDate[key] = (tradesByDate[key] || 0) + t.calculatedPnL;
    });
    const bestDayProfit = Object.keys(tradesByDate).length > 0 ? Math.max(...Object.values(tradesByDate)) : 0;

    return {
      totalTrades: tradesWithPnL.length,
      wins: wins.length,
      losses: losses.length,
      breakevens: breakevens.length,
      winRate: tradesWithPnL.length > 0 ? (wins.length / tradesWithPnL.length) * 100 : 0,
      avgWinRR,
      avgLossRR,
      profitFactor,
      currentWinStreak,
      currentLossStreak,
      topWinRR,
      topLossRR: 1,
      totalRR: totalPnL,
      totalPnL,
      bestDayProfit,
    };
  }, [getActiveAccount, calculatePnL]);

  return {
    profile,
    trades,
    accounts,
    loading,
    error,
    getActiveAccount,
    calculatePnL,
    calculateStats,
  };
}
