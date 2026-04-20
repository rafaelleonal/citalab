"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteService } from "../actions";

export type ServiceToDelete = {
  id: string;
  name: string;
  price: string;
  durationMinutes: number;
  requiresFasting: boolean;
  instructions: string | null;
  active: boolean;
};

export function DeleteServiceDialog({
  service,
  onOpenChange,
}: {
  service: ServiceToDelete | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const open = !!service;

  function handleConfirm() {
    if (!service) return;
    startTransition(async () => {
      const res = await deleteService(service.id);
      if (res.ok) {
        toast.success("Estudio eliminado");
        onOpenChange(false);
        router.refresh();
      } else if (res.error === "has_future_appointments") {
        toast.error(
          `Este estudio está en ${res.futureCount} cita${
            res.futureCount === 1 ? "" : "s"
          } futura${res.futureCount === 1 ? "" : "s"}. Desactívalo en vez de eliminarlo.`
        );
        onOpenChange(false);
      } else if (res.error === "not_found") {
        toast.error("El estudio ya no existe");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error("No se pudo eliminar");
      }
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        if (!isPending) onOpenChange(v);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar este estudio?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-slate-900">
              «{service?.name}»
            </span>{" "}
            se eliminará permanentemente. Las citas existentes con este estudio
            no se verán afectadas, pero ya no podrás usarlo para nuevas citas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
