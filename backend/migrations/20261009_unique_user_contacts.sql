CREATE UNIQUE INDEX IF NOT EXISTS usuarios_email_unique_idx
ON usuarios (lower(trim(email)));

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_telefono_unique_idx
ON usuarios (telefono)
WHERE telefono IS NOT NULL;
