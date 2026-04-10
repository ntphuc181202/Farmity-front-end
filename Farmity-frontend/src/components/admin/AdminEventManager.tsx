import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Swal from "sweetalert2";
import eventApi from "../../api/eventApi";
import mediaApi from "../../api/mediaApi";
import itemApi from "../../api/itemApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const RECIPE_TYPE_LABELS: Record<number, string> = {
  0: "Default",
};

const RECIPE_CATEGORY_LABELS: Record<number, string> = {
  0: "General",
  1: "Tool",
  2: "Food",
  3: "Materials",
  4: "Furniture",
  5: "Equipment",
};

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

const TOOL_TYPE_LABELS: Record<number, string> = {
  0: "Hoe",
  1: "WateringCan",
  2: "Pickaxe",
  3: "Axe",
  4: "FishingRod",
};

type EventIngredient = {
  itemId: string;
  quantity: number;
};

type CrossResult = {
  targetPlantId: string;
  resultPlantId: string;
};

type EventRecipe = {
  recipeID: string;
  recipeName: string;
  description: string;
  recipeType: number;
  category: number;
  recipeLevel: number;
  resultItemId: string;
  resultQuantity: number;
  resultQuality: number;
  isUnlockedByDefault: boolean;
  ingredients: EventIngredient[];
  products: EventIngredient[];
  status: string;
};

type EventItem = {
  itemID: string;
  itemName: string;
  description: string;
  iconUrl?: string;
  iconFile?: File | null;
  iconPreview?: string;
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
  npcPreferenceNames: string[];
  npcPreferenceReactions: number[];
  energyRestore: number;
  healthRestore: number;
  status: string;
  toolType?: number;
  toolLevel?: number;
  toolPower?: number;
  toolMaterialId?: string;
  plantId?: string;
  sourcePlantId?: string;
  pollinationSuccessChance?: number;
  viabilityDays?: number;
  crossResults?: CrossResult[];
  bufferDuration?: number;
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
};

type CatalogItem = {
  itemID: string;
  itemName: string;
  iconUrl?: string;
};

type EventDoc = {
  _id?: string;
  id?: string;
  eventId?: string;
  eventName?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  imageUrls?: string[];
  recipes?: EventRecipe[];
  items?: EventItem[];
};

const emptyIngredient = (): EventIngredient => ({
  itemId: "",
  quantity: 1,
});

const emptyEventRecipe = (): EventRecipe => ({
  recipeID: "",
  recipeName: "",
  description: "",
  recipeType: 0,
  category: 0,
  recipeLevel: 1,
  resultItemId: "",
  resultQuantity: 1,
  resultQuality: 0,
  isUnlockedByDefault: false,
  ingredients: [],
  products: [],
  status: "active",
});

const emptyEventItem = (): EventItem => ({
  itemID: "",
  itemName: "",
  description: "",
  iconUrl: "",
  iconFile: null,
  iconPreview: "",
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
  npcPreferenceNames: [],
  npcPreferenceReactions: [],
  energyRestore: 0,
  healthRestore: 0,
  status: "active",
  crossResults: [],
  fishingSeasons: [],
  foragingSeasons: [],
});

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
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-slate-800 ${item.itemID === value ? "bg-emerald-500/10 text-emerald-300" : "text-slate-50"}`}
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

function extractEventArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  const keys = [
    "data",
    "items",
    "catalog",
    "events",
    "results",
    "eventList",
    "event_list",
  ];

  for (const key of keys) {
    if (Array.isArray((data as any)[key])) return (data as any)[key];
  }

  // Handle nested wrappers like { data: { events: [...] } }
  for (const key of keys) {
    const nested = (data as any)[key];
    if (nested && typeof nested === "object") {
      const arr = extractEventArray(nested);
      if (arr.length > 0) return arr;
    }
  }

  return [];
}

function normalizeEventDoc(input: any): EventDoc {
  const imageUrls =
    (Array.isArray(input?.imageUrls) && input.imageUrls) ||
    (Array.isArray(input?.imageURLs) && input.imageURLs) ||
    (Array.isArray(input?.images) && input.images) ||
    [];

  const recipes =
    (Array.isArray(input?.recipes) && input.recipes) ||
    (Array.isArray(input?.eventRecipes) && input.eventRecipes) ||
    (Array.isArray(input?.event_recipes) && input.event_recipes) ||
    [];

  const items =
    (Array.isArray(input?.items) && input.items) ||
    (Array.isArray(input?.eventItems) && input.eventItems) ||
    (Array.isArray(input?.event_items) && input.event_items) ||
    [];

  return {
    _id: input?._id,
    id: input?.id,
    eventId: String(
      input?.eventId ||
        input?.eventID ||
        input?.event_id ||
        input?.eventCode ||
        input?.slug ||
        "",
    ),
    eventName: String(input?.eventName || input?.name || ""),
    description: String(input?.description || input?.desc || ""),
    startTime: input?.startTime || input?.startDate || input?.startAt,
    endTime: input?.endTime || input?.endDate || input?.endAt,
    status: input?.status,
    imageUrls,
    recipes,
    items,
  };
}

function toDateTimeInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (input: number) => String(input).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoString(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function dedupeByKey<T extends Record<string, any>>(
  list: T[],
  key: keyof T,
): T[] {
  const map = new Map<string, T>();
  list.forEach((item) => {
    const raw = item[key];
    const id = typeof raw === "string" ? raw.trim() : String(raw ?? "");
    if (!id) return;
    map.set(id, item);
  });
  return Array.from(map.values());
}

function AdminEventManager() {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [eventId, setEventId] = useState("");
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("active");
  const [eventExistingImages, setEventExistingImages] = useState<string[]>([]);
  const [eventImageFiles, setEventImageFiles] = useState<File[]>([]);
  const [eventImagePreviews, setEventImagePreviews] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<EventRecipe[]>([]);
  const [items, setItems] = useState<EventItem[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);

  const eventCreatedItems = useMemo(() => {
    return items
      .map((item): CatalogItem | null => {
        const itemID = item.itemID.trim();
        const itemName = item.itemName.trim();
        if (!itemID || !itemName) return null;
        return {
          itemID,
          itemName,
          iconUrl: item.iconPreview || item.iconUrl || undefined,
        };
      })
      .filter((item): item is CatalogItem => Boolean(item));
  }, [items]);

  const recipeSelectableItems = useMemo(() => {
    const map = new Map<string, CatalogItem>();

    catalogItems.forEach((item) => {
      if (!item.itemID) return;
      map.set(item.itemID, item);
    });

    eventCreatedItems.forEach((item) => {
      map.set(item.itemID, item);
    });

    return Array.from(map.values());
  }, [catalogItems, eventCreatedItems]);

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await eventApi.getAllEvents();
      let list = extractEventArray(res?.data).map((event) =>
        normalizeEventDoc(event),
      );

      // Fallback for single-object response
      if (list.length === 0) {
        const single = normalizeEventDoc(res?.data?.data || res?.data);
        if (single.eventId || single.eventName) list = [single];
      }

      setEvents(list);
    } catch (err) {
      console.error("Failed to load events", err);
      setError("Unable to load events. Please try again.");
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
    fetchEvents();
    fetchItems();
  }, []);

  const resetForm = () => {
    setEditingEventId(null);
    setEventId("");
    setEventName("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setStatus("active");
    setEventExistingImages([]);
    setEventImageFiles([]);
    setEventImagePreviews([]);
    setRecipes([]);
    setItems([]);
    setError("");
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (event: EventDoc) => {
    setEditingEventId(event.eventId || null);
    setEventId(event.eventId || "");
    setEventName(event.eventName || "");
    setDescription(event.description || "");
    setStartTime(toDateTimeInput(event.startTime));
    setEndTime(toDateTimeInput(event.endTime));
    setStatus(
      (event.status || "active").toLowerCase() === "inactive"
        ? "inactive"
        : "active",
    );
    setEventExistingImages(
      Array.isArray(event.imageUrls) ? event.imageUrls : [],
    );
    setEventImageFiles([]);
    setEventImagePreviews([]);
    setRecipes(
      Array.isArray(event.recipes)
        ? event.recipes.map((recipe) => ({
            recipeID: recipe.recipeID || "",
            recipeName: recipe.recipeName || "",
            description: recipe.description || "",
            recipeType: Number((recipe as any).recipeType) || 0,
            category: Number(recipe.category) || 0,
            recipeLevel: Number((recipe as any).recipeLevel) || 1,
            resultItemId: recipe.resultItemId || "",
            resultQuantity: Number(recipe.resultQuantity) || 1,
            resultQuality: Number((recipe as any).resultQuality) || 0,
            isUnlockedByDefault: Boolean((recipe as any).isUnlockedByDefault),
            ingredients: Array.isArray((recipe as any).defaultIngredients)
              ? (recipe as any).defaultIngredients.map((ingredient: any) => ({
                  itemId: ingredient.itemId || "",
                  quantity: Number(ingredient.quantity) || 1,
                }))
              : Array.isArray(recipe.ingredients)
                ? recipe.ingredients.map((ingredient) => ({
                    itemId: ingredient.itemId || "",
                    quantity: Number(ingredient.quantity) || 1,
                  }))
                : [],
            products: Array.isArray((recipe as any).eventIngredients)
              ? (recipe as any).eventIngredients.map((product: any) => ({
                  itemId: product.itemId || "",
                  quantity: Number(product.quantity) || 1,
                }))
              : Array.isArray((recipe as any).products)
                ? (recipe as any).products.map((product: any) => ({
                    itemId: product.itemId || "",
                    quantity: Number(product.quantity) || 1,
                  }))
                : [],
            status:
              ((recipe as any).status || "active").toLowerCase() === "inactive"
                ? "inactive"
                : "active",
          }))
        : [],
    );
    setItems(
      Array.isArray(event.items)
        ? event.items.map((item) => ({
            itemID: item.itemID || "",
            itemName: item.itemName || "",
            description: item.description || "",
            iconUrl: item.iconUrl || "",
            iconFile: null,
            iconPreview: item.iconUrl || "",
            itemType: Number(item.itemType) || 0,
            itemCategory: Number(item.itemCategory) || 0,
            maxStack: Number(item.maxStack) || 1,
            isStackable: Boolean(item.isStackable),
            basePrice: Number(item.basePrice) || 0,
            buyPrice: Number(item.buyPrice) || 0,
            canBeSold: item.canBeSold ?? true,
            canBeBought: item.canBeBought ?? false,
            isQuestItem: Boolean(item.isQuestItem),
            isArtifact: Boolean(item.isArtifact),
            isRareItem: Boolean(item.isRareItem),
            npcPreferenceNames: Array.isArray((item as any).npcPreferenceNames)
              ? (item as any).npcPreferenceNames.map((name: any) =>
                  String(name || ""),
                )
              : [],
            npcPreferenceReactions: Array.isArray(
              (item as any).npcPreferenceReactions,
            )
              ? (item as any).npcPreferenceReactions.map(
                  (reaction: any) => Number(reaction) || 0,
                )
              : [],
            energyRestore:
              Number((item as any).energyRestore) ||
              Number((item as any).viableRestore) ||
              0,
            healthRestore: Number((item as any).healthRestore) || 0,
            status:
              ((item as any).status || "active").toLowerCase() === "inactive"
                ? "inactive"
                : "active",
            toolType: (item as any).toolType,
            toolLevel: (item as any).toolLevel,
            toolPower: (item as any).toolPower,
            toolMaterialId: (item as any).toolMaterialId || "",
            plantId: (item as any).plantId || "",
            sourcePlantId: (item as any).sourcePlantId || "",
            pollinationSuccessChance: (item as any).pollinationSuccessChance,
            viabilityDays: (item as any).viabilityDays,
            crossResults: Array.isArray((item as any).crossResults)
              ? (item as any).crossResults
              : [],
            bufferDuration: (item as any).bufferDuration,
            damage: (item as any).damage,
            critChance: (item as any).critChance,
            weaponMaterialId: (item as any).weaponMaterialId || "",
            weaponType: (item as any).weaponType,
            tier: (item as any).tier,
            attackCooldown: (item as any).attackCooldown,
            knockbackForce: (item as any).knockbackForce,
            projectileSpeed: (item as any).projectileSpeed,
            projectileRange: (item as any).projectileRange,
            projectileKnockback: (item as any).projectileKnockback,
            linkedSkillId: (item as any).linkedSkillId || "",
            difficulty: (item as any).difficulty,
            fishingSeasons: Array.isArray((item as any).fishingSeasons)
              ? (item as any).fishingSeasons.map(
                  (value: any) => Number(value) || 0,
                )
              : [],
            isLegendary: Boolean((item as any).isLegendary),
            foragingSeasons: Array.isArray((item as any).foragingSeasons)
              ? (item as any).foragingSeasons.map(
                  (value: any) => Number(value) || 0,
                )
              : [],
            isOre: Boolean((item as any).isOre),
            requiresSmelting: Boolean((item as any).requiresSmelting),
            smeltedResultId: (item as any).smeltedResultId || "",
            isUniversalLike: Boolean((item as any).isUniversalLike),
            isUniversalLove: Boolean((item as any).isUniversalLove),
            relatedQuestID: (item as any).relatedQuestID || "",
            autoConsume: Boolean((item as any).autoConsume),
          }))
        : [],
    );
    setError("");
    setIsModalOpen(true);
  };

  const setRecipeField = <K extends keyof EventRecipe>(
    index: number,
    key: K,
    value: EventRecipe[K],
  ) => {
    setRecipes((prev) =>
      prev.map((recipe, recipeIndex) =>
        recipeIndex === index ? { ...recipe, [key]: value } : recipe,
      ),
    );
  };

  const setItemField = <K extends keyof EventItem>(
    index: number,
    key: K,
    value: EventItem[K],
  ) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  };

  const handleEventItemIconPick = (
    index: number,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              iconFile: file,
              iconPreview: preview,
            }
          : item,
      ),
    );
  };

  const uploadEventImage = async (file: File) => {
    const { data } = await mediaApi.uploadSignature({ folder: "events" });
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

  const uploadEventItemIcon = async (file: File) => {
    const { data } = await mediaApi.uploadSignature({ folder: "event-items" });
    const { cloudName, apiKey, timestamp, signature, folder } = data;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const result = await uploadRes.json();
    return result.secure_url as string;
  };

  const addRecipe = () => setRecipes((prev) => [...prev, emptyEventRecipe()]);
  const removeRecipe = (index: number) =>
    setRecipes((prev) =>
      prev.filter((_, recipeIndex) => recipeIndex !== index),
    );
  const addItem = () => setItems((prev) => [...prev, emptyEventItem()]);
  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  const addIngredient = (recipeIndex: number) => {
    setRecipes((prev) =>
      prev.map((recipe, index) =>
        index === recipeIndex
          ? {
              ...recipe,
              ingredients: [...recipe.ingredients, emptyIngredient()],
            }
          : recipe,
      ),
    );
  };
  const removeIngredient = (recipeIndex: number, ingredientIndex: number) => {
    setRecipes((prev) =>
      prev.map((recipe, index) =>
        index === recipeIndex
          ? {
              ...recipe,
              ingredients: recipe.ingredients.filter(
                (_, index2) => index2 !== ingredientIndex,
              ),
            }
          : recipe,
      ),
    );
  };
  const addProduct = (recipeIndex: number) => {
    setRecipes((prev) =>
      prev.map((recipe, index) =>
        index === recipeIndex
          ? { ...recipe, products: [...recipe.products, emptyIngredient()] }
          : recipe,
      ),
    );
  };
  const removeProduct = (recipeIndex: number, productIndex: number) => {
    setRecipes((prev) =>
      prev.map((recipe, index) =>
        index === recipeIndex
          ? {
              ...recipe,
              products: recipe.products.filter(
                (_, index2) => index2 !== productIndex,
              ),
            }
          : recipe,
      ),
    );
  };
  const setIngredientField = (
    recipeIndex: number,
    ingredientIndex: number,
    key: keyof EventIngredient,
    value: string,
  ) => {
    setRecipes((prev) =>
      prev.map((recipe, index) => {
        if (index !== recipeIndex) return recipe;
        return {
          ...recipe,
          ingredients: recipe.ingredients.map((ingredient, index2) => {
            if (index2 !== ingredientIndex) return ingredient;
            return {
              ...ingredient,
              [key]: key === "quantity" ? Number(value) || 0 : value,
            };
          }),
        };
      }),
    );
  };
  const setProductField = (
    recipeIndex: number,
    productIndex: number,
    key: keyof EventIngredient,
    value: string,
  ) => {
    setRecipes((prev) =>
      prev.map((recipe, index) => {
        if (index !== recipeIndex) return recipe;
        return {
          ...recipe,
          products: recipe.products.map((product, index2) => {
            if (index2 !== productIndex) return product;
            return {
              ...product,
              [key]: key === "quantity" ? Number(value) || 0 : value,
            };
          }),
        };
      }),
    );
  };
  const addNpcPreference = (itemIndex: number) => {
    setItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              npcPreferenceNames: [...item.npcPreferenceNames, ""],
              npcPreferenceReactions: [...item.npcPreferenceReactions, 0],
            }
          : item,
      ),
    );
  };
  const removeNpcPreference = (itemIndex: number, preferenceIndex: number) => {
    setItems((prev) =>
      prev.map((item, index) => {
        if (index !== itemIndex) return item;
        return {
          ...item,
          npcPreferenceNames: item.npcPreferenceNames.filter(
            (_, index2) => index2 !== preferenceIndex,
          ),
          npcPreferenceReactions: item.npcPreferenceReactions.filter(
            (_, index2) => index2 !== preferenceIndex,
          ),
        };
      }),
    );
  };
  const setNpcPreferenceName = (
    itemIndex: number,
    preferenceIndex: number,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item, index) => {
        if (index !== itemIndex) return item;
        return {
          ...item,
          npcPreferenceNames: item.npcPreferenceNames.map((name, index2) =>
            index2 === preferenceIndex ? value : name,
          ),
        };
      }),
    );
  };
  const setNpcPreferenceReaction = (
    itemIndex: number,
    preferenceIndex: number,
    value: number,
  ) => {
    setItems((prev) =>
      prev.map((item, index) => {
        if (index !== itemIndex) return item;
        return {
          ...item,
          npcPreferenceReactions: item.npcPreferenceReactions.map(
            (reaction, index2) =>
              index2 === preferenceIndex ? value : reaction,
          ),
        };
      }),
    );
  };

  const addCrossResult = (itemIndex: number) => {
    setItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              crossResults: [
                ...(item.crossResults || []),
                { targetPlantId: "", resultPlantId: "" },
              ],
            }
          : item,
      ),
    );
  };

  const removeCrossResult = (itemIndex: number, crossIndex: number) => {
    setItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              crossResults: (item.crossResults || []).filter(
                (_, i) => i !== crossIndex,
              ),
            }
          : item,
      ),
    );
  };

  const setCrossResultField = (
    itemIndex: number,
    crossIndex: number,
    key: keyof CrossResult,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item, index) => {
        if (index !== itemIndex) return item;
        return {
          ...item,
          crossResults: (item.crossResults || []).map((cross, index2) =>
            index2 === crossIndex ? { ...cross, [key]: value } : cross,
          ),
        };
      }),
    );
  };

  const setSeasonList = (
    itemIndex: number,
    key: "fishingSeasons" | "foragingSeasons",
    raw: string,
  ) => {
    const values = raw
      .split(",")
      .map((token) => Number(token.trim()))
      .filter((num) => !Number.isNaN(num));

    setItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex ? { ...item, [key]: values } : item,
      ),
    );
  };

  const appendIfDefined = (target: any, key: keyof EventItem, value: any) => {
    if (value !== undefined && value !== null && value !== "") {
      target[key] = value;
    }
  };

  const buildPayload = async () => {
    const payload: any = {
      eventName: eventName.trim(),
      description: description.trim(),
      startTime: toIsoString(startTime),
      endTime: toIsoString(endTime),
      status,
    };

    if (!editingEventId) {
      payload.eventId = eventId.trim();
    }

    // Upload new event images then merge with existing ones
    const uploadedNewImages = await Promise.all(
      eventImageFiles.map((file) => uploadEventImage(file)),
    );
    const allImages = [...eventExistingImages, ...uploadedNewImages];
    if (allImages.length > 0) payload.imageUrls = allImages;

    const cleanedRecipes = recipes
      .map((recipe) => {
        const defaultIngredients = recipe.ingredients
          .map((ingredient) => ({
            itemId: ingredient.itemId.trim(),
            quantity: Number(ingredient.quantity) || 1,
          }))
          .filter((ingredient) => ingredient.itemId);

        const eventIngredients = recipe.products
          .map((product) => ({
            itemId: product.itemId.trim(),
            quantity: Number(product.quantity) || 1,
          }))
          .filter((product) => product.itemId);

        return {
          recipeID: recipe.recipeID.trim(),
          recipeName: recipe.recipeName.trim(),
          description: recipe.description.trim(),
          recipeType: Number(recipe.recipeType) || 0,
          category: Number(recipe.category) || 0,
          recipeLevel: Number(recipe.recipeLevel) || 1,
          resultItemId: recipe.resultItemId.trim(),
          resultQuantity: Number(recipe.resultQuantity) || 1,
          resultQuality: Number(recipe.resultQuality) || 0,
          isUnlockedByDefault: Boolean(recipe.isUnlockedByDefault),
          defaultIngredients,
          eventIngredients,
          status: recipe.status,
        };
      })
      .filter((recipe) => recipe.recipeID && recipe.recipeName);

    const cleanedItems = await Promise.all(
      items.map(async (item) => {
        let uploadedIconUrl = item.iconUrl?.trim() || "";

        if (item.iconFile) {
          uploadedIconUrl = await uploadEventItemIcon(item.iconFile);
        }

        const payloadItem: any = {
          itemID: item.itemID.trim(),
          itemName: item.itemName.trim(),
          description: item.description.trim(),
          ...(uploadedIconUrl ? { iconUrl: uploadedIconUrl } : {}),
          itemType: Number(item.itemType) || 0,
          itemCategory: Number(item.itemCategory) || 0,
          maxStack: Number(item.maxStack) || 1,
          isStackable: Boolean(item.isStackable),
          basePrice: Number(item.basePrice) || 0,
          buyPrice: Number(item.buyPrice) || 0,
          canBeSold: Boolean(item.canBeSold),
          canBeBought: Boolean(item.canBeBought),
          isQuestItem: Boolean(item.isQuestItem),
          isArtifact: Boolean(item.isArtifact),
          isRareItem: Boolean(item.isRareItem),
          npcPreferenceNames: item.npcPreferenceNames
            .map((name) => name.trim())
            .filter(Boolean),
          npcPreferenceReactions: item.npcPreferenceNames
            .map((name, index) => ({
              name: name.trim(),
              reaction: Number(item.npcPreferenceReactions[index]) || 0,
            }))
            .filter((entry) => entry.name)
            .map((entry) => entry.reaction),
          viableRestore: Number(item.energyRestore) || 0,
          energyRestore: Number(item.energyRestore) || 0,
          healthRestore: Number(item.healthRestore) || 0,
          status: item.status,
        };

        appendIfDefined(payloadItem, "toolType", item.toolType);
        appendIfDefined(payloadItem, "toolLevel", item.toolLevel);
        appendIfDefined(payloadItem, "toolPower", item.toolPower);
        appendIfDefined(
          payloadItem,
          "toolMaterialId",
          item.toolMaterialId?.trim(),
        );
        appendIfDefined(payloadItem, "plantId", item.plantId?.trim());
        appendIfDefined(
          payloadItem,
          "sourcePlantId",
          item.sourcePlantId?.trim(),
        );
        appendIfDefined(
          payloadItem,
          "pollinationSuccessChance",
          item.pollinationSuccessChance,
        );
        appendIfDefined(payloadItem, "viabilityDays", item.viabilityDays);
        if (item.crossResults && item.crossResults.length > 0) {
          payloadItem.crossResults = item.crossResults.filter(
            (cross) =>
              cross.targetPlantId?.trim() && cross.resultPlantId?.trim(),
          );
        }
        appendIfDefined(payloadItem, "bufferDuration", item.bufferDuration);
        appendIfDefined(payloadItem, "damage", item.damage);
        appendIfDefined(payloadItem, "critChance", item.critChance);
        appendIfDefined(
          payloadItem,
          "weaponMaterialId",
          item.weaponMaterialId?.trim(),
        );
        appendIfDefined(payloadItem, "weaponType", item.weaponType);
        appendIfDefined(payloadItem, "tier", item.tier);
        appendIfDefined(payloadItem, "attackCooldown", item.attackCooldown);
        appendIfDefined(payloadItem, "knockbackForce", item.knockbackForce);
        appendIfDefined(payloadItem, "projectileSpeed", item.projectileSpeed);
        appendIfDefined(payloadItem, "projectileRange", item.projectileRange);
        appendIfDefined(
          payloadItem,
          "projectileKnockback",
          item.projectileKnockback,
        );
        appendIfDefined(
          payloadItem,
          "linkedSkillId",
          item.linkedSkillId?.trim(),
        );
        appendIfDefined(payloadItem, "difficulty", item.difficulty);
        if (item.fishingSeasons && item.fishingSeasons.length > 0)
          payloadItem.fishingSeasons = item.fishingSeasons;
        appendIfDefined(payloadItem, "isLegendary", item.isLegendary);
        if (item.foragingSeasons && item.foragingSeasons.length > 0)
          payloadItem.foragingSeasons = item.foragingSeasons;
        appendIfDefined(payloadItem, "isOre", item.isOre);
        appendIfDefined(payloadItem, "requiresSmelting", item.requiresSmelting);
        appendIfDefined(
          payloadItem,
          "smeltedResultId",
          item.smeltedResultId?.trim(),
        );
        appendIfDefined(payloadItem, "isUniversalLike", item.isUniversalLike);
        appendIfDefined(payloadItem, "isUniversalLove", item.isUniversalLove);
        appendIfDefined(
          payloadItem,
          "relatedQuestID",
          item.relatedQuestID?.trim(),
        );
        appendIfDefined(payloadItem, "autoConsume", item.autoConsume);

        return payloadItem;
      }),
    );

    const filteredItems = cleanedItems.filter(
      (item) => item.itemID && item.itemName,
    );

    if (cleanedRecipes.length > 0) payload.recipes = cleanedRecipes;
    if (filteredItems.length > 0) payload.items = filteredItems;

    return payload;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!editingEventId && !eventId.trim()) {
      setError("Event ID is required.");
      return;
    }
    if (!eventName.trim() || !startTime || !endTime) {
      setError("Event name, start time, and end time are required.");
      return;
    }

    const createdEventItemIds = new Set(
      items
        .filter((item) => item.itemID.trim() && item.itemName.trim())
        .map((item) => item.itemID.trim()),
    );

    for (const recipe of recipes) {
      if (!recipe.recipeID.trim() && !recipe.recipeName.trim()) continue;

      if (!recipe.recipeID.trim() || !recipe.recipeName.trim()) {
        setError(
          "Recipe ID and Recipe Name are required for each event recipe.",
        );
        return;
      }

      if (!recipe.resultItemId.trim()) {
        setError(
          `Result Item is required for recipe ${recipe.recipeID || recipe.recipeName}.`,
        );
        return;
      }

      const hasInvalidDefaultIngredient = recipe.ingredients.some(
        (ingredient) => !ingredient.itemId.trim(),
      );
      const hasInvalidEventIngredient = recipe.products.some(
        (ingredient) => !ingredient.itemId.trim(),
      );
      const totalIngredientCount =
        recipe.ingredients.filter((ingredient) => ingredient.itemId.trim())
          .length +
        recipe.products.filter((ingredient) => ingredient.itemId.trim()).length;

      if (
        hasInvalidDefaultIngredient ||
        hasInvalidEventIngredient ||
        totalIngredientCount === 0
      ) {
        setError(
          `Recipe ${recipe.recipeID || recipe.recipeName} needs at least one valid ingredient (default or event ingredient).`,
        );
        return;
      }

      const missingEventIngredientId = recipe.products
        .map((ingredient) => ingredient.itemId.trim())
        .find((itemId) => itemId && !createdEventItemIds.has(itemId));

      if (missingEventIngredientId) {
        setError(
          `Event ingredient itemID '${missingEventIngredientId}' in recipe ${recipe.recipeID || recipe.recipeName} is not created in Event Items below.`,
        );
        return;
      }
    }

    const startedEventItems = items.filter((item) => {
      return (
        item.itemID.trim() ||
        item.itemName.trim() ||
        item.description.trim() ||
        Boolean(item.iconFile) ||
        Boolean(item.iconUrl?.trim())
      );
    });

    const startedRecipes = recipes.filter((recipe) => {
      return (
        recipe.recipeID.trim() ||
        recipe.recipeName.trim() ||
        recipe.resultItemId.trim() ||
        recipe.ingredients.length > 0 ||
        recipe.products.length > 0
      );
    });

    if (!editingEventId) {
      if (startedRecipes.length === 0) {
        setError("Please create recipe data first, then create the event.");
        return;
      }
      if (startedEventItems.length === 0) {
        setError("Please create event item data first, then create the event.");
        return;
      }
    }

    const incompleteEventItem = startedEventItems.find(
      (item) => !item.itemID.trim() || !item.itemName.trim(),
    );
    if (incompleteEventItem) {
      setError(
        "Each Event Item row you start must have both Item ID and Item Name.",
      );
      return;
    }

    const duplicateEventItemId = (() => {
      const seen = new Set<string>();
      for (const item of startedEventItems) {
        const itemId = item.itemID.trim();
        if (seen.has(itemId)) return itemId;
        seen.add(itemId);
      }
      return null;
    })();

    if (duplicateEventItemId) {
      setError(
        `Duplicate Event Item ID '${duplicateEventItemId}'. Please keep itemID unique.`,
      );
      return;
    }

    const duplicateRecipeId = (() => {
      const seen = new Set<string>();
      for (const recipe of startedRecipes) {
        const recipeId = recipe.recipeID.trim();
        if (!recipeId) continue;
        if (seen.has(recipeId)) return recipeId;
        seen.add(recipeId);
      }
      return null;
    })();

    if (duplicateRecipeId) {
      setError(
        `Duplicate Recipe ID '${duplicateRecipeId}'. Please keep recipeID unique.`,
      );
      return;
    }

    const missingEventItemIcon = startedEventItems.find(
      (item) =>
        item.itemID.trim() &&
        item.itemName.trim() &&
        !item.iconFile &&
        !item.iconUrl?.trim(),
    );

    if (missingEventItemIcon) {
      setError(
        `Icon image is required for event item ${missingEventItemIcon.itemID || missingEventItemIcon.itemName}.`,
      );
      return;
    }

    try {
      setSaving(true);
      const payload = await buildPayload();
      if (editingEventId) {
        await eventApi.updateEvent(editingEventId, payload);
        await Swal.fire({
          toast: true,
          icon: "success",
          title: "Event updated",
          position: "top-end",
          showConfirmButton: false,
          timer: 1800,
        });
      } else {
        await eventApi.createEvent(payload);
        await Swal.fire({
          toast: true,
          icon: "success",
          title: "Event created",
          position: "top-end",
          showConfirmButton: false,
          timer: 1800,
        });
      }
      resetForm();
      setIsModalOpen(false);
      await fetchEvents();
    } catch (err: any) {
      console.error("Save event failed", err);
      const backendMessage = err?.response?.data?.message;
      const backendError = err?.response?.data?.error;

      if (Array.isArray(backendMessage) && backendMessage.length > 0) {
        setError(backendMessage.join(" | "));
      } else if (typeof backendMessage === "string" && backendMessage.trim()) {
        setError(backendMessage);
      } else if (typeof backendError === "string" && backendError.trim()) {
        setError(backendError);
      } else {
        setError(
          "Failed to save event. Please verify nested recipe/item data.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventIdValue: string) => {
    const result = await Swal.fire({
      title: "Delete event?",
      text: "This will remove the event and all related event recipes/items.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    try {
      await eventApi.deleteEvent(eventIdValue);
      setEvents((prev) =>
        prev.filter((event) => (event.eventId || "") !== eventIdValue),
      );
      if (editingEventId === eventIdValue) {
        resetForm();
        setIsModalOpen(false);
      }
      await Swal.fire({
        toast: true,
        icon: "success",
        title: "Event deleted",
        position: "top-end",
        showConfirmButton: false,
        timer: 1800,
      });
    } catch (err) {
      console.error("Delete event failed", err);
      Swal.fire("Error", "Failed to delete event.", "error");
    }
  };

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return events;
    return events.filter((event) => {
      const eventIdValue = (event.eventId || "").toLowerCase();
      const eventNameValue = (event.eventName || "").toLowerCase();
      const statusValue = (event.status || "").toLowerCase();
      return (
        eventIdValue.includes(term) ||
        eventNameValue.includes(term) ||
        statusValue.includes(term)
      );
    });
  }, [events, search]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Event management
          </h1>
          <p className="text-sm text-slate-400">
            Manage event windows with event-only recipes and items.
          </p>
        </div>
        <Button onClick={openCreate}>+ New Event</Button>
      </header>

      <Card className="overflow-hidden">
        <CardHeader className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg text-white">Events</CardTitle>
              <p className="text-sm text-slate-400">
                {events.length} event(s) loaded.
              </p>
            </div>
            <Input
              className="max-w-xs"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-slate-800">
          {loading ? (
            <div className="p-6 text-sm text-slate-400">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-6 text-sm text-slate-400">No events found.</div>
          ) : (
            filteredEvents.map((event) => {
              const currentEventId = event.eventId || "";
              return (
                <div
                  key={currentEventId || event._id || event.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-lg shadow-slate-950/20"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Images + Info */}
                    <div className="flex gap-4 flex-1 min-w-0">
                      {/* Event Images */}
                      {event.imageUrls && event.imageUrls.length > 0 && (
                        <img
                          src={event.imageUrls[0]}
                          alt={event.eventName || "event"}
                          className="h-20 w-20 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                      )}

                      {/* Event Info */}
                      <div className="space-y-2 min-w-0">
                        <p className="text-lg font-semibold text-white truncate">
                          <span className="text-slate-400">Event Name:</span>{" "}
                          {event.eventName || "Unnamed event"}
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 truncate">
                          <span className="text-slate-500">Event ID:</span>{" "}
                          {currentEventId || "No eventId"}
                        </p>
                        <p className="text-sm text-slate-300 line-clamp-2">
                          <span className="text-slate-400">Description:</span>{" "}
                          {event.description || "No description"}
                        </p>
                        <p className="text-sm text-slate-300">
                          <span className="text-slate-400">Start:</span>{" "}
                          {event.startTime
                            ? new Date(event.startTime).toLocaleString()
                            : "-"}{" "}
                          <span className="text-slate-400">→ End:</span>{" "}
                          {event.endTime
                            ? new Date(event.endTime).toLocaleString()
                            : "-"}
                        </p>
                        <p className="text-sm text-slate-300">
                          Status: {event.status || "active"} | Recipes:{" "}
                          {event.recipes?.length || 0} | Items:{" "}
                          {event.items?.length || 0}
                        </p>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(event)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={!currentEventId}
                        onClick={() => handleDelete(currentEventId)}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
          <Card className="my-8 flex w-full max-w-5xl flex-col border border-slate-800 bg-slate-950">
            <CardHeader className="shrink-0 border-b border-slate-800">
              <CardTitle className="text-lg text-white">
                {editingEventId
                  ? `Edit — ${editingEventId}`
                  : "Create New Event"}
              </CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">
                      Event ID *
                    </label>
                    <Input
                      value={eventId}
                      onChange={(e) => setEventId(e.target.value)}
                      placeholder="e.g. spring_festival_2026"
                      disabled={!!editingEventId}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">
                      Event Name *
                    </label>
                    <Input
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="Spring Festival"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-200">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Event description..."
                    className="min-h-24 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">
                      Start Time *
                    </label>
                    <Input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">
                      End Time *
                    </label>
                    <Input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-200">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none focus:border-emerald-500"
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </div>
                </div>

                {/* Event Images */}
                <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Event Images
                  </h3>

                  {/* Existing images */}
                  {eventExistingImages.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {eventExistingImages.map((url, idx) => (
                        <div key={`exist-img-${idx}`} className="relative">
                          <img
                            src={url}
                            alt={`event-img-${idx}`}
                            className="h-24 w-24 rounded-lg border border-slate-700 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEventExistingImages((prev) =>
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
                  {eventImagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {eventImagePreviews.map((preview, idx) => (
                        <div key={`new-img-${idx}`} className="relative">
                          <img
                            src={preview}
                            alt={`new-img-${idx}`}
                            className="h-24 w-24 rounded-lg border border-emerald-700 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEventImageFiles((prev) =>
                                prev.filter((_, i) => i !== idx),
                              );
                              setEventImagePreviews((prev) =>
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
                        setEventImageFiles((prev) => [...prev, ...files]);
                        setEventImagePreviews((prev) => [...prev, ...previews]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
                      Event Recipes
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addRecipe}
                    >
                      + Add recipe
                    </Button>
                  </div>
                  {recipes.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No event recipes added.
                    </p>
                  ) : (
                    recipes.map((recipe, recipeIndex) => (
                      <div
                        key={`event-recipe-${recipeIndex}`}
                        className="space-y-3 rounded-lg border border-slate-800 bg-slate-950 p-4"
                      >
                        <section className="space-y-3">
                          <h4 className="font-semibold text-emerald-400 text-sm uppercase tracking-wider">
                            Recipe Info
                          </h4>
                          <div className="grid gap-3 md:grid-cols-2">
                            <Field label="Recipe ID *">
                              <Input
                                value={recipe.recipeID}
                                onChange={(e) =>
                                  setRecipeField(
                                    recipeIndex,
                                    "recipeID",
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g. event_recipe_lantern"
                              />
                            </Field>
                            <Field label="Recipe Name *">
                              <Input
                                value={recipe.recipeName}
                                onChange={(e) =>
                                  setRecipeField(
                                    recipeIndex,
                                    "recipeName",
                                    e.target.value,
                                  )
                                }
                                placeholder="Display name"
                              />
                            </Field>
                          </div>
                          <Field label="Description">
                            <textarea
                              value={recipe.description}
                              onChange={(e) =>
                                setRecipeField(
                                  recipeIndex,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Recipe description"
                              className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500"
                            />
                          </Field>
                          <div className="grid gap-3 md:grid-cols-2">
                            <Field label="Recipe Type">
                              <select
                                value={recipe.recipeType}
                                onChange={(e) =>
                                  setRecipeField(
                                    recipeIndex,
                                    "recipeType",
                                    Number(e.target.value) || 0,
                                  )
                                }
                                className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none focus:border-emerald-500"
                              >
                                {Object.entries(RECIPE_TYPE_LABELS).map(
                                  ([value, label]) => (
                                    <option key={value} value={value}>
                                      {label}
                                    </option>
                                  ),
                                )}
                              </select>
                            </Field>
                            <Field label="Category">
                              <select
                                value={recipe.category}
                                onChange={(e) =>
                                  setRecipeField(
                                    recipeIndex,
                                    "category",
                                    Number(e.target.value) || 0,
                                  )
                                }
                                className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none focus:border-emerald-500"
                              >
                                {Object.entries(RECIPE_CATEGORY_LABELS).map(
                                  ([value, label]) => (
                                    <option key={value} value={value}>
                                      {label}
                                    </option>
                                  ),
                                )}
                              </select>
                            </Field>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <Field label="Recipe Level">
                              <Input
                                type="number"
                                value={recipe.recipeLevel}
                                onChange={(e) =>
                                  setRecipeField(
                                    recipeIndex,
                                    "recipeLevel",
                                    Number(e.target.value) || 1,
                                  )
                                }
                                placeholder="1"
                              />
                            </Field>
                            <Field label="Status">
                              <select
                                value={recipe.status}
                                onChange={(e) =>
                                  setRecipeField(
                                    recipeIndex,
                                    "status",
                                    e.target.value,
                                  )
                                }
                                className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none focus:border-emerald-500"
                              >
                                <option value="active">active</option>
                                <option value="inactive">inactive</option>
                              </select>
                            </Field>
                          </div>
                          <label className="flex items-center gap-2 pt-1 text-sm text-slate-300 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={recipe.isUnlockedByDefault}
                              onChange={(e) =>
                                setRecipeField(
                                  recipeIndex,
                                  "isUnlockedByDefault",
                                  e.target.checked,
                                )
                              }
                              className="rounded w-4 h-4 accent-emerald-500"
                            />
                            Unlocked by Default
                          </label>
                        </section>

                        <section className="space-y-3 border-slate-800 border-t pt-3">
                          <h4 className="font-semibold text-amber-400 text-sm uppercase tracking-wider">
                            Result
                          </h4>
                          <div className="grid gap-3 md:grid-cols-3">
                            <Field label="Result Item *">
                              <ItemPicker
                                items={recipeSelectableItems}
                                value={recipe.resultItemId}
                                onChange={(itemId) =>
                                  setRecipeField(
                                    recipeIndex,
                                    "resultItemId",
                                    itemId,
                                  )
                                }
                                placeholder="Select result item"
                              />
                            </Field>
                            <Field label="Result Quantity">
                              <Input
                                type="number"
                                value={recipe.resultQuantity}
                                onChange={(e) =>
                                  setRecipeField(
                                    recipeIndex,
                                    "resultQuantity",
                                    Number(e.target.value) || 1,
                                  )
                                }
                                placeholder="1"
                              />
                            </Field>
                            <Field label="Result Quality">
                              <Input
                                type="number"
                                value={recipe.resultQuality}
                                onChange={(e) =>
                                  setRecipeField(
                                    recipeIndex,
                                    "resultQuality",
                                    Number(e.target.value) || 0,
                                  )
                                }
                                placeholder="0"
                              />
                            </Field>
                          </div>
                        </section>

                        <section className="space-y-2 border-slate-800 border-t pt-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-200">
                              Event Ingredients
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => addProduct(recipeIndex)}
                            >
                              + Add event ingredient
                            </Button>
                          </div>

                          {recipe.products.length === 0 ? (
                            <p className="text-xs text-slate-400">
                              No event ingredients added.
                            </p>
                          ) : (
                            recipe.products.map((product, productIndex) => (
                              <div
                                key={`event-product-${recipeIndex}-${productIndex}`}
                                className="grid gap-2 md:grid-cols-[1fr_160px_auto]"
                              >
                                <Field label="Item ID">
                                  <Input
                                    value={product.itemId}
                                    onChange={(e) =>
                                      setProductField(
                                        recipeIndex,
                                        productIndex,
                                        "itemId",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="ItemID event (vd: event_token_gold)"
                                  />
                                </Field>
                                <Field label="Quantity">
                                  <Input
                                    type="number"
                                    value={product.quantity}
                                    onChange={(e) =>
                                      setProductField(
                                        recipeIndex,
                                        productIndex,
                                        "quantity",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="1"
                                  />
                                </Field>
                                <div className="flex items-end">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                      removeProduct(recipeIndex, productIndex)
                                    }
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </section>
                        <section className="space-y-2 border-slate-800 border-t pt-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-200">
                              Default Ingredients
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => addIngredient(recipeIndex)}
                            >
                              + Add ingredient
                            </Button>
                          </div>

                          {recipe.ingredients.length === 0 ? (
                            <p className="text-xs text-slate-400">
                              No default ingredients added.
                            </p>
                          ) : (
                            recipe.ingredients.map(
                              (ingredient, ingredientIndex) => (
                                <div
                                  key={`event-ingredient-${recipeIndex}-${ingredientIndex}`}
                                  className="grid gap-2 md:grid-cols-[1fr_160px_auto]"
                                >
                                  <Field label="Ingredient Item ID">
                                    <ItemPicker
                                      items={catalogItems}
                                      value={ingredient.itemId}
                                      onChange={(itemId) =>
                                        setIngredientField(
                                          recipeIndex,
                                          ingredientIndex,
                                          "itemId",
                                          itemId,
                                        )
                                      }
                                      placeholder="Select ingredient item"
                                    />
                                  </Field>
                                  <Field label="Quantity">
                                    <Input
                                      type="number"
                                      value={ingredient.quantity}
                                      onChange={(e) =>
                                        setIngredientField(
                                          recipeIndex,
                                          ingredientIndex,
                                          "quantity",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="1"
                                    />
                                  </Field>
                                  <div className="flex items-end">
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        removeIngredient(
                                          recipeIndex,
                                          ingredientIndex,
                                        )
                                      }
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ),
                            )
                          )}
                        </section>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeRecipe(recipeIndex)}
                        >
                          Remove recipe
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                      Event Items
                    </h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addItem}
                    >
                      + Add item
                    </Button>
                  </div>
                  {items.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No event items added.
                    </p>
                  ) : (
                    items.map((item, itemIndex) => (
                      <div
                        key={`event-item-${itemIndex}`}
                        className="space-y-3 rounded-lg border border-slate-800 bg-slate-950 p-4"
                      >
                        <section className="space-y-3">
                          <h4 className="font-semibold text-emerald-400 text-sm uppercase tracking-wider">
                            Base Fields
                          </h4>
                          <div className="grid gap-3 md:grid-cols-2">
                            <Field label="Item ID *">
                              <Input
                                value={item.itemID}
                                onChange={(e) =>
                                  setItemField(
                                    itemIndex,
                                    "itemID",
                                    e.target.value,
                                  )
                                }
                                placeholder="e.g. event_token_gold"
                              />
                            </Field>
                            <Field label="Item Name *">
                              <Input
                                value={item.itemName}
                                onChange={(e) =>
                                  setItemField(
                                    itemIndex,
                                    "itemName",
                                    e.target.value,
                                  )
                                }
                                placeholder="Display name"
                              />
                            </Field>
                          </div>
                          <Field label="Description">
                            <textarea
                              value={item.description}
                              onChange={(e) =>
                                setItemField(
                                  itemIndex,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Flavour text..."
                              className="min-h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-500"
                            />
                          </Field>
                          <Field
                            label={
                              item.iconUrl || item.iconPreview
                                ? "Icon (optional, replaces current)"
                                : "Icon *"
                            }
                          >
                            <label className="flex justify-center items-center bg-slate-900 border-2 border-slate-700 hover:border-slate-500 border-dashed rounded-lg w-full h-24 transition cursor-pointer">
                              <span className="text-sm text-slate-400">
                                {item.iconFile
                                  ? item.iconFile.name
                                  : "Click to select icon image"}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleEventItemIconPick(itemIndex, e)
                                }
                                className="hidden"
                              />
                            </label>
                            {(item.iconPreview || item.iconUrl) && (
                              <img
                                src={item.iconPreview || item.iconUrl}
                                alt="preview"
                                className="bg-slate-800 mt-2 rounded-md w-16 h-16 object-cover pixel-art"
                              />
                            )}
                          </Field>
                          <div className="grid gap-3 md:grid-cols-4">
                            <Field label="Item Type">
                              <select
                                value={item.itemType}
                                onChange={(e) =>
                                  setItemField(
                                    itemIndex,
                                    "itemType",
                                    Number(e.target.value) || 0,
                                  )
                                }
                                className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none focus:border-emerald-500"
                              >
                                {Object.entries(ITEM_TYPE_LABELS).map(
                                  ([value, label]) => (
                                    <option key={value} value={value}>
                                      {label}
                                    </option>
                                  ),
                                )}
                              </select>
                            </Field>
                            <Field label="Category">
                              <select
                                value={item.itemCategory}
                                onChange={(e) =>
                                  setItemField(
                                    itemIndex,
                                    "itemCategory",
                                    Number(e.target.value) || 0,
                                  )
                                }
                                className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none focus:border-emerald-500"
                              >
                                {Object.entries(ITEM_CATEGORY_LABELS).map(
                                  ([value, label]) => (
                                    <option key={value} value={value}>
                                      {label}
                                    </option>
                                  ),
                                )}
                              </select>
                            </Field>
                            <Field label="Max Stack">
                              <Input
                                type="number"
                                value={item.maxStack}
                                onChange={(e) =>
                                  setItemField(
                                    itemIndex,
                                    "maxStack",
                                    Number(e.target.value) || 1,
                                  )
                                }
                                placeholder="1"
                              />
                            </Field>
                            <Field label="Base Price">
                              <Input
                                type="number"
                                value={item.basePrice}
                                onChange={(e) =>
                                  setItemField(
                                    itemIndex,
                                    "basePrice",
                                    Number(e.target.value) || 0,
                                  )
                                }
                                placeholder="0"
                              />
                            </Field>
                          </div>
                          <div className="grid gap-3 md:grid-cols-4">
                            <Field label="Buy Price">
                              <Input
                                type="number"
                                value={item.buyPrice}
                                onChange={(e) =>
                                  setItemField(
                                    itemIndex,
                                    "buyPrice",
                                    Number(e.target.value) || 0,
                                  )
                                }
                                placeholder="0"
                              />
                            </Field>
                            <Field label="Viable Restore">
                              <Input
                                type="number"
                                value={item.energyRestore}
                                onChange={(e) =>
                                  setItemField(
                                    itemIndex,
                                    "energyRestore",
                                    Number(e.target.value) || 0,
                                  )
                                }
                                placeholder="0"
                              />
                            </Field>
                            <Field label="Health Restore">
                              <Input
                                type="number"
                                value={item.healthRestore}
                                onChange={(e) =>
                                  setItemField(
                                    itemIndex,
                                    "healthRestore",
                                    Number(e.target.value) || 0,
                                  )
                                }
                                placeholder="0"
                              />
                            </Field>
                            <Field label="Status">
                              <select
                                value={item.status}
                                onChange={(e) =>
                                  setItemField(
                                    itemIndex,
                                    "status",
                                    e.target.value,
                                  )
                                }
                                className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none focus:border-emerald-500"
                              >
                                <option value="active">active</option>
                                <option value="inactive">inactive</option>
                              </select>
                            </Field>
                          </div>
                          <div className="flex flex-wrap gap-4 pt-1">
                            <Toggle
                              label="Stackable"
                              checked={item.isStackable}
                              onChange={(checked) =>
                                setItemField(itemIndex, "isStackable", checked)
                              }
                            />
                            <Toggle
                              label="Can Be Sold"
                              checked={item.canBeSold}
                              onChange={(checked) =>
                                setItemField(itemIndex, "canBeSold", checked)
                              }
                            />
                            <Toggle
                              label="Can Be Bought"
                              checked={item.canBeBought}
                              onChange={(checked) =>
                                setItemField(itemIndex, "canBeBought", checked)
                              }
                            />
                            <Toggle
                              label="Quest Item"
                              checked={item.isQuestItem}
                              onChange={(checked) =>
                                setItemField(itemIndex, "isQuestItem", checked)
                              }
                            />
                            <Toggle
                              label="Artifact"
                              checked={item.isArtifact}
                              onChange={(checked) =>
                                setItemField(itemIndex, "isArtifact", checked)
                              }
                            />
                            <Toggle
                              label="Rare Item"
                              checked={item.isRareItem}
                              onChange={(checked) =>
                                setItemField(itemIndex, "isRareItem", checked)
                              }
                            />
                          </div>
                        </section>
                        <section className="space-y-3 border-slate-800 border-t pt-3">
                          <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
                            Type Specific Fields
                          </h4>

                          {item.itemType === 0 && (
                            <div className="grid gap-3 md:grid-cols-4">
                              <Field label="Tool Type">
                                <select
                                  value={item.toolType ?? 0}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "toolType",
                                      Number(e.target.value) || 0,
                                    )
                                  }
                                  className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none focus:border-emerald-500"
                                >
                                  {Object.entries(TOOL_TYPE_LABELS).map(
                                    ([value, label]) => (
                                      <option key={value} value={value}>
                                        {label}
                                      </option>
                                    ),
                                  )}
                                </select>
                              </Field>
                              <Field label="Tool Level">
                                <Input
                                  type="number"
                                  value={item.toolLevel ?? 1}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "toolLevel",
                                      Number(e.target.value) || 1,
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Tool Power">
                                <Input
                                  type="number"
                                  value={item.toolPower ?? 1}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "toolPower",
                                      Number(e.target.value) || 1,
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Tool Material ID">
                                <Input
                                  value={item.toolMaterialId ?? ""}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "toolMaterialId",
                                      e.target.value,
                                    )
                                  }
                                />
                              </Field>
                            </div>
                          )}

                          {item.itemType === 1 && (
                            <Field label="Plant ID">
                              <Input
                                value={item.plantId ?? ""}
                                onChange={(e) =>
                                  setItemField(
                                    itemIndex,
                                    "plantId",
                                    e.target.value,
                                  )
                                }
                              />
                            </Field>
                          )}

                          {item.itemType === 3 && (
                            <>
                              <div className="grid gap-3 md:grid-cols-3">
                                <Field label="Source Plant ID">
                                  <Input
                                    value={item.sourcePlantId ?? ""}
                                    onChange={(e) =>
                                      setItemField(
                                        itemIndex,
                                        "sourcePlantId",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </Field>
                                <Field label="Pollination Success Chance">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={item.pollinationSuccessChance ?? 0.5}
                                    onChange={(e) =>
                                      setItemField(
                                        itemIndex,
                                        "pollinationSuccessChance",
                                        Number(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </Field>
                                <Field label="Viability Days">
                                  <Input
                                    type="number"
                                    value={item.viabilityDays ?? 3}
                                    onChange={(e) =>
                                      setItemField(
                                        itemIndex,
                                        "viabilityDays",
                                        Number(e.target.value) || 0,
                                      )
                                    }
                                  />
                                </Field>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm text-slate-200">
                                    Cross Results
                                  </p>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addCrossResult(itemIndex)}
                                  >
                                    + Add
                                  </Button>
                                </div>
                                {(item.crossResults || []).map(
                                  (cross, crossIndex) => (
                                    <div
                                      key={`cross-${itemIndex}-${crossIndex}`}
                                      className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"
                                    >
                                      <Input
                                        value={cross.targetPlantId}
                                        onChange={(e) =>
                                          setCrossResultField(
                                            itemIndex,
                                            crossIndex,
                                            "targetPlantId",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Target Plant ID"
                                      />
                                      <Input
                                        value={cross.resultPlantId}
                                        onChange={(e) =>
                                          setCrossResultField(
                                            itemIndex,
                                            crossIndex,
                                            "resultPlantId",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Result Plant ID"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          removeCrossResult(
                                            itemIndex,
                                            crossIndex,
                                          )
                                        }
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  ),
                                )}
                              </div>
                            </>
                          )}

                          {(item.itemType === 4 || item.itemType === 8) && (
                            <Field label="Buffer Duration">
                              <Input
                                type="number"
                                value={item.bufferDuration ?? 0}
                                onChange={(e) =>
                                  setItemField(
                                    itemIndex,
                                    "bufferDuration",
                                    Number(e.target.value) || 0,
                                  )
                                }
                              />
                            </Field>
                          )}

                          {item.itemType === 6 && (
                            <div className="grid gap-3 md:grid-cols-3">
                              <Field label="Damage">
                                <Input
                                  type="number"
                                  value={item.damage ?? 0}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "damage",
                                      Number(e.target.value) || 0,
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Crit Chance">
                                <Input
                                  type="number"
                                  value={item.critChance ?? 0}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "critChance",
                                      Number(e.target.value) || 0,
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Weapon Material ID">
                                <Input
                                  value={item.weaponMaterialId ?? ""}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "weaponMaterialId",
                                      e.target.value,
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Weapon Type">
                                <Input
                                  type="number"
                                  value={item.weaponType ?? 0}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "weaponType",
                                      Number(e.target.value) || 0,
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Tier">
                                <Input
                                  type="number"
                                  value={item.tier ?? 1}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "tier",
                                      Number(e.target.value) || 1,
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Attack Cooldown">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.attackCooldown ?? 0}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "attackCooldown",
                                      Number(e.target.value) || 0,
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Knockback Force">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.knockbackForce ?? 0}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "knockbackForce",
                                      Number(e.target.value) || 0,
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Projectile Speed">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.projectileSpeed ?? 0}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "projectileSpeed",
                                      Number(e.target.value) || 0,
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Projectile Range">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.projectileRange ?? 0}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "projectileRange",
                                      Number(e.target.value) || 0,
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Projectile Knockback">
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.projectileKnockback ?? 0}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "projectileKnockback",
                                      Number(e.target.value) || 0,
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Linked Skill ID">
                                <Input
                                  value={item.linkedSkillId ?? ""}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "linkedSkillId",
                                      e.target.value,
                                    )
                                  }
                                />
                              </Field>
                            </div>
                          )}

                          {item.itemType === 7 && (
                            <div className="grid gap-3 md:grid-cols-3">
                              <Field label="Difficulty">
                                <Input
                                  type="number"
                                  value={item.difficulty ?? 0}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "difficulty",
                                      Number(e.target.value) || 0,
                                    )
                                  }
                                />
                              </Field>
                              <Field label="Fishing Seasons (comma numbers)">
                                <Input
                                  value={(item.fishingSeasons || []).join(",")}
                                  onChange={(e) =>
                                    setSeasonList(
                                      itemIndex,
                                      "fishingSeasons",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0,1,2,3"
                                />
                              </Field>
                              <div className="flex items-end">
                                <Toggle
                                  label="Legendary"
                                  checked={Boolean(item.isLegendary)}
                                  onChange={(checked) =>
                                    setItemField(
                                      itemIndex,
                                      "isLegendary",
                                      checked,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}

                          {item.itemType === 9 && (
                            <Field label="Foraging Seasons (comma numbers)">
                              <Input
                                value={(item.foragingSeasons || []).join(",")}
                                onChange={(e) =>
                                  setSeasonList(
                                    itemIndex,
                                    "foragingSeasons",
                                    e.target.value,
                                  )
                                }
                                placeholder="0,1,2,3"
                              />
                            </Field>
                          )}

                          {item.itemType === 10 && (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-4">
                                <Toggle
                                  label="Is Ore"
                                  checked={Boolean(item.isOre)}
                                  onChange={(checked) =>
                                    setItemField(itemIndex, "isOre", checked)
                                  }
                                />
                                <Toggle
                                  label="Requires Smelting"
                                  checked={Boolean(item.requiresSmelting)}
                                  onChange={(checked) =>
                                    setItemField(
                                      itemIndex,
                                      "requiresSmelting",
                                      checked,
                                    )
                                  }
                                />
                              </div>
                              <Field label="Smelted Result ID">
                                <Input
                                  value={item.smeltedResultId ?? ""}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "smeltedResultId",
                                      e.target.value,
                                    )
                                  }
                                />
                              </Field>
                            </div>
                          )}

                          {item.itemType === 11 && (
                            <div className="flex flex-wrap gap-4">
                              <Toggle
                                label="Universal Like"
                                checked={Boolean(item.isUniversalLike)}
                                onChange={(checked) =>
                                  setItemField(
                                    itemIndex,
                                    "isUniversalLike",
                                    checked,
                                  )
                                }
                              />
                              <Toggle
                                label="Universal Love"
                                checked={Boolean(item.isUniversalLove)}
                                onChange={(checked) =>
                                  setItemField(
                                    itemIndex,
                                    "isUniversalLove",
                                    checked,
                                  )
                                }
                              />
                            </div>
                          )}

                          {item.itemType === 12 && (
                            <div className="grid gap-3 md:grid-cols-2">
                              <Field label="Related Quest ID">
                                <Input
                                  value={item.relatedQuestID ?? ""}
                                  onChange={(e) =>
                                    setItemField(
                                      itemIndex,
                                      "relatedQuestID",
                                      e.target.value,
                                    )
                                  }
                                />
                              </Field>
                              <div className="flex items-end">
                                <Toggle
                                  label="Auto Consume"
                                  checked={Boolean(item.autoConsume)}
                                  onChange={(checked) =>
                                    setItemField(
                                      itemIndex,
                                      "autoConsume",
                                      checked,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </section>
                        <section className="space-y-2 border-slate-800 border-t pt-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-cyan-300">
                              NPC Preferences
                            </h4>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => addNpcPreference(itemIndex)}
                            >
                              + Add preference
                            </Button>
                          </div>
                          {item.npcPreferenceNames.length === 0 ? (
                            <p className="text-xs text-slate-400">
                              No NPC preferences added.
                            </p>
                          ) : (
                            item.npcPreferenceNames.map(
                              (name, preferenceIndex) => (
                                <div
                                  key={`event-item-pref-${itemIndex}-${preferenceIndex}`}
                                  className="grid gap-2 md:grid-cols-[1fr_160px_auto]"
                                >
                                  <Field label="NPC Name">
                                    <Input
                                      value={name}
                                      onChange={(e) =>
                                        setNpcPreferenceName(
                                          itemIndex,
                                          preferenceIndex,
                                          e.target.value,
                                        )
                                      }
                                      placeholder="NPC name"
                                    />
                                  </Field>
                                  <Field label="Reaction">
                                    <select
                                      value={
                                        item.npcPreferenceReactions[
                                          preferenceIndex
                                        ] ?? 0
                                      }
                                      onChange={(e) =>
                                        setNpcPreferenceReaction(
                                          itemIndex,
                                          preferenceIndex,
                                          Number(e.target.value) || 0,
                                        )
                                      }
                                      className="h-9 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none focus:border-emerald-500"
                                    >
                                      {[-2, -1, 0, 1, 2].map((value) => (
                                        <option key={value} value={value}>
                                          {value}
                                        </option>
                                      ))}
                                    </select>
                                  </Field>
                                  <div className="flex items-end">
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        removeNpcPreference(
                                          itemIndex,
                                          preferenceIndex,
                                        )
                                      }
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ),
                            )
                          )}
                        </section>
                        <p className="text-xs text-slate-500">
                          If you need Cloudinary upload for a specific event
                          item later, the API methods are already added in
                          eventApi.
                        </p>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(itemIndex)}
                        >
                          Remove item
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
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving
                      ? "Saving..."
                      : editingEventId
                        ? "Save Changes"
                        : "Create Event"}
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-white">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300 select-none">
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

export default AdminEventManager;
