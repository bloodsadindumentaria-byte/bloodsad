-- 005 — Limpia espacios sueltos al principio/final en name y slug de artists
-- Correr a mano en el SQL Editor de Supabase. Es idempotente (trim() sobre
-- un valor ya limpio no cambia nada).
--
-- Causa del "no encontrado" al compartir algunos links de artista: 5 filas
-- tenían un espacio de mas en el slug (ej: "Tom-Waits ", " Dan-Barrett").
-- El sitio los sigue resolviendo bien via sus propios links (el espacio
-- queda codificado), pero al compartir la URL por Instagram/WhatsApp esas
-- apps suelen recortar el espacio del final, y ahi rompe.

update artists set name = trim(name), slug = trim(slug)
where name != trim(name) or slug != trim(slug);
