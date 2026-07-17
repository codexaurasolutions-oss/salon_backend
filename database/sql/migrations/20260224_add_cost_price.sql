-- Migration: Add cost_price to services, salon_inventory, and customer_product_purchases
-- Date: 2026-02-24

-- Add cost_price to services table
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0.00;

-- Add cost_price to salon_inventory table
ALTER TABLE public.salon_inventory ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0.00;

-- Add cost_price to customer_product_purchases table
ALTER TABLE public.customer_product_purchases ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0.00;
