import {
  Calendar, Gauge, Fuel, Settings2, Palette,
  Car, Activity, CheckCircle2,
} from "lucide-react"
import type { VehicleFull } from "@/lib/supabase/types"
import {
  FUEL_LABELS, TRANSMISSION_LABELS,
  CONDITION_LABELS, BODY_TYPE_LABELS,
} from "@/lib/constants"
import { formatMileage } from "@/lib/utils"

const Row = ({ label, value, icon: Icon }: {
  label: string; value: string | number; icon: React.ElementType
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-surface-dark/50 last:border-0">
    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand/8 text-brand">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-ink/40">{label}</p>
      <p className="text-sm font-medium text-ink truncate">{value}</p>
    </div>
  </div>
)

export function SpecsGrid({ vehicle }: { vehicle: VehicleFull }) {
  const specs = [
    { label: "Año",         value: vehicle.year,                                icon: Calendar },
    { label: "Kilometraje", value: vehicle.mileage === 0 ? "0 km" : formatMileage(vehicle.mileage ?? 0), icon: Gauge },
    { label: "Combustible", value: FUEL_LABELS[vehicle.fuel_type] ?? vehicle.fuel_type,                  icon: Fuel },
    { label: "Transmisión", value: TRANSMISSION_LABELS[vehicle.transmission] ?? vehicle.transmission,    icon: Settings2 },
    { label: "Condición",   value: CONDITION_LABELS[vehicle.condition] ?? vehicle.condition,             icon: Activity },
    ...(vehicle.body_type
      ? [{ label: "Carrocería", value: BODY_TYPE_LABELS[vehicle.body_type] ?? vehicle.body_type, icon: Car }]
      : []),
    ...(vehicle.color
      ? [{ label: "Color", value: vehicle.color, icon: Palette }]
      : []),
  ]

  return (
    <div className="card p-5">
      <h2 className="font-semibold text-ink mb-2">Especificaciones</h2>
      <div>
        {specs.map((s) => (
          <Row key={s.label} {...s} />
        ))}
      </div>

      {/* Features */}
      {vehicle.features && vehicle.features.length > 0 && (
        <div className="mt-5 border-t border-surface-dark/50 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink/40 mb-3">
            Equipamiento
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {vehicle.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-ink/70">
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-brand" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
