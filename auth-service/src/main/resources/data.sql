-- Auth Service seed data
INSERT IGNORE INTO users (full_name, email, password, phone, role, enabled, created_at, updated_at) VALUES
('Dr. Sarah Johnson', 'sarah.doctor@nestie.ai', '$2b$10$VoZvo7JYRm40nr4LfWVDtebBSYp0kCdmJ4VvX2UiOrYezhEDUzwX2', '+1234567890', 'DOCTOR', true, NOW(), NOW()),
('Dr. Michael Chen', 'michael.doctor@nestie.ai', '$2b$10$VoZvo7JYRm40nr4LfWVDtebBSYp0kCdmJ4VvX2UiOrYezhEDUzwX2', '+1234567891', 'DOCTOR', true, NOW(), NOW()),
('Emily Williams', 'emily@nestie.ai', '$2b$10$VoZvo7JYRm40nr4LfWVDtebBSYp0kCdmJ4VvX2UiOrYezhEDUzwX2', '+1234567892', 'PATIENT', true, NOW(), NOW()),
('Jessica Brown', 'jessica@nestie.ai', '$2b$10$VoZvo7JYRm40nr4LfWVDtebBSYp0kCdmJ4VvX2UiOrYezhEDUzwX2', '+1234567893', 'PATIENT', true, NOW(), NOW()),
('Admin User', 'admin@nestie.ai', '$2b$10$u4ajGU6mlb74SPVZXapUROIp3nCXrFSGAVBvtmvOa2BV7YTzWaRQ6', '+1234567894', 'ADMIN', true, NOW(), NOW());
