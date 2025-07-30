-- Function to update account balance
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the account balance based on all transactions for that account
  UPDATE accounts 
  SET balance = (
    SELECT COALESCE(
      SUM(CASE 
        WHEN type = 'income' THEN amount 
        WHEN type = 'expense' THEN -amount 
        ELSE 0 
      END), 0
    )
    FROM transactions 
    WHERE account_id = COALESCE(NEW.account_id, OLD.account_id)
  )
  WHERE id = COALESCE(NEW.account_id, OLD.account_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT
CREATE OR REPLACE TRIGGER trigger_update_account_balance_insert
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance();

-- Create trigger for UPDATE
CREATE OR REPLACE TRIGGER trigger_update_account_balance_update
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance();

-- Create trigger for DELETE
CREATE OR REPLACE TRIGGER trigger_update_account_balance_delete
  AFTER DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance();

-- Update existing account balances based on current transactions
UPDATE accounts 
SET balance = (
  SELECT COALESCE(
    SUM(CASE 
      WHEN type = 'income' THEN amount 
      WHEN type = 'expense' THEN -amount 
      ELSE 0 
    END), 0
  )
  FROM transactions 
  WHERE account_id = accounts.id
)
WHERE is_active = true;