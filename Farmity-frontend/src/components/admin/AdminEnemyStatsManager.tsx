import { useMemo, useState, useEffect } from "react";
import Swal from "sweetalert2";
import enemyStatsApi from "../../api/enemyStatsApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface EnemyStatsDoc {
  _id?: string;
  enemyId: string;
  enemyName?: string;
  respawnDelaySeconds?: number;
  maxHealth?: number;
  damageAmount?: number;
  baseExp?: number;
  knockbackForce?: number;
  enableOutOfCombatRegen?: boolean;
  regenDelaySeconds?: number;
  regenHpPerSecond?: number;
  regenRequireNearGuardAnchor?: boolean;
  regenGuardProximity?: number;
  moveSpeed?: number;
  chaseSpeed?: number;
  wanderSpeed?: number;
  wanderRange?: number;
  enableSeparation?: boolean;
  separationRadius?: number;
  separationForce?: number;
  detectionRange?: number;
  attackRange?: number;
  fieldOfViewAngle?: number;
  guardDuration?: number;
  guardLookDuration?: number;
  damageThrottleTime?: number;
  useActiveAttack?: boolean;
  attackCooldown?: number;
  attackRecovery?: number;
  attackFrontDotThreshold?: number;
  knockbackDuration?: number;
  squashPixels?: number;
  stretchPixels?: number;
  waveDuration?: number;
  flashDuration?: number;
  flashCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

const UPDATABLE_FIELDS: Array<keyof EnemyStatsDoc> = [
  "enemyName",
  "respawnDelaySeconds",
  "maxHealth",
  "damageAmount",
  "baseExp",
  "knockbackForce",
  "enableOutOfCombatRegen",
  "regenDelaySeconds",
  "regenHpPerSecond",
  "regenRequireNearGuardAnchor",
  "regenGuardProximity",
  "moveSpeed",
  "chaseSpeed",
  "wanderSpeed",
  "wanderRange",
  "enableSeparation",
  "separationRadius",
  "separationForce",
  "detectionRange",
  "attackRange",
  "fieldOfViewAngle",
  "guardDuration",
  "guardLookDuration",
  "damageThrottleTime",
  "useActiveAttack",
  "attackCooldown",
  "attackRecovery",
  "attackFrontDotThreshold",
  "knockbackDuration",
  "squashPixels",
  "stretchPixels",
  "waveDuration",
  "flashDuration",
  "flashCount",
];

const MIN_ONE_FIELDS: Array<keyof EnemyStatsDoc> = ["maxHealth", "damageAmount", "baseExp"];
const MIN_ZERO_FIELDS: Array<keyof EnemyStatsDoc> = [
  "respawnDelaySeconds",
  "knockbackForce",
  "regenDelaySeconds",
  "regenHpPerSecond",
  "regenGuardProximity",
  "moveSpeed",
  "chaseSpeed",
  "wanderSpeed",
  "wanderRange",
  "separationRadius",
  "separationForce",
  "detectionRange",
  "attackRange",
  "guardDuration",
  "guardLookDuration",
  "damageThrottleTime",
  "attackCooldown",
  "attackRecovery",
  "knockbackDuration",
  "squashPixels",
  "stretchPixels",
  "waveDuration",
  "flashDuration",
  "flashCount",
];

function AdminEnemyStatsManager() {
  const [enemies, setEnemies] = useState<EnemyStatsDoc[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [original, setOriginal] = useState<EnemyStatsDoc | null>(null);
  const [form, setForm] = useState<EnemyStatsDoc | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const t = search.toLowerCase();
    return enemies.filter(
      (e) => e.enemyId?.toLowerCase().includes(t) || (e.enemyName || "").toLowerCase().includes(t),
    );
  }, [enemies, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await enemyStatsApi.getCatalog();
      const data = res?.data?.enemies;
      setEnemies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load enemy stats catalog:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load enemy stats catalog.",
        background: "#020617",
        color: "#e5e7eb",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const setField = <K extends keyof EnemyStatsDoc>(key: K, value: EnemyStatsDoc[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const setNum = (key: keyof EnemyStatsDoc, raw: string) => {
    if (raw === "") return;
    const next = Number(raw);
    if (Number.isNaN(next)) return;
    setField(key, next as never);
  };

  const validateForm = (doc: EnemyStatsDoc) => {
    if (!doc.enemyName || !doc.enemyName.trim()) {
      return "enemyName cannot be empty.";
    }

    for (const key of MIN_ONE_FIELDS) {
      const value = Number(doc[key] ?? 0);
      if (value < 1) return `${String(key)} must be >= 1.`;
    }

    for (const key of MIN_ZERO_FIELDS) {
      const value = Number(doc[key] ?? 0);
      if (value < 0) return `${String(key)} must be >= 0.`;
    }

    const fov = Number(doc.fieldOfViewAngle ?? 0);
    if (fov < 0 || fov > 360) return "fieldOfViewAngle must be between 0 and 360.";

    const frontDot = Number(doc.attackFrontDotThreshold ?? 0);
    if (frontDot < -1 || frontDot > 1) return "attackFrontDotThreshold must be between -1 and 1.";

    return "";
  };

  const buildPatch = (current: EnemyStatsDoc, base: EnemyStatsDoc) => {
    const patch: Partial<EnemyStatsDoc> = {};

    UPDATABLE_FIELDS.forEach((field) => {
      const nextValue = current[field];
      const prevValue = base[field];
      if (nextValue !== prevValue) {
        (patch as Record<string, unknown>)[String(field)] = nextValue;
      }
    });

    return patch;
  };

  const openEdit = (enemy: EnemyStatsDoc) => {
    setOriginal(enemy);
    setForm({ ...enemy });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    if (!form || !original || !form.enemyId) return;

    const validationError = validateForm(form);
    if (validationError) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: validationError,
        background: "#020617",
        color: "#e5e7eb",
      });
      return;
    }

    const patch = buildPatch(form, original);
    if (Object.keys(patch).length === 0) {
      Swal.fire({
        icon: "info",
        title: "No changes",
        text: "There are no updated fields to save.",
        background: "#020617",
        color: "#e5e7eb",
      });
      return;
    }

    try {
      setSaving(true);
      const res = await enemyStatsApi.updateEnemyStats(form.enemyId, patch);
      const updated = res.data as EnemyStatsDoc;

      setEnemies((prev) =>
        prev.map((enemy) => (enemy.enemyId === updated.enemyId ? { ...enemy, ...updated } : enemy)),
      );
      setOriginal(updated);
      setForm({ ...updated });

      Swal.fire({
        toast: true,
        icon: "success",
        title: "Enemy stats updated",
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
        background: "#020617",
        color: "#e5e7eb",
      });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to update enemy stats.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        background: "#020617",
        color: "#e5e7eb",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Enemy Stats Catalog</h1>
          <p className="mt-0.5 text-sm text-slate-400">{enemies.length} enemies total</p>
        </div>
        <p className="text-xs text-slate-500">Update only by immutable enemyId</p>
      </header>

      <Card>
        <CardHeader>
          <Input
            placeholder="Search enemyId or enemyName..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-md"
          />
        </CardHeader>
        <CardContent className="divide-y divide-slate-800">
          {loading && <p className="py-8 text-center text-sm text-slate-400">Loading catalog...</p>}
          {!loading && visible.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No enemies found.</p>
          )}

          {!loading &&
            visible.map((enemy) => (
              <div
                key={enemy.enemyId}
                className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-slate-800/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-800 text-xs font-semibold text-emerald-300">
                  {String(enemy.enemyId || "?").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{enemy.enemyName || enemy.enemyId}</p>
                  <p className="truncate text-xs text-slate-400">
                    {enemy.enemyId} · HP {Number(enemy.maxHealth ?? 0)} · DMG {Number(enemy.damageAmount ?? 0)} · SPD{" "}
                    {Number(enemy.moveSpeed ?? 0)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] text-slate-500">
                    {enemy.updatedAt ? new Date(enemy.updatedAt).toLocaleString() : "-"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" onClick={() => openEdit(enemy)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span className="text-sm text-slate-400">
            {currentPage} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
          <Card className="my-8 flex w-full max-w-5xl flex-col border border-slate-800 bg-slate-950">
            <CardHeader className="shrink-0 border-b border-slate-800">
              <CardTitle>{form?.enemyId ? `Edit Enemy Stats - ${form.enemyId}` : "Edit Enemy Stats"}</CardTitle>
            </CardHeader>

            <div className="flex-1 overflow-y-auto p-6">
              {!form ? (
                <p className="py-8 text-center text-sm text-slate-500">Select an enemy to edit.</p>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Enemy ID (immutable)">
                      <Input value={form.enemyId} disabled />
                    </Field>
                    <Field label="Last Updated">
                      <Input value={form.updatedAt ? new Date(form.updatedAt).toLocaleString() : "-"} disabled />
                    </Field>
                    <Field label="Enemy Name">
                      <Input value={form.enemyName || ""} onChange={(e) => setField("enemyName", e.target.value)} />
                    </Field>
                    <Field label="Respawn Delay (s)">
                      <Input
                        type="number"
                        min={0}
                        value={form.respawnDelaySeconds ?? 0}
                        onChange={(e) => setNum("respawnDelaySeconds", e.target.value)}
                      />
                    </Field>
                  </div>

                  <Section title="Core Combat">
                    <Grid4>
                      <Field label="Max Health"><Input type="number" min={1} value={form.maxHealth ?? 1} onChange={(e) => setNum("maxHealth", e.target.value)} /></Field>
                      <Field label="Damage"><Input type="number" min={1} value={form.damageAmount ?? 1} onChange={(e) => setNum("damageAmount", e.target.value)} /></Field>
                      <Field label="Base EXP"><Input type="number" min={1} value={form.baseExp ?? 1} onChange={(e) => setNum("baseExp", e.target.value)} /></Field>
                      <Field label="Knockback Force"><Input type="number" min={0} value={form.knockbackForce ?? 0} onChange={(e) => setNum("knockbackForce", e.target.value)} /></Field>
                    </Grid4>
                  </Section>

                  <Section title="Regeneration">
                    <div className="mb-3 flex flex-wrap gap-4">
                      <Toggle
                        label="Enable Out-of-combat Regen"
                        checked={Boolean(form.enableOutOfCombatRegen)}
                        onChange={(v) => setField("enableOutOfCombatRegen", v)}
                      />
                      <Toggle
                        label="Require Near Guard Anchor"
                        checked={Boolean(form.regenRequireNearGuardAnchor)}
                        onChange={(v) => setField("regenRequireNearGuardAnchor", v)}
                      />
                    </div>
                    <Grid4>
                      <Field label="Regen Delay (s)"><Input type="number" min={0} value={form.regenDelaySeconds ?? 0} onChange={(e) => setNum("regenDelaySeconds", e.target.value)} /></Field>
                      <Field label="Regen HP/s"><Input type="number" min={0} value={form.regenHpPerSecond ?? 0} onChange={(e) => setNum("regenHpPerSecond", e.target.value)} /></Field>
                      <Field label="Guard Proximity"><Input type="number" min={0} value={form.regenGuardProximity ?? 0} onChange={(e) => setNum("regenGuardProximity", e.target.value)} /></Field>
                    </Grid4>
                  </Section>

                  <Section title="Movement & AI">
                    <div className="mb-3 flex flex-wrap gap-4">
                      <Toggle label="Enable Separation" checked={Boolean(form.enableSeparation)} onChange={(v) => setField("enableSeparation", v)} />
                    </div>
                    <Grid4>
                      <Field label="Move Speed"><Input type="number" min={0} value={form.moveSpeed ?? 0} onChange={(e) => setNum("moveSpeed", e.target.value)} /></Field>
                      <Field label="Chase Speed"><Input type="number" min={0} value={form.chaseSpeed ?? 0} onChange={(e) => setNum("chaseSpeed", e.target.value)} /></Field>
                      <Field label="Wander Speed"><Input type="number" min={0} value={form.wanderSpeed ?? 0} onChange={(e) => setNum("wanderSpeed", e.target.value)} /></Field>
                      <Field label="Wander Range"><Input type="number" min={0} value={form.wanderRange ?? 0} onChange={(e) => setNum("wanderRange", e.target.value)} /></Field>
                      <Field label="Separation Radius"><Input type="number" min={0} value={form.separationRadius ?? 0} onChange={(e) => setNum("separationRadius", e.target.value)} /></Field>
                      <Field label="Separation Force"><Input type="number" min={0} value={form.separationForce ?? 0} onChange={(e) => setNum("separationForce", e.target.value)} /></Field>
                      <Field label="Detection Range"><Input type="number" min={0} value={form.detectionRange ?? 0} onChange={(e) => setNum("detectionRange", e.target.value)} /></Field>
                      <Field label="Attack Range"><Input type="number" min={0} value={form.attackRange ?? 0} onChange={(e) => setNum("attackRange", e.target.value)} /></Field>
                      <Field label="FOV Angle (0..360)"><Input type="number" min={0} max={360} value={form.fieldOfViewAngle ?? 120} onChange={(e) => setNum("fieldOfViewAngle", e.target.value)} /></Field>
                      <Field label="Guard Duration"><Input type="number" min={0} value={form.guardDuration ?? 0} onChange={(e) => setNum("guardDuration", e.target.value)} /></Field>
                      <Field label="Guard Look Duration"><Input type="number" min={0} value={form.guardLookDuration ?? 0} onChange={(e) => setNum("guardLookDuration", e.target.value)} /></Field>
                    </Grid4>
                  </Section>

                  <Section title="Attack Cadence">
                    <div className="mb-3 flex flex-wrap gap-4">
                      <Toggle label="Use Active Attack" checked={Boolean(form.useActiveAttack)} onChange={(v) => setField("useActiveAttack", v)} />
                    </div>
                    <Grid4>
                      <Field label="Damage Throttle Time"><Input type="number" min={0} value={form.damageThrottleTime ?? 0} onChange={(e) => setNum("damageThrottleTime", e.target.value)} /></Field>
                      <Field label="Attack Cooldown"><Input type="number" min={0} value={form.attackCooldown ?? 0} onChange={(e) => setNum("attackCooldown", e.target.value)} /></Field>
                      <Field label="Attack Recovery"><Input type="number" min={0} value={form.attackRecovery ?? 0} onChange={(e) => setNum("attackRecovery", e.target.value)} /></Field>
                      <Field label="Front Dot (-1..1)"><Input type="number" min={-1} max={1} step="0.01" value={form.attackFrontDotThreshold ?? 0} onChange={(e) => setNum("attackFrontDotThreshold", e.target.value)} /></Field>
                    </Grid4>
                  </Section>

                  <Section title="Hit / Death Feel">
                    <Grid4>
                      <Field label="Knockback Duration"><Input type="number" min={0} value={form.knockbackDuration ?? 0} onChange={(e) => setNum("knockbackDuration", e.target.value)} /></Field>
                      <Field label="Squash Pixels"><Input type="number" min={0} value={form.squashPixels ?? 0} onChange={(e) => setNum("squashPixels", e.target.value)} /></Field>
                      <Field label="Stretch Pixels"><Input type="number" min={0} value={form.stretchPixels ?? 0} onChange={(e) => setNum("stretchPixels", e.target.value)} /></Field>
                      <Field label="Wave Duration"><Input type="number" min={0} value={form.waveDuration ?? 0} onChange={(e) => setNum("waveDuration", e.target.value)} /></Field>
                      <Field label="Flash Duration"><Input type="number" min={0} value={form.flashDuration ?? 0} onChange={(e) => setNum("flashDuration", e.target.value)} /></Field>
                      <Field label="Flash Count"><Input type="number" min={0} value={form.flashCount ?? 0} onChange={(e) => setNum("flashCount", e.target.value)} /></Field>
                    </Grid4>
                  </Section>
                </div>
              )}
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-slate-800 p-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !form}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-t border-slate-800 pt-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">{title}</h3>
      {children}
    </section>
  );
}

function Grid4({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded accent-emerald-500"
      />
      {label}
    </label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export default AdminEnemyStatsManager;
