-- ============================================
-- SALARY ENGINE SCHEMA ENHANCEMENTS
-- ============================================
-- Add required columns for production salary engine
-- Run this after main schema.sql

USE dayflow_hrms;

-- ============================================
-- 1. ADD MISSING COLUMNS TO salary_component_types
-- ============================================

-- Check and add is_residual column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = 'dayflow_hrms' 
AND table_name = 'salary_component_types' 
AND column_name = 'is_residual';

SET @query = IF(@col_exists = 0,
    'ALTER TABLE salary_component_types ADD COLUMN is_residual BOOLEAN DEFAULT FALSE COMMENT "Auto-calculated residual component (only one allowed)"',
    'SELECT "Column is_residual already exists" as message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add base_component column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = 'dayflow_hrms' 
AND table_name = 'salary_component_types' 
AND column_name = 'base_component';

SET @query = IF(@col_exists = 0,
    'ALTER TABLE salary_component_types ADD COLUMN base_component VARCHAR(20) DEFAULT "WAGE" COMMENT "Component to calculate from: WAGE, BASIC, OTHER"',
    'SELECT "Column base_component already exists" as message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 2. UPDATE EXISTING COMPONENT TYPES
-- ============================================

-- Update Base Salary to use WAGE as base
UPDATE salary_component_types
SET base_component = 'WAGE',
    default_mode = 'PERCENT',
    default_value = 50.00
WHERE component_code = 'BASIC' OR name = 'Basic Salary';

-- Update HRA to use BASIC as base
UPDATE salary_component_types
SET base_component = 'BASIC',
    default_mode = 'PERCENT',
    default_value = 50.00
WHERE component_code = 'HRA' OR name LIKE '%House Rent%';

-- Update other wage-based components
UPDATE salary_component_types
SET base_component = 'WAGE'
WHERE component_code IN ('DA', 'CONVEYANCE', 'MEDICAL', 'SPECIAL')
OR name IN ('Dearness Allowance', 'Conveyance Allowance', 'Medical Allowance', 'Special Allowance');

-- ============================================
-- 3. INSERT/UPDATE STANDARD COMPONENT TYPES
-- ============================================

INSERT INTO salary_component_types (name, description, component_code, default_mode, default_value, component_category, is_taxable, is_statutory, is_residual, base_component, is_active, display_order)
VALUES
('Basic Salary', 'Base salary component - 50% of wage', 'BASIC', 'PERCENT', 50.00, 'EARNING', TRUE, FALSE, FALSE, 'WAGE', TRUE, 1),
('House Rent Allowance', 'HRA - 50% of Basic salary', 'HRA', 'PERCENT', 50.00, 'EARNING', TRUE, FALSE, FALSE, 'BASIC', TRUE, 2),
('Dearness Allowance', 'DA - 10% of wage', 'DA', 'PERCENT', 10.00, 'EARNING', TRUE, FALSE, FALSE, 'WAGE', TRUE, 3),
('Conveyance Allowance', 'Fixed transport allowance', 'CONVEYANCE', 'FIXED', 1600.00, 'EARNING', FALSE, FALSE, FALSE, 'WAGE', TRUE, 4),
('Medical Allowance', 'Fixed medical benefits', 'MEDICAL', 'FIXED', 1250.00, 'EARNING', FALSE, FALSE, FALSE, 'WAGE', TRUE, 5),
('Special Allowance', 'Special allowance - 20% of wage', 'SPECIAL', 'PERCENT', 20.00, 'EARNING', TRUE, FALSE, FALSE, 'WAGE', TRUE, 6),
('Fixed Allowance', 'Residual component - auto-calculated', 'FIXED_ALLOW', 'PERCENT', 0.00, 'EARNING', TRUE, FALSE, TRUE, 'WAGE', TRUE, 99),
('Performance Bonus', 'Performance bonus - 8.33% of wage', 'PERF_BONUS', 'PERCENT', 8.33, 'EARNING', TRUE, FALSE, FALSE, 'WAGE', TRUE, 7),
('LTA', 'Leave Travel Allowance - 8.33% of wage', 'LTA', 'PERCENT', 8.33, 'EARNING', FALSE, FALSE, FALSE, 'WAGE', TRUE, 8)
ON DUPLICATE KEY UPDATE
    default_mode = VALUES(default_mode),
    default_value = VALUES(default_value),
    base_component = VALUES(base_component),
    is_residual = VALUES(is_residual),
    is_taxable = VALUES(is_taxable),
    display_order = VALUES(display_order);

-- ============================================
-- 4. VERIFICATION QUERIES
-- ============================================

-- Check component types configuration
SELECT 
    id,
    name,
    component_code,
    default_mode,
    default_value,
    base_component,
    is_residual,
    component_category,
    display_order
FROM salary_component_types
WHERE is_active = TRUE
ORDER BY component_category, display_order;

-- Count residual components (should be 1)
SELECT 
    COUNT(*) as residual_count,
    GROUP_CONCAT(name) as residual_components
FROM salary_component_types
WHERE is_residual = TRUE
AND is_active = TRUE;

-- ============================================
-- 5. ADD INDEXES FOR PERFORMANCE
-- ============================================

-- Add index for is_residual
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM information_schema.statistics
WHERE table_schema = 'dayflow_hrms'
AND table_name = 'salary_component_types'
AND index_name = 'idx_comp_type_residual';

SET @query = IF(@index_exists = 0,
    'ALTER TABLE salary_component_types ADD INDEX idx_comp_type_residual (is_residual)',
    'SELECT "Index idx_comp_type_residual already exists" as message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for base_component
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM information_schema.statistics
WHERE table_schema = 'dayflow_hrms'
AND table_name = 'salary_component_types'
AND index_name = 'idx_comp_type_base';

SET @query = IF(@index_exists = 0,
    'ALTER TABLE salary_component_types ADD INDEX idx_comp_type_base (base_component)',
    'SELECT "Index idx_comp_type_base already exists" as message');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 6. VALIDATION CHECKS
-- ============================================

-- Ensure only one residual component is active
DELIMITER //

CREATE TRIGGER trg_salary_comp_type_residual_check
BEFORE INSERT ON salary_component_types
FOR EACH ROW
BEGIN
    DECLARE residual_count INT;
    
    IF NEW.is_residual = TRUE AND NEW.is_active = TRUE THEN
        SELECT COUNT(*) INTO residual_count
        FROM salary_component_types
        WHERE is_residual = TRUE
        AND is_active = TRUE
        AND id != COALESCE(NEW.id, 0);
        
        IF residual_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Only one active residual component is allowed';
        END IF;
    END IF;
END //

CREATE TRIGGER trg_salary_comp_type_residual_update_check
BEFORE UPDATE ON salary_component_types
FOR EACH ROW
BEGIN
    DECLARE residual_count INT;
    
    IF NEW.is_residual = TRUE AND NEW.is_active = TRUE THEN
        SELECT COUNT(*) INTO residual_count
        FROM salary_component_types
        WHERE is_residual = TRUE
        AND is_active = TRUE
        AND id != NEW.id;
        
        IF residual_count > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Only one active residual component is allowed';
        END IF;
    END IF;
END //

DELIMITER ;

-- ============================================
-- END OF SCHEMA ENHANCEMENTS
-- ============================================

SELECT '✅ Salary Engine schema enhancements completed successfully!' as status;
