-- ============================================
-- PAYROLL SYSTEM SCHEMA UPDATES
-- ============================================
-- Add columns for payroll system compatibility
-- Run this after salary_engine_schema.sql

USE dayflow_hrms;

-- Add month and year columns for easier querying
ALTER TABLE salary_slips 
ADD COLUMN month INT COMMENT 'Month (1-12)' AFTER salary_month,
ADD COLUMN year INT COMMENT 'Year (YYYY)' AFTER month,
ADD COLUMN period_start DATE COMMENT 'Period start date' AFTER year,
ADD COLUMN period_end DATE COMMENT 'Period end date' AFTER period_start;

-- Create indexes for better performance
CREATE INDEX idx_salary_slip_month_year ON salary_slips(month, year);
CREATE INDEX idx_salary_slip_period ON salary_slips(period_start, period_end);

-- Create table for salary slip components (for detailed breakdown)
CREATE TABLE IF NOT EXISTS salary_slip_components (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    slip_id BIGINT NOT NULL,
    component_type_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    is_deduction BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (slip_id) REFERENCES salary_slips(id) ON DELETE CASCADE,
    FOREIGN KEY (component_type_id) REFERENCES salary_component_types(id) ON DELETE RESTRICT,
    
    INDEX idx_slip_components_slip (slip_id),
    INDEX idx_slip_components_type (component_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update existing salary_slips to populate month, year, period_start, period_end
UPDATE salary_slips 
SET 
    month = MONTH(salary_month),
    year = YEAR(salary_month),
    period_start = salary_month,
    period_end = LAST_DAY(salary_month)
WHERE month IS NULL;

SELECT 'Payroll schema updates completed successfully' as message;
