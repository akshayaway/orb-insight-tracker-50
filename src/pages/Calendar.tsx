import { useState } from "react";
import { ChevronLeft, ChevronRight, BarChart3, Users, TrendingUp, Settings, HelpCircle, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTrades } from "@/hooks/useTrades";
import { useAccounts } from "@/hooks/useAccounts";
import { format, startOfWeek, endOfWeek, addWeeks, isSameWeek, startOfMonth, endOfMonth } from "date-fns";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { trades, loading, calculateStats, calculatePnL: calculatePnLHook } = useTrades();
  const { getActiveAccount } = useAccounts();
  const activeAccount = getActiveAccount();
  
  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get trades for a specific day
  const getTradesForDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = format(date, 'yyyy-MM-dd');
    return trades.filter(trade => {
      const tradeDate = format(new Date(trade.date), 'yyyy-MM-dd');
      return tradeDate === dateStr;
    });
  };

  // Calculate P&L for a day using the hook's calculatePnL function
  const getDayPnL = (day: number) => {
    const dayTrades = getTradesForDay(day);
    if (!activeAccount || dayTrades.length === 0) return 0;
    return dayTrades.reduce((total, trade) => {
      return total + calculatePnLHook(trade, activeAccount);
    }, 0);
  };

  // Get weekly data
  const getWeekData = (weekStart: Date) => {
    const weekEnd = endOfWeek(weekStart);
    const weekTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate >= weekStart && tradeDate <= weekEnd;
    });
    
    const weekPnL = activeAccount ? weekTrades.reduce((total, trade) => {
      return total + calculatePnLHook(trade, activeAccount);
    }, 0) : 0;
    
    return {
      trades: weekTrades.length,
      pnl: weekPnL
    };
  };

  // Generate calendar weeks for the current month
  const getCalendarWeeks = () => {
    const weeks = [];
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    let currentWeekStart = startOfWeek(monthStart);
    
    while (currentWeekStart <= monthEnd) {
      weeks.push(currentWeekStart);
      currentWeekStart = addWeeks(currentWeekStart, 1);
    }
    
    return weeks;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (day: number) => {
    return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  };

  // Calculate total monthly stats
  const monthlyStats = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      return tradeDate >= monthStart && tradeDate <= monthEnd;
    });
    
    // Calculate total P&L for the month
    const totalPnL = activeAccount ? monthTrades.reduce((total, trade) => {
      return total + calculatePnLHook(trade, activeAccount);
    }, 0) : 0;
    
    return {
      balance: (activeAccount?.current_balance || 0),
      mll: 0, // Max Loss Limit - placeholder
      rpnl: totalPnL, // Total realized P&L
      upnl: 0 // Unrealized P&L - placeholder
    };
  };

  const stats = monthlyStats();

  return (
    <div className="min-h-screen bg-background flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
        {/* Top Stats Bar - Mobile responsive */}
        <div className="h-auto min-h-[60px] bg-card border-b border-border flex flex-wrap items-center px-3 py-2 gap-2 w-full">
          <div className="bg-muted/30 px-3 py-1.5 rounded-lg flex-1 min-w-[100px]">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">BALANCE</div>
            <div className="text-sm font-semibold text-foreground truncate">
              ${stats.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-muted/30 px-3 py-1.5 rounded-lg flex-1 min-w-[100px]">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">MLL</div>
            <div className="text-sm font-semibold text-foreground truncate">
              ${stats.mll.toFixed(2)}
            </div>
          </div>
          <div className="bg-muted/30 px-3 py-1.5 rounded-lg flex-1 min-w-[100px]">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">RP&L</div>
            <div className={cn("text-sm font-semibold truncate", stats.rpnl >= 0 ? "text-success" : "text-destructive")}>
              {stats.rpnl >= 0 ? '+' : ''}${Math.abs(stats.rpnl).toFixed(2)}
            </div>
          </div>
          <div className="bg-muted/30 px-3 py-1.5 rounded-lg flex-1 min-w-[100px]">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">UP&L</div>
            <div className="text-sm font-semibold text-foreground truncate">
              ${stats.upnl.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="flex-1 p-3 w-full max-w-full overflow-x-hidden">
          <div className="max-w-full overflow-x-hidden">
            {/* Calendar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <h1 className="text-xl font-bold text-foreground">
                {monthNames[currentMonth]} {currentYear}
              </h1>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} className="border-border hover:bg-muted h-8 w-8 p-0">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="border-border hover:bg-muted h-8 w-8 p-0">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid with Week Summaries */}
            <div className="space-y-2 w-full max-w-full overflow-x-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-8 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-[10px] font-medium text-muted-foreground truncate">
                    {day}
                  </div>
                ))}
                <div className="p-2 text-center text-[10px] font-medium text-muted-foreground truncate">
                  Week
                </div>
              </div>

              {/* Calendar Weeks */}
              {getCalendarWeeks().map((weekStart, weekIndex) => {
                const weekData = getWeekData(weekStart);
                return (
                  <div key={weekIndex} className="grid grid-cols-8 gap-1">
                    {/* Days of the week */}
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const date = new Date(weekStart);
                      date.setDate(weekStart.getDate() + dayIndex);
                      const day = date.getDate();
                      const isCurrentMonth = date.getMonth() === currentMonth;
                      const dayTrades = isCurrentMonth ? getTradesForDay(day) : [];
                      const dayPnL = isCurrentMonth ? getDayPnL(day) : 0;
                      const isCurrentDay = isCurrentMonth && isToday(day);
                      
                      return (
                        <div 
                          key={dayIndex} 
                          className={cn(
                            "bg-card border border-border rounded p-1.5 h-16 flex flex-col justify-between transition-all duration-200 text-[10px]",
                            isCurrentMonth ? "hover:bg-muted/50" : "opacity-30",
                            isCurrentDay && "ring-1 ring-primary shadow-primary"
                          )}
                        >
                          {isCurrentMonth && (
                            <>
                              <div className="text-[10px] text-muted-foreground">{day}</div>
                              <div className="flex-1 flex flex-col justify-center items-center gap-0.5">
                                {dayPnL !== 0 && (
                                  <div className={cn("text-[10px] font-bold", dayPnL > 0 ? "text-success" : "text-destructive")}>
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
                    
                    {/* Week Summary */}
                    <div className="bg-muted/20 border border-border rounded p-1.5 h-16 flex flex-col justify-center items-center">
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">
                        Week {weekIndex + 1}
                      </div>
                      <div className={cn(
                        "text-[10px] font-bold",
                        weekData.pnl > 0 ? "text-success" : weekData.pnl < 0 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {weekData.pnl > 0 ? '+' : ''}${Math.abs(weekData.pnl).toFixed(0)}
                      </div>
                      <div className="text-[9px] text-muted-foreground">
                        {weekData.trades} trade{weekData.trades !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;