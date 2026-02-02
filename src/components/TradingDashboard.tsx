import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TimeFilter } from './TimeFilter';
import { NewTradeModal } from './NewTradeModal';
import { StatsCard } from './StatsCard';
import { TradingTable } from './TradingTable';
import { EquityChart } from './EquityChart';
import { GuestBanner } from './GuestBanner';
import { useTrades } from '@/hooks/useTrades';
import { useAccounts } from '@/hooks/useAccounts';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, User, Twitter, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths, subYears, isSameDay, isSameWeek, isSameMonth, isSameYear, format } from 'date-fns';

export function TradingDashboard() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { trades, loading, refetchTrades, calculateStats, calculatePnL, getTradesByDate } = useTrades();
  const { getActiveAccount, accounts } = useAccounts();
  const { user } = useAuth();
  const activeAccount = getActiveAccount();
  const isGuest = !user;

  const filteredTrades = useMemo(() => {
    if (!trades) return [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = subDays(today, 1);
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 0 });
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 0 });
    const startOfLastWeek = subWeeks(startOfThisWeek, 1);
    const endOfLastWeek = subDays(startOfThisWeek, 1);
    const startOfThisMonth = startOfMonth(today);
    const endOfThisMonth = endOfMonth(today);
    const startOfLastMonth = subMonths(startOfThisMonth, 1);
    const endOfLastMonth = subDays(startOfThisMonth, 1);
    const threeMonthsAgo = subMonths(today, 3);
    const startOfThisYear = new Date(today.getFullYear(), 0, 1);
    const endOfThisYear = new Date(today.getFullYear(), 11, 31);
    const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);

    return trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      switch (activeFilter) {
        case 'today':
          return isSameDay(tradeDate, today);
        case 'yesterday':
          return isSameDay(tradeDate, yesterday);
        case 'this-week':
          return isSameWeek(tradeDate, today, { weekStartsOn: 0 });
        case 'last-week':
          return isSameWeek(tradeDate, subWeeks(today, 1), { weekStartsOn: 0 });
        case 'this-month':
          return isSameMonth(tradeDate, today);
        case 'last-month':
          return isSameMonth(tradeDate, subMonths(today, 1));
        case '3-months':
          return tradeDate >= threeMonthsAgo;
        case 'this-year':
          return isSameYear(tradeDate, today);
        case 'last-year':
          return isSameYear(tradeDate, subYears(today, 1));
        default:
          return true;
      }
    });
  }, [trades, activeFilter]);

  // Calculate stats based on filtered trades using consistent P&L calculation
  const filteredStats = useMemo(() => {
    if (filteredTrades.length === 0) {
      return {
        totalTrades: 0,
        wins: 0,
        losses: 0,
        breakevens: 0,
        winRate: 0,
        avgWinRR: 0,
        avgLossRR: 0,
        profitFactor: 0,
        currentWinStreak: 0,
        currentLossStreak: 0,
        topWinRR: 0,
        topLossRR: 0,
        totalRR: 0,
        totalPnL: 0,
        bestDayProfit: 0
      };
    }

    // Calculate P&L for each trade using the consistent method
    const tradesWithPnL = filteredTrades.map(trade => ({
      ...trade,
      calculatedPnL: activeAccount ? calculatePnL(trade, activeAccount) : 0
    }));

    const wins = tradesWithPnL.filter(t => t.result.toLowerCase() === 'win');
    const losses = tradesWithPnL.filter(t => t.result.toLowerCase() === 'loss');
    const breakevens = tradesWithPnL.filter(t => t.result.toLowerCase() === 'breakeven');

    // Calculate total P&L using consistent calculation
    const totalWinPnL = wins.reduce((sum, trade) => sum + Math.abs(trade.calculatedPnL), 0);
    const totalLossPnL = losses.reduce((sum, trade) => sum + Math.abs(trade.calculatedPnL), 0);
    const totalPnL = tradesWithPnL.reduce((sum, trade) => sum + trade.calculatedPnL, 0);

    // Calculate R:R values for win/loss trades
    const winRRs = wins
      .map(t => t.rr || 0)
      .filter(rr => rr > 0);
    const lossRRs = losses
      .map(() => 1) // Loss is always 1R
      .filter(r => r > 0);

    const avgWinRR = winRRs.length > 0 ? winRRs.reduce((a, b) => a + b, 0) / winRRs.length : 0;
    const avgLossRR = lossRRs.length > 0 ? lossRRs.reduce((a, b) => a + b, 0) / lossRRs.length : 0;
    const totalWinRR = winRRs.reduce((a, b) => a + b, 0);
    const totalLossRR = lossRRs.reduce((a, b) => a + b, 0);

    // Calculate profit factor
    const profitFactor = totalLossPnL > 0 ? totalWinPnL / totalLossPnL : totalWinPnL > 0 ? Infinity : 0;

    // Calculate streaks
    let currentWinStreak = 0;
    let currentLossStreak = 0;

    // Calculate from most recent trade backwards
    for (let i = 0; i < tradesWithPnL.length; i++) {
      const result = tradesWithPnL[i].result.toLowerCase();
      if (result === 'win') {
        currentWinStreak++;
        currentLossStreak = 0;
      } else if (result === 'loss') {
        currentLossStreak++;
        currentWinStreak = 0;
      } else {
        currentWinStreak = 0;
        currentLossStreak = 0;
      }
    }

    const topWinRR = winRRs.length > 0 ? Math.max(...winRRs) : 0;
    const topLossRR = 1; // Loss is always 1R

    // Calculate best day profit
    const tradesByDate: Record<string, number> = {};
    tradesWithPnL.forEach(trade => {
      const dateKey = format(new Date(trade.date), 'yyyy-MM-dd');
      if (!tradesByDate[dateKey]) {
        tradesByDate[dateKey] = 0;
      }
      tradesByDate[dateKey] += trade.calculatedPnL;
    });

    let bestDayProfit = 0;
    if (Object.keys(tradesByDate).length > 0) {
      bestDayProfit = Math.max(...Object.values(tradesByDate));
    }

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
      topLossRR,
      totalRR: totalPnL, // Using calculated total P&L
      totalPnL,
      bestDayProfit
    };
  }, [filteredTrades, activeAccount, calculatePnL]);

  // Generate equity curve data
  const equityData = useMemo(() => {
    if (!activeAccount || trades.length === 0) {
      return [{ date: new Date().toISOString(), value: 0 }];
    }

    // Sort all trades by date
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let runningTotal = 0;
    const equityPoints = [{ date: sortedTrades[0].date, value: 0 }];

    sortedTrades.forEach(trade => {
      const pnl = calculatePnL(trade, activeAccount);
      runningTotal += pnl;
      equityPoints.push({ date: trade.date, value: runningTotal });
    });

    return equityPoints;
  }, [trades, activeAccount, calculatePnL]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-muted-foreground">Loading dashboard...</div>
    </div>;
  }

  // Calculate portfolio value and P&L - now properly reactive
  const portfolioValue = activeAccount ? activeAccount.current_balance : 0;
  const startingBalance = activeAccount ? activeAccount.starting_balance : 0;
  const portfolioPnL = activeAccount ? portfolioValue - startingBalance : 0;
  const portfolioPnLPercentage = activeAccount && startingBalance > 0 ? (portfolioPnL / startingBalance) * 100 : 0;

  return <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ duration: 0.5 }}
    className="space-y-6 w-full max-w-full overflow-x-hidden"
  >
    {/* Header Section */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <BarChart3 className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
            PropFirm Journal
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground truncate">
            Professional Trading Dashboard
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
        {/* Portfolio Balance - now properly reactive */}
        <div className="text-right bg-card p-3 rounded-lg border border-border w-full sm:w-auto">
          <div className="text-lg md:text-xl font-bold text-foreground truncate">
            ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {activeAccount ? activeAccount.name : 'No Active Account'}
          </div>
          {activeAccount && (
            <div className={`text-xs font-medium truncate ${portfolioPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              P&L: {portfolioPnL >= 0 ? '+' : ''}${portfolioPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
              ({portfolioPnLPercentage >= 0 ? '+' : ''}{portfolioPnLPercentage.toFixed(2)}%)
            </div>
          )}
        </div>
        
        {/* Social Links */}
        <div className="flex gap-1 sm:gap-2">
          <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
            <a href="https://x.com/propfirm_forex" target="_blank" rel="noopener noreferrer">
              <Twitter className="w-3 h-3" />
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
            <a href="https://telegram.dog/free_propfirm_accounts" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-3 h-3" />
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
            <a href="https://discord.gg/7MRsuqqT3n" target="_blank" rel="noopener noreferrer">
              <Users className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </div>
    </div>

    {/* Guest Banner */}
    <GuestBanner />

    {/* Time Filter */}
    <TimeFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />

    {/* Stats Cards */}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="col-span-1"
      >
        <StatsCard 
          title="WINS" 
          value={filteredStats.wins.toString()} 
          change={`${filteredStats.winRate.toFixed(1)}%`} 
          positive={true} 
          icon={<TrendingUp className="w-4 h-4" />} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        className="col-span-1"
      >
        <StatsCard 
          title="LOSSES" 
          value={filteredStats.losses.toString()} 
          change={`${(100 - filteredStats.winRate).toFixed(1)}%`} 
          positive={false} 
          icon={<TrendingDown className="w-4 h-4" />} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3 }}
        className="col-span-1"
      >
        <StatsCard 
          title="OPEN" 
          value="0" 
          change="0%" 
          icon={<Target className="w-4 h-4" />} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }}
        className="col-span-1"
      >
        <StatsCard 
          title="WASH" 
          value={filteredStats.breakevens.toString()} 
          change={`${filteredStats.totalTrades > 0 ? (filteredStats.breakevens / filteredStats.totalTrades * 100).toFixed(1) : 0}%`} 
          icon={<Target className="w-4 h-4" />} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.5 }}
        className="col-span-1"
      >
        <StatsCard 
          title="AVG WIN" 
          value={`${filteredStats.avgWinRR.toFixed(1)}R`} 
          positive={true} 
          icon={<DollarSign className="w-4 h-4" />} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.6 }}
        className="col-span-1"
      >
        <StatsCard 
          title="AVG LOSS" 
          value={`${filteredStats.avgLossRR.toFixed(1)}R`} 
          positive={false} 
          icon={<DollarSign className="w-4 h-4" />} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.7 }}
        className="col-span-1"
      >
        <StatsCard 
          title="PNL $" 
          value={`${filteredStats.totalPnL > 0 ? '+' : ''}$${Math.abs(filteredStats.totalPnL).toFixed(2)}`} 
          positive={filteredStats.totalPnL >= 0} 
          icon={<BarChart3 className="w-4 h-4" />} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.8 }}
        className="col-span-1"
      >
        <StatsCard 
          title="PNL %" 
          value={`${filteredStats.totalPnL > 0 ? '+' : ''}${activeAccount && activeAccount.starting_balance > 0 ? (filteredStats.totalPnL / activeAccount.starting_balance * 100).toFixed(2) : '0.00'}%`} 
          positive={activeAccount && activeAccount.starting_balance > 0 ? (filteredStats.totalPnL / activeAccount.starting_balance) >= 0 : true} 
          icon={<BarChart3 className="w-4 h-4" />} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.9 }}
        className="col-span-2 sm:col-span-1"
      >
        <StatsCard 
          title="PROFIT FACTOR" 
          value={filteredStats.profitFactor === Infinity ? "∞" : filteredStats.profitFactor.toFixed(2)} 
          positive={filteredStats.profitFactor > 1} 
          icon={<BarChart3 className="w-4 h-4" />} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 1.0 }}
        className="col-span-2 sm:col-span-1"
      >
        <StatsCard 
          title="BEST DAY" 
          value={`${filteredStats.bestDayProfit > 0 ? '+' : ''}$${Math.abs(filteredStats.bestDayProfit).toFixed(2)}`} 
          positive={filteredStats.bestDayProfit >= 0} 
          icon={<TrendingUp className="w-4 h-4" />} 
        />
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 1.1 }}
        className="col-span-2 sm:col-span-1"
      >
        <StatsCard 
          title="STREAK" 
          value={filteredStats.currentWinStreak.toString()} 
          positive={filteredStats.currentWinStreak > 0} 
          icon={<Target className="w-4 h-4" />} 
        />
      </motion.div>
    </div>

    {/* Equity Curve Chart */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 1.2 }}
      className="w-full"
    >
      <EquityChart data={equityData} startingBalance={activeAccount?.starting_balance || 0} />
    </motion.div>

    {/* New Trade Button */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 1.3 }}
      className="w-full"
    >
      <NewTradeModal onTradeAdded={refetchTrades} />
    </motion.div>

    {/* Trade Table */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 1.3 }}
      className="w-full"
    >
      <TradingTable trades={filteredTrades} onTradeUpdated={refetchTrades} />
    </motion.div>

    {/* Demo Notice */}
    {filteredStats.totalTrades === 0 && <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ delay: 1.4 }}
      className="text-center p-6 bg-muted/20 rounded-lg border border-border"
    >
      <p className="text-muted-foreground">
        No trades found for the selected time period. Start by adding your first trade!
      </p>
    </motion.div>}
  </motion.div>;
}