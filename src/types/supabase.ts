export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          whatsapp: string | null;
          address: string | null;
          role: 'user' | 'admin';
          reset_otp: string | null;
          reset_otp_expiry: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          whatsapp?: string | null;
          address?: string | null;
          role?: 'user' | 'admin';
          reset_otp?: string | null;
          reset_otp_expiry?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          phone?: string | null;
          whatsapp?: string | null;
          address?: string | null;
          role?: 'user' | 'admin';
          reset_otp?: string | null;
          reset_otp_expiry?: string | null;
          updated_at?: string;
        };
      };
      trips: {
        Row: {
          id: string;
          user_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_whatsapp: string | null;
          customer_email: string;
          customer_address: string | null;
          pickup_location: string;
          destinations: string[];
          start_date: string;
          duration: string;
          adults: number;
          children: number;
          travel_type: string;
          budget_range: string;
          package_type: string;
          hotel_category: string;
          transport: string;
          activities: string[];
          food_pref: string;
          special_requests: string;
          estimated_price: number;
          status: 'Pending' | 'Approved' | 'Rejected';
          payment_status: 'Pending' | 'Paid';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_whatsapp?: string | null;
          customer_email: string;
          customer_address?: string | null;
          pickup_location: string;
          destinations: string[];
          start_date: string;
          duration: string;
          adults: number;
          children: number;
          travel_type: string;
          budget_range?: string;
          package_type?: string;
          hotel_category?: string;
          transport?: string;
          activities?: string[];
          food_pref?: string;
          special_requests?: string;
          estimated_price?: number;
          status?: 'Pending' | 'Approved' | 'Rejected';
          payment_status?: 'Pending' | 'Paid';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_whatsapp?: string | null;
          customer_email?: string;
          customer_address?: string | null;
          pickup_location?: string;
          destinations?: string[];
          start_date?: string;
          duration?: string;
          adults?: number;
          children?: number;
          travel_type?: string;
          budget_range?: string;
          package_type?: string;
          hotel_category?: string;
          transport?: string;
          activities?: string[];
          food_pref?: string;
          special_requests?: string;
          estimated_price?: number;
          status?: 'Pending' | 'Approved' | 'Rejected';
          payment_status?: 'Pending' | 'Paid';
        };
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          trip_type: string;
          rating: number;
          review_text: string;
          images: string[];
          image_url: string;
          status: 'Pending' | 'Approved' | 'Rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          trip_type: string;
          rating: number;
          review_text: string;
          images?: string[];
          image_url?: string;
          status?: 'Pending' | 'Approved' | 'Rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          trip_type?: string;
          rating?: number;
          review_text?: string;
          images?: string[];
          image_url?: string;
          status?: 'Pending' | 'Approved' | 'Rejected';
        };
      };
      settings: {
        Row: {
          id: string;
          whatsapp_number: string;
          email_user: string;
          email_pass: string;
          email_host: string;
          email_port: number;
          email_secure: boolean;
          email_from_name: string;
          email_from_address: string;
          admin_notification_email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          whatsapp_number?: string;
          email_user?: string;
          email_pass?: string;
          email_host?: string;
          email_port?: number;
          email_secure?: boolean;
          email_from_name?: string;
          email_from_address?: string;
          admin_notification_email?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          whatsapp_number?: string;
          email_user?: string;
          email_pass?: string;
          email_host?: string;
          email_port?: number;
          email_secure?: boolean;
          email_from_name?: string;
          email_from_address?: string;
          admin_notification_email?: string;
        };
      };
    };
  };
}
