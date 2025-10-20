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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown | null
          provider_id: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          provider_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown | null
          provider_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "isp_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bandwidth_queues: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string | null
          enabled: boolean | null
          id: string
          max_download: number
          max_upload: number
          name: string
          priority: number | null
          router_id: string
          target: string
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          enabled?: boolean | null
          id?: string
          max_download: number
          max_upload: number
          name: string
          priority?: number | null
          router_id: string
          target: string
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          enabled?: boolean | null
          id?: string
          max_download?: number
          max_upload?: number
          name?: string
          priority?: number | null
          router_id?: string
          target?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bandwidth_queues_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bandwidth_queues_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      bandwidth_usage: {
        Row: {
          customer_id: string
          download_mb: number | null
          hour: number | null
          id: string
          recorded_at: string
          router_id: string
          total_mb: number | null
          upload_mb: number | null
          usage_date: string
        }
        Insert: {
          customer_id: string
          download_mb?: number | null
          hour?: number | null
          id?: string
          recorded_at?: string
          router_id: string
          total_mb?: number | null
          upload_mb?: number | null
          usage_date: string
        }
        Update: {
          customer_id?: string
          download_mb?: number | null
          hour?: number | null
          id?: string
          recorded_at?: string
          router_id?: string
          total_mb?: number | null
          upload_mb?: number | null
          usage_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "bandwidth_usage_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bandwidth_usage_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      bridge_interfaces: {
        Row: {
          arp: string | null
          comment: string | null
          created_at: string | null
          enabled: boolean | null
          id: string
          mtu: number | null
          name: string
          protocol_mode: string | null
          router_id: string
          updated_at: string | null
        }
        Insert: {
          arp?: string | null
          comment?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          mtu?: number | null
          name: string
          protocol_mode?: string | null
          router_id: string
          updated_at?: string | null
        }
        Update: {
          arp?: string | null
          comment?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          mtu?: number | null
          name?: string
          protocol_mode?: string | null
          router_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bridge_interfaces_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      bridge_ports: {
        Row: {
          bridge: string
          comment: string | null
          created_at: string | null
          enabled: boolean | null
          id: string
          interface: string
          priority: number | null
          pvid: number | null
          router_id: string
          updated_at: string | null
        }
        Insert: {
          bridge: string
          comment?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          interface: string
          priority?: number | null
          pvid?: number | null
          router_id: string
          updated_at?: string | null
        }
        Update: {
          bridge?: string
          comment?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          interface?: string
          priority?: number | null
          pvid?: number | null
          router_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bridge_ports_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_portal_settings: {
        Row: {
          created_at: string | null
          customer_id: string
          email_notifications: boolean | null
          id: string
          show_connected_devices: boolean | null
          show_usage_stats: boolean | null
          sms_notifications: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          email_notifications?: boolean | null
          id?: string
          show_connected_devices?: boolean | null
          show_usage_stats?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          email_notifications?: boolean | null
          id?: string
          show_connected_devices?: boolean | null
          show_usage_stats?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_portal_settings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_sessions: {
        Row: {
          customer_id: string
          data_downloaded_mb: number | null
          data_uploaded_mb: number | null
          disconnect_reason: string | null
          id: string
          ip_address: unknown | null
          mac_address: string | null
          router_id: string
          session_end: string | null
          session_start: string
          status: Database["public"]["Enums"]["session_status"]
        }
        Insert: {
          customer_id: string
          data_downloaded_mb?: number | null
          data_uploaded_mb?: number | null
          disconnect_reason?: string | null
          id?: string
          ip_address?: unknown | null
          mac_address?: string | null
          router_id: string
          session_end?: string | null
          session_start?: string
          status?: Database["public"]["Enums"]["session_status"]
        }
        Update: {
          customer_id?: string
          data_downloaded_mb?: number | null
          data_uploaded_mb?: number | null
          disconnect_reason?: string | null
          id?: string
          ip_address?: unknown | null
          mac_address?: string | null
          router_id?: string
          session_end?: string | null
          session_start?: string
          status?: Database["public"]["Enums"]["session_status"]
        }
        Relationships: [
          {
            foreignKeyName: "customer_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_sessions_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_subscriptions: {
        Row: {
          auto_renew: boolean
          created_at: string
          customer_id: string
          end_date: string | null
          id: string
          package_id: string
          start_date: string
          status: Database["public"]["Enums"]["account_status"]
          updated_at: string
        }
        Insert: {
          auto_renew?: boolean
          created_at?: string
          customer_id: string
          end_date?: string | null
          id?: string
          package_id: string
          start_date?: string
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Update: {
          auto_renew?: boolean
          created_at?: string
          customer_id?: string
          end_date?: string | null
          id?: string
          package_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["account_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          activation_expires_at: string | null
          activation_token: string | null
          address: string | null
          assigned_router_id: string | null
          auto_disconnect_enabled: boolean | null
          created_at: string
          email: string
          first_login_at: string | null
          full_name: string
          id: string
          installation_address: string | null
          notes: string | null
          override_reason: string | null
          override_until: string | null
          payment_override: boolean | null
          phone: string
          provider_id: string
          registration_date: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          activation_expires_at?: string | null
          activation_token?: string | null
          address?: string | null
          assigned_router_id?: string | null
          auto_disconnect_enabled?: boolean | null
          created_at?: string
          email: string
          first_login_at?: string | null
          full_name: string
          id?: string
          installation_address?: string | null
          notes?: string | null
          override_reason?: string | null
          override_until?: string | null
          payment_override?: boolean | null
          phone: string
          provider_id: string
          registration_date?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          activation_expires_at?: string | null
          activation_token?: string | null
          address?: string | null
          assigned_router_id?: string | null
          auto_disconnect_enabled?: boolean | null
          created_at?: string
          email?: string
          first_login_at?: string | null
          full_name?: string
          id?: string
          installation_address?: string | null
          notes?: string | null
          override_reason?: string | null
          override_until?: string | null
          payment_override?: boolean | null
          phone?: string
          provider_id?: string
          registration_date?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_assigned_router_id_fkey"
            columns: ["assigned_router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "isp_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dhcp_servers: {
        Row: {
          address_pool: string
          created_at: string | null
          dns_servers: string | null
          enabled: boolean | null
          gateway: string | null
          id: string
          interface: string
          lease_time: string | null
          name: string
          router_id: string
          updated_at: string | null
        }
        Insert: {
          address_pool: string
          created_at?: string | null
          dns_servers?: string | null
          enabled?: boolean | null
          gateway?: string | null
          id?: string
          interface: string
          lease_time?: string | null
          name: string
          router_id: string
          updated_at?: string | null
        }
        Update: {
          address_pool?: string
          created_at?: string | null
          dns_servers?: string | null
          enabled?: boolean | null
          gateway?: string | null
          id?: string
          interface?: string
          lease_time?: string | null
          name?: string
          router_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dhcp_servers_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      dns_settings: {
        Row: {
          allow_remote_requests: boolean | null
          cache_max_ttl: string | null
          cache_size: number | null
          created_at: string | null
          id: string
          router_id: string
          servers: string[] | null
          updated_at: string | null
          use_doh_server: string | null
        }
        Insert: {
          allow_remote_requests?: boolean | null
          cache_max_ttl?: string | null
          cache_size?: number | null
          created_at?: string | null
          id?: string
          router_id: string
          servers?: string[] | null
          updated_at?: string | null
          use_doh_server?: string | null
        }
        Update: {
          allow_remote_requests?: boolean | null
          cache_max_ttl?: string | null
          cache_size?: number | null
          created_at?: string | null
          id?: string
          router_id?: string
          servers?: string[] | null
          updated_at?: string | null
          use_doh_server?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dns_settings_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: true
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      dns_static_records: {
        Row: {
          address: string | null
          comment: string | null
          created_at: string | null
          enabled: boolean | null
          id: string
          name: string
          router_id: string
          ttl: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          comment?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          name: string
          router_id: string
          ttl?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          comment?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          router_id?: string
          ttl?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dns_static_records_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          email_type: string
          id: string
          provider_id: string | null
          recipient_email: string
          sent_at: string | null
          status: string | null
          subject: string
          user_id: string | null
        }
        Insert: {
          email_type: string
          id?: string
          provider_id?: string | null
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          subject: string
          user_id?: string | null
        }
        Update: {
          email_type?: string
          id?: string
          provider_id?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "isp_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      firewall_rules: {
        Row: {
          action: string
          chain: string
          comment: string | null
          created_at: string | null
          dst_address: string | null
          dst_port: string | null
          enabled: boolean | null
          id: string
          position: number | null
          protocol: string | null
          router_id: string
          src_address: string | null
          src_port: string | null
          updated_at: string | null
        }
        Insert: {
          action: string
          chain: string
          comment?: string | null
          created_at?: string | null
          dst_address?: string | null
          dst_port?: string | null
          enabled?: boolean | null
          id?: string
          position?: number | null
          protocol?: string | null
          router_id: string
          src_address?: string | null
          src_port?: string | null
          updated_at?: string | null
        }
        Update: {
          action?: string
          chain?: string
          comment?: string | null
          created_at?: string | null
          dst_address?: string | null
          dst_port?: string | null
          enabled?: boolean | null
          id?: string
          position?: number | null
          protocol?: string | null
          router_id?: string
          src_address?: string | null
          src_port?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "firewall_rules_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      hotspot_servers: {
        Row: {
          address_pool: string | null
          created_at: string | null
          enabled: boolean | null
          id: string
          idle_timeout: string | null
          interface: string
          keepalive_timeout: string | null
          login_timeout: string | null
          name: string
          profile: string | null
          router_id: string
          updated_at: string | null
        }
        Insert: {
          address_pool?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          idle_timeout?: string | null
          interface: string
          keepalive_timeout?: string | null
          login_timeout?: string | null
          name: string
          profile?: string | null
          router_id: string
          updated_at?: string | null
        }
        Update: {
          address_pool?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          idle_timeout?: string | null
          interface?: string
          keepalive_timeout?: string | null
          login_timeout?: string | null
          name?: string
          profile?: string | null
          router_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotspot_servers_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      hotspot_users: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string | null
          enabled: boolean | null
          id: string
          limit_bytes_in: number | null
          limit_bytes_out: number | null
          limit_uptime: string | null
          name: string
          password: string
          profile: string | null
          router_id: string
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          enabled?: boolean | null
          id?: string
          limit_bytes_in?: number | null
          limit_bytes_out?: number | null
          limit_uptime?: string | null
          name: string
          password: string
          profile?: string | null
          router_id: string
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          enabled?: boolean | null
          id?: string
          limit_bytes_in?: number | null
          limit_bytes_out?: number | null
          limit_uptime?: string | null
          name?: string
          password?: string
          profile?: string | null
          router_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotspot_users_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotspot_users_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          description: string | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          status: Database["public"]["Enums"]["invoice_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          description?: string | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      ip_address_pools: {
        Row: {
          comment: string | null
          created_at: string | null
          dns_servers: string | null
          gateway: string | null
          id: string
          ip_range: string
          ip_range_end: unknown | null
          ip_range_start: unknown | null
          name: string
          router_id: string
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          dns_servers?: string | null
          gateway?: string | null
          id?: string
          ip_range: string
          ip_range_end?: unknown | null
          ip_range_start?: unknown | null
          name: string
          router_id: string
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          dns_servers?: string | null
          gateway?: string | null
          id?: string
          ip_range?: string
          ip_range_end?: unknown | null
          ip_range_start?: unknown | null
          name?: string
          router_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ip_address_pools_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      isp_providers: {
        Row: {
          address: string | null
          auto_suspend: boolean | null
          business_type: string | null
          company_email: string
          company_name: string
          company_phone: string | null
          created_at: string
          id: string
          last_payment_date: string | null
          logo_url: string | null
          max_customers: number | null
          max_routers: number | null
          monthly_fee: number | null
          next_billing_date: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          owner_id: string
          payment_method: string | null
          payment_phone: string | null
          payment_status: string | null
          registration_number: string | null
          registration_status: string | null
          stripe_customer_id: string | null
          subscription_end_date: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          subscription_start_date: string
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          tax_id: string | null
          trial_end_date: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          auto_suspend?: boolean | null
          business_type?: string | null
          company_email: string
          company_name: string
          company_phone?: string | null
          created_at?: string
          id?: string
          last_payment_date?: string | null
          logo_url?: string | null
          max_customers?: number | null
          max_routers?: number | null
          monthly_fee?: number | null
          next_billing_date?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          owner_id: string
          payment_method?: string | null
          payment_phone?: string | null
          payment_status?: string | null
          registration_number?: string | null
          registration_status?: string | null
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          subscription_start_date?: string
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          tax_id?: string | null
          trial_end_date?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          auto_suspend?: boolean | null
          business_type?: string | null
          company_email?: string
          company_name?: string
          company_phone?: string | null
          created_at?: string
          id?: string
          last_payment_date?: string | null
          logo_url?: string | null
          max_customers?: number | null
          max_routers?: number | null
          monthly_fee?: number | null
          next_billing_date?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          owner_id?: string
          payment_method?: string | null
          payment_phone?: string | null
          payment_status?: string | null
          registration_number?: string | null
          registration_status?: string | null
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          subscription_start_date?: string
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          tax_id?: string | null
          trial_end_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "isp_providers_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mangle_rules: {
        Row: {
          action: string
          chain: string
          comment: string | null
          connection_mark: string | null
          created_at: string | null
          dst_address: string | null
          dst_port: string | null
          enabled: boolean | null
          id: string
          in_interface: string | null
          new_connection_mark: string | null
          new_packet_mark: string | null
          new_routing_mark: string | null
          out_interface: string | null
          passthrough: boolean | null
          position: number | null
          protocol: string | null
          router_id: string
          src_address: string | null
          src_port: string | null
          updated_at: string | null
        }
        Insert: {
          action: string
          chain: string
          comment?: string | null
          connection_mark?: string | null
          created_at?: string | null
          dst_address?: string | null
          dst_port?: string | null
          enabled?: boolean | null
          id?: string
          in_interface?: string | null
          new_connection_mark?: string | null
          new_packet_mark?: string | null
          new_routing_mark?: string | null
          out_interface?: string | null
          passthrough?: boolean | null
          position?: number | null
          protocol?: string | null
          router_id: string
          src_address?: string | null
          src_port?: string | null
          updated_at?: string | null
        }
        Update: {
          action?: string
          chain?: string
          comment?: string | null
          connection_mark?: string | null
          created_at?: string | null
          dst_address?: string | null
          dst_port?: string | null
          enabled?: boolean | null
          id?: string
          in_interface?: string | null
          new_connection_mark?: string | null
          new_packet_mark?: string | null
          new_routing_mark?: string | null
          out_interface?: string | null
          passthrough?: boolean | null
          position?: number | null
          protocol?: string | null
          router_id?: string
          src_address?: string | null
          src_port?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mangle_rules_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      nat_rules: {
        Row: {
          action: string
          chain: string
          comment: string | null
          created_at: string | null
          dst_address: string | null
          dst_port: string | null
          enabled: boolean | null
          id: string
          in_interface: string | null
          out_interface: string | null
          position: number | null
          protocol: string | null
          router_id: string
          src_address: string | null
          src_port: string | null
          to_addresses: string | null
          to_ports: string | null
          updated_at: string | null
        }
        Insert: {
          action?: string
          chain?: string
          comment?: string | null
          created_at?: string | null
          dst_address?: string | null
          dst_port?: string | null
          enabled?: boolean | null
          id?: string
          in_interface?: string | null
          out_interface?: string | null
          position?: number | null
          protocol?: string | null
          router_id: string
          src_address?: string | null
          src_port?: string | null
          to_addresses?: string | null
          to_ports?: string | null
          updated_at?: string | null
        }
        Update: {
          action?: string
          chain?: string
          comment?: string | null
          created_at?: string | null
          dst_address?: string | null
          dst_port?: string | null
          enabled?: boolean | null
          id?: string
          in_interface?: string | null
          out_interface?: string | null
          position?: number | null
          protocol?: string | null
          router_id?: string
          src_address?: string | null
          src_port?: string | null
          to_addresses?: string | null
          to_ports?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nat_rules_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      network_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          provider_id: string | null
          router_id: string | null
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          provider_id?: string | null
          router_id?: string | null
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          provider_id?: string | null
          router_id?: string | null
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "network_settings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "isp_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "network_settings_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_on_customer_signup: boolean | null
          email_on_payment: boolean | null
          email_on_router_offline: boolean | null
          id: string
          provider_id: string
          sms_on_critical: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_on_customer_signup?: boolean | null
          email_on_payment?: boolean | null
          email_on_router_offline?: boolean | null
          id?: string
          provider_id: string
          sms_on_critical?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_on_customer_signup?: boolean | null
          email_on_payment?: boolean | null
          email_on_router_offline?: boolean | null
          id?: string
          provider_id?: string
          sms_on_critical?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "isp_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          message: string
          provider_id: string | null
          scheduled_at: string | null
          send_via: Database["public"]["Enums"]["send_via"]
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          message: string
          provider_id?: string | null
          scheduled_at?: string | null
          send_via?: Database["public"]["Enums"]["send_via"]
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          message?: string
          provider_id?: string | null
          scheduled_at?: string | null
          send_via?: Database["public"]["Enums"]["send_via"]
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "isp_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_override_log: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          override_status: boolean
          override_until: string | null
          performed_by: string | null
          provider_id: string
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          override_status: boolean
          override_until?: string | null
          performed_by?: string | null
          provider_id: string
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          override_status?: boolean
          override_until?: string | null
          performed_by?: string | null
          provider_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_override_log_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_override_log_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "isp_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          payment_date: string | null
          payment_method: string
          provider_id: string
          status: string | null
          transaction_ref: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_date?: string | null
          payment_method: string
          provider_id: string
          status?: string | null
          transaction_ref?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_date?: string | null
          payment_method?: string
          provider_id?: string
          status?: string | null
          transaction_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "isp_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      pppoe_profiles: {
        Row: {
          authentication: string | null
          created_at: string | null
          dns_server: string | null
          id: string
          local_address: string | null
          max_sessions: number | null
          name: string
          remote_address: string | null
          router_id: string
          service_name: string | null
          updated_at: string | null
        }
        Insert: {
          authentication?: string | null
          created_at?: string | null
          dns_server?: string | null
          id?: string
          local_address?: string | null
          max_sessions?: number | null
          name: string
          remote_address?: string | null
          router_id: string
          service_name?: string | null
          updated_at?: string | null
        }
        Update: {
          authentication?: string | null
          created_at?: string | null
          dns_server?: string | null
          id?: string
          local_address?: string | null
          max_sessions?: number | null
          name?: string
          remote_address?: string | null
          router_id?: string
          service_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pppoe_profiles_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      pppoe_secrets: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string | null
          enabled: boolean | null
          id: string
          local_address: string | null
          name: string
          password: string
          profile: string | null
          remote_address: string | null
          router_id: string
          routes: string | null
          service: string | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          enabled?: boolean | null
          id?: string
          local_address?: string | null
          name: string
          password: string
          profile?: string | null
          remote_address?: string | null
          router_id: string
          routes?: string | null
          service?: string | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string | null
          enabled?: boolean | null
          id?: string
          local_address?: string | null
          name?: string
          password?: string
          profile?: string | null
          remote_address?: string | null
          router_id?: string
          routes?: string | null
          service?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pppoe_secrets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pppoe_secrets_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      pppoe_sessions: {
        Row: {
          address: string | null
          caller_id: string | null
          connected_at: string | null
          customer_id: string | null
          encoding: string | null
          id: string
          last_sync: string | null
          router_id: string
          rx_bytes: number | null
          service: string | null
          session_id: string | null
          status: string | null
          tx_bytes: number | null
          uptime: string | null
          username: string
        }
        Insert: {
          address?: string | null
          caller_id?: string | null
          connected_at?: string | null
          customer_id?: string | null
          encoding?: string | null
          id?: string
          last_sync?: string | null
          router_id: string
          rx_bytes?: number | null
          service?: string | null
          session_id?: string | null
          status?: string | null
          tx_bytes?: number | null
          uptime?: string | null
          username: string
        }
        Update: {
          address?: string | null
          caller_id?: string | null
          connected_at?: string | null
          customer_id?: string | null
          encoding?: string | null
          id?: string
          last_sync?: string | null
          router_id?: string
          rx_bytes?: number | null
          service?: string | null
          session_id?: string | null
          status?: string | null
          tx_bytes?: number | null
          uptime?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "pppoe_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pppoe_sessions_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      router_capabilities: {
        Row: {
          capability: string
          created_at: string | null
          enabled: boolean | null
          id: string
          router_id: string
        }
        Insert: {
          capability: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          router_id: string
        }
        Update: {
          capability?: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          router_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "router_capabilities_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      router_interfaces: {
        Row: {
          created_at: string | null
          id: string
          last_sync: string | null
          mac_address: string | null
          name: string
          router_id: string
          rx_bytes: number | null
          rx_packets: number | null
          status: string | null
          tx_bytes: number | null
          tx_packets: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_sync?: string | null
          mac_address?: string | null
          name: string
          router_id: string
          rx_bytes?: number | null
          rx_packets?: number | null
          status?: string | null
          tx_bytes?: number | null
          tx_packets?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_sync?: string | null
          mac_address?: string | null
          name?: string
          router_id?: string
          rx_bytes?: number | null
          rx_packets?: number | null
          status?: string | null
          tx_bytes?: number | null
          tx_packets?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "router_interfaces_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      router_ip_addresses: {
        Row: {
          address: string
          comment: string | null
          created_at: string | null
          enabled: boolean | null
          id: string
          interface: string
          network: string | null
          router_id: string
          updated_at: string | null
        }
        Insert: {
          address: string
          comment?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          interface: string
          network?: string | null
          router_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          comment?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          interface?: string
          network?: string | null
          router_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "router_ip_addresses_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      router_stats: {
        Row: {
          active_users: number | null
          bandwidth_in_mbps: number | null
          bandwidth_out_mbps: number | null
          cpu_load: number | null
          id: string
          memory_usage: number | null
          recorded_at: string
          router_id: string
          uptime_seconds: number | null
        }
        Insert: {
          active_users?: number | null
          bandwidth_in_mbps?: number | null
          bandwidth_out_mbps?: number | null
          cpu_load?: number | null
          id?: string
          memory_usage?: number | null
          recorded_at?: string
          router_id: string
          uptime_seconds?: number | null
        }
        Update: {
          active_users?: number | null
          bandwidth_in_mbps?: number | null
          bandwidth_out_mbps?: number | null
          cpu_load?: number | null
          id?: string
          memory_usage?: number | null
          recorded_at?: string
          router_id?: string
          uptime_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "router_stats_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
      routers: {
        Row: {
          api_endpoint: string | null
          api_port: number | null
          api_type: Database["public"]["Enums"]["api_type"]
          architecture: string | null
          board_name: string | null
          connection_test_status: string | null
          cpu_count: number | null
          created_at: string
          credentials_vault_id: string | null
          disk_size: number | null
          firmware_version: string | null
          id: string
          ip_address: string
          last_seen: string | null
          last_test_date: string | null
          location: string | null
          manufacturer: string | null
          model: string | null
          name: string
          password: string | null
          provider_id: string
          router_os_version: string | null
          status: Database["public"]["Enums"]["router_status"]
          total_memory: number | null
          updated_at: string
          username: string | null
        }
        Insert: {
          api_endpoint?: string | null
          api_port?: number | null
          api_type?: Database["public"]["Enums"]["api_type"]
          architecture?: string | null
          board_name?: string | null
          connection_test_status?: string | null
          cpu_count?: number | null
          created_at?: string
          credentials_vault_id?: string | null
          disk_size?: number | null
          firmware_version?: string | null
          id?: string
          ip_address: string
          last_seen?: string | null
          last_test_date?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          password?: string | null
          provider_id: string
          router_os_version?: string | null
          status?: Database["public"]["Enums"]["router_status"]
          total_memory?: number | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          api_endpoint?: string | null
          api_port?: number | null
          api_type?: Database["public"]["Enums"]["api_type"]
          architecture?: string | null
          board_name?: string | null
          connection_test_status?: string | null
          cpu_count?: number | null
          created_at?: string
          credentials_vault_id?: string | null
          disk_size?: number | null
          firmware_version?: string | null
          id?: string
          ip_address?: string
          last_seen?: string | null
          last_test_date?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          password?: string | null
          provider_id?: string
          router_os_version?: string | null
          status?: Database["public"]["Enums"]["router_status"]
          total_memory?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "isp_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          bandwidth_limit_gb: number | null
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          package_name: string
          price: number
          provider_id: string
          speed_mbps: number
          updated_at: string
        }
        Insert: {
          bandwidth_limit_gb?: number | null
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          package_name: string
          price: number
          provider_id: string
          speed_mbps: number
          updated_at?: string
        }
        Update: {
          bandwidth_limit_gb?: number | null
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          package_name?: string
          price?: number
          provider_id?: string
          speed_mbps?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "isp_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          display_name: string
          features: Json | null
          id: string
          is_active: boolean | null
          max_bandwidth_gb: number | null
          max_customers: number
          max_routers: number
          monthly_price: number
          plan_name: string
          trial_days: number | null
          yearly_price: number | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_bandwidth_gb?: number | null
          max_customers: number
          max_routers: number
          monthly_price: number
          plan_name: string
          trial_days?: number | null
          yearly_price?: number | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_bandwidth_gb?: number | null
          max_customers?: number
          max_routers?: number
          monthly_price?: number
          plan_name?: string
          trial_days?: number | null
          yearly_price?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vlans: {
        Row: {
          comment: string | null
          created_at: string | null
          enabled: boolean | null
          id: string
          interface: string
          name: string
          router_id: string
          updated_at: string | null
          vlan_id: number
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          interface: string
          name: string
          router_id: string
          updated_at?: string | null
          vlan_id: number
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          interface?: string
          name?: string
          router_id?: string
          updated_at?: string | null
          vlan_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "vlans_router_id_fkey"
            columns: ["router_id"]
            isOneToOne: false
            referencedRelation: "routers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_provider_id: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_provider_owner: {
        Args: { _provider_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "active" | "suspended" | "pending" | "disconnected"
      api_type: "mikrotik_api" | "ssh" | "snmp" | "rest_api"
      app_role: "platform_owner" | "isp_provider" | "customer"
      billing_cycle: "monthly" | "quarterly" | "yearly"
      invoice_status: "draft" | "issued" | "paid" | "overdue" | "cancelled"
      notification_status: "pending" | "sent" | "failed"
      notification_type:
        | "payment_reminder"
        | "package_expiry"
        | "system_alert"
        | "promotional"
      payment_method:
        | "cash"
        | "mpesa"
        | "bank_transfer"
        | "credit_card"
        | "paypal"
        | "stripe"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      router_status: "online" | "offline" | "warning" | "maintenance"
      send_via: "email" | "sms" | "both"
      session_status: "active" | "disconnected"
      subscription_plan: "trial" | "standard" | "professional" | "enterprise"
      subscription_status: "active" | "suspended" | "cancelled" | "trial"
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
    Enums: {
      account_status: ["active", "suspended", "pending", "disconnected"],
      api_type: ["mikrotik_api", "ssh", "snmp", "rest_api"],
      app_role: ["platform_owner", "isp_provider", "customer"],
      billing_cycle: ["monthly", "quarterly", "yearly"],
      invoice_status: ["draft", "issued", "paid", "overdue", "cancelled"],
      notification_status: ["pending", "sent", "failed"],
      notification_type: [
        "payment_reminder",
        "package_expiry",
        "system_alert",
        "promotional",
      ],
      payment_method: [
        "cash",
        "mpesa",
        "bank_transfer",
        "credit_card",
        "paypal",
        "stripe",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      router_status: ["online", "offline", "warning", "maintenance"],
      send_via: ["email", "sms", "both"],
      session_status: ["active", "disconnected"],
      subscription_plan: ["trial", "standard", "professional", "enterprise"],
      subscription_status: ["active", "suspended", "cancelled", "trial"],
    },
  },
} as const
