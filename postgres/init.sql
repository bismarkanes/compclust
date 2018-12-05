ALTER SYSTEM SET max_connections=100;
ALTER SYSTEM reset shared_buffers;
CREATE TABLE IF NOT EXISTS public.users (
       id SERIAL PRIMARY KEY,
       username VARCHAR(100) NOT NULL,
       email VARCHAR(100) NOT NULL
);
