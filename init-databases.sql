CREATE DATABASE IF NOT EXISTS nestie_auth_db;
CREATE DATABASE IF NOT EXISTS nestie_pregnancy_db;
CREATE DATABASE IF NOT EXISTS nestie_appointment_db;
CREATE DATABASE IF NOT EXISTS nestie_preview_db;

GRANT ALL PRIVILEGES ON nestie_auth_db.* TO 'Nestie'@'%';
GRANT ALL PRIVILEGES ON nestie_pregnancy_db.* TO 'Nestie'@'%';
GRANT ALL PRIVILEGES ON nestie_appointment_db.* TO 'Nestie'@'%';
GRANT ALL PRIVILEGES ON nestie_preview_db.* TO 'Nestie'@'%';
FLUSH PRIVILEGES;
