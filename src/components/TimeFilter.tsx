import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { tapFeedback } from '@/lib/haptics';

interface TimeFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filterOptions = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this-week', label: 'This Week' },
  { value: 'last-week', label: 'Last Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: '3-months', label: '3 Months' },
  { value: 'this-year', label: 'This Year' },
  { value: 'last-year', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
];

export function TimeFilter({ activeFilter, onFilterChange }: TimeFilterProps) {
  const isMobile = useIsMobile();

  const handleFilterChange = async (value: string) => {
    await tapFeedback();
    onFilterChange(value);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3 mb-4 w-full">
      <div className={isMobile ? "horizontal-scroll scrollbar-hide gap-2 pb-1 -mx-1 px-1" : "flex flex-wrap gap-1.5 w-full"}>
        {filterOptions.map((option) => (
          <motion.div 
            key={option.value} 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            className="flex-shrink-0"
          >
            <Button 
              variant={activeFilter === option.value ? "default" : "outline"} 
              size="sm" 
              onClick={() => handleFilterChange(option.value)}
              className={`transition-all duration-200 text-xs whitespace-nowrap ${
                isMobile ? 'h-10 px-4 min-w-fit touch-target' : 'h-8 px-2'
              } ${
                activeFilter === option.value 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              {option.label}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
