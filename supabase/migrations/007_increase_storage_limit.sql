-- 007 — Sube el límite de tamaño del bucket "albums" para poder subir videos
-- Correr a mano en el SQL Editor de Supabase. Es idempotente.
--
-- El bucket se creó pensando en tapas de discos (archivos chicos), por eso
-- rechazaba los videos con "exceeded the maximum allowed size". Se sube a
-- 500 MB y se saca la restricción de tipo de archivo (por si estaba limitada
-- a imágenes).

update storage.buckets
set file_size_limit = 524288000, -- 500 MB
    allowed_mime_types = null
where id = 'albums';
