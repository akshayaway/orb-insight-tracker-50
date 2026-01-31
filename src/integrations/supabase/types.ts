export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      account_sizes: {
        Row: {
          account_size: string
          created_at: string | null
          discount: number | null
          firm_id: string | null
          id: string
          payout_rate: number | null
          platform: string | null
          price: number | null
          updated_at: string | null
        }
        Insert: {
          account_size: string
          created_at?: string | null
          discount?: number | null
          firm_id?: string | null
          id?: string
          payout_rate?: number | null
          platform?: string | null
          price?: number | null
          updated_at?: string | null
        }
        Update: {
          account_size?: string
          created_at?: string | null
          discount?: number | null
          firm_id?: string | null
          id?: string
          payout_rate?: number | null
          platform?: string | null
          price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_sizes_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "propfirms"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          created_at: string
          current_balance: number
          id: string
          is_active: boolean
          name: string
          risk_per_trade: number
          starting_balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_balance?: number
          id?: string
          is_active?: boolean
          name: string
          risk_per_trade?: number
          starting_balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          id?: string
          is_active?: boolean
          name?: string
          risk_per_trade?: number
          starting_balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          content: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          published: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      budget_prop: {
        Row: {
          created_at: string | null
          id: string
          propfirm_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          propfirm_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          propfirm_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_prop_propfirm_id_fkey"
            columns: ["propfirm_id"]
            isOneToOne: false
            referencedRelation: "prop_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      cheap_firms: {
        Row: {
          created_at: string
          firm_id: string
          id: string
        }
        Insert: {
          created_at?: string
          firm_id: string
          id?: string
        }
        Update: {
          created_at?: string
          firm_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cheap_firms_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: true
            referencedRelation: "propfirms"
            referencedColumns: ["id"]
          },
        ]
      }
      prop_firms: {
        Row: {
          affiliate_url: string | null
          brand: string | null
          category_id: string | null
          cons: string[] | null
          coupon_code: string | null
          created_at: string | null
          description: string | null
          evaluation_model: string | null
          features: string[] | null
          funding_amount: string
          id: string
          logo_url: string | null
          max_funding: string | null
          name: string
          original_price: number | null
          payout_rate: number
          platform: string | null
          price: number
          profit_split: number
          pros: string[] | null
          regulation: string | null
          review_score: number | null
          show_on_homepage: boolean | null
          slug: string | null
          starting_fee: number | null
          table_coupon_code: string | null
          table_evaluation_rules: string | null
          table_fee: number | null
          table_payout_rate: number | null
          table_platform: string | null
          table_price: number | null
          table_profit_split: number | null
          table_trust_rating: number | null
          trust_rating: number | null
          updated_at: string | null
          user_review_count: number | null
        }
        Insert: {
          affiliate_url?: string | null
          brand?: string | null
          category_id?: string | null
          cons?: string[] | null
          coupon_code?: string | null
          created_at?: string | null
          description?: string | null
          evaluation_model?: string | null
          features?: string[] | null
          funding_amount: string
          id?: string
          logo_url?: string | null
          max_funding?: string | null
          name: string
          original_price?: number | null
          payout_rate: number
          platform?: string | null
          price: number
          profit_split: number
          pros?: string[] | null
          regulation?: string | null
          review_score?: number | null
          show_on_homepage?: boolean | null
          slug?: string | null
          starting_fee?: number | null
          table_coupon_code?: string | null
          table_evaluation_rules?: string | null
          table_fee?: number | null
          table_payout_rate?: number | null
          table_platform?: string | null
          table_price?: number | null
          table_profit_split?: number | null
          table_trust_rating?: number | null
          trust_rating?: number | null
          updated_at?: string | null
          user_review_count?: number | null
        }
        Update: {
          affiliate_url?: string | null
          brand?: string | null
          category_id?: string | null
          cons?: string[] | null
          coupon_code?: string | null
          created_at?: string | null
          description?: string | null
          evaluation_model?: string | null
          features?: string[] | null
          funding_amount?: string
          id?: string
          logo_url?: string | null
          max_funding?: string | null
          name?: string
          original_price?: number | null
          payout_rate?: number
          platform?: string | null
          price?: number
          profit_split?: number
          pros?: string[] | null
          regulation?: string | null
          review_score?: number | null
          show_on_homepage?: boolean | null
          slug?: string | null
          starting_fee?: number | null
          table_coupon_code?: string | null
          table_evaluation_rules?: string | null
          table_fee?: number | null
          table_payout_rate?: number | null
          table_platform?: string | null
          table_price?: number | null
          table_profit_split?: number | null
          table_trust_rating?: number | null
          trust_rating?: number | null
          updated_at?: string | null
          user_review_count?: number | null
        }
        Relationships: []
      }
      propfirms: {
        Row: {
          affiliate_link: string | null
          brand: string | null
          buy_now_url: string | null
          category_id: string | null
          cons: string[] | null
          coupon_code: string | null
          created_at: string | null
          description: string | null
          discount: number | null
          evaluation_model: string | null
          features: string[] | null
          funding_amount: string | null
          id: string
          logo_url: string | null
          max_funding: number | null
          name: string
          original_price: number | null
          payout_rate: number | null
          platform: string | null
          price: number | null
          profit_split: number | null
          pros: string[] | null
          regulation_country: string | null
          review_score: number | null
          slug: string | null
          starting_fee: number | null
          tags: string[] | null
          trading_levels: string[] | null
          trust_rating: number | null
          updated_at: string | null
        }
        Insert: {
          affiliate_link?: string | null
          brand?: string | null
          buy_now_url?: string | null
          category_id?: string | null
          cons?: string[] | null
          coupon_code?: string | null
          created_at?: string | null
          description?: string | null
          discount?: number | null
          evaluation_model?: string | null
          features?: string[] | null
          funding_amount?: string | null
          id?: string
          logo_url?: string | null
          max_funding?: number | null
          name: string
          original_price?: number | null
          payout_rate?: number | null
          platform?: string | null
          price?: number | null
          profit_split?: number | null
          pros?: string[] | null
          regulation_country?: string | null
          review_score?: number | null
          slug?: string | null
          starting_fee?: number | null
          tags?: string[] | null
          trading_levels?: string[] | null
          trust_rating?: number | null
          updated_at?: string | null
        }
        Update: {
          affiliate_link?: string | null
          brand?: string | null
          buy_now_url?: string | null
          category_id?: string | null
          cons?: string[] | null
          coupon_code?: string | null
          created_at?: string | null
          description?: string | null
          discount?: number | null
          evaluation_model?: string | null
          features?: string[] | null
          funding_amount?: string | null
          id?: string
          logo_url?: string | null
          max_funding?: number | null
          name?: string
          original_price?: number | null
          payout_rate?: number | null
          platform?: string | null
          price?: number | null
          profit_split?: number | null
          pros?: string[] | null
          regulation_country?: string | null
          review_score?: number | null
          slug?: string | null
          starting_fee?: number | null
          tags?: string[] | null
          trading_levels?: string[] | null
          trust_rating?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          category: string | null
          created_at: string | null
          expert_score: number | null
          expert_summary: string | null
          firm_id: string | null
          id: string
          payout_speed: string | null
          trust_score: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          expert_score?: number | null
          expert_summary?: string | null
          firm_id?: string | null
          id?: string
          payout_speed?: string | null
          trust_score?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          expert_score?: number | null
          expert_summary?: string | null
          firm_id?: string | null
          id?: string
          payout_speed?: string | null
          trust_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "propfirms"
            referencedColumns: ["id"]
          },
        ]
      }
      table_review_firms: {
        Row: {
          created_at: string | null
          firm_id: string | null
          id: string
          is_approved: boolean | null
          sort_priority: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          firm_id?: string | null
          id?: string
          is_approved?: boolean | null
          sort_priority?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          firm_id?: string | null
          id?: string
          is_approved?: boolean | null
          sort_priority?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "table_review_firms_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "prop_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      top_firms: {
        Row: {
          created_at: string
          firm_id: string
          id: string
          rank: number
        }
        Insert: {
          created_at?: string
          firm_id: string
          id?: string
          rank: number
        }
        Update: {
          created_at?: string
          firm_id?: string
          id?: string
          rank?: number
        }
        Relationships: [
          {
            foreignKeyName: "top_firms_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: true
            referencedRelation: "propfirms"
            referencedColumns: ["id"]
          },
        ]
      }
      top5_prop: {
        Row: {
          created_at: string | null
          id: string
          propfirm_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          propfirm_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          propfirm_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "top5_prop_propfirm_id_fkey"
            columns: ["propfirm_id"]
            isOneToOne: false
            referencedRelation: "prop_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_reviews: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          screenshot_url: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          screenshot_url?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          screenshot_url?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          account_id: string | null
          commission: number | null
          created_at: string
          date: string
          entry_price: number | null
          exit_price: number | null
          id: string
          image_url: string | null
          is_public: boolean | null
          notes: string | null
          pnl_dollar: number | null
          quantity: number | null
          result: string
          risk_percentage: number | null
          rr: number | null
          session: string
          setup_tag: string | null
          side: string | null
          strategy_tag: string | null
          symbol: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          commission?: number | null
          created_at?: string
          date: string
          entry_price?: number | null
          exit_price?: number | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          notes?: string | null
          pnl_dollar?: number | null
          quantity?: number | null
          result: string
          risk_percentage?: number | null
          rr?: number | null
          session: string
          setup_tag?: string | null
          side?: string | null
          strategy_tag?: string | null
          symbol?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          commission?: number | null
          created_at?: string
          date?: string
          entry_price?: number | null
          exit_price?: number | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          notes?: string | null
          pnl_dollar?: number | null
          quantity?: number | null
          result?: string
          risk_percentage?: number | null
          rr?: number | null
          session?: string
          setup_tag?: string | null
          side?: string | null
          strategy_tag?: string | null
          symbol?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_admin: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          firm_id: string | null
          id: string
          rating: number
          reviewer_name: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          firm_id?: string | null
          id?: string
          rating: number
          reviewer_name?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          firm_id?: string | null
          id?: string
          rating?: number
          reviewer_name?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reviews_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "propfirms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_account_active: {
        Args: { account_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
