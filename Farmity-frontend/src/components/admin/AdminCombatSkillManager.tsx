import { useEffect, useMemo, useState, FormEvent } from "react";
import Swal from "sweetalert2";
import combatSkillApi from "../../api/combatSkillApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface CombatSkillDoc {
  skillId: string;
  skillName: string;
  skillDescription?: string;
  iconUrl?: string;
  ownership?: string;
  category?: string;
  requiredWeaponType?: number | "";
  cooldown?: number;
  diceTier?: string;
  skillMultiplier?: number;
  projectilePrefabKey?: string;
  projectileSpeed?: number;
  projectileRange?: number;
  projectileKnockback?: number;
  slashVfxKey?: string;
  slashVfxDuration?: number;
  slashVfxSpawnOffset?: number;
  slashVfxPositionOffsetX?: number;
  slashVfxPositionOffsetY?: number;
  slashKnockbackForce?: number;
  damagePopupPrefabKey?: string;
}

interface CatalogEnums {
  ownership: string[];
  category: string[];
  diceTier: string[];
}

const FALLBACK_ENUMS: CatalogEnums = {
  ownership: ["PlayerSkill", "WeaponSkill"],
  category: ["None", "Projectile", "Slash", "AoE", "Buff", "Summon"],
  diceTier: ["D6", "D8", "D10", "D12", "D20"],
};

const EMPTY_SKILL: CombatSkillDoc = {
  skillId: "",
  skillName: "",
  skillDescription: "",
  iconUrl: "",
  ownership: "PlayerSkill",
  category: "None",
  requiredWeaponType: "",
  cooldown: 0,
  diceTier: "D6",
  skillMultiplier: 1,
  projectilePrefabKey: "",
  projectileSpeed: 0,
  projectileRange: 0,
  projectileKnockback: 0,
  slashVfxKey: "",
  slashVfxDuration: 0,
  slashVfxSpawnOffset: 0,
  slashVfxPositionOffsetX: 0,
  slashVfxPositionOffsetY: 0,
  slashKnockbackForce: 0,
  damagePopupPrefabKey: "",
};

function sanitizePayload(form: CombatSkillDoc, editing: boolean) {
  const payload: Record<string, unknown> = { ...form };

  if (editing) {
    delete payload.skillId;
  }

  Object.keys(payload).forEach((key) => {
    const value = payload[key];
    if (value === "" || value === undefined || value === null) {
      delete payload[key];
    }
  });

  return payload;
}

function AdminCombatSkillManager() {
  const [skills, setSkills] = useState<CombatSkillDoc[]>([]);
  const [search, setSearch] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [catalogEnums, setCatalogEnums] = useState<CatalogEnums>(FALLBACK_ENUMS);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [form, setForm] = useState<CombatSkillDoc>({ ...EMPTY_SKILL });
  const [loading, setLoading] = useState(false);

  const pageSize = 10;

  const fetchSkills = async () => {
    try {
      const res = await combatSkillApi.getAllCombatSkills();
      const data = res.data;
      if (Array.isArray(data)) {
        setSkills(data);
      } else {
        setSkills(data?.skills || []);
      }
    } catch (err) {
      console.error("Failed to load combat skills:", err);
    }
  };

  const fetchCatalogEnums = async () => {
    try {
      const res = await combatSkillApi.getCatalog();
      const nextEnums = res.data?.enums;
      if (nextEnums) {
        setCatalogEnums({
          ownership: nextEnums.ownership || FALLBACK_ENUMS.ownership,
          category: nextEnums.category || FALLBACK_ENUMS.category,
          diceTier: nextEnums.diceTier || FALLBACK_ENUMS.diceTier,
        });
      }
    } catch (err) {
      console.error("Failed to load combat skill catalog:", err);
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchCatalogEnums();
  }, []);

  const resetForm = () => {
    setForm({ ...EMPTY_SKILL });
    setEditingSkillId(null);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (skill: CombatSkillDoc) => {
    setForm({ ...EMPTY_SKILL, ...skill });
    setEditingSkillId(skill.skillId);
    setIsModalOpen(true);
  };

  const set = <K extends keyof CombatSkillDoc>(key: K, value: CombatSkillDoc[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setNum = (key: keyof CombatSkillDoc, raw: string) => {
    set(key, raw === "" ? ("" as never) : (Number(raw) as never));
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();

    if (!form.skillId.trim() || !form.skillName.trim()) {
      Swal.fire({ icon: "warning", title: "Skill ID and Skill Name are required", background: "#020617", color: "#e5e7eb" });
      return;
    }

    const isEditing = Boolean(editingSkillId);
    const payload = sanitizePayload(form, isEditing);

    try {
      setLoading(true);

      if (isEditing && editingSkillId) {
        await combatSkillApi.updateCombatSkill(editingSkillId, payload);
        Swal.fire({ toast: true, icon: "success", title: "Combat skill updated", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      } else {
        await combatSkillApi.createCombatSkill(payload);
        Swal.fire({ toast: true, icon: "success", title: "Combat skill created", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchSkills();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to save combat skill.";
      Swal.fire({ icon: "error", title: "Error", text: msg, background: "#020617", color: "#e5e7eb" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (skillId: string) => {
    const result = await Swal.fire({
      title: "Delete this combat skill?",
      text: `Skill \"${skillId}\" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it",
      background: "#020617",
      color: "#e5e7eb",
    });

    if (!result.isConfirmed) return;

    try {
      await combatSkillApi.deleteCombatSkill(skillId);
      setSkills((prev) => prev.filter((s) => s.skillId !== skillId));
      Swal.fire({ toast: true, icon: "success", title: "Combat skill deleted", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to delete combat skill.", background: "#020617", color: "#e5e7eb" });
    }
  };

  const filtered = useMemo(() => {
    return skills.filter((s) => {
      const t = search.toLowerCase();
      const textMatch =
        s.skillId?.toLowerCase().includes(t) ||
        s.skillName?.toLowerCase().includes(t) ||
        (s.skillDescription || "").toLowerCase().includes(t);
      const ownershipMatch = ownershipFilter === "all" || s.ownership === ownershipFilter;
      const categoryMatch = categoryFilter === "all" || s.category === categoryFilter;
      return textMatch && ownershipMatch && categoryMatch;
    });
  }, [skills, search, ownershipFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const showProjectile = form.category === "Projectile";
  const showSlash = form.category === "Slash";

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="font-semibold text-white text-2xl">Combat Skills</h1>
          <p className="mt-0.5 text-slate-400 text-sm">{skills.length} skills total</p>
        </div>
        <Button onClick={openCreate}>+ New Combat Skill</Button>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search by ID, name or description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1 min-w-[180px]"
            />
            <select
              value={ownershipFilter}
              onChange={(e) => {
                setOwnershipFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 px-3 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 h-9 text-slate-50 text-sm"
            >
              <option value="all">All Ownership</option>
              {catalogEnums.ownership.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 px-3 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 h-9 text-slate-50 text-sm"
            >
              <option value="all">All Category</option>
              {catalogEnums.category.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-slate-800">
          {visible.length === 0 && (
            <p className="py-8 text-slate-500 text-sm text-center">No combat skills found.</p>
          )}
          {visible.map((skill) => (
            <div key={skill.skillId} className="flex items-center gap-4 hover:bg-slate-800/40 px-6 py-3 transition-colors">
              {skill.iconUrl ? (
                <img src={skill.iconUrl} alt={skill.skillName} className="bg-slate-800 rounded-md w-10 h-10 object-cover shrink-0" />
              ) : (
                <div className="bg-slate-800 rounded-md w-10 h-10 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{skill.skillName}</p>
                <p className="text-slate-400 text-xs truncate">
                  {skill.skillId} · {skill.ownership || "-"} · {skill.category || "-"}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => openEdit(skill)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(skill.skillId)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span className="text-slate-400 text-sm">{currentPage} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      {isModalOpen && (
        <div className="z-50 fixed inset-0 flex justify-center items-start bg-black/70 p-4 overflow-y-auto">
          <Card className="flex flex-col bg-slate-950 my-8 border border-slate-800 w-full max-w-4xl">
            <CardHeader className="border-slate-800 border-b shrink-0">
              <CardTitle>{editingSkillId ? `Edit - ${editingSkillId}` : "Create New Combat Skill"}</CardTitle>
            </CardHeader>

            <div className="flex-1 p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <section className="space-y-3">
                  <h3 className="font-semibold text-emerald-400 text-sm uppercase tracking-wider">Base Fields</h3>
                  <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                    <Field label="Skill ID *">
                      <Input
                        value={form.skillId}
                        onChange={(e) => set("skillId", e.target.value)}
                        placeholder="e.g. skill_slash_01"
                        disabled={!!editingSkillId}
                      />
                    </Field>
                    <Field label="Skill Name *">
                      <Input value={form.skillName} onChange={(e) => set("skillName", e.target.value)} placeholder="Display name" />
                    </Field>
                  </div>

                  <Field label="Description">
                    <textarea
                      value={form.skillDescription || ""}
                      onChange={(e) => set("skillDescription", e.target.value)}
                      placeholder="Skill description..."
                      rows={2}
                      className="flex bg-slate-900 px-3 py-2 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full text-slate-50 placeholder:text-slate-500 text-sm"
                    />
                  </Field>

                  <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                    <Field label="Icon URL">
                      <Input value={form.iconUrl || ""} onChange={(e) => set("iconUrl", e.target.value)} placeholder="https://..." />
                    </Field>
                    <Field label="Damage Popup Prefab Key">
                      <Input value={form.damagePopupPrefabKey || ""} onChange={(e) => set("damagePopupPrefabKey", e.target.value)} placeholder="popup_damage_default" />
                    </Field>
                  </div>

                  <div className="gap-3 grid grid-cols-2 sm:grid-cols-4">
                    <Field label="Ownership">
                      <select
                        value={form.ownership || "PlayerSkill"}
                        onChange={(e) => set("ownership", e.target.value)}
                        className="flex bg-slate-900 px-3 py-1 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full h-9 text-slate-50 text-sm"
                      >
                        {catalogEnums.ownership.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Category">
                      <select
                        value={form.category || "None"}
                        onChange={(e) => set("category", e.target.value)}
                        className="flex bg-slate-900 px-3 py-1 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full h-9 text-slate-50 text-sm"
                      >
                        {catalogEnums.category.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Cooldown (s)">
                      <Input type="number" value={form.cooldown ?? 0} onChange={(e) => setNum("cooldown", e.target.value)} min={0} step="0.01" />
                    </Field>
                    <Field label="Dice Tier">
                      <select
                        value={form.diceTier || "D6"}
                        onChange={(e) => set("diceTier", e.target.value)}
                        className="flex bg-slate-900 px-3 py-1 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full h-9 text-slate-50 text-sm"
                      >
                        {catalogEnums.diceTier.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                    <Field label="Skill Multiplier">
                      <Input type="number" value={form.skillMultiplier ?? 1} onChange={(e) => setNum("skillMultiplier", e.target.value)} min={0} step="0.01" />
                    </Field>
                    <Field label="Required Weapon Type">
                      <Input
                        type="number"
                        value={form.requiredWeaponType ?? ""}
                        onChange={(e) => setNum("requiredWeaponType", e.target.value)}
                        min={0}
                        placeholder="Optional. Useful for WeaponSkill"
                      />
                    </Field>
                  </div>
                </section>

                {showProjectile && (
                  <section className="space-y-3 pt-2 border-slate-800 border-t">
                    <h3 className="font-semibold text-amber-400 text-sm uppercase tracking-wider">Projectile Fields</h3>
                    <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                      <Field label="Projectile Prefab Key">
                        <Input value={form.projectilePrefabKey || ""} onChange={(e) => set("projectilePrefabKey", e.target.value)} placeholder="projectile_arrow" />
                      </Field>
                    </div>
                    <div className="gap-3 grid grid-cols-1 sm:grid-cols-3">
                      <Field label="Projectile Speed">
                        <Input type="number" value={form.projectileSpeed ?? 0} onChange={(e) => setNum("projectileSpeed", e.target.value)} min={0} step="0.01" />
                      </Field>
                      <Field label="Projectile Range">
                        <Input type="number" value={form.projectileRange ?? 0} onChange={(e) => setNum("projectileRange", e.target.value)} min={0} step="0.01" />
                      </Field>
                      <Field label="Projectile Knockback">
                        <Input type="number" value={form.projectileKnockback ?? 0} onChange={(e) => setNum("projectileKnockback", e.target.value)} step="0.01" />
                      </Field>
                    </div>
                  </section>
                )}

                {showSlash && (
                  <section className="space-y-3 pt-2 border-slate-800 border-t">
                    <h3 className="font-semibold text-amber-400 text-sm uppercase tracking-wider">Slash Fields</h3>
                    <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                      <Field label="Slash VFX Key">
                        <Input value={form.slashVfxKey || ""} onChange={(e) => set("slashVfxKey", e.target.value)} placeholder="slash_vfx_default" />
                      </Field>
                      <Field label="Slash VFX Duration">
                        <Input type="number" value={form.slashVfxDuration ?? 0} onChange={(e) => setNum("slashVfxDuration", e.target.value)} min={0} step="0.01" />
                      </Field>
                    </div>
                    <div className="gap-3 grid grid-cols-2 sm:grid-cols-4">
                      <Field label="Spawn Offset">
                        <Input type="number" value={form.slashVfxSpawnOffset ?? 0} onChange={(e) => setNum("slashVfxSpawnOffset", e.target.value)} step="0.01" />
                      </Field>
                      <Field label="Offset X">
                        <Input type="number" value={form.slashVfxPositionOffsetX ?? 0} onChange={(e) => setNum("slashVfxPositionOffsetX", e.target.value)} step="0.01" />
                      </Field>
                      <Field label="Offset Y">
                        <Input type="number" value={form.slashVfxPositionOffsetY ?? 0} onChange={(e) => setNum("slashVfxPositionOffsetY", e.target.value)} step="0.01" />
                      </Field>
                      <Field label="Slash Knockback Force">
                        <Input type="number" value={form.slashKnockbackForce ?? 0} onChange={(e) => setNum("slashKnockbackForce", e.target.value)} step="0.01" />
                      </Field>
                    </div>
                  </section>
                )}
              </form>
            </div>

            <div className="flex justify-end gap-2 p-4 border-slate-800 border-t shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : editingSkillId ? "Save Changes" : "Create Skill"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
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

export default AdminCombatSkillManager;
