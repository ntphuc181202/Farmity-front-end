import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import Swal from "sweetalert2";
import itemApi from "../../api/itemApi";
import materialApi from "../../api/materialApi";
import combatSkillApi from "../../api/combatSkillApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

/* ───────── constants ───────── */

const ITEM_TYPE_LABELS: Record<number, string> = {
  0: "Tool",
  1: "Seed",
  2: "Crop",
  3: "Pollen",
  4: "Consumable",
  5: "Material",
  6: "Weapon",
  7: "Fish",
  8: "Cooking",
  9: "Forage",
  10: "Resource",
  11: "Gift",
  12: "Quest",
  13: "Structure",
  14: "Fertilizer",
};

const ITEM_CATEGORY_LABELS: Record<number, string> = {
  0: "Farming",
  1: "Mining",
  2: "Fishing",
  3: "Cooking",
  4: "Crafting",
  5: "Combat",
  6: "Foraging",
  7: "Special",
};

const WEAPON_TYPE_LABELS: Record<number, string> = {
  0: "None",
  1: "Sword",
  2: "Staff",
  3: "Spear",
};

const TOOL_TYPE_LABELS: Record<number, string> = {
  0: "Hoe",
  1: "WateringCan",
  2: "Pickaxe",
  3: "Axe",
  4: "FishingRod",
};

const STRUCTURE_INTERACTION_LABELS: Record<number, string> = {
  0: "Storage",
  1: "Crafting",
  2: "Smelting",
  3: "Fence",
  4: "Decoration",
};

const STRUCTURE_LEVEL_LABELS: Record<number, string> = {
  0: "Wood",
  1: "Bronze",
  2: "Iron",
  3: "Gold",
};

/* ───────── types ───────── */

interface CrossResult {
  targetPlantId: string;
  resultPlantId: string;
}

interface ItemDoc {
  _id?: string;
  itemID: string;
  itemName: string;
  description: string;
  iconUrl?: string;
  itemType: number;
  itemCategory: number;
  maxStack: number;
  isStackable: boolean;
  basePrice: number;
  buyPrice: number;
  canBeSold: boolean;
  canBeBought: boolean;
  isQuestItem: boolean;
  isArtifact: boolean;
  isRareItem: boolean;
  npcPreferenceNames?: string[];
  npcPreferenceReactions?: number[];
  // type-specific
  toolType?: number;
  toolLevel?: number;
  toolPower?: number;
  toolMaterialId?: string;
  plantId?: string;
  sourcePlantId?: string;
  pollinationSuccessChance?: number;
  viabilityDays?: number;
  crossResults?: CrossResult[];
  energyRestore?: number;
  viableRestore?: number;
  healthRestore?: number;
  bufferDuration?: number;
  regenBoostMultiplier?: number;
  toolEfficiencyReductionPercent?: number;
  effectDurationSeconds?: number;
  damage?: number;
  critChance?: number;
  weaponMaterialId?: string;
  weaponType?: number;
  tier?: number;
  attackCooldown?: number;
  knockbackForce?: number;
  projectileSpeed?: number;
  projectileRange?: number;
  projectileKnockback?: number;
  linkedSkillId?: string;
  difficulty?: number;
  fishingSeasons?: number[];
  isLegendary?: boolean;
  foragingSeasons?: number[];
  isOre?: boolean;
  requiresSmelting?: boolean;
  smeltedResultId?: string;
  isUniversalLike?: boolean;
  isUniversalLove?: boolean;
  relatedQuestID?: string;
  autoConsume?: boolean;
  structureInteractionType?: number;
  structureLevel?: number;
  structureInteractionSpriteUrl?: string;
}

const EMPTY: ItemDoc = {
  itemID: "",
  itemName: "",
  description: "",
  itemType: 0,
  itemCategory: 0,
  maxStack: 1,
  isStackable: false,
  basePrice: 0,
  buyPrice: 0,
  canBeSold: true,
  canBeBought: false,
  isQuestItem: false,
  isArtifact: false,
  isRareItem: false,
  energyRestore: 0,
  viableRestore: 0,
  healthRestore: 0,
  bufferDuration: 0,
  regenBoostMultiplier: 0,
  toolEfficiencyReductionPercent: 0,
  effectDurationSeconds: 0,
  npcPreferenceNames: [],
  npcPreferenceReactions: [],
};

interface MaterialDoc {
  materialId?: string;
  materialName?: string;
}

interface CombatSkillDoc {
  skillId: string;
  skillName?: string;
  ownership?: string;
}

// Backend enum: CombatManager.Model.WeaponType
const STAFF_WEAPON_TYPE = 2;

/* ───────── helper: build FormData ───────── */

function buildFormData(
  form: ItemDoc,
  iconFile: File | null,
  spriteFile: File | null = null,
): FormData {
  const fd = new FormData();

  if (iconFile) fd.append("icon", iconFile);

  // base scalars
  const scalars: (keyof ItemDoc)[] = [
    "itemID",
    "itemName",
    "description",
    "itemType",
    "itemCategory",
    "maxStack",
    "isStackable",
    "basePrice",
    "buyPrice",
    "canBeSold",
    "canBeBought",
    "isQuestItem",
    "isArtifact",
    "isRareItem",
  ];
  for (const k of scalars) {
    const v = form[k];
    if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
  }

  // npc preferences
  if (form.npcPreferenceNames && form.npcPreferenceNames.length > 0) {
    form.npcPreferenceNames.forEach((n) => fd.append("npcPreferenceNames", n));
  }
  if (form.npcPreferenceReactions && form.npcPreferenceReactions.length > 0) {
    form.npcPreferenceReactions.forEach((r) =>
      fd.append("npcPreferenceReactions", String(r)),
    );
  }

  // type-specific
  const t = Number(form.itemType);
  if (t === 0) {
    appendIfDefined(fd, "toolType", form.toolType);
    appendIfDefined(fd, "toolLevel", form.toolLevel);
    appendIfDefined(fd, "toolPower", form.toolPower);
    appendIfDefined(fd, "toolMaterialId", form.toolMaterialId);
  } else if (t === 1) {
    appendIfDefined(fd, "plantId", form.plantId);
  } else if (t === 3) {
    appendIfDefined(fd, "sourcePlantId", form.sourcePlantId);
    appendIfDefined(
      fd,
      "pollinationSuccessChance",
      form.pollinationSuccessChance,
    );
    appendIfDefined(fd, "viabilityDays", form.viabilityDays);
    if (form.crossResults && form.crossResults.length > 0) {
      fd.append("crossResults", JSON.stringify(form.crossResults));
    }
  } else if (t === 4) {
    appendIfDefined(fd, "viableRestore", form.viableRestore);
    appendIfDefined(fd, "healthRestore", form.healthRestore);
    appendIfDefined(fd, "regenBoostMultiplier", form.regenBoostMultiplier);
    appendIfDefined(
      fd,
      "toolEfficiencyReductionPercent",
      form.toolEfficiencyReductionPercent,
    );
    appendIfDefined(fd, "effectDurationSeconds", form.effectDurationSeconds);
  } else if (t === 8) {
    appendIfDefined(fd, "energyRestore", form.energyRestore);
    appendIfDefined(fd, "healthRestore", form.healthRestore);
    appendIfDefined(fd, "bufferDuration", form.bufferDuration);
  } else if (t === 6) {
    appendIfDefined(fd, "damage", form.damage);
    appendIfDefined(fd, "critChance", form.critChance);
    appendIfDefined(fd, "weaponMaterialId", form.weaponMaterialId);
    appendIfDefined(fd, "weaponType", form.weaponType);
    appendIfDefined(fd, "tier", form.tier);
    appendIfDefined(fd, "attackCooldown", form.attackCooldown);
    appendIfDefined(fd, "knockbackForce", form.knockbackForce);
    appendIfDefined(fd, "projectileSpeed", form.projectileSpeed);
    appendIfDefined(fd, "projectileRange", form.projectileRange);
    appendIfDefined(fd, "projectileKnockback", form.projectileKnockback);
    appendIfDefined(fd, "linkedSkillId", form.linkedSkillId);
  } else if (t === 7) {
    appendIfDefined(fd, "difficulty", form.difficulty);
    if (form.fishingSeasons && form.fishingSeasons.length > 0) {
      form.fishingSeasons.forEach((s) =>
        fd.append("fishingSeasons", String(s)),
      );
    }
    appendIfDefined(fd, "isLegendary", form.isLegendary);
  } else if (t === 9) {
    if (form.foragingSeasons && form.foragingSeasons.length > 0) {
      form.foragingSeasons.forEach((s) =>
        fd.append("foragingSeasons", String(s)),
      );
    }
    appendIfDefined(fd, "energyRestore", form.energyRestore);
  } else if (t === 10) {
    appendIfDefined(fd, "isOre", form.isOre);
    appendIfDefined(fd, "requiresSmelting", form.requiresSmelting);
    appendIfDefined(fd, "smeltedResultId", form.smeltedResultId);
  } else if (t === 11) {
    appendIfDefined(fd, "isUniversalLike", form.isUniversalLike);
    appendIfDefined(fd, "isUniversalLove", form.isUniversalLove);
  } else if (t === 12) {
    appendIfDefined(fd, "relatedQuestID", form.relatedQuestID);
    appendIfDefined(fd, "autoConsume", form.autoConsume);
  } else if (t === 13) {
    appendIfDefined(
      fd,
      "structureInteractionType",
      form.structureInteractionType,
    );
    appendIfDefined(fd, "structureLevel", form.structureLevel);
    if (spriteFile) fd.append("structureInteractionSprite", spriteFile);
  }

  return fd;
}

function appendIfDefined(fd: FormData, key: string, v: unknown) {
  if (v !== undefined && v !== null && v !== "") fd.append(key, String(v));
}

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

function AdminItemManager() {
  const [items, setItems] = useState<ItemDoc[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemID, setEditingItemID] = useState<string | null>(null);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [form, setForm] = useState<ItemDoc>({ ...EMPTY });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState("");
  const [spriteFile, setSpriteFile] = useState<File | null>(null);
  const [spritePreview, setSpritePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<MaterialDoc[]>([]);
  const [weaponSkills, setWeaponSkills] = useState<CombatSkillDoc[]>([]);

  /* ── fetch ── */
  const fetchItems = async () => {
    try {
      const res = await itemApi.getAllItems();
      setItems(res.data || []);
    } catch (err) {
      console.error("Failed to load items:", err);
    }
  };

  const fetchWeaponLookups = async () => {
    try {
      const [materialsRes, skillsRes] = await Promise.all([
        materialApi.getMaterialCatalog(),
        combatSkillApi.getAllCombatSkills(),
      ]);

      const materialData = materialsRes?.data;
      setMaterials(
        Array.isArray(materialData)
          ? materialData
          : materialData?.materials || [],
      );

      const skillsData = skillsRes?.data;
      const allSkills: CombatSkillDoc[] = Array.isArray(skillsData)
        ? skillsData
        : skillsData?.skills || [];
      setWeaponSkills(allSkills.filter((s) => s?.ownership === "WeaponSkill"));
    } catch (err) {
      console.error("Failed to load weapon lookup data:", err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchWeaponLookups();
  }, []);

  /* ── helpers ── */
  const resetForm = () => {
    setForm({ ...EMPTY });
    setIconFile(null);
    setIconPreview("");
    setSpriteFile(null);
    setSpritePreview("");
    setEditingItemID(null);
    setIsDetailMode(false);
  };

  const openCreate = () => {
    resetForm();
    setIsDetailMode(false);
    setIsModalOpen(true);
  };

  const openEdit = (item: ItemDoc) => {
    setForm({ ...item });
    setIconPreview(item.iconUrl || "");
    setSpriteFile(null);
    setSpritePreview(item.structureInteractionSpriteUrl || "");
    setEditingItemID(item.itemID);
    setIsDetailMode(true);
    setIsModalOpen(true);
  };

  /* ── field updaters ── */
  const set = <K extends keyof ItemDoc>(key: K, value: ItemDoc[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setNum = (key: keyof ItemDoc, raw: string) =>
    set(key, raw === "" ? ("" as never) : (Number(raw) as never));

  const setBool = (key: keyof ItemDoc, checked: boolean) =>
    set(key, checked as never);

  /* ── icon pick ── */
  const handleIconPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  /* ── structure sprite pick ── */
  const handleSpritePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSpriteFile(file);
    setSpritePreview(URL.createObjectURL(file));
  };

  /* ── submit ── */
  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!form.itemID.trim() || !form.itemName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Item ID and Name are required",
        background: "#020617",
        color: "#e5e7eb",
      });
      return;
    }
    if (!editingItemID && !iconFile) {
      Swal.fire({
        icon: "warning",
        title: "Icon image is required for new items",
        background: "#020617",
        color: "#e5e7eb",
      });
      return;
    }

    if (Number(form.itemType) === 6) {
      const requiredWeaponFields: Array<{ key: keyof ItemDoc; label: string }> =
        [
          { key: "damage", label: "Damage" },
          { key: "critChance", label: "Crit Chance" },
          { key: "weaponMaterialId", label: "Weapon Material ID" },
          { key: "weaponType", label: "Weapon Type" },
          { key: "tier", label: "Tier" },
          { key: "attackCooldown", label: "Attack Cooldown" },
          { key: "knockbackForce", label: "Knockback Force" },
        ];

      const missing = requiredWeaponFields.find(({ key }) => {
        const v = form[key];
        return v === undefined || v === null || v === "";
      });

      if (missing) {
        Swal.fire({
          icon: "warning",
          title: `${missing.label} is required for weapon items`,
          background: "#020617",
          color: "#e5e7eb",
        });
        return;
      }

      const isStaffWeapon = Number(form.weaponType) === STAFF_WEAPON_TYPE;
      if (isStaffWeapon) {
        const missingProjectileField = [
          { key: "projectileSpeed", label: "Projectile Speed" },
          { key: "projectileRange", label: "Projectile Range" },
          { key: "projectileKnockback", label: "Projectile Knockback" },
        ].find(({ key }) => {
          const v = form[key as keyof ItemDoc];
          return v === undefined || v === null || v === "";
        });

        if (missingProjectileField) {
          Swal.fire({
            icon: "warning",
            title: `${missingProjectileField.label} is required for staff weapons`,
            text: `Staff type is weaponType=${STAFF_WEAPON_TYPE}.`,
            background: "#020617",
            color: "#e5e7eb",
          });
          return;
        }
      }
    }

    if (form.linkedSkillId && Number(form.itemType) !== 6) {
      Swal.fire({
        icon: "warning",
        title: "Linked Skill is only valid for weapon items",
        background: "#020617",
        color: "#e5e7eb",
      });
      return;
    }

    if (Number(form.itemType) === 6 && form.linkedSkillId) {
      const matched = weaponSkills.find(
        (s) => s.skillId === form.linkedSkillId,
      );
      if (!matched) {
        Swal.fire({
          icon: "warning",
          title: "Invalid linked skill",
          text: "Linked skill must exist and have ownership WeaponSkill.",
          background: "#020617",
          color: "#e5e7eb",
        });
        return;
      }
    }

    try {
      setLoading(true);
      const fd = buildFormData(form, iconFile, spriteFile);

      if (editingItemID) {
        await itemApi.updateItem(editingItemID, fd);
        Swal.fire({
          toast: true,
          icon: "success",
          title: "Item updated",
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          background: "#020617",
          color: "#e5e7eb",
        });
      } else {
        await itemApi.createItem(fd);
        Swal.fire({
          toast: true,
          icon: "success",
          title: "Item created",
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          background: "#020617",
          color: "#e5e7eb",
        });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchItems();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to save item.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        background: "#020617",
        color: "#e5e7eb",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async (itemID: string) => {
    const result = await Swal.fire({
      title: "Delete this item?",
      text: `Item "${itemID}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it",
      background: "#020617",
      color: "#e5e7eb",
    });
    if (!result.isConfirmed) return;

    try {
      await itemApi.deleteItem(itemID);
      setItems((prev) => prev.filter((i) => i.itemID !== itemID));
      Swal.fire({
        toast: true,
        icon: "success",
        title: "Item deleted",
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        background: "#020617",
        color: "#e5e7eb",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete item.",
        background: "#020617",
        color: "#e5e7eb",
      });
    }
  };

  /* ── filter + paginate ── */
  const filtered = items.filter((i) => {
    const t = search.toLowerCase();
    const matchText =
      i.itemID.toLowerCase().includes(t) ||
      i.itemName.toLowerCase().includes(t) ||
      (i.description || "").toLowerCase().includes(t);
    const matchType = typeFilter === "all" || String(i.itemType) === typeFilter;
    const matchCategory =
      categoryFilter === "all" || String(i.itemCategory) === categoryFilter;
    return matchText && matchType && matchCategory;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  /* ── NPC prefs helpers ── */
  const addNpcPref = () => {
    setForm((prev) => ({
      ...prev,
      npcPreferenceNames: [...(prev.npcPreferenceNames || []), ""],
      npcPreferenceReactions: [...(prev.npcPreferenceReactions || []), 0],
    }));
  };
  const removeNpcPref = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      npcPreferenceNames: (prev.npcPreferenceNames || []).filter(
        (_, i) => i !== idx,
      ),
      npcPreferenceReactions: (prev.npcPreferenceReactions || []).filter(
        (_, i) => i !== idx,
      ),
    }));
  };
  const setNpcName = (idx: number, val: string) => {
    setForm((prev) => {
      const names = [...(prev.npcPreferenceNames || [])];
      names[idx] = val;
      return { ...prev, npcPreferenceNames: names };
    });
  };
  const setNpcReaction = (idx: number, val: number) => {
    setForm((prev) => {
      const reactions = [...(prev.npcPreferenceReactions || [])];
      reactions[idx] = val;
      return { ...prev, npcPreferenceReactions: reactions };
    });
  };

  /* ── cross results helpers ── */
  const addCrossResult = () => {
    setForm((prev) => ({
      ...prev,
      crossResults: [
        ...(prev.crossResults || []),
        { targetPlantId: "", resultPlantId: "" },
      ],
    }));
  };
  const removeCrossResult = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      crossResults: (prev.crossResults || []).filter((_, i) => i !== idx),
    }));
  };
  const setCrossField = (
    idx: number,
    field: keyof CrossResult,
    val: string,
  ) => {
    setForm((prev) => {
      const arr = [...(prev.crossResults || [])];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...prev, crossResults: arr };
    });
  };

  /* ── seasons toggle helper ── */
  const toggleSeason = (
    key: "fishingSeasons" | "foragingSeasons",
    val: number,
  ) => {
    setForm((prev) => {
      const arr = [...((prev[key] as number[]) || [])];
      const idx = arr.indexOf(val);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(val);
      return { ...prev, [key]: arr };
    });
  };

  /* ─────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="font-semibold text-white text-2xl">Items Catalog</h1>
          <p className="mt-0.5 text-slate-400 text-sm">
            {items.length} items total
          </p>
        </div>
        <Button onClick={openCreate}>+ New Item</Button>
      </header>

      {/* List */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search by ID, name or description…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1 min-w-[180px]"
            />
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-900 px-3 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 h-9 text-slate-50 text-sm"
            >
              <option value="all">All Types</option>
              {Object.entries(ITEM_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
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
              <option value="all">All Categories</option>
              {Object.entries(ITEM_CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-slate-800">
          {visible.length === 0 && (
            <p className="py-8 text-slate-500 text-sm text-center">
              No items found.
            </p>
          )}
          {visible.map((item) => (
            <div
              key={item.itemID}
              className="flex items-center gap-4 hover:bg-slate-800/40 px-6 py-3 transition-colors"
            >
              {item.iconUrl ? (
                <img
                  src={item.iconUrl}
                  alt={item.itemName}
                  className="bg-slate-800 rounded-md w-10 h-10 object-cover shrink-0 pixel-art"
                />
              ) : (
                <div className="bg-slate-800 rounded-md w-10 h-10 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">
                  {item.itemName}
                </p>
                <p className="text-slate-400 text-xs truncate">
                  {item.itemID} · {ITEM_TYPE_LABELS[item.itemType] ?? "Unknown"}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => openEdit(item)}>
                  Detail
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(item.itemID)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span className="text-slate-400 text-sm">
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

      {/* ═══════  Modal  ═══════ */}
      {isModalOpen && (
        <div className="z-50 fixed inset-0 flex justify-center items-start bg-black/70 p-4 overflow-y-auto">
          <Card className="flex flex-col bg-slate-950 my-8 border border-slate-800 w-full max-w-3xl">
            <CardHeader className="border-slate-800 border-b shrink-0">
              <CardTitle>
                {editingItemID ? `${isDetailMode ? "Detail" : "Edit"} — ${editingItemID}` : "Create New Item"}
              </CardTitle>
            </CardHeader>

            <div className="flex-1 p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <fieldset disabled={!!editingItemID && isDetailMode} className="space-y-5">
                {/* ─── Base Fields ─── */}
                <section className="space-y-3">
                  <h3 className="font-semibold text-emerald-400 text-sm uppercase tracking-wider">
                    Base Fields
                  </h3>
                  <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
                    <Field label="Item ID *">
                      <Input
                        value={form.itemID}
                        onChange={(e) => set("itemID", e.target.value)}
                        placeholder="e.g. tool_hoe_basic"
                        disabled={!!editingItemID}
                      />
                    </Field>
                    <Field label="Item Name *">
                      <Input
                        value={form.itemName}
                        onChange={(e) => set("itemName", e.target.value)}
                        placeholder="Display name"
                      />
                    </Field>
                  </div>

                  <Field label="Description">
                    <textarea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Flavour text…"
                      rows={2}
                      className="flex bg-slate-900 px-3 py-2 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full text-slate-50 placeholder:text-slate-500 text-sm"
                    />
                  </Field>

                  {/* Icon upload */}
                  <Field
                    label={
                      editingItemID
                        ? "Icon (optional, replaces current)"
                        : "Icon *"
                    }
                  >
                    <label className="flex justify-center items-center bg-slate-900 border-2 border-slate-700 hover:border-slate-500 border-dashed rounded-lg w-full h-24 transition cursor-pointer">
                      <span className="text-slate-400 text-sm">
                        {iconFile
                          ? iconFile.name
                          : "Click to select icon image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconPick}
                        className="hidden"
                      />
                    </label>
                    {iconPreview && (
                      <img
                        src={iconPreview}
                        alt="preview"
                        className="bg-slate-800 mt-2 rounded-md w-16 h-16 object-cover pixel-art"
                      />
                    )}
                  </Field>

                  <div className="gap-3 grid grid-cols-2 sm:grid-cols-4">
                    <Field label="Item Type">
                      <select
                        value={form.itemType}
                        onChange={(e) => {
                          const nextType = Number(e.target.value);
                          setForm((prev) => ({
                            ...prev,
                            itemType: nextType,
                            ...(nextType === 6
                              ? {
                                  isStackable: false,
                                  maxStack: 1,
                                  itemCategory: 5,
                                  weaponType: prev.weaponType ?? 1,
                                }
                              : {}),
                          }));
                        }}
                        className="flex bg-slate-900 px-3 py-1 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full h-9 text-slate-50 text-sm"
                      >
                        {Object.entries(ITEM_TYPE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v} ({k})
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Category">
                      <select
                        value={form.itemCategory}
                        onChange={(e) =>
                          set("itemCategory", Number(e.target.value))
                        }
                        className="flex bg-slate-900 px-3 py-1 border border-slate-700 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 w-full h-9 text-slate-50 text-sm"
                      >
                        {Object.entries(ITEM_CATEGORY_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v} ({k})
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Max Stack">
                      <Input
                        type="number"
                        value={form.maxStack}
                        onChange={(e) => setNum("maxStack", e.target.value)}
                        min={1}
                      />
                    </Field>
                    <Field label="Base Price">
                      <Input
                        type="number"
                        value={form.basePrice}
                        onChange={(e) => setNum("basePrice", e.target.value)}
                        min={0}
                      />
                    </Field>
                  </div>

                  <div className="gap-3 grid grid-cols-2 sm:grid-cols-4">
                    <Field label="Buy Price">
                      <Input
                        type="number"
                        value={form.buyPrice}
                        onChange={(e) => setNum("buyPrice", e.target.value)}
                        min={0}
                      />
                    </Field>
                  </div>

                  {/* Booleans */}
                  <div className="flex flex-wrap gap-4 pt-1">
                    <Toggle
                      label="Stackable"
                      checked={form.isStackable}
                      onChange={(c) => setBool("isStackable", c)}
                    />
                    <Toggle
                      label="Can Be Sold"
                      checked={form.canBeSold}
                      onChange={(c) => setBool("canBeSold", c)}
                    />
                    <Toggle
                      label="Can Be Bought"
                      checked={form.canBeBought}
                      onChange={(c) => setBool("canBeBought", c)}
                    />
                    <Toggle
                      label="Quest Item"
                      checked={form.isQuestItem}
                      onChange={(c) => setBool("isQuestItem", c)}
                    />
                    <Toggle
                      label="Artifact"
                      checked={form.isArtifact}
                      onChange={(c) => setBool("isArtifact", c)}
                    />
                    <Toggle
                      label="Rare Item"
                      checked={form.isRareItem}
                      onChange={(c) => setBool("isRareItem", c)}
                    />
                  </div>
                </section>

                {/* ─── NPC Preferences ─── */}
                <section className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-emerald-400 text-sm uppercase tracking-wider">
                      NPC Preferences
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addNpcPref}
                    >
                      + Add
                    </Button>
                  </div>
                  {(form.npcPreferenceNames || []).map((name, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        className="flex-1"
                        placeholder="NPC name"
                        value={name}
                        onChange={(e) => setNpcName(idx, e.target.value)}
                      />
                      <select
                        value={(form.npcPreferenceReactions || [])[idx] ?? 0}
                        onChange={(e) =>
                          setNpcReaction(idx, Number(e.target.value))
                        }
                        className="bg-slate-900 px-2 border border-slate-700 rounded-md h-9 text-slate-50 text-sm"
                      >
                        {[-2, -1, 0, 1, 2].map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="w-8 h-8 shrink-0"
                        onClick={() => removeNpcPref(idx)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </section>

                {/* ─── Type-Specific Fields ─── */}
                <TypeFields
                  itemType={Number(form.itemType)}
                  form={form}
                  set={set}
                  setNum={setNum}
                  setBool={setBool}
                  materials={materials}
                  weaponSkills={weaponSkills}
                  toggleSeason={toggleSeason}
                  addCrossResult={addCrossResult}
                  removeCrossResult={removeCrossResult}
                  setCrossField={setCrossField}
                  spriteFile={spriteFile}
                  spritePreview={spritePreview}
                  onSpritePick={handleSpritePick}
                />
                </fieldset>
              </form>
            </div>

            {/* Footer */}
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
              {editingItemID && isDetailMode && (
                <Button type="button" onClick={() => setIsDetailMode(false)}>
                  Edit
                </Button>
              )}
              <Button onClick={handleSubmit} disabled={loading || (!!editingItemID && isDetailMode)}>
                {loading
                  ? "Saving…"
                  : editingItemID
                    ? "Save Changes"
                    : "Create Item"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════ */

/* Labelled field wrapper */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

/* Checkbox toggle */
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded w-4 h-4 accent-emerald-500"
      />
      {label}
    </label>
  );
}

/* Dynamic type-specific fields */
function TypeFields({
  itemType,
  form,
  set,
  setNum,
  setBool,
  materials,
  weaponSkills,
  toggleSeason,
  addCrossResult,
  removeCrossResult,
  setCrossField,
  spriteFile,
  spritePreview,
  onSpritePick,
}: {
  itemType: number;
  form: ItemDoc;
  set: <K extends keyof ItemDoc>(key: K, value: ItemDoc[K]) => void;
  setNum: (key: keyof ItemDoc, raw: string) => void;
  setBool: (key: keyof ItemDoc, checked: boolean) => void;
  materials: MaterialDoc[];
  weaponSkills: CombatSkillDoc[];
  toggleSeason: (
    key: "fishingSeasons" | "foragingSeasons",
    val: number,
  ) => void;
  addCrossResult: () => void;
  removeCrossResult: (idx: number) => void;
  setCrossField: (
    idx: number,
    field: "targetPlantId" | "resultPlantId",
    val: string,
  ) => void;
  spriteFile: File | null;
  spritePreview: string;
  onSpritePick: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const selectClass =
    "flex h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500";

  const sectionHeader = ITEM_TYPE_LABELS[itemType]
    ? `${ITEM_TYPE_LABELS[itemType]} Fields`
    : "Extra Fields";

  // Hide section for types with no extra fields
  if (itemType === 2 || itemType === 5 || itemType === 14) return null;

  return (
    <section className="space-y-3 pt-2 border-slate-800 border-t">
      <h3 className="font-semibold text-amber-400 text-sm uppercase tracking-wider">
        {sectionHeader}
      </h3>

      {/* 0 – Tool */}
      {itemType === 0 && (
        <div className="gap-3 grid grid-cols-2 sm:grid-cols-4">
          <Field label="Tool Type">
            <select
              value={form.toolType ?? 0}
              onChange={(e) => set("toolType", Number(e.target.value))}
              className={selectClass}
            >
              {Object.entries(TOOL_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tool Level">
            <Input
              type="number"
              value={form.toolLevel ?? 1}
              onChange={(e) => setNum("toolLevel", e.target.value)}
              min={1}
            />
          </Field>
          <Field label="Tool Power">
            <Input
              type="number"
              value={form.toolPower ?? 1}
              onChange={(e) => setNum("toolPower", e.target.value)}
              min={1}
            />
          </Field>
          <Field label="Material ID">
            <Input
              value={form.toolMaterialId ?? ""}
              onChange={(e) => set("toolMaterialId", e.target.value)}
              placeholder="e.g. mat_copper"
            />
          </Field>
        </div>
      )}

      {/* 1 – Seed */}
      {itemType === 1 && (
        <Field label="Plant ID">
          <Input
            value={form.plantId ?? ""}
            onChange={(e) => set("plantId", e.target.value)}
            placeholder="e.g. plant_corn"
          />
        </Field>
      )}

      {/* 3 – Pollen */}
      {itemType === 3 && (
        <>
          <div className="gap-3 grid grid-cols-1 sm:grid-cols-3">
            <Field label="Source Plant ID">
              <Input
                value={form.sourcePlantId ?? ""}
                onChange={(e) => set("sourcePlantId", e.target.value)}
                placeholder="e.g. plant_corn"
              />
            </Field>
            <Field label="Pollination Success %">
              <Input
                type="number"
                step="0.01"
                value={form.pollinationSuccessChance ?? 0.5}
                onChange={(e) =>
                  setNum("pollinationSuccessChance", e.target.value)
                }
                min={0}
                max={1}
              />
            </Field>
            <Field label="Viability Days">
              <Input
                type="number"
                value={form.viabilityDays ?? 3}
                onChange={(e) => setNum("viabilityDays", e.target.value)}
                min={0}
              />
            </Field>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Cross Results</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addCrossResult}
              >
                + Add
              </Button>
            </div>
            {(form.crossResults || []).map((cr, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  className="flex-1"
                  placeholder="Target Plant ID"
                  value={cr.targetPlantId}
                  onChange={(e) =>
                    setCrossField(idx, "targetPlantId", e.target.value)
                  }
                />
                <Input
                  className="flex-1"
                  placeholder="Result Plant ID"
                  value={cr.resultPlantId}
                  onChange={(e) =>
                    setCrossField(idx, "resultPlantId", e.target.value)
                  }
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="w-8 h-8 shrink-0"
                  onClick={() => removeCrossResult(idx)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 4 – Consumable */}
      {itemType === 4 && (
        <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
          <Field label="Viable Restore">
            <Input
              type="number"
              value={form.viableRestore ?? 0}
              onChange={(e) => setNum("viableRestore", e.target.value)}
              min={0}
            />
          </Field>
          <Field label="Health Restore">
            <Input
              type="number"
              value={form.healthRestore ?? 0}
              onChange={(e) => setNum("healthRestore", e.target.value)}
              min={0}
            />
          </Field>
          <Field label="Regen Boost Multiplier">
            <Input
              type="number"
              step="0.1"
              value={form.regenBoostMultiplier ?? 0}
              onChange={(e) => setNum("regenBoostMultiplier", e.target.value)}
              min={0}
            />
          </Field>
          <Field label="Tool Efficiency Reduction %">
            <Input
              type="number"
              step="0.01"
              value={form.toolEfficiencyReductionPercent ?? 0}
              onChange={(e) =>
                setNum("toolEfficiencyReductionPercent", e.target.value)
              }
              min={0}
              max={0.95}
            />
          </Field>
          <Field label="Effect Duration Seconds">
            <Input
              type="number"
              step="0.1"
              value={form.effectDurationSeconds ?? 0}
              onChange={(e) => setNum("effectDurationSeconds", e.target.value)}
              min={0}
            />
          </Field>
        </div>
      )}

      {/* 8 – Cooking */}
      {itemType === 8 && (
        <div className="gap-3 grid grid-cols-1 sm:grid-cols-3">
          <Field label="Energy Restore">
            <Input
              type="number"
              value={form.energyRestore ?? 0}
              onChange={(e) => setNum("energyRestore", e.target.value)}
            />
          </Field>
          <Field label="Health Restore">
            <Input
              type="number"
              value={form.healthRestore ?? 0}
              onChange={(e) => setNum("healthRestore", e.target.value)}
            />
          </Field>
          <Field label="Buffer Duration">
            <Input
              type="number"
              step="0.1"
              value={form.bufferDuration ?? 0}
              onChange={(e) => setNum("bufferDuration", e.target.value)}
              min={0}
            />
          </Field>
        </div>
      )}

      {/* 6 – Weapon */}
      {itemType === 6 && (
        <>
          <div className="gap-3 grid grid-cols-2 sm:grid-cols-4">
            <Field label="Damage *">
              <Input
                type="number"
                value={form.damage ?? 10}
                onChange={(e) => setNum("damage", e.target.value)}
                min={0}
              />
            </Field>
            <Field label="Crit Chance % *">
              <Input
                type="number"
                value={form.critChance ?? 5}
                onChange={(e) => setNum("critChance", e.target.value)}
                min={0}
                max={100}
              />
            </Field>
            <Field label="Weapon Material ID *">
              <select
                value={form.weaponMaterialId ?? ""}
                onChange={(e) => set("weaponMaterialId", e.target.value)}
                className={selectClass}
              >
                <option value="">Select material</option>
                {materials.map((m) => {
                  const materialId = m.materialId || "";
                  if (!materialId) return null;
                  return (
                    <option key={materialId} value={materialId}>
                      {materialId}
                      {m.materialName ? ` - ${m.materialName}` : ""}
                    </option>
                  );
                })}
              </select>
            </Field>
          </div>

          <div className="gap-3 grid grid-cols-2 sm:grid-cols-4">
            <Field label="Weapon Type *">
              <select
                value={form.weaponType ?? 1}
                onChange={(e) => set("weaponType", Number(e.target.value))}
                className={selectClass}
              >
                {Object.entries(WEAPON_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v} ({k})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tier *">
              <Input
                type="number"
                value={form.tier ?? 1}
                onChange={(e) => setNum("tier", e.target.value)}
                min={1}
              />
            </Field>
            <Field label="Attack Cooldown *">
              <Input
                type="number"
                step="0.01"
                value={form.attackCooldown ?? 0.5}
                onChange={(e) => setNum("attackCooldown", e.target.value)}
                min={0}
              />
            </Field>
            <Field label="Knockback Force *">
              <Input
                type="number"
                step="0.01"
                value={form.knockbackForce ?? 0}
                onChange={(e) => setNum("knockbackForce", e.target.value)}
                min={0}
              />
            </Field>
          </div>

          <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
            <Field label="Linked Skill ID (WeaponSkill only)">
              <select
                value={form.linkedSkillId ?? ""}
                onChange={(e) => set("linkedSkillId", e.target.value)}
                className={selectClass}
              >
                <option value="">None</option>
                {weaponSkills.map((s) => (
                  <option key={s.skillId} value={s.skillId}>
                    {s.skillId}
                    {s.skillName ? ` - ${s.skillName}` : ""}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="gap-3 grid grid-cols-1 sm:grid-cols-3">
            <Field label="Projectile Speed (staff)">
              <Input
                type="number"
                step="0.01"
                value={form.projectileSpeed ?? ""}
                onChange={(e) => setNum("projectileSpeed", e.target.value)}
                min={0}
                placeholder="Required for staff"
              />
            </Field>
            <Field label="Projectile Range (staff)">
              <Input
                type="number"
                step="0.01"
                value={form.projectileRange ?? ""}
                onChange={(e) => setNum("projectileRange", e.target.value)}
                min={0}
                placeholder="Required for staff"
              />
            </Field>
            <Field label="Projectile Knockback (staff)">
              <Input
                type="number"
                step="0.01"
                value={form.projectileKnockback ?? ""}
                onChange={(e) => setNum("projectileKnockback", e.target.value)}
                min={0}
                placeholder="Required for staff"
              />
            </Field>
          </div>

          <p className="text-slate-400 text-xs">
            Weapon visuals use item icon directly at runtime.
          </p>
          <p className="text-slate-400 text-xs">
            Staff projectile fields are required when Weapon Type is Staff (
            {STAFF_WEAPON_TYPE}).
          </p>
        </>
      )}

      {/* 7 – Fish */}
      {itemType === 7 && (
        <div className="space-y-3">
          <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
            <Field label="Difficulty">
              <Input
                type="number"
                value={form.difficulty ?? 1}
                onChange={(e) => setNum("difficulty", e.target.value)}
                min={0}
              />
            </Field>
            <div className="flex items-end pb-1">
              <Toggle
                label="Legendary"
                checked={form.isLegendary ?? false}
                onChange={(c) => setBool("isLegendary", c)}
              />
            </div>
          </div>
          <Field label="Fishing Seasons">
            <div className="flex gap-4">
              <Toggle
                label="Sunny (0)"
                checked={(form.fishingSeasons || []).includes(0)}
                onChange={() => toggleSeason("fishingSeasons", 0)}
              />
              <Toggle
                label="Rainy (1)"
                checked={(form.fishingSeasons || []).includes(1)}
                onChange={() => toggleSeason("fishingSeasons", 1)}
              />
            </div>
          </Field>
        </div>
      )}

      {/* 9 – Forage */}
      {itemType === 9 && (
        <div className="space-y-3">
          <Field label="Foraging Seasons">
            <div className="flex gap-4">
              <Toggle
                label="Sunny (0)"
                checked={(form.foragingSeasons || []).includes(0)}
                onChange={() => toggleSeason("foragingSeasons", 0)}
              />
              <Toggle
                label="Rainy (1)"
                checked={(form.foragingSeasons || []).includes(1)}
                onChange={() => toggleSeason("foragingSeasons", 1)}
              />
            </div>
          </Field>
          <Field label="Energy Restore">
            <Input
              type="number"
              value={form.energyRestore ?? 5}
              onChange={(e) => setNum("energyRestore", e.target.value)}
            />
          </Field>
        </div>
      )}

      {/* 10 – Resource */}
      {itemType === 10 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4">
            <Toggle
              label="Is Ore"
              checked={form.isOre ?? false}
              onChange={(c) => setBool("isOre", c)}
            />
            <Toggle
              label="Requires Smelting"
              checked={form.requiresSmelting ?? false}
              onChange={(c) => setBool("requiresSmelting", c)}
            />
          </div>
          <Field label="Smelted Result ID">
            <Input
              value={form.smeltedResultId ?? ""}
              onChange={(e) => set("smeltedResultId", e.target.value)}
              placeholder="Item ID of smelted output"
            />
          </Field>
        </div>
      )}

      {/* 11 – Gift */}
      {itemType === 11 && (
        <div className="flex flex-wrap gap-4">
          <Toggle
            label="Universal Like"
            checked={form.isUniversalLike ?? false}
            onChange={(c) => setBool("isUniversalLike", c)}
          />
          <Toggle
            label="Universal Love"
            checked={form.isUniversalLove ?? false}
            onChange={(c) => setBool("isUniversalLove", c)}
          />
        </div>
      )}

      {/* 12 – Quest */}
      {itemType === 12 && (
        <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
          <Field label="Related Quest ID">
            <Input
              value={form.relatedQuestID ?? ""}
              onChange={(e) => set("relatedQuestID", e.target.value)}
              placeholder="e.g. quest_goblins_01"
            />
          </Field>
          <div className="flex items-end pb-1">
            <Toggle
              label="Auto Consume"
              checked={form.autoConsume ?? false}
              onChange={(c) => setBool("autoConsume", c)}
            />
          </div>
        </div>
      )}

      {/* 13 – Structure */}
      {itemType === 13 && (
        <div className="space-y-3">
          <div className="gap-3 grid grid-cols-1 sm:grid-cols-2">
            <Field label="Interaction Type">
              <select
                value={form.structureInteractionType ?? 0}
                onChange={(e) =>
                  set("structureInteractionType", Number(e.target.value))
                }
                className={selectClass}
              >
                {Object.entries(STRUCTURE_INTERACTION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v} ({k})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Structure Level">
              <select
                value={form.structureLevel ?? 0}
                onChange={(e) => set("structureLevel", Number(e.target.value))}
                className={selectClass}
              >
                {Object.entries(STRUCTURE_LEVEL_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v} ({k})
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex justify-center items-center bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-md px-3 h-9 transition cursor-pointer shrink-0">
              <span className="text-slate-400 text-xs whitespace-nowrap">
                {spriteFile ? spriteFile.name : "Interaction Sprite…"}
              </span>
              <input
                type="file"
                accept="image/png,image/*"
                onChange={onSpritePick}
                className="hidden"
              />
            </label>
            {spritePreview && (
              <img
                src={spritePreview}
                alt="sprite preview"
                className="bg-slate-800 rounded w-16 h-16 object-cover shrink-0 pixel-art"
              />
            )}
            {!spritePreview && (
              <span className="text-slate-600 text-s">
                optional — replaces current
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminItemManager;
