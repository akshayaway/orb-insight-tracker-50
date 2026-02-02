import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { Edit, Trash2, Share, Image, Eye, Calendar, Clock, TrendingUp, TrendingDown, Lock } from 'lucide-react'
import { useTradeActions } from '@/hooks/useTradeActions'
import { useAuth } from '@/contexts/AuthContext'
import { useGuest } from '@/contexts/GuestContext'
import { EditTradeModal } from './EditTradeModal'
import { TradeListItem } from './TradeListItem'
import type { Trade } from '@/hooks/useTrades'
import { useNavigate } from 'react-router-dom'
import { useAccounts } from '@/hooks/useAccounts'
import { useIsMobile } from '@/hooks/use-mobile'
import { format, formatDistanceToNow, isToday, isYesterday, isSameWeek } from 'date-fns'

interface TradingTableProps {
  trades: Trade[]
  onTradeUpdated: () => void
}

export function TradingTable({ trades, onTradeUpdated }: TradingTableProps) {
  const { deleteTrade, shareTrade, viewImage, loading } = useTradeActions();
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const navigate = useNavigate();
  const { getActiveAccount } = useAccounts();
  const { user } = useAuth();
  const { isGuest, openAuthModal } = useGuest();
  const activeAccount = getActiveAccount();
  const isMobile = useIsMobile();

  // Enhanced calculation with better precision and accounting for all factors
  const calculateTradePnL = (trade: Trade) => {
    if (!activeAccount) return 0;
    
    // If trade has actual pnl_dollar value, use that (most accurate)
    if (trade.pnl_dollar !== null && trade.pnl_dollar !== undefined) {
      return Number(trade.pnl_dollar);
    }
    
    // Calculate based on risk percentage and R:R ratio using starting balance
    const riskPercentage = trade.risk_percentage || 1.0; // Default to 1% if not set
    const riskAmount = activeAccount.starting_balance * (riskPercentage / 100);
    const rrRatio = trade.rr || 1; // Default to 1:1 if not set
    
    switch (trade.result.toLowerCase()) {
      case 'win':
        return Number((riskAmount * rrRatio).toFixed(2)); // Win: risk * reward ratio
      case 'loss':
        return Number((-riskAmount).toFixed(2)); // Loss: -risk amount
      default:
        return 0; // Breakeven
    }
  };

  // Format date and time with enhanced display - shows both trade date and system timestamps
  const formatTradeDateTime = (trade: Trade) => {
    const tradeDate = new Date(trade.date);
    const createdAt = new Date(trade.created_at);
    const updatedAt = new Date(trade.updated_at);
    const now = new Date();
    
    // Use created_at for "when logged" and updated_at for "when last modified"
    const lastModified = updatedAt > createdAt ? updatedAt : createdAt;
    const isRecent = isToday(lastModified) || isYesterday(lastModified);
    
    // Format trade date (the actual trading date)
    let tradeDateDisplay;
    if (isToday(tradeDate)) {
      tradeDateDisplay = 'Today';
    } else if (isYesterday(tradeDate)) {
      tradeDateDisplay = 'Yesterday';
    } else if (isSameWeek(tradeDate, now)) {
      tradeDateDisplay = format(tradeDate, 'EEEE'); // Day name
    } else {
      tradeDateDisplay = format(tradeDate, 'MMM dd');
    }
    
    return {
      // Trade date information
      displayDate: tradeDateDisplay,
      fullTradeDate: format(tradeDate, 'MMM dd, yyyy'),
      tradeTime: format(tradeDate, 'HH:mm'),
      
      // System timestamps
      createdAt: createdAt,
      updatedAt: updatedAt,
      lastModified: lastModified,
      
      // Display helpers
      relativeCreated: formatDistanceToNow(createdAt, { addSuffix: true }),
      relativeUpdated: formatDistanceToNow(updatedAt, { addSuffix: true }),
      relativeLastModified: formatDistanceToNow(lastModified, { addSuffix: true }),
      
      // Status flags
      isRecent: isRecent,
      wasUpdated: updatedAt.getTime() !== createdAt.getTime(),
      
      // Formatted strings for display
      createdAtFormatted: format(createdAt, 'MMM dd, HH:mm'),
      updatedAtFormatted: format(updatedAt, 'MMM dd, HH:mm')
    };
  };

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
  };

  const handleDelete = async (tradeId: string) => {
    await deleteTrade(tradeId);
    // Ensure account balance is recalculated after deletion
    onTradeUpdated();
  };

  const handleShare = (trade: Trade) => {
    shareTrade(trade);
  };

  const handleViewImage = (imageUrl: string) => {
    // Try to open in modal first, fallback to new tab
    viewImage(imageUrl);
  };

  const handleViewDetails = (tradeId: string) => {
    navigate(`/review/${tradeId}`);
  };

  // Sort trades: newest first (by updated_at for most recent activity, then by created_at, then by trade date)
  const sortedTrades = [...trades].sort((a, b) => {
    // First sort by updated_at (most recent modifications first)
    const updatedAtA = new Date(a.updated_at).getTime();
    const updatedAtB = new Date(b.updated_at).getTime();
    if (updatedAtA !== updatedAtB) {
      return updatedAtB - updatedAtA; // Most recently updated first
    }
    
    // If updated_at is the same, sort by created_at (when the trade was logged)
    const createdAtA = new Date(a.created_at).getTime();
    const createdAtB = new Date(b.created_at).getTime();
    if (createdAtA !== createdAtB) {
      return createdAtB - createdAtA; // Most recently created first
    }
    
    // If both are the same, sort by actual trade date
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Newest trade date first
  });

  // Mobile list view
  if (isMobile) {
    return (
      <Card className="bg-card border-border shadow-lg w-full">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Trading History
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {sortedTrades.length} trades
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {sortedTrades.map((trade) => (
              <TradeListItem
                key={trade.id}
                trade={trade}
                pnl={calculateTradePnL(trade)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
          
          {sortedTrades.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">No trades yet</h3>
                  <p className="text-muted-foreground text-sm">Start logging your trades to see them here</p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
        
        <EditTradeModal 
          trade={editingTrade} 
          isOpen={!!editingTrade} 
          onClose={() => setEditingTrade(null)} 
          onTradeUpdated={onTradeUpdated} 
        />
      </Card>
    );
  }

  // Desktop table view
  return (
    <Card className="bg-card border-border shadow-lg w-full max-w-full overflow-x-hidden">
      <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2 text-lg">
              <TrendingUp className="h-4 w-4 text-primary" />
              Trading History
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {sortedTrades.length} trades • Sorted by most recent activity
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Real-time updates</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="w-full max-w-full overflow-x-hidden">
        <div className="overflow-x-auto w-full max-w-full">
          <Table className="w-full max-w-full">
            <TableHeader>
              <TableRow className="border-border hover:bg-muted/50">
                <TableHead className="text-muted-foreground font-semibold text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Trade Date & Activity
                  </div>
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs">Symbol</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs">Position</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs">Session</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs">Risk %</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs">R:R</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs">Result</TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    P&L
                  </div>
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTrades.map((trade, index) => {
                const tradePnL = calculateTradePnL(trade);
                const dateTime = formatTradeDateTime(trade);
                const isPositivePnL = tradePnL > 0;
                const isNegativePnL = tradePnL < 0;
                
                return (
                  <motion.tr 
                    key={trade.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: index * 0.03, duration: 0.4 }}
                    className={cn(
                      "border-border hover:bg-muted/30 group transition-all duration-200",
                      dateTime.isRecent && "bg-primary/5 hover:bg-primary/10"
                    )}
                  >
                    {/* Enhanced Date & Time Cell - Shows trade date and system timestamps */}
                    <TableCell className="font-medium py-2">
                      <div className="flex flex-col gap-1">
                        {/* Primary display: Trade Date */}
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-semibold text-xs",
                            dateTime.isRecent ? "text-primary" : "text-foreground"
                          )}>
                            {dateTime.displayDate}
                          </span>
                          {dateTime.isRecent && (
                            <Badge variant="secondary" className="text-[10px] px-1 py-0.5">
                              {dateTime.wasUpdated ? "Updated" : "New"}
                            </Badge>
                          )}
                        </div>
                        {/* Secondary display: Trade time and system info */}
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" />
                          <span title={`Trade Date: ${dateTime.fullTradeDate}`}>
                            {dateTime.tradeTime}
                          </span>
                          <span className="text-muted-foreground/70">•</span>
                          {/* Show creation or update time based on which is more recent */}
                          {dateTime.wasUpdated ? (
                            <span title={`Updated: ${dateTime.updatedAtFormatted} (Created: ${dateTime.createdAtFormatted})`} className="text-orange-600 dark:text-orange-400">
                              Modified {dateTime.relativeUpdated}
                            </span>
                          ) : (
                            <span title={`Logged: ${dateTime.createdAtFormatted}`} className="text-blue-600 dark:text-blue-400">
                              Logged {dateTime.relativeCreated}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    {/* Enhanced Symbol Cell */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-foreground font-bold text-xs">
                          {trade.symbol || 'N/A'}
                        </span>
                        {trade.symbol && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Enhanced Position (Side) Cell */}
                    <TableCell className="py-2">
                      {trade.side ? (
                        <div className="flex items-center gap-1">
                          {trade.side === "LONG" ? (
                            <TrendingUp className="h-3 w-3 text-success" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-destructive" />
                          )}
                          <Badge variant={trade.side === "LONG" ? "default" : "secondary"} className={cn(
                            "font-medium text-[10px] px-1.5 py-0.5 transition-colors",
                            trade.side === "LONG" ? "bg-success/10 text-success border-success/20 hover:bg-success/20" : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                          )}>
                            {trade.side}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">N/A</span>
                      )}
                    </TableCell>
                    
                    {/* Enhanced Session Cell */}
                    <TableCell className="py-2">
                      {trade.session ? (
                        <Badge variant="outline" className={cn(
                          "border-border text-muted-foreground font-medium text-[10px] px-1.5 py-0.5",
                          "hover:bg-muted/50 transition-colors"
                        )}>
                          {trade.session}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">N/A</span>
                      )}
                    </TableCell>
                    
                    {/* Enhanced Risk Percentage Cell */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-semibold text-foreground text-xs">
                          {trade.risk_percentage ? `${trade.risk_percentage}%` : '1.0%'}
                        </span>
                        {trade.risk_percentage && (
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            trade.risk_percentage <= 1 ? "bg-success" : trade.risk_percentage <= 2 ? "bg-yellow-500" : "bg-destructive"
                          )}></div>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Enhanced R:R Cell */}
                    <TableCell className="py-2">
                      {trade.rr ? (
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-foreground text-xs">
                            1:{trade.rr}
                          </span>
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            trade.rr >= 2 ? "bg-success" : trade.rr >= 1.5 ? "bg-yellow-500" : "bg-orange-500"
                          )}></div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-xs">N/A</span>
                      )}
                    </TableCell>
                    
                    {/* Enhanced Result Cell */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1">
                        {trade.result === "Win" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                        )}
                        {trade.result === "Loss" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse"></div>
                        )}
                        <Badge variant={
                          trade.result === "Win" ? "default" : 
                          trade.result === "Loss" ? "destructive" : "secondary"
                        } className={cn(
                          "font-semibold transition-all duration-200 hover:scale-105 text-[10px] px-1.5 py-0.5",
                          trade.result === "Win" ? "bg-success/10 text-success border-success/30 hover:bg-success/20" : 
                          trade.result === "Loss" ? "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20" : 
                          "bg-muted/10 text-muted-foreground border-muted/30 hover:bg-muted/20"
                        )}>
                          {trade.result}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    {/* Enhanced P&L Cell */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1">
                        {tradePnL > 0 && (
                          <TrendingUp className="h-3 w-3 text-success" />
                        )}
                        {tradePnL < 0 && (
                          <TrendingDown className="h-3 w-3 text-destructive" />
                        )}
                        <div className="flex flex-col gap-0.5">
                          <div className={cn(
                            "font-bold font-mono text-xs transition-all",
                            isPositivePnL ? "text-success" : isNegativePnL ? "text-destructive" : "text-muted-foreground"
                          )}>
                            {tradePnL !== 0 ? (
                              <span className="flex items-center gap-0.5">
                                {tradePnL > 0 ? '+' : ''}${Number(tradePnL).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">$0.00</span>
                            )}
                          </div>
                          {activeAccount && trade.risk_percentage && (
                            <div className="text-[10px] text-muted-foreground">
                              {tradePnL !== 0 ? (
                                <span>
                                  {((tradePnL / activeAccount.starting_balance) * 100).toFixed(2)}%
                                </span>
                              ) : (
                                <span>0.00%</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    {/* Enhanced Actions Cell */}
                    <TableCell className="py-2">
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        {/* View Details Button */}
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-primary/20 hover:text-primary transition-colors" onClick={() => handleViewDetails(trade.id)} title="View trade details">
                            <Eye className="h-2.5 w-2.5" />
                          </Button>
                        </motion.div>
                        
                        {/* Edit Button */}
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-blue-500/20 hover:text-blue-600 transition-colors" onClick={() => handleEdit(trade)} title="Edit trade">
                            <Edit className="h-2.5 w-2.5" />
                          </Button>
                        </motion.div>
                        
                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive transition-colors" disabled={loading} title="Delete trade">
                                <Trash2 className="h-2.5 w-2.5" />
                              </Button>
                            </motion.div>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground">Delete Trade</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                Are you sure you want to delete this {trade.symbol || 'trade'}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="hover:bg-muted">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(trade.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                Delete Trade
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        {/* Share Button */}
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-green-500/20 hover:text-green-600 transition-colors" onClick={() => handleShare(trade)} title="Share trade">
                            <Share className="h-2.5 w-2.5" />
                          </Button>
                        </motion.div>
                        
                        {/* Image Button - Only show if image exists */}
                        {trade.image_url && (
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-orange-500/20 hover:text-orange-600 transition-colors" onClick={() => handleViewImage(trade.image_url!)} title="View screenshot">
                              <Image className="h-2.5 w-2.5" />
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {sortedTrades.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">No trades yet</h3>
                <p className="text-muted-foreground text-xs">Start logging your trades to see them here</p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
      
      <EditTradeModal 
        trade={editingTrade} 
        isOpen={!!editingTrade} 
        onClose={() => setEditingTrade(null)} 
        onTradeUpdated={onTradeUpdated} 
      />
    </Card>
  )
}