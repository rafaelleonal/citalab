-- Previene double-booking del mismo slot dentro de un lab (A1).
-- El índice es PARCIAL: solo aplica a citas activas (no canceladas),
-- para que una cita cancelada libere el slot y permita reagendar.
CREATE UNIQUE INDEX IF NOT EXISTS "appointments_active_slot_unique"
  ON "appointments" ("lab_id", "appointment_date", "appointment_time")
  WHERE "status" <> 'cancelled';
