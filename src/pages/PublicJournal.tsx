import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePublicJournal } from '@/hooks/usePublicJournal';
import { StatsCard } from '@/components/StatsCard';
import { EquityChart } from '@/components/EquityChart';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp, TrendingDown, Target, DollarSign, BarChart3, Eye, EyeOff,
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default function PublicJournal() {
  const { shareId } = useParams<{ shareId: string }>();
  const { profile, trades, accounts, loading, error, getActiveAccount, calculatePnL, calculateStats } = usePublicJournal(shareId);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const activeAccount = getActiveAccount();
  const stats = useMemo(() => calculateStats(trades), [trades, calculateStats]);

  const equityData = useMemo(() => {
    if (!activeAccount || trades.length === 0) return [{ date: new Date().toISOString(), value: 0 }];
    const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let running = 0;
    const pts = [{ date: sorted[0].date, value: 0 }];
    sorted.forEach(t => {
      running += calculatePnL(t, activeAccount);
      pts.push({ date: t.date, value: running });
    });
    return pts;
  }, [trades, activeAccount, calculatePnL]);

  // Calendar helpers
  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const getTradesForDay = (day: number) => {
    const dateStr = format(new Date(currentYear, currentMonth, day), 'yyyy-MM-dd');
    return trades.filter(t => format(new Date(t.date), 'yyyy-MM-dd') === dateStr);
  };

  const getDaysInMonth = () => {
    const first = new Date(currentYear, currentMonth, 1);
    const last = endOfMonth(first);
    const startDay = first.getDay();
    const totalDays = last.getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(d);
    return days;
  };

  const getDayPnL = (day: number) => {
    const dayTrades = getTradesForDay(day);
    return dayTrades.reduce((sum, t) => sum + calculatePnL(t, activeAccount), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading public journal…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <EyeOff className="w-12 h-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold text-foreground">Journal Unavailable</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const portfolioValue = activeAccount ? activeAccount.current_balance : 0;
  const startingBalance = activeAccount ? activeAccount.starting_balance : 0;
  const portfolioPnL = portfolioValue - startingBalance;
  const portfolioPnLPct = startingBalance > 0 ? (portfolioPnL / startingBalance) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="https://i.postimg.cc/W31cqNRN/20260117-155732.jpg" alt="PropFirm" className="h-8 w-8 rounded object-cover" />
          <div>
            <h1 className="text-lg font-semibold text-card-foreground">
              {profile?.discord_username ? `${profile.discord_username}'s Journal` : 'Trading Journal'}
            </h1>
            <p className="text-xs text-muted-foreground">PropFirm Knowledge Journal</p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <Eye className="w-3.5 h-3.5" />
          View Only
        </Badge>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Portfolio card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Portfolio Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{activeAccount?.name || 'Account'}</p>
                <p className={cn('text-sm font-medium', portfolioPnL >= 0 ? 'text-green-500' : 'text-red-500')}>
                  P&L: {portfolioPnL >= 0 ? '+' : ''}${portfolioPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({portfolioPnLPct >= 0 ? '+' : ''}{portfolioPnLPct.toFixed(2)}%)
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { title: 'WINS', value: stats.wins.toString(), change: `${stats.winRate.toFixed(1)}%`, positive: true, icon: <TrendingUp className="w-4 h-4" /> },
            { title: 'LOSSES', value: stats.losses.toString(), change: `${(100 - stats.winRate).toFixed(1)}%`, positive: false, icon: <TrendingDown className="w-4 h-4" /> },
            { title: 'WASH', value: stats.breakevens.toString(), icon: <Target className="w-4 h-4" /> },
            { title: 'AVG WIN', value: `${stats.avgWinRR.toFixed(1)}R`, positive: true, icon: <DollarSign className="w-4 h-4" /> },
            { title: 'AVG LOSS', value: `${stats.avgLossRR.toFixed(1)}R`, positive: false, icon: <DollarSign className="w-4 h-4" /> },
            { title: 'PNL $', value: `${stats.totalPnL >= 0 ? '+' : ''}$${Math.abs(stats.totalPnL).toFixed(2)}`, positive: stats.totalPnL >= 0, icon: <BarChart3 className="w-4 h-4" /> },
            { title: 'PROFIT FACTOR', value: stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2), positive: stats.profitFactor > 1, icon: <BarChart3 className="w-4 h-4" /> },
            { title: 'STREAK', value: stats.currentWinStreak.toString(), positive: stats.currentWinStreak > 0, icon: <Target className="w-4 h-4" /> },
          ].map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <StatsCard {...s} />
            </motion.div>
          ))}
        </div>

        {/* Equity chart */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <EquityChart data={equityData} startingBalance={activeAccount?.starting_balance || 0} />
        </motion.div>

        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> Trade Calendar
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCalendarDate(new Date(currentYear, currentMonth - 1, 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[140px] text-center">
                    {monthNames[currentMonth]} {currentYear}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCalendarDate(new Date(currentYear, currentMonth + 1, 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center">
                {dayNames.map(d => (
                  <div key={d} className="text-xs font-medium text-muted-foreground py-1">{d}</div>
                ))}
                {getDaysInMonth().map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} />;
                  const dayTrades = getTradesForDay(day);
                  const pnl = getDayPnL(day);
                  const hasTrades = dayTrades.length > 0;
                  return (
                    <div
                      key={day}
                      className={cn(
                        'rounded-md p-1 text-xs min-h-[48px] flex flex-col items-center justify-center',
                        hasTrades && pnl > 0 && 'bg-green-500/10 text-green-500',
                        hasTrades && pnl < 0 && 'bg-red-500/10 text-red-500',
                        hasTrades && pnl === 0 && 'bg-muted',
                        !hasTrades && 'text-muted-foreground',
                      )}
                    >
                      <span className="font-medium">{day}</span>
                      {hasTrades && (
                        <span className="text-[10px] font-medium">
                          {pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trade history table */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trade History ({trades.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Symbol</th>
                      <th className="text-left p-3 font-medium">Side</th>
                      <th className="text-left p-3 font-medium">Result</th>
                      <th className="text-right p-3 font-medium">R:R</th>
                      <th className="text-right p-3 font-medium">P&L</th>
                      <th className="text-left p-3 font-medium">Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.slice(0, 100).map(trade => {
                      const pnl = calculatePnL(trade, activeAccount);
                      return (
                        <tr key={trade.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="p-3">{format(new Date(trade.date), 'MMM dd, yyyy')}</td>
                          <td className="p-3 font-medium">{trade.symbol || '—'}</td>
                          <td className="p-3">
                            <Badge variant={trade.side === 'long' ? 'default' : 'secondary'} className="text-xs">
                              {trade.side || '—'}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                trade.result.toLowerCase() === 'win' && 'border-green-500/50 text-green-500',
                                trade.result.toLowerCase() === 'loss' && 'border-red-500/50 text-red-500',
                              )}
                            >
                              {trade.result}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">{trade.rr ? `${trade.rr.toFixed(1)}R` : '—'}</td>
                          <td className={cn('p-3 text-right font-medium', pnl >= 0 ? 'text-green-500' : 'text-red-500')}>
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                          </td>
                          <td className="p-3 text-muted-foreground">{trade.session}</td>
                        </tr>
                      );
                    })}
                    {trades.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          No trades recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <div className="text-center py-6 text-xs text-muted-foreground">
          Shared via PropFirm Knowledge Journal · Read-only view
        </div>
      </main>
    </div>
  );
}
