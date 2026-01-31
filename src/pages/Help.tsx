import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Quote } from "lucide-react"

const Help = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
      
      <Card className="bg-gradient-card shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-muted-foreground">
            <p>Welcome to PropFirm Knowledge Journal!</p>
            <p>This application helps you track your trading performance and master the art of professional trading across different forex sessions.</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the Dashboard to view your overall performance</li>
              <li>Check Stats for detailed analytics and insights</li>
              <li>Review your trades in the Calendar</li>
              <li>Track your equity curve and monitor progress</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-card border-border border-primary/20">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Quote className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <CardTitle className="text-card-foreground">We Build Traders</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-lg font-semibold text-primary italic">
              "Consistency is the key to success in prop firm trading. Track every trade, learn from every decision, and evolve your strategy every day."
            </p>
            <p className="text-muted-foreground">
              Our Knowledge Journal empowers you to maintain discipline, analyze patterns, and build the trading mindset required to succeed as a professional trader.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Pro Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-muted-foreground">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Log trades immediately after closing for accurate records</li>
              <li>Include detailed notes about your reasoning and market conditions</li>
              <li>Review your stats weekly to identify patterns and edge</li>
              <li>Focus on consistency over perfection</li>
              <li>Use your trading history to refine your strategy</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Help
