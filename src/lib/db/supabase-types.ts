// Database types for Supabase
// These types will be generated automatically once we have a Supabase project
// For now, we define them manually based on our planned schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cars: {
        Row: {
          id: string
          user_id: string
          brand: string
          model: string
          year: number
          license_plate: string | null
          picture_url: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          brand: string
          model: string
          year: number
          license_plate?: string | null
          picture_url?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          brand?: string
          model?: string
          year?: number
          license_plate?: string | null
          picture_url?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'cars_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      fuel_logs: {
        Row: {
          id: string
          user_id: string
          car_id: string
          date: string
          distance: number
          dist_unit: 'km' | 'mi'
          fuel: number
          fuel_unit: 'gal' | 'L'
          price: number
          drive_type: 'city' | 'mixed' | 'highway'
          car_reported: number | null
          car_reported_unit: 'km/gal' | 'km/L' | 'MPG' | 'L/100km' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          car_id: string
          date: string
          distance: number
          dist_unit: 'km' | 'mi'
          fuel: number
          fuel_unit: 'gal' | 'L'
          price: number
          drive_type: 'city' | 'mixed' | 'highway'
          car_reported?: number | null
          car_reported_unit?: 'km/gal' | 'km/L' | 'MPG' | 'L/100km' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          car_id?: string
          date?: string
          distance?: number
          dist_unit?: 'km' | 'mi'
          fuel?: number
          fuel_unit?: 'gal' | 'L'
          price?: number
          drive_type?: 'city' | 'mixed' | 'highway'
          car_reported?: number | null
          car_reported_unit?: 'km/gal' | 'km/L' | 'MPG' | 'L/100km' | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'fuel_logs_car_id_fkey'
            columns: ['car_id']
            isOneToOne: false
            referencedRelation: 'cars'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fuel_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}