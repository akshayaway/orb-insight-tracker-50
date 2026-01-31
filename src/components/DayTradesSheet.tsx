import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, Calendar, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import type { Trade } from '@/hooks/useTrades';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { tapFeedback } from '@/lib/haptics';

interface DayTradesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  trades: Trade[];
  calculatePnL: (trade: Trade) => number;
}

export function DayTradesSheet({ isOpen, onClose, date, trades, calculatePnL }: DayTradesSheetProps) {
  const navigate = useNavigate();
  const totalPnL = trades.reduce((sum, trade) => sum + calculatePnL(trade), 0);

  const handleTradeClick = async (tradeId: string) => {
    await tapFeedback();
    onClose();
    navigate(`/review/${tradeId}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl shadow-xl max-h-[70vh] overflow-hidden safe-area-bottom"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  {format(date, 'EEEE, MMM dd')}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Summary */}
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {trades.length} trade{trades.length !== 1 ? 's' : ''}
                </span>
                <div className={cn(
                  "font-bold text-lg",
                  totalPnL > 0 ? "text-success" : totalPnL < 0 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {totalPnL > 0 ? '+' : ''}{totalPnL !== 0 ? `$${Math.abs(totalPnL).toFixed(2)}` : '$0.00'}
                </div>
              </div>
            </div>

            {/* Trades List */}
            <div className="overflow-y-auto max-h-[50vh] p-4 space-y-2">
              {trades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No trades on this day
                </div>
              ) : (
                trades.map((trade) => {
                  const pnl = calculatePnL(trade);
                  const isPositive = pnl > 0;
                  const isNegative = pnl < 0;

                  return (
                    <motion.button
                      key={trade.id}
                      onClick={() => handleTradeClick(trade.id)}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "w-full p-3 bg-card border border-border rounded-lg text-left",
                        "flex items-center justify-between gap-3",
                        "active:bg-muted/50 transition-colors touch-target"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground">
                            {trade.symbol || 'N/A'}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              trade.side === "LONG"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-destructive/10 text-destructive border-destructive/20"
                            )}
                          >
                            {trade.side}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {trade.session} • {trade.rr ? `1:${trade.rr}R` : 'N/A'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className={cn(
                            "font-bold font-mono",
                            isPositive ? "text-success" : isNegative ? "text-destructive" : "text-muted-foreground"
                          )}>
                            {pnl > 0 ? '+' : ''}${Math.abs(pnl).toFixed(2)}
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              trade.result === 'Win' && "bg-success/10 text-success",
                              trade.result === 'Loss' && "bg-destructive/10 text-destructive"
                            )}
                          >
                            {trade.result}
                          </Badge>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
