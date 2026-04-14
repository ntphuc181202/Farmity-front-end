import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import achievementApi from "../../api/achievementApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const REQUIREMENT_TYPES = [
  "KILL",
  "HARVEST",
  "PLANT",
  "CRAFT",
  "FISH",
  "COLLECT",
  "DISCOVER",
  "QUEST_COMPLETE",
  "REACH_LEVEL",
  "COOK",
  "TRADE",
] as const;

type RequirementType = (typeof REQUIREMENT_TYPES)[number];

interface AchievementRequirement {
  type: RequirementType;
  target: number;
  entityId?: string;
  label: string;
}

interface AchievementDoc {
  _id?: string;
  achievementId: string;
  name: string;
  description: string;
  requirements: AchievementRequirement[];
}

const EMPTY_REQUIREMENT: AchievementRequirement = {
  type: "KILL",
  target: 1,
  entityId: "",
  label: "",
};

const EMPTY_ACHIEVEMENT: AchievementDoc = {
  achievementId: "",
  name: "",
  description: "",
  requirements: [{ ...EMPTY_REQUIREMENT }],
};

const normalizeType = (value: unknown): RequirementType => {
  const t = String(value || "KILL").toUpperCase() as RequirementType;
  return REQUIREMENT_TYPES.includes(t) ? t : "KILL";
};

const normalizeAchievement = (raw: any): AchievementDoc => {
  const requirementList = Array.isArray(raw?.requirements)
    ? raw.requirements.map((r: any) => ({
        type: normalizeType(r?.type),
        target: Number.isFinite(Number(r?.target)) ? Number(r.target) : 1,
        entityId: r?.entityId ? String(r.entityId) : "",
        label: String(r?.label || ""),
      }))
    : [{ ...EMPTY_REQUIREMENT }];

  return {
    _id: raw?._id,
    achievementId: String(raw?.achievementId || ""),
    name: String(raw?.name || ""),
    description: String(raw?.description || ""),
    requirements: requirementList.length > 0 ? requirementList : [{ ...EMPTY_REQUIREMENT }],
  };
};

function AdminAchievementManager() {
  const [achievements, setAchievements] = useState<AchievementDoc[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [form, setForm] = useState<AchievementDoc>({ ...EMPTY_ACHIEVEMENT });
  const [loading, setLoading] = useState(false);

  const fetchAchievements = async () => {
    try {
      const res = await achievementApi.getAllAchievements();
      const raw = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.achievements)
          ? res.data.achievements
          : [];
      setAchievements(raw.map((a: any) => normalizeAchievement(a)));
    } catch (err) {
      console.error("Failed to load achievement definitions:", err);
      setAchievements([]);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const resetForm = () => {
    setForm({ ...EMPTY_ACHIEVEMENT, requirements: [{ ...EMPTY_REQUIREMENT }] });
    setEditingAchievementId(null);
    setIsDetailMode(false);
  };

  const openCreate = () => {
    resetForm();
    setIsDetailMode(false);
    setIsModalOpen(true);
  };

  const openEdit = (achievement: AchievementDoc) => {
    setForm({
      ...achievement,
      requirements:
        achievement.requirements?.length > 0
          ? achievement.requirements.map((r) => ({ ...r }))
          : [{ ...EMPTY_REQUIREMENT }],
    });
    setEditingAchievementId(achievement.achievementId);
    setIsDetailMode(true);
    setIsModalOpen(true);
  };

  const setField = <K extends keyof AchievementDoc>(key: K, value: AchievementDoc[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateRequirement = (index: number, patch: Partial<AchievementRequirement>) => {
    setForm((prev) => {
      const next = [...prev.requirements];
      next[index] = { ...next[index], ...patch };
      return { ...prev, requirements: next };
    });
  };

  const addRequirement = () => {
    setForm((prev) => ({
      ...prev,
      requirements: [...prev.requirements, { ...EMPTY_REQUIREMENT }],
    }));
  };

  const removeRequirement = (index: number) => {
    setForm((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): string | null => {
    if (!form.achievementId.trim()) return "Achievement ID is required";
    if (!form.name.trim()) return "Name is required";
    if (!form.description.trim()) return "Description is required";
    if (!form.requirements.length) return "At least one requirement is required";

    const seenLabels = new Set<string>();
    for (let i = 0; i < form.requirements.length; i += 1) {
      const r = form.requirements[i];
      if (!REQUIREMENT_TYPES.includes(r.type)) {
        return `Requirement ${i + 1}: invalid type`;
      }
      if (!Number.isFinite(r.target) || Number(r.target) < 1) {
        return `Requirement ${i + 1}: target must be >= 1`;
      }
      if (!r.label.trim()) {
        return `Requirement ${i + 1}: label is required`;
      }

      const normalizedLabel = r.label.trim().toLowerCase();
      if (seenLabels.has(normalizedLabel)) {
        return `Requirement ${i + 1}: label is duplicated`;
      }
      seenLabels.add(normalizedLabel);
    }

    return null;
  };

  const buildPayload = () => ({
    achievementId: form.achievementId.trim(),
    name: form.name.trim(),
    description: form.description.trim(),
    requirements: form.requirements.map((r) => ({
      type: r.type,
      target: Number(r.target),
      ...(r.entityId?.trim() ? { entityId: r.entityId.trim() } : {}),
      label: r.label.trim(),
    })),
  });

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();

    const errorText = validateForm();
    if (errorText) {
      await Swal.fire({
        icon: "warning",
        title: errorText,
        background: "#020617",
        color: "#e5e7eb",
      });
      return;
    }

    try {
      setLoading(true);
      const payload = buildPayload();

      if (editingAchievementId) {
        await achievementApi.updateAchievement(editingAchievementId, {
          name: payload.name,
          description: payload.description,
          requirements: payload.requirements,
        });
        await Swal.fire({ toast: true, icon: "success", title: "Achievement updated", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      } else {
        await achievementApi.createAchievement(payload);
        await Swal.fire({ toast: true, icon: "success", title: "Achievement created", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchAchievements();
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to save achievement.";
      await Swal.fire({ icon: "error", title: "Error", text: message, background: "#020617", color: "#e5e7eb" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (achievementId: string) => {
    const result = await Swal.fire({
      title: "Delete this achievement?",
      text: `Achievement "${achievementId}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it",
      background: "#020617",
      color: "#e5e7eb",
    });

    if (!result.isConfirmed) return;

    try {
      await achievementApi.deleteAchievement(achievementId);
      setAchievements((prev) => prev.filter((a) => a.achievementId !== achievementId));
      await Swal.fire({ toast: true, icon: "success", title: "Achievement deleted", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to delete achievement.";
      await Swal.fire({ icon: "error", title: "Error", text: message, background: "#020617", color: "#e5e7eb" });
    }
  };

  const filtered = achievements.filter((a) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    return (
      a.achievementId.toLowerCase().includes(term) ||
      a.name.toLowerCase().includes(term) ||
      a.description.toLowerCase().includes(term) ||
      a.requirements.some(
        (r) =>
          r.type.toLowerCase().includes(term) ||
          r.label.toLowerCase().includes(term) ||
          (r.entityId || "").toLowerCase().includes(term),
      )
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Achievement Definitions</h1>
          <p className="mt-0.5 text-sm text-slate-400">{achievements.length} achievements total</p>
        </div>
        <Button onClick={openCreate}>+ New Achievement</Button>
      </header>

      <Card>
        <CardHeader>
          <Input
            placeholder="Search by ID, name, description, requirement label/type..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </CardHeader>
        <CardContent className="divide-y divide-slate-800">
          {visible.length === 0 && <p className="py-8 text-sm text-slate-500 text-center">No achievements found.</p>}
          {visible.map((achievement) => (
            <div key={achievement.achievementId} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-800/40 transition-colors">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-yellow-500/10 text-yellow-300 text-xs font-bold shrink-0">
                AC
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{achievement.name}</p>
                <p className="truncate text-xs text-slate-400">
                  {achievement.achievementId} | Requirements {achievement.requirements?.length || 0}
                </p>
                <p className="truncate text-xs text-slate-500 mt-1">{achievement.description}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" onClick={() => openEdit(achievement)}>Detail</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(achievement.achievementId)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span className="text-sm text-slate-400">{currentPage} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 overflow-y-auto">
          <Card className="my-8 w-full max-w-4xl border border-slate-800 bg-slate-950 flex flex-col">
            <CardHeader className="shrink-0 border-b border-slate-800">
              <CardTitle>{editingAchievementId ? `${isDetailMode ? "Detail" : "Edit"} - ${editingAchievementId}` : "Create New Achievement"}</CardTitle>
            </CardHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset disabled={!!editingAchievementId && isDetailMode} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Achievement ID *</Label>
                    <Input
                      value={form.achievementId}
                      onChange={(e) => setField("achievementId", e.target.value)}
                      placeholder="e.g. first_harvest"
                      disabled={!!editingAchievementId}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      placeholder="e.g. First Harvest"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Description *</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="Describe when this achievement is earned"
                  />
                </div>

                <div className="space-y-3 rounded-md border border-slate-800 p-3">
                  <div className="flex items-center justify-between">
                    <Label>Requirements *</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addRequirement}>
                      + Add requirement
                    </Button>
                  </div>

                  {form.requirements.map((req, index) => (
                    <div key={`${req.label}-${index}`} className="grid grid-cols-1 sm:grid-cols-12 gap-2 rounded-md border border-slate-800 p-3">
                      <div className="sm:col-span-3">
                        <Label className="text-xs">Type</Label>
                        <select
                          value={req.type}
                          onChange={(e) => updateRequirement(index, { type: normalizeType(e.target.value) })}
                          className="flex h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
                        >
                          {REQUIREMENT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <Label className="text-xs">Target</Label>
                        <Input
                          type="number"
                          min={1}
                          value={req.target}
                          onChange={(e) => updateRequirement(index, { target: Number(e.target.value || 1) })}
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <Label className="text-xs">Entity ID (optional)</Label>
                        <Input
                          value={req.entityId || ""}
                          onChange={(e) => updateRequirement(index, { entityId: e.target.value })}
                          placeholder="e.g. carrot_seed"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <Label className="text-xs">Label *</Label>
                        <Input
                          value={req.label}
                          onChange={(e) => updateRequirement(index, { label: e.target.value })}
                          placeholder="e.g. Harvest 10 carrots"
                        />
                      </div>

                      <div className="sm:col-span-1 flex items-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="w-full"
                          disabled={form.requirements.length <= 1}
                          onClick={() => removeRequirement(index)}
                        >
                          X
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                </fieldset>
              </form>
            </div>

            <div className="shrink-0 border-slate-800 border-t p-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsModalOpen(false);
                }}
              >
                Cancel
              </Button>
              {editingAchievementId && isDetailMode && (
                <Button type="button" onClick={() => setIsDetailMode(false)}>
                  Edit
                </Button>
              )}
              <Button type="button" onClick={() => handleSubmit()} disabled={loading || (!!editingAchievementId && isDetailMode)}>
                {loading ? "Saving..." : editingAchievementId ? "Save Changes" : "Create Achievement"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AdminAchievementManager;
