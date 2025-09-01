/*
  # Financial Management System Database Schema

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (enum: income/expense)
      - `amount` (decimal)
      - `description` (text)
      - `category` (text)
      - `date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (enum: income/expense)
      - `icon` (text)
      - `color` (text)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Secure user data isolation

  3. Indexes
    - Performance indexes for common queries
    - Date-based filtering optimization
*/

-- Create enum types
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE category_type AS ENUM ('income', 'expense');

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount decimal(12,2) NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  category text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type category_type NOT NULL,
  icon text NOT NULL DEFAULT 'Circle',
  color text NOT NULL DEFAULT '#6B7280',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, type, user_id)
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for categories
CREATE POLICY "Users can view own categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Insert default categories for new users
INSERT INTO categories (name, type, icon, color, user_id) VALUES
('Salário', 'income', 'Banknote', '#10B981', '00000000-0000-0000-0000-000000000000'),
('Freelance', 'income', 'Briefcase', '#3B82F6', '00000000-0000-0000-0000-000000000000'),
('Investimentos', 'income', 'TrendingUp', '#8B5CF6', '00000000-0000-0000-0000-000000000000'),
('Alimentação', 'expense', 'UtensilsCrossed', '#EF4444', '00000000-0000-0000-0000-000000000000'),
('Transporte', 'expense', 'Car', '#F97316', '00000000-0000-0000-0000-000000000000'),
('Moradia', 'expense', 'Home', '#06B6D4', '00000000-0000-0000-0000-000000000000'),
('Saúde', 'expense', 'Heart', '#EC4899', '00000000-0000-0000-0000-000000000000'),
('Educação', 'expense', 'GraduationCap', '#8B5CF6', '00000000-0000-0000-0000-000000000000'),
('Lazer', 'expense', 'Gamepad2', '#F59E0B', '00000000-0000-0000-0000-000000000000'),
('Outros', 'expense', 'MoreHorizontal', '#6B7280', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (name, type, user_id) DO NOTHING;

-- Function to automatically create default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (name, type, icon, color, user_id) VALUES
    ('Salário', 'income', 'Banknote', '#10B981', NEW.id),
    ('Freelance', 'income', 'Briefcase', '#3B82F6', NEW.id),
    ('Investimentos', 'income', 'TrendingUp', '#8B5CF6', NEW.id),
    ('Alimentação', 'expense', 'UtensilsCrossed', '#EF4444', NEW.id),
    ('Transporte', 'expense', 'Car', '#F97316', NEW.id),
    ('Moradia', 'expense', 'Home', '#06B6D4', NEW.id),
    ('Saúde', 'expense', 'Heart', '#EC4899', NEW.id),
    ('Educação', 'expense', 'GraduationCap', '#8B5CF6', NEW.id),
    ('Lazer', 'expense', 'Gamepad2', '#F59E0B', NEW.id),
    ('Outros', 'expense', 'MoreHorizontal', '#6B7280', NEW.id)
  ON CONFLICT (name, type, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE OR REPLACE TRIGGER create_default_categories_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories_for_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for transactions updated_at
CREATE OR REPLACE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();