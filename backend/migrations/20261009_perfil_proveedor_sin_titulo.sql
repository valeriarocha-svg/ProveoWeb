ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);

ALTER TABLE perfiles_proveedor
ALTER COLUMN titulo_profesional DROP NOT NULL;
