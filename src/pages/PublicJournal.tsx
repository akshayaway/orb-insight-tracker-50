import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePublicJournal } from '@/hooks/usePublicJournal';
import { StatsCard } from '@/components/StatsCard';
import { EquityChart } from '@/components/EquityChart';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp, TrendingDown, Target, DollarSign, BarChart3, Eye, EyeOff,
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Image as ImageIcon, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, endOfMonth } from 'date-fns';
import { Trade } from '@/hooks/useTrades';

export default function PublicJournal() {
  const { shareId } = useParams<{ shareId: string }>();
  const {
    profile, trades, accounts, loading, error,
    selectedAccountId, setSelectedAccountId,
    getActiveAccount, calculatePnL, calculateStats,
  } = usePublicJournal(shareId);

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [previewTrade, setPreviewTrade] = useState<Trade | null>(null);

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

  const getDayPnL = (day: number) => {
    const dayTrades = getTradesForDay(day);
    return dayTrades.reduce((sum, t) => sum + calculatePnL(t, activeAccount), 0);
  };

  const getCalendarWeeks = () => {
    const weeks: Date[] = [];
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    let currentWeekStart = startOfWeek(monthStart);
    while (currentWeekStart <= monthEnd) {
      weeks.push(currentWeekStart);
      currentWeekStart = addWeeks(currentWeekStart, 1);
    }
    return weeks;
  };

  const getWeekData = (weekStart: Date) => {
    const we = endOfWeek(weekStart);
    const weekTrades = trades.filter(t => {
      const d = new Date(t.date);
      return d >= weekStart && d <= we;
    });
    const pnl = activeAccount ? weekTrades.reduce((s, t) => s + calculatePnL(t, activeAccount), 0) : 0;
    return { trades: weekTrades.length, pnl };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading trading portfolio…" />
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

  const tradePreviewPnL = previewTrade ? calculatePnL(previewTrade, activeAccount) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://i.postimg.cc/W31cqNRN/20260117-155732.jpg" alt="PropFirm" className="h-8 w-8 rounded object-cover" />
            <div>
              <h1 className="text-lg font-semibold text-card-foreground">
                {profile?.discord_username ? `${profile.discord_username}'s Portfolio` : 'Trading Portfolio'}
              </h1>
              <p className="text-xs text-muted-foreground">PropFirm Knowledge Journal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Account selector */}
            {accounts.length > 1 && (
              <Select value={selectedAccountId || ''} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="w-[160px] h-8 text-xs">
                  <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id} className="text-xs">
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Badge variant="secondary" className="gap-1.5 shrink-0">
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Only</span>
            </Badge>
          </div>
        </div>
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

        {/* Calendar — 8-column grid with weekly summaries */}
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
            <CardContent className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Day headers + Week column */}
                <div className="grid grid-cols-8 gap-1 mb-2">
                  {dayNames.map(d => (
                    <div key={d} className="p-2 text-center text-[10px] font-medium text-muted-foreground">{d}</div>
                  ))}
                  <div className="p-2 text-center text-[10px] font-medium text-muted-foreground">Week</div>
                </div>

                {/* Weeks */}
                {getCalendarWeeks().map((weekStart, wi) => {
                  const weekData = getWeekData(weekStart);
                  return (
                    <div key={wi} className="grid grid-cols-8 gap-1 mb-1">
                      {Array.from({ length: 7 }, (_, di) => {
                        const date = new Date(weekStart);
                        date.setDate(weekStart.getDate() + di);
                        const day = date.getDate();
                        const isCurrentMonth = date.getMonth() === currentMonth;
                        const dayTrades = isCurrentMonth ? getTradesForDay(day) : [];
                        const dayPnL = isCurrentMonth ? getDayPnL(day) : 0;
                        return (
                          <div
                            key={di}
                            className={cn(
                              'bg-card border border-border rounded p-1.5 h-16 flex flex-col justify-between text-[10px]',
                              isCurrentMonth ? 'hover:bg-muted/50' : 'opacity-30',
                            )}
                          >
                            {isCurrentMonth && (
                              <>
                                <div className="text-[10px] text-muted-foreground">{day}</div>
                                <div className="flex-1 flex flex-col justify-center items-center gap-0.5">
                                  {dayPnL !== 0 && (
                                    <div className={cn('text-[10px] font-bold', dayPnL > 0 ? 'text-green-500' : 'text-red-500')}>
                                      {dayPnL > 0 ? '+' : ''}${Math.abs(dayPnL).toFixed(0)}
                                    </div>
                                  )}
                                  {dayTrades.length > 0 && (
                                    <div className="text-[9px] text-muted-foreground">
                                      {dayTrades.length} trade{dayTrades.length > 1 ? 's' : ''}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                      {/* Week summary */}
                      <div className="bg-muted/20 border border-border rounded p-1.5 h-16 flex flex-col justify-center items-center">
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">Wk {wi + 1}</div>
                        <div className={cn('text-[10px] font-bold', weekData.pnl > 0 ? 'text-green-500' : weekData.pnl < 0 ? 'text-red-500' : 'text-muted-foreground')}>
                          {weekData.pnl > 0 ? '+' : ''}${Math.abs(weekData.pnl).toFixed(0)}
                        </div>
                        <div className="text-[9px] text-muted-foreground">{weekData.trades} trade{weekData.trades !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trade history table with screenshot thumbnails */}
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
                      <th className="text-left p-3 font-medium w-11">Proof</th>
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
                    {trades.slice(0, 200).map(trade => {
                      const pnl = calculatePnL(trade, activeAccount);
                      return (
                        <tr
                          key={trade.id}
                          className={cn(
                            'border-b border-border/50 hover:bg-muted/30 transition-colors',
                            trade.image_url && 'cursor-pointer',
                          )}
                          onClick={() => trade.image_url && setPreviewTrade(trade)}
                        >
                          <td className="p-3">
                            {trade.image_url ? (
                              <img
                                src={trade.image_url}
                                alt="Trade screenshot"
                                className="w-10 h-10 rounded object-cover border border-border"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-muted/30 flex items-center justify-center">
                                <ImageIcon className="w-4 h-4 text-muted-foreground/40" />
                              </div>
                            )}
                          </td>
                          <td className="p-3 whitespace-nowrap">{format(new Date(trade.date), 'MMM dd, yyyy')}</td>
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
                        <td colSpan={8} className="p-8 text-center text-muted-foreground">
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

      {/* Trade Screenshot Preview Modal */}
      <Dialog open={!!previewTrade} onOpenChange={(open) => !open && setPreviewTrade(null)}>
        <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
          {previewTrade && (
            <>
              {/* Screenshot */}
              <div className="relative bg-black">
                <img
                  src={previewTrade.image_url!}
                  alt="Trade proof"
                  className="w-full max-h-[60vh] object-contain"
                />
              </div>
              {/* Trade metadata */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-foreground">{previewTrade.symbol || 'Trade'}</span>
                    <Badge variant={previewTrade.side === 'long' ? 'default' : 'secondary'} className="text-xs">
                      {previewTrade.side || '—'}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        previewTrade.result.toLowerCase() === 'win' && 'border-green-500/50 text-green-500',
                        previewTrade.result.toLowerCase() === 'loss' && 'border-red-500/50 text-red-500',
                      )}
                    >
                      {previewTrade.result}
                    </Badge>
                  </div>
                  <div className={cn('text-lg font-bold', tradePreviewPnL >= 0 ? 'text-green-500' : 'text-red-500')}>
                    {tradePreviewPnL >= 0 ? '+' : ''}${tradePreviewPnL.toFixed(2)}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Date</p>
                    <p className="font-medium text-foreground">{format(new Date(previewTrade.date), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">R:R</p>
                    <p className="font-medium text-foreground">{previewTrade.rr ? `${previewTrade.rr.toFixed(1)}R` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Session</p>
                    <p className="font-medium text-foreground">{previewTrade.session}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Setup</p>
                    <p className="font-medium text-foreground">{previewTrade.setup_tag || '—'}</p>
                  </div>
                </div>
                {previewTrade.notes && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm text-foreground">{previewTrade.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
