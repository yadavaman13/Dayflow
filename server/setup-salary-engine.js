import db from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupSalaryEngine() {
    console.log('\n🔧 Setting up Salary Engine Schema...\n');
    
    try {
        const connection = await db.getConnection();
        
        const sqlFile = path.join(__dirname, './database/salary_engine_schema.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');
        
        // Split by delimiter and execute each statement
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s && !s.startsWith('--') && s !== 'DELIMITER');
        
        for (const statement of statements) {
            if (statement.length > 5) {
                try {
                    await connection.query(statement);
                } catch (err) {
                    if (!err.message.includes('already exists')) {
                        console.log('⚠️  Warning:', err.message.substring(0, 100));
                    }
                }
            }
        }
        
        console.log('✅ Salary engine schema setup complete!\n');
        
        // Verify
        const [components] = await connection.query(`
            SELECT name, component_code, default_value, base_component, is_residual
            FROM salary_component_types
            WHERE is_active = TRUE
            ORDER BY display_order
        `);
        
        console.log('📋 Component Types:');
        components.forEach(c => {
            console.log(`   ${c.is_residual ? '⭐' : '•'} ${c.name} (${c.component_code}) - ${c.default_value}% of ${c.base_component}`);
        });
        
        connection.release();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    
    process.exit(0);
}

setupSalaryEngine();
