import { FormEvent, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import enemyStatsApi from "../../api/enemyStatsApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type EnemyStat = {
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
};

const NUMBER_FIELDS: Array<{
  key: keyof EnemyStat;
  label: string;
  step?: string;
}> = [
  { key: "respawnDelaySeconds", label: "Respawn Delay Seconds", step: "0.1" },
  { key: "maxHealth", label: "Max Health", step: "1" },
  { key: "damageAmount", label: "Damage Amount", step: "1" },
  { key: "baseExp", label: "Base EXP", step: "1" },
  { key: "knockbackForce", label: "Knockback Force", step: "0.1" },
  { key: "regenDelaySeconds", label: "Regen Delay Seconds", step: "0.1" },
  { key: "regenHpPerSecond", label: "Regen HP Per Second", step: "0.1" },
  { key: "regenGuardProximity", label: "Regen Guard Proximity", step: "0.1" },
  { key: "moveSpeed", label: "Move Speed", step: "0.1" },
  { key: "chaseSpeed", label: "Chase Speed", step: "0.1" },
  { key: "wanderSpeed", label: "Wander Speed", step: "0.1" },
  { key: "wanderRange", label: "Wander Range", step: "0.1" },
  { key: "separationRadius", label: "Separation Radius", step: "0.1" },
  { key: "separationForce", label: "Separation Force", step: "0.1" },
  { key: "detectionRange", label: "Detection Range", step: "0.1" },
  { key: "attackRange", label: "Attack Range", step: "0.1" },
  { key: "fieldOfViewAngle", label: "Field Of View Angle", step: "0.1" },
  { key: "guardDuration", label: "Guard Duration", step: "0.1" },
  { key: "guardLookDuration", label: "Guard Look Duration", step: "0.1" },
  { key: "damageThrottleTime", label: "Damage Throttle Time", step: "0.1" },
  { key: "attackCooldown", label: "Attack Cooldown", step: "0.1" },
  { key: "attackRecovery", label: "Attack Recovery", step: "0.1" },
  {
    key: "attackFrontDotThreshold",
    label: "Attack Front Dot Threshold",
    step: "0.1",
  },
  { key: "knockbackDuration", label: "Knockback Duration", step: "0.1" },
  { key: "squashPixels", label: "Squash Pixels", step: "0.1" },
  { key: "stretchPixels", label: "Stretch Pixels", step: "0.1" },
  { key: "waveDuration", label: "Wave Duration", step: "0.1" },
  { key: "flashDuration", label: "Flash Duration", step: "0.1" },
  { key: "flashCount", label: "Flash Count", step: "1" },
];

const BOOL_FIELDS: Array<{ key: keyof EnemyStat; label: string }> = [
  { key: "enableOutOfCombatRegen", label: "Enable Out Of Combat Regen" },
  {
    key: "regenRequireNearGuardAnchor",
    label: "Regen Require Near Guard Anchor",
  },
  { key: "enableSeparation", label: "Enable Separation" },
  { key: "useActiveAttack", label: "Use Active Attack" },
];

function extractEnemyArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  const directKeys = [
    "data",
    "enemies",
    "items",
    "catalog",
    "enemyStats",
    "enemy_stats",
    "results",
  ];

  for (const key of directKeys) {
    if (Array.isArray((data as any)[key])) {
      return (data as any)[key];
    }
  }

  // Handle wrappers like { data: { items: [...] } }
  for (const key of directKeys) {
    const nested = (data as any)[key];
    if (nested && typeof nested === "object") {
      const found = extractEnemyArray(nested);
      if (found.length > 0) return found;
    }
  }

  return [];
}

function normalizeEnemy(input: any): EnemyStat {
  const enemyId = String(
    input?.enemyId ||
      input?.enemyID ||
      input?.enemy_id ||
      input?.id ||
      input?._id ||
      "",
  );

  return {
    enemyId,
    enemyName: input?.enemyName || "",
    respawnDelaySeconds: input?.respawnDelaySeconds,
    maxHealth: input?.maxHealth,
    damageAmount: input?.damageAmount,
    baseExp: input?.baseExp,
    knockbackForce: input?.knockbackForce,
    enableOutOfCombatRegen: input?.enableOutOfCombatRegen,
    regenDelaySeconds: input?.regenDelaySeconds,
    regenHpPerSecond: input?.regenHpPerSecond,
    regenRequireNearGuardAnchor: input?.regenRequireNearGuardAnchor,
    regenGuardProximity: input?.regenGuardProximity,
    moveSpeed: input?.moveSpeed,
    chaseSpeed: input?.chaseSpeed,
    wanderSpeed: input?.wanderSpeed,
    wanderRange: input?.wanderRange,
    enableSeparation: input?.enableSeparation,
    separationRadius: input?.separationRadius,
    separationForce: input?.separationForce,
    detectionRange: input?.detectionRange,
    attackRange: input?.attackRange,
    fieldOfViewAngle: input?.fieldOfViewAngle,
    guardDuration: input?.guardDuration,
    guardLookDuration: input?.guardLookDuration,
    damageThrottleTime: input?.damageThrottleTime,
    useActiveAttack: input?.useActiveAttack,
    attackCooldown: input?.attackCooldown,
    attackRecovery: input?.attackRecovery,
    attackFrontDotThreshold: input?.attackFrontDotThreshold,
    knockbackDuration: input?.knockbackDuration,
    squashPixels: input?.squashPixels,
    stretchPixels: input?.stretchPixels,
    waveDuration: input?.waveDuration,
    flashDuration: input?.flashDuration,
    flashCount: input?.flashCount,
  };
}

function AdminEnemyStatsManager() {
  const [entries, setEntries] = useState<EnemyStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEnemyId, setEditingEnemyId] = useState<string | null>(null);
  const [form, setForm] = useState<EnemyStat>({ enemyId: "" });
  const [initialForm, setInitialForm] = useState<EnemyStat>({ enemyId: "" });

  const fetchCatalog = async () => {
    setLoading(true);
    setError("");
    try {
      let res;
      try {
        res = await enemyStatsApi.getAllEnemyStats();
      } catch {
        res = await enemyStatsApi.getEnemyStatsCatalog();
      }

      let list = extractEnemyArray(res?.data)
        .map((entry) => normalizeEnemy(entry))
        .filter((entry) => entry.enemyId);

      if (list.length === 0) {
        const single = normalizeEnemy(
          res?.data?.data || res?.data?.enemy || res?.data?.item || res?.data,
        );
        if (single.enemyId) list = [single];
      }

      setEntries(list);
    } catch (err) {
      console.error("Failed to load enemy stats", err);
      setError("Unable to load enemy stats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return entries;

    return entries.filter((entry) => {
      return (
        entry.enemyId.toLowerCase().includes(term) ||
        (entry.enemyName || "").toLowerCase().includes(term)
      );
    });
  }, [entries, search]);

  const openEdit = async (entry: EnemyStat) => {
    setError("");
    setEditingEnemyId(entry.enemyId);
    setIsModalOpen(true);

    try {
      const res = await enemyStatsApi.getEnemyStatByEnemyId(entry.enemyId);
      const detailed = normalizeEnemy(
        res?.data?.data ||
          res?.data?.enemy ||
          res?.data?.item ||
          res?.data ||
          entry,
      );
      setForm(detailed);
      setInitialForm(detailed);
    } catch (err) {
      console.error("Failed to load enemy detail", err);
      const fallback = normalizeEnemy(entry);
      setForm(fallback);
      setInitialForm(fallback);
      setError("Could not load detail by enemyId. Using catalog data.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEnemyId(null);
    setForm({ enemyId: "" });
    setInitialForm({ enemyId: "" });
    setError("");
  };

  const setStringField = (key: keyof EnemyStat, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setNumberField = (key: keyof EnemyStat, raw: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: raw === "" ? undefined : Number(raw),
    }));
  };

  const setBoolField = (key: keyof EnemyStat, value: boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildUpdatePayload = () => {
    const payload: Record<string, any> = {};

    if ((form.enemyName || "") !== (initialForm.enemyName || "")) {
      payload.enemyName = form.enemyName?.trim() || "";
    }

    NUMBER_FIELDS.forEach(({ key }) => {
      if (form[key] !== initialForm[key] && form[key] !== undefined) {
        payload[key] = Number(form[key]);
      }
    });

    BOOL_FIELDS.forEach(({ key }) => {
      if (form[key] !== initialForm[key] && form[key] !== undefined) {
        payload[key] = Boolean(form[key]);
      }
    });

    return payload;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!editingEnemyId) {
      setError("No enemy selected for update.");
      return;
    }

    const payload = buildUpdatePayload();
    if (Object.keys(payload).length === 0) {
      setError("No changes detected.");
      return;
    }

    try {
      setSaving(true);
      await enemyStatsApi.updateEnemyStat(editingEnemyId, payload);
      await Swal.fire({
        toast: true,
        icon: "success",
        title: "Enemy stat updated",
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
      });
      closeModal();
      await fetchCatalog();
    } catch (err: any) {
      console.error("Update enemy stat failed", err);
      const backendMessage = err?.response?.data?.message;
      const backendError = err?.response?.data?.error;
      if (Array.isArray(backendMessage) && backendMessage.length > 0) {
        setError(backendMessage.join(" | "));
      } else if (typeof backendMessage === "string" && backendMessage.trim()) {
        setError(backendMessage);
      } else if (typeof backendError === "string" && backendError.trim()) {
        setError(backendError);
      } else {
        setError("Failed to update enemy stat.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Enemy Stats</h1>
        <Button type="button" variant="outline" onClick={fetchCatalog}>
          Refresh
        </Button>
      </header>

      {error && !isModalOpen && (
        <div className="rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg text-white">
                Enemy Stats Catalog
              </CardTitle>
              <p className="text-sm text-slate-400">
                {entries.length} enemy stat(s) loaded.
              </p>
            </div>
            <Input
              className="max-w-xs"
              placeholder="Search enemy by id or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="divide-y divide-slate-800">
          {loading ? (
            <div className="p-6 text-sm text-slate-400">
              Loading enemy stats...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-6 text-sm text-slate-400">
              No enemy stats found.
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.enemyId}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-lg shadow-slate-950/20"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-white text-lg font-semibold truncate">
                      <span className="text-slate-400 text-sm font-normal">
                        Enemy Name:{" "}
                      </span>
                      {entry.enemyName || "-"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      <span className="uppercase tracking-[0.2em]">
                        Enemy ID:{" "}
                      </span>
                      {entry.enemyId}
                    </p>
                    <p className="text-sm text-slate-300">
                      <span className="text-slate-400">Max HP: </span>
                      {entry.maxHealth ?? "-"}
                      <span className="mx-2 text-slate-600">|</span>
                      <span className="text-slate-400">Damage: </span>
                      {entry.damageAmount ?? "-"}
                      <span className="mx-2 text-slate-600">|</span>
                      <span className="text-slate-400">EXP: </span>
                      {entry.baseExp ?? "-"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(entry)}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
          <Card className="my-8 flex w-full max-w-6xl flex-col border border-slate-800 bg-slate-950">
            <CardHeader className="shrink-0 border-b border-slate-800">
              <CardTitle className="text-lg text-white">
                Update Enemy Stat - {editingEnemyId}
              </CardTitle>
            </CardHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <form className="space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-200">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">
                      Enemy ID
                    </label>
                    <Input value={form.enemyId} disabled />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">
                      Enemy Name
                    </label>
                    <Input
                      value={form.enemyName || ""}
                      onChange={(e) =>
                        setStringField("enemyName", e.target.value)
                      }
                      placeholder="e.g. Green Slime"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Numeric Fields
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {NUMBER_FIELDS.map((field) => (
                      <div className="space-y-1" key={String(field.key)}>
                        <label className="text-sm font-medium text-slate-200">
                          {field.label}
                        </label>
                        <Input
                          type="number"
                          step={field.step || "0.1"}
                          value={
                            typeof form[field.key] === "number"
                              ? Number(form[field.key])
                              : ""
                          }
                          onChange={(e) =>
                            setNumberField(field.key, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Boolean Fields
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {BOOL_FIELDS.map((field) => (
                      <div className="space-y-1" key={String(field.key)}>
                        <label className="text-sm font-medium text-slate-200">
                          {field.label}
                        </label>
                        <select
                          value={
                            form[field.key] === undefined
                              ? ""
                              : form[field.key]
                                ? "true"
                                : "false"
                          }
                          onChange={(e) => {
                            if (e.target.value === "") {
                              setForm((prev) => ({
                                ...prev,
                                [field.key]: undefined,
                              }));
                            } else {
                              setBoolField(
                                field.key,
                                e.target.value === "true",
                              );
                            }
                          }}
                          className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none focus:border-emerald-500"
                        >
                          <option value="">(no change)</option>
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Update Enemy Stat"}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AdminEnemyStatsManager;
