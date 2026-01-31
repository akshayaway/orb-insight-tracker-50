import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, ChevronRight, Calendar, Image } from 'lucide-react';
import type { Trade } from '@/hooks/useTrades';
import { format, isToday, isYesterday } from 'date-fns';
import { tapFeedback } from '@/lib/haptics';

interface TradeListItemProps {
  trade: Trade;
  pnl: number;
  onEdit?: (trade: Trade) => void;
  onDelete?: (tradeId: string) => void;
}

export function TradeListItem({ trade, pnl, onEdit, onDelete }: TradeListItemProps) {
  const navigate = useNavigate();
  const isPositive = pnl > 0;
  const isNegative = pnl < 0;
  
  const tradeDate = new Date(trade.date);
  let dateDisplay = format(tradeDate, 'MMM dd');
  if (isToday(tradeDate)) dateDisplay = 'Today';
  else if (isYesterday(tradeDate)) dateDisplay = 'Yesterday';

  const handlePress = async () => {
    await tapFeedback();
    navigate(`/review/${trade.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileTap={{ scale: 0.98 }}
      onClick={handlePress}
      className="touch-target"
    >
      <Card className={cn(
        "bg-card border-border p-4 cursor-pointer active:bg-muted/50 transition-colors",
        trade.result === 'Win' && "border-l-4 border-l-success",
        trade.result === 'Loss' && "border-l-4 border-l-destructive",
        trade.result === 'Breakeven' && "border-l-4 border-l-muted-foreground"
      )}>
        <div className="flex items-center justify-between gap-3">
          {/* Left: Trade Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-foreground text-base">
                {trade.symbol || 'N/A'}
              </span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs px-2 py-0",
                  trade.side === "LONG" 
                    ? "bg-success/10 text-success border-success/20" 
                    : "bg-destructive/10 text-destructive border-destructive/20"
                )}
              >
                {trade.side || 'N/A'}
              </Badge>
              {trade.image_url && (
                <Image className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{dateDisplay}</span>
              <span className="text-muted-foreground/50">•</span>
              <span>{trade.session}</span>
              {trade.rr && (
                <>
                  <span className="text-muted-foreground/50">•</span>
                  <span>1:{trade.rr}R</span>
                </>
              )}
            </div>
          </div>

          {/* Right: P&L and Arrow */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={cn(
                "font-bold font-mono text-base",
                isPositive ? "text-success" : isNegative ? "text-destructive" : "text-muted-foreground"
              )}>
                {pnl > 0 ? '+' : ''}{pnl !== 0 ? `$${Math.abs(pnl).toFixed(2)}` : '$0.00'}
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
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
