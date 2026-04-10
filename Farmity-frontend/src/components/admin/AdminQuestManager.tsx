import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Swal from "sweetalert2";
import questApi from "../../api/questApi";
import mediaApi from "../../api/mediaApi";
import itemApi from "../../api/itemApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type QuestReward = {
  itemId: string;
  quantity: number;
};

type QuestObjective = {
  objectiveId?: string;
  description?: string;
  itemId?: string;
  requiredAmount?: number;
  currentAmount?: number;
};

type CatalogItem = {
  itemID: string;
  itemName: string;
  iconUrl?: string;
};

type Quest = {
  _id?: string;
  id?: string;
  questId?: string;
  questName?: string;
  description?: string;
  NPCName?: string;
  Weight?: number;
  nextQuestId?: string;
  status?: string;
  imageUrls?: string[];
  reward?: QuestReward;
  objectives?: QuestObjective[];
};

const emptyObjective = (): QuestObjective => ({
  objectiveId: "",
  description: "",
  itemId: "",
  requiredAmount: 0,
  currentAmount: 0,
});

function normalizeArrayResponse(data: any): Quest[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function ItemPicker({
  items,
  value,
  onChange,
  placeholder = "Select item...",
}: {
  items: CatalogItem[];
  value: string;
  onChange: (itemId: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = items.find((i) => i.itemID === value);
  const filtered = items.filter((i) => {
    const q = query.toLowerCase();
    return (
      i.itemID.toLowerCase().includes(q) || i.itemName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setQuery("");
        }}
        className="flex h-9 w-full items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 text-left text-sm text-slate-50 transition-colors hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        {selected ? (
          <>
            {selected.iconUrl && (
              <img
                src={selected.iconUrl}
                alt=""
                className="pixel-art h-5 w-5 shrink-0 rounded object-cover"
              />
            )}
            <span className="flex-1 truncate">{selected.itemName}</span>
            <span className="shrink-0 text-xs text-slate-500">
              {selected.itemID}
            </span>
          </>
        ) : (
          <span className="flex-1 text-slate-500">{placeholder}</span>
        )}
        <span className="ml-1 text-xs text-slate-500">▾</span>
      </button>

      {open && (
        <div className="absolute z-[60] mt-1 flex max-h-60 w-full flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
          <div className="border-b border-slate-800 p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800"
            >
              - None -
            </button>
            {filtered.length === 0 && (
              <p className="py-3 text-center text-xs text-slate-500">
                No items match.
              </p>
            )}
            {filtered.map((item) => (
              <button
                key={item.itemID}
                type="button"
                onClick={() => {
                  onChange(item.itemID);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-slate-800 ${
                  item.itemID === value
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "text-slate-50"
                }`}
              >
                {item.iconUrl ? (
                  <img
                    src={item.iconUrl}
                    alt=""
                    className="pixel-art h-6 w-6 shrink-0 rounded bg-slate-800 object-cover"
                  />
                ) : (
                  <div className="h-6 w-6 shrink-0 rounded bg-slate-800" />
                )}
                <span className="flex-1 truncate text-left">
                  {item.itemName}
                </span>
                <span className="shrink-0 text-xs text-slate-500">
                  {item.itemID}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminQuestManager() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [questId, setQuestId] = useState("");
  const [questName, setQuestName] = useState("");
  const [description, setDescription] = useState("");
  const [NPCName, setNPCName] = useState("");
  const [Weight, setWeight] = useState(1);
  const [nextQuestId, setNextQuestId] = useState("");
  const [rewardItemId, setRewardItemId] = useState("");
  const [rewardQuantity, setRewardQuantity] = useState(1);
  const [status, setStatus] = useState("active");
  const [statusOpen, setStatusOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [objectives, setObjectives] = useState<QuestObjective[]>([]);
  const [questExistingImages, setQuestExistingImages] = useState<string[]>([]);
  const [questImageFiles, setQuestImageFiles] = useState<File[]>([]);
  const [questImagePreviews, setQuestImagePreviews] = useState<string[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);

  const uploadQuestImage = async (file: File) => {
    const { data } = await mediaApi.uploadSignature({ folder: "quests" });
    const { cloudName, apiKey, timestamp, signature, folder } = data;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData },
    );
    const result = await uploadRes.json();
    return result.secure_url as string;
  };

  const fetchQuests = async () => {
    setLoading(true);
    setError("");
    try {
      const allRes = await questApi.getAllQuests();
      const allQuests = normalizeArrayResponse(allRes.data);
      if (allQuests.length > 0) {
        setQuests(allQuests);
      } else {
        const catalogRes = await questApi.getQuestCatalog();
        setQuests(normalizeArrayResponse(catalogRes.data));
      }
    } catch (err) {
      console.error("Failed to load quests", err);
      setError("Unable to load quests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await itemApi.getAllItems();
      const data: CatalogItem[] = (res.data || [])
        .map((item: any) => ({
          itemID: String(item.itemID || ""),
          itemName: String(item.itemName || ""),
          iconUrl: item.iconUrl,
        }))
        .filter((item: CatalogItem) => item.itemID && item.itemName);
      setCatalogItems(data);
    } catch (err) {
      console.error("Failed to load items catalog", err);
    }
  };

  useEffect(() => {
    fetchQuests();
    fetchItems();
  }, []);

  const resetForm = () => {
    setEditingQuestId(null);
    setQuestId("");
    setQuestName("");
    setDescription("");
    setNPCName("");
    setWeight(1);
    setNextQuestId("");
    setRewardItemId("");
    setRewardQuantity(1);
    setStatus("active");
    setStatusOpen(false);
    setQuestExistingImages([]);
    setQuestImageFiles([]);
    setQuestImagePreviews([]);
    setObjectives([]);
    setError("");
  };

  const handleEdit = (quest: Quest) => {
    const normalizedStatus =
      (quest.status || "active").toLowerCase() === "inactive"
        ? "inactive"
        : "active";

    setEditingQuestId(quest.questId || null);
    setQuestId(quest.questId || "");
    setQuestName(quest.questName || "");
    setDescription(quest.description || "");
    setNPCName(quest.NPCName || "");
    setWeight(Number(quest.Weight) || 1);
    setNextQuestId(quest.nextQuestId || "");
    setRewardItemId(quest.reward?.itemId || "");
    setRewardQuantity(Number(quest.reward?.quantity) || 1);
    setStatus(normalizedStatus);
    setStatusOpen(false);
    setQuestExistingImages(
      Array.isArray(quest.imageUrls) ? quest.imageUrls : [],
    );
    setQuestImageFiles([]);
    setQuestImagePreviews([]);
    setObjectives(
      Array.isArray(quest.objectives) && quest.objectives.length > 0
        ? quest.objectives.map((objective) => ({
            objectiveId: objective.objectiveId || "",
            description: objective.description || "",
            itemId: objective.itemId || "",
            requiredAmount: Number(objective.requiredAmount) || 0,
            currentAmount: Number(objective.currentAmount) || 0,
          }))
        : [],
    );
    setError("");
    setIsModalOpen(true);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const updateObjective = (
    index: number,
    key: keyof QuestObjective,
    value: string,
  ) => {
    setObjectives((prev) =>
      prev.map((objective, i) => {
        if (i !== index) return objective;
        if (key === "requiredAmount" || key === "currentAmount") {
          return {
            ...objective,
            [key]: Number(value) || 0,
          };
        }
        return {
          ...objective,
          [key]: value,
        };
      }),
    );
  };

  const addObjective = () => {
    setObjectives((prev) => [...prev, emptyObjective()]);
  };

  const removeObjective = (index: number) => {
    setObjectives((prev) => prev.filter((_, i) => i !== index));
  };

  const buildCreatePayload = async () => {
    // Upload new quest images then merge with existing ones
    const uploadedNewImages = await Promise.all(
      questImageFiles.map((file) => uploadQuestImage(file)),
    );
    const allImages = [...questExistingImages, ...uploadedNewImages];

    const payload: any = {
      questId: questId.trim(),
      questName: questName.trim(),
      description: description.trim(),
      NPCName: NPCName.trim(),
      Weight: Number(Weight) || 0,
      reward: {
        itemId: rewardItemId.trim(),
        quantity: Number(rewardQuantity) || 0,
      },
    };

    if (nextQuestId.trim()) payload.nextQuestId = nextQuestId.trim();
    if (status.trim()) payload.status = status.trim();
    if (allImages.length > 0) payload.imageUrls = allImages;

    const cleanedObjectives = objectives
      .map((objective) => ({
        objectiveId: objective.objectiveId?.trim() || undefined,
        description: objective.description?.trim() || undefined,
        itemId: objective.itemId?.trim() || undefined,
        requiredAmount: Number(objective.requiredAmount) || 0,
        currentAmount: Number(objective.currentAmount) || 0,
      }))
      .filter(
        (objective) =>
          objective.objectiveId || objective.description || objective.itemId,
      );

    if (cleanedObjectives.length > 0) {
      payload.objectives = cleanedObjectives;
    }

    return payload;
  };

  const buildUpdatePayload = async () => {
    // Upload new quest images then merge with existing ones
    const uploadedNewImages = await Promise.all(
      questImageFiles.map((file) => uploadQuestImage(file)),
    );
    const allImages = [...questExistingImages, ...uploadedNewImages];

    const payload: any = {};

    if (questName.trim()) payload.questName = questName.trim();
    if (description.trim()) payload.description = description.trim();
    if (NPCName.trim()) payload.NPCName = NPCName.trim();
    payload.Weight = Number(Weight) || 0;
    if (nextQuestId.trim()) payload.nextQuestId = nextQuestId.trim();
    if (status.trim()) payload.status = status.trim();
    if (allImages.length > 0) payload.imageUrls = allImages;

    if (rewardItemId.trim() || rewardQuantity > 0) {
      payload.reward = {
        ...(rewardItemId.trim() ? { itemId: rewardItemId.trim() } : {}),
        ...(rewardQuantity > 0 ? { quantity: Number(rewardQuantity) } : {}),
      };
    }

    const cleanedObjectives = objectives
      .map((objective) => ({
        ...(objective.objectiveId?.trim()
          ? { objectiveId: objective.objectiveId.trim() }
          : {}),
        ...(objective.description?.trim()
          ? { description: objective.description.trim() }
          : {}),
        ...(objective.itemId?.trim()
          ? { itemId: objective.itemId.trim() }
          : {}),
        ...(objective.requiredAmount !== undefined
          ? { requiredAmount: Number(objective.requiredAmount) || 0 }
          : {}),
        ...(objective.currentAmount !== undefined
          ? { currentAmount: Number(objective.currentAmount) || 0 }
          : {}),
      }))
      .filter((objective) => Object.keys(objective).length > 0);

    if (cleanedObjectives.length > 0) {
      payload.objectives = cleanedObjectives;
    }

    return payload;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!editingQuestId) {
      if (
        !questId.trim() ||
        !questName.trim() ||
        !description.trim() ||
        !NPCName.trim() ||
        !rewardItemId.trim()
      ) {
        setError("Please fill all required fields for create quest.");
        return;
      }
    }

    try {
      setSaving(true);
      if (editingQuestId) {
        const updatePayload = await buildUpdatePayload();
        await questApi.updateQuest(editingQuestId, updatePayload);
        await Swal.fire({
          toast: true,
          icon: "success",
          title: "Quest updated",
          position: "top-end",
          showConfirmButton: false,
          timer: 1800,
        });
      } else {
        const createPayload = await buildCreatePayload();
        await questApi.createQuest(createPayload);
        await Swal.fire({
          toast: true,
          icon: "success",
          title: "Quest created",
          position: "top-end",
          showConfirmButton: false,
          timer: 1800,
        });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchQuests();
    } catch (err) {
      console.error("Save quest failed", err);
      setError("Failed to save quest. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete quest?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      await questApi.deleteQuest(id);
      setQuests((prev) => prev.filter((quest) => (quest.questId || "") !== id));
      if (editingQuestId === id) {
        resetForm();
      }
      await Swal.fire({
        toast: true,
        icon: "success",
        title: "Quest deleted",
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (err) {
      console.error("Delete quest failed", err);
      Swal.fire("Error", "Failed to delete quest.", "error");
    }
  };

  const filteredQuests = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return quests;

    return quests.filter((quest) => {
      const id = (quest.questId || "").toLowerCase();
      const name = (quest.questName || "").toLowerCase();
      const npc = (quest.NPCName || "").toLowerCase();
      const statusValue = (quest.status || "").toLowerCase();
      return (
        id.includes(term) ||
        name.includes(term) ||
        npc.includes(term) ||
        statusValue.includes(term)
      );
    });
  }, [quests, search]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Quest management</h1>
        <Button onClick={openCreate}>+ New Quest</Button>
      </header>

      <div>
        <Card className="overflow-hidden">
          <CardHeader className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg text-white">
                  Quest catalog
                </CardTitle>
                <p className="text-sm text-slate-400">
                  {quests.length} quest(s) loaded.
                </p>
              </div>
              <Input
                className="max-w-xs"
                placeholder="Search quest..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="divide-y divide-slate-800">
            {loading ? (
              <div className="p-6 text-sm text-slate-400">
                Loading quests...
              </div>
            ) : filteredQuests.length === 0 ? (
              <div className="p-6 text-sm text-slate-400">No quests found.</div>
            ) : (
              filteredQuests.map((quest) => {
                const id = quest.questId || "";
                return (
                  <div
                    key={id || quest._id || quest.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-lg shadow-slate-950/20"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      {/* Image + Info */}
                      <div className="flex gap-4 flex-1 min-w-0">
                        {/* First image */}
                        {quest.imageUrls && quest.imageUrls.length > 0 && (
                          <img
                            src={quest.imageUrls[0]}
                            alt={quest.questName || "quest"}
                            className="h-20 w-20 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                        )}

                        {/* Info */}
                        <div className="space-y-1.5 min-w-0">
                          <p className="text-white text-lg font-semibold truncate">
                            <span className="text-slate-400 text-sm font-normal">
                              Quest Name:{" "}
                            </span>
                            {quest.questName || "Unnamed quest"}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            <span className="uppercase tracking-[0.2em]">
                              Quest ID:{" "}
                            </span>
                            {id || "No questId"}
                          </p>
                          <p className="text-sm text-slate-300 line-clamp-2">
                            <span className="text-slate-400">
                              Description:{" "}
                            </span>
                            {quest.description || "-"}
                          </p>
                          <p className="text-sm text-slate-300">
                            <span className="text-slate-400">NPC: </span>
                            {quest.NPCName || "-"}
                          </p>
                          <p className="text-sm text-slate-300">
                            <span className="text-slate-400">Status: </span>
                            {quest.status || "-"}
                            <span className="mx-2 text-slate-600">|</span>
                            <span className="text-slate-400">Weight: </span>
                            {quest.Weight ?? "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(quest)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(id)}
                          disabled={!id}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
          <Card className="my-8 flex w-full max-w-3xl flex-col border border-slate-800 bg-slate-950">
            <CardHeader className="shrink-0 border-b border-slate-800">
              <CardTitle className="text-lg text-white">
                {editingQuestId ? "Edit quest" : "Create quest"}
              </CardTitle>
            </CardHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">
                    Quest ID
                  </label>
                  <Input
                    placeholder="q_001"
                    value={questId}
                    onChange={(e) => setQuestId(e.target.value)}
                    disabled={Boolean(editingQuestId)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">
                    Quest Name
                  </label>
                  <Input
                    placeholder="Sample Quest"
                    value={questName}
                    onChange={(e) => setQuestName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">
                    Description
                  </label>
                  <Input
                    placeholder="A sample quest description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">
                    NPC Name
                  </label>
                  <Input
                    placeholder="NPC Name"
                    value={NPCName}
                    onChange={(e) => setNPCName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">
                      Weight
                    </label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={Weight}
                      onChange={(e) => setWeight(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">
                      Status
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setStatusOpen((open) => !open)}
                        className="flex min-h-[2.25rem] w-full items-center justify-between rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors hover:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                      >
                        <span className="capitalize">{status}</span>
                        <span className="text-slate-500">▾</span>
                      </button>

                      {statusOpen && (
                        <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-xl">
                          {[
                            { value: "active", label: "active" },
                            { value: "inactive", label: "inactive" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-slate-900"
                              onClick={() => {
                                setStatus(option.value);
                                setStatusOpen(false);
                              }}
                            >
                              <span className="capitalize">{option.label}</span>
                              {status === option.value ? (
                                <span className="text-emerald-300">✓</span>
                              ) : null}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">
                    Next Quest ID
                  </label>
                  <Input
                    placeholder="q_002"
                    value={nextQuestId}
                    onChange={(e) => setNextQuestId(e.target.value)}
                  />
                </div>

                {/* Quest Images */}
                <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Quest Images
                  </h3>

                  {/* Existing images */}
                  {questExistingImages.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {questExistingImages.map((url, idx) => (
                        <div key={`exist-img-${idx}`} className="relative">
                          <img
                            src={url}
                            alt={`quest-img-${idx}`}
                            className="h-24 w-24 rounded-lg border border-slate-700 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setQuestExistingImages((prev) =>
                                prev.filter((_, i) => i !== idx),
                              )
                            }
                            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white hover:bg-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New image previews */}
                  {questImagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {questImagePreviews.map((preview, idx) => (
                        <div key={`new-img-${idx}`} className="relative">
                          <img
                            src={preview}
                            alt={`new-img-${idx}`}
                            className="h-24 w-24 rounded-lg border border-emerald-700 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setQuestImageFiles((prev) =>
                                prev.filter((_, i) => i !== idx),
                              );
                              setQuestImagePreviews((prev) =>
                                prev.filter((_, i) => i !== idx),
                              );
                            }}
                            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white hover:bg-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add images button */}
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-600 p-3 text-sm text-slate-400 transition-colors hover:border-emerald-500 hover:text-emerald-400">
                    <span>+ Add images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (!files.length) return;
                        const previews = files.map((f) =>
                          URL.createObjectURL(f),
                        );
                        setQuestImageFiles((prev) => [...prev, ...files]);
                        setQuestImagePreviews((prev) => [...prev, ...previews]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">
                      Reward Item
                    </label>
                    <ItemPicker
                      items={catalogItems}
                      value={rewardItemId}
                      onChange={(itemId) => setRewardItemId(itemId)}
                      placeholder="Select reward item..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">
                      Reward Quantity
                    </label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={rewardQuantity}
                      onChange={(e) =>
                        setRewardQuantity(Number(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2 rounded-md border border-slate-800 bg-slate-900/60 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-200">
                      Objectives
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addObjective}
                    >
                      + Add objective
                    </Button>
                  </div>

                  {objectives.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      No objectives added.
                    </p>
                  ) : (
                    objectives.map((objective, index) => (
                      <div
                        key={`objective-${index}`}
                        className="space-y-2 rounded-md border border-slate-800 bg-slate-950 p-2"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300">
                              Objective ID
                            </label>
                            <Input
                              placeholder="q001_ob001"
                              value={objective.objectiveId || ""}
                              onChange={(e) =>
                                updateObjective(
                                  index,
                                  "objectiveId",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300">
                              Item ID
                            </label>
                            <ItemPicker
                              items={catalogItems}
                              value={objective.itemId || ""}
                              onChange={(itemId) =>
                                updateObjective(index, "itemId", itemId)
                              }
                              placeholder="Select item..."
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-300">
                            Description
                          </label>
                          <Input
                            placeholder="Collect items"
                            value={objective.description || ""}
                            onChange={(e) =>
                              updateObjective(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300">
                              Required Amount
                            </label>
                            <Input
                              type="number"
                              placeholder="5"
                              value={objective.requiredAmount || 0}
                              onChange={(e) =>
                                updateObjective(
                                  index,
                                  "requiredAmount",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-300">
                              Current Amount
                            </label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={objective.currentAmount || 0}
                              onChange={(e) =>
                                updateObjective(
                                  index,
                                  "currentAmount",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeObjective(index)}
                        >
                          Remove objective
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <div className="flex flex-wrap gap-2">
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
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? "Saving..."
                      : editingQuestId
                        ? "Update Quest"
                        : "Create Quest"}
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

export default AdminQuestManager;
