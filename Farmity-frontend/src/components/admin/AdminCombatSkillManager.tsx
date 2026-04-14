import { useEffect, useMemo, useState, FormEvent, ChangeEvent } from "react";
import Swal from "sweetalert2";
import combatSkillApi from "../../api/combatSkillApi";
import combatCatalogApi from "../../api/combatCatalogApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface CombatSkillDoc {
  skillId: string;
  skillName: string;
  skillDescription?: string;
  ownership?: string;
  category?: string;
  buffSubCategory?: string;
  buffValue?: number;
  buffDuration?: number;
  buffTickInterval?: number;
  unlockLevel?: number;
  requiredWeaponType?: number | "";
  cooldown?: number;
  diceTier?: string;
  skillMultiplier?: number;
  projectileSpeed?: number;
  projectileRange?: number;
  projectileKnockback?: number;
  aoeCastRange?: number;
  aoeRadius?: number;
  aoeVfxDuration?: number;
  skillVisualConfigId?: string;
  slashVfxDuration?: number;
  slashVfxSpawnOffset?: number;
  slashVfxPositionOffsetX?: number;
  slashVfxPositionOffsetY?: number;
  slashKnockbackForce?: number;
  iconUrl?: string;
}

interface CombatCatalogDoc {
  configId: string;
  displayName?: string;
  type?: string;
}

interface CatalogEnums {
  ownership: string[];
  category: string[];
  buffSubCategory: string[];
  diceTier: string[];
}

const FALLBACK_ENUMS: CatalogEnums = {
  ownership: ["PlayerSkill", "WeaponSkill"],
  category: ["None", "Projectile", "Slash", "AoE", "Buff", "Summon"],
  buffSubCategory: ["None", "InstantHeal", "HealOverTime", "StaminaRegen", "MoveSpeedPercent"],
  diceTier: ["D6", "D8", "D10", "D12", "D20"],
};

const WEAPON_TYPE_LABELS: Record<number, string> = {
  0: "None",
  1: "Sword",
  2: "Staff",
  3: "Spear",
};

const EMPTY_SKILL: CombatSkillDoc = {
  skillId: "",
  skillName: "",
  skillDescription: "",
  ownership: "PlayerSkill",
  category: "None",
  buffSubCategory: "None",
  buffValue: 0,
  buffDuration: 0,
  buffTickInterval: 0,
  unlockLevel: 1,
  requiredWeaponType: "",
  cooldown: 0,
  diceTier: "D6",
  skillMultiplier: 1,
  projectileSpeed: 0,
  projectileRange: 0,
  projectileKnockback: 0,
  aoeCastRange: 0,
  aoeRadius: 0,
  aoeVfxDuration: 0,
  skillVisualConfigId: "",
  slashVfxDuration: 0,
  slashVfxSpawnOffset: 0,
  slashVfxPositionOffsetX: 0,
  slashVfxPositionOffsetY: 0,
  slashKnockbackForce: 0,
};

function buildFormData(form: CombatSkillDoc, iconFile: File | null, editing: boolean): FormData {
  const fd = new FormData();

  if (iconFile) {
    fd.append("icon", iconFile);
  }

  const payload: Record<string, unknown> = { ...form };
  delete payload.iconUrl;
  delete payload.projectilePrefabKey;

  if (editing) {
    delete payload.skillId;
  }

  Object.keys(payload).forEach((key) => {
    const value = payload[key];
    if (value !== "" && value !== undefined && value !== null) {
      fd.append(key, String(value));
    }
  });

  return fd;
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
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [form, setForm] = useState<CombatSkillDoc>({ ...EMPTY_SKILL });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState("");
  const [skillVfxConfigs, setSkillVfxConfigs] = useState<CombatCatalogDoc[]>([]);
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
          buffSubCategory: nextEnums.buffSubCategory || FALLBACK_ENUMS.buffSubCategory,
          diceTier: nextEnums.diceTier || FALLBACK_ENUMS.diceTier,
        });
      }
    } catch (err) {
      console.error("Failed to load combat skill catalog:", err);
    }
  };

  const fetchSkillVfxConfigs = async () => {
    try {
      const res = await combatCatalogApi.getAllCombatCatalogs("skill_vfx");
      const data = Array.isArray(res.data) ? res.data : res.data?.entries || [];
      setSkillVfxConfigs(data.filter((entry: CombatCatalogDoc) => !!entry?.configId));
    } catch (err) {
      console.error("Failed to load skill_vfx combat catalogs:", err);
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchCatalogEnums();
    fetchSkillVfxConfigs();
  }, []);

  const resetForm = () => {
    setForm({ ...EMPTY_SKILL });
    setIconFile(null);
    setIconPreview("");
    setEditingSkillId(null);
    setIsDetailMode(false);
  };

  const openCreate = () => {
    resetForm();
    setIsDetailMode(false);
    setIsModalOpen(true);
  };

  const openEdit = (skill: CombatSkillDoc) => {
    setForm({ ...EMPTY_SKILL, ...skill });
    setIconFile(null);
    setIconPreview(skill.iconUrl || "");
    setEditingSkillId(skill.skillId);
    setIsDetailMode(true);
    setIsModalOpen(true);
  };

  const set = <K extends keyof CombatSkillDoc>(key: K, value: CombatSkillDoc[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setNum = (key: keyof CombatSkillDoc, raw: string) => {
    set(key, raw === "" ? ("" as never) : (Number(raw) as never));
  };

  const handleIconPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();

    if (!form.skillId.trim() || !form.skillName.trim()) {
      Swal.fire({ icon: "warning", title: "Skill ID and Skill Name are required", background: "#020617", color: "#e5e7eb" });
      return;
    }

    if (!editingSkillId && !iconFile) {
      Swal.fire({ icon: "warning", title: "Icon image is required for new combat skills", background: "#020617", color: "#e5e7eb" });
      return;
    }

    if (form.unlockLevel !== undefined && form.unlockLevel !== null && Number(form.unlockLevel) < 1) {
      Swal.fire({
        icon: "warning",
        title: "Unlock Level must be at least 1",
        text: "Skills become visible from unlockLevel >= 1.",
        background: "#020617",
        color: "#e5e7eb",
      });
      return;
    }

    const normalizedForm: CombatSkillDoc = {
      ...form,
      buffSubCategory: (form.category || "None") === "Buff" ? form.buffSubCategory || "None" : "None",
      buffValue: (form.category || "None") === "Buff" ? Number(form.buffValue ?? 0) : 0,
      buffDuration: (form.category || "None") === "Buff" ? Number(form.buffDuration ?? 0) : 0,
      buffTickInterval: (form.category || "None") === "Buff" ? Number(form.buffTickInterval ?? 0) : 0,
      aoeCastRange: (form.category || "None") === "AoE" ? Number(form.aoeCastRange ?? 0) : 0,
      aoeRadius: (form.category || "None") === "AoE" ? Number(form.aoeRadius ?? 0) : 0,
      aoeVfxDuration: (form.category || "None") === "AoE" ? Number(form.aoeVfxDuration ?? 0) : 0,
      requiredWeaponType: (form.ownership || "PlayerSkill") === "PlayerSkill" ? 0 : form.requiredWeaponType,
    };

    if ((normalizedForm.ownership || "PlayerSkill") === "WeaponSkill" && Number(normalizedForm.requiredWeaponType || 0) <= 0) {
      Swal.fire({ icon: "warning", title: "Weapon Skill requires Weapon Type", text: "Please choose requiredWeaponType > 0.", background: "#020617", color: "#e5e7eb" });
      return;
    }

    const isEditing = Boolean(editingSkillId);
    const fd = buildFormData(normalizedForm, iconFile, isEditing);

    try {
      setLoading(true);

      if (isEditing && editingSkillId) {
        await combatSkillApi.updateCombatSkill(editingSkillId, fd);
        Swal.fire({ toast: true, icon: "success", title: "Combat skill updated", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      } else {
        await combatSkillApi.createCombatSkill(fd);
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
  const showAoE = form.category === "AoE";
  const showSlash = form.category === "Slash";
  const showBuff = form.category === "Buff";

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
                  {skill.skillId} · {skill.ownership || "-"} · {skill.category || "-"} · unlock L{Number(skill.unlockLevel ?? 1)}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => openEdit(skill)}>
                  Detail
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
              <CardTitle>{editingSkillId ? `${isDetailMode ? "Detail" : "Edit"} - ${editingSkillId}` : "Create New Combat Skill"}</CardTitle>
            </CardHeader>

            <div className="flex-1 p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <fieldset disabled={!!editingSkillId && isDetailMode} className="space-y-5">
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

                  <Field label={editingSkillId ? "Icon (optional, replaces current)" : "Icon *"}>
                    <label className="flex justify-center items-center bg-slate-900 border-2 border-slate-700 hover:border-slate-500 border-dashed rounded-lg w-full h-24 transition cursor-pointer">
                      <span className="text-slate-400 text-sm">{iconFile ? iconFile.name : "Click to select icon image"}</span>
                      <input type="file" accept="image/*" onChange={handleIconPick} className="hidden" />
                    </label>
                    {iconPreview && <img src={iconPreview} alt="skill icon preview" className="bg-slate-800 mt-2 rounded-md w-16 h-16 object-cover" />}
                  </Field>

                  <div className="gap-3 grid grid-cols-2 sm:grid-cols-4">
                    <Field label="Ownership">
                      <select
                        value={form.ownership || "PlayerSkill"}
                        onChange={(e) => {
                          const nextOwnership = e.target.value;
                          set("ownership", nextOwnership);
                          if (nextOwnership === "PlayerSkill") {
                            set("requiredWeaponType", 0);
                          }
                        }}
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
                        onChange={(e) => {
                          const nextCategory = e.target.value;
                          set("category", nextCategory);
                          if (nextCategory !== "Buff") {
                            set("buffSubCategory", "None");
                            set("buffValue", 0);
                            set("buffDuration", 0);
                            set("buffTickInterval", 0);
                          }
                          if (nextCategory !== "AoE") {
                            set("aoeCastRange", 0);
                            set("aoeRadius", 0);
                            set("aoeVfxDuration", 0);
                          }
                        }}
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
                    <Field label="Unlock Level">
                      <Input type="number" value={form.unlockLevel ?? 1} onChange={(e) => setNum("unlockLevel", e.target.value)} min={1} step="1" />
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
                      <select
                        value={Number(form.requiredWeaponType ?? 0)}
                        onChange={(e) => setNum("requiredWeaponType", e.target.value)}
                        disabled={(form.ownership || "PlayerSkill") === "PlayerSkill"}
                        className="flex bg-slate-900 disabled:opacity-60 px-3 py-1 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full h-9 text-slate-50 text-sm"
                      >
                        {Object.entries(WEAPON_TYPE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v} ({k})
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Skill Visual Config (skill_vfx)">
                    <select
                      value={form.skillVisualConfigId || ""}
                      onChange={(e) => set("skillVisualConfigId", e.target.value)}
                      className="flex bg-slate-900 px-3 py-1 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full h-9 text-slate-50 text-sm"
                    >
                      <option value="">Select skill_vfx config</option>
                      {skillVfxConfigs.map((cfg) => (
                        <option key={cfg.configId} value={cfg.configId}>
                          {cfg.displayName || cfg.configId} ({cfg.configId})
                        </option>
                      ))}
                    </select>
                  </Field>
                </section>

                {showProjectile && (
                  <section className="space-y-3 pt-2 border-slate-800 border-t">
                    <h3 className="font-semibold text-amber-400 text-sm uppercase tracking-wider">Projectile Fields</h3>
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

                {showBuff && (
                  <section className="space-y-3 pt-2 border-slate-800 border-t">
                    <h3 className="font-semibold text-amber-400 text-sm uppercase tracking-wider">Buff Fields</h3>
                    <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                      <Field label="Buff Sub Category">
                        <select
                          value={form.buffSubCategory || "None"}
                          onChange={(e) => set("buffSubCategory", e.target.value)}
                          className="flex bg-slate-900 px-3 py-1 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full h-9 text-slate-50 text-sm"
                        >
                          {catalogEnums.buffSubCategory.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Buff Value">
                        <Input type="number" value={form.buffValue ?? 0} onChange={(e) => setNum("buffValue", e.target.value)} step="0.01" />
                      </Field>
                      <Field label="Buff Duration (s)">
                        <Input type="number" min={0} value={form.buffDuration ?? 0} onChange={(e) => setNum("buffDuration", e.target.value)} step="0.01" />
                      </Field>
                      <Field label="Buff Tick Interval (s)">
                        <Input type="number" min={0} value={form.buffTickInterval ?? 0} onChange={(e) => setNum("buffTickInterval", e.target.value)} step="0.01" />
                      </Field>
                    </div>
                  </section>
                )}

                {showAoE && (
                  <section className="space-y-3 pt-2 border-slate-800 border-t">
                    <h3 className="font-semibold text-amber-400 text-sm uppercase tracking-wider">AoE Fields</h3>
                    <div className="gap-3 grid grid-cols-1 sm:grid-cols-3">
                      <Field label="AoE Cast Range">
                        <Input type="number" min={0} value={form.aoeCastRange ?? 0} onChange={(e) => setNum("aoeCastRange", e.target.value)} step="0.01" />
                      </Field>
                      <Field label="AoE Radius">
                        <Input type="number" min={0} value={form.aoeRadius ?? 0} onChange={(e) => setNum("aoeRadius", e.target.value)} step="0.01" />
                      </Field>
                      <Field label="AoE VFX Duration (s)">
                        <Input type="number" min={0} value={form.aoeVfxDuration ?? 0} onChange={(e) => setNum("aoeVfxDuration", e.target.value)} step="0.01" />
                      </Field>
                    </div>
                  </section>
                )}

                {showSlash && (
                  <section className="space-y-3 pt-2 border-slate-800 border-t">
                    <h3 className="font-semibold text-amber-400 text-sm uppercase tracking-wider">Slash Fields</h3>
                    <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
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
                </fieldset>
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
              {editingSkillId && isDetailMode && (
                <Button type="button" onClick={() => setIsDetailMode(false)}>
                  Edit
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={loading || (!!editingSkillId && isDetailMode)}>
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
