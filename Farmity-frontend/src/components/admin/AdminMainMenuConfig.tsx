import { useEffect, useState, ChangeEvent } from "react";
import Swal from "sweetalert2";
import gameConfigApi from "../../api/gameConfigApi";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

/* ═══════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════ */

function AdminMainMenuConfig() {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [version, setVersion] = useState<number>(0);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  /* ── fetch current config ── */
  const fetchConfig = async () => {
    try {
      setFetching(true);
      const res = await gameConfigApi.getMainMenu();
      if (res.data) {
        setCurrentUrl(res.data.currentBackgroundUrl || null);
        setVersion(res.data.version || 0);
      }
    } catch (err) {
      console.error("Failed to load main-menu config:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  /* ── file pick ── */
  const handleFilePick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setNewFile(null);
    setPreview("");
  };

  /* ── submit ── */
  const handleUpdate = async () => {
    if (!newFile) {
      Swal.fire({ icon: "warning", title: "Please select a background image first", background: "#020617", color: "#e5e7eb" });
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("background", newFile);

      const res = await gameConfigApi.updateMainMenu(fd);

      setCurrentUrl(res.data.currentBackgroundUrl);
      setVersion(res.data.version);
      setNewFile(null);
      setPreview("");

      Swal.fire({ toast: true, icon: "success", title: "Background updated!", position: "top-end", showConfirmButton: false, timer: 2000, background: "#020617", color: "#e5e7eb" });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to update background.";
      Swal.fire({ icon: "error", title: "Error", text: msg, background: "#020617", color: "#e5e7eb" });
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────
     RENDER
     ───────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Main Menu Background</h1>
        <p className="text-sm text-slate-400 mt-0.5">Configure the game's main-menu background image</p>
      </header>

      {/* Current Background */}
      <Card>
        <CardHeader>
          <CardTitle>Current Background</CardTitle>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <p className="text-slate-500 text-sm">Loading…</p>
          ) : currentUrl ? (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                <img
                  src={currentUrl}
                  alt="Current main-menu background"
                  className="w-full max-h-[400px] object-contain pixel-art"
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">Version: <span className="text-slate-300 font-mono">{version}</span></span>
                <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline">Open full image ↗</a>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-4">No background has been set yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Upload New Background */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Background</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Background Image (max 10 MB)</Label>
            <label className="mt-1 flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-slate-500 transition bg-slate-900">
              <div className="text-center">
                <p className="text-sm text-slate-400">{newFile ? newFile.name : "Click to select background image"}</p>
                {newFile && <p className="text-xs text-slate-500 mt-1">{(newFile.size / 1024 / 1024).toFixed(2)} MB</p>}
              </div>
              <input type="file" accept="image/*" onChange={handleFilePick} className="hidden" />
            </label>
          </div>

          {/* Preview */}
          {preview && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                <img src={preview} alt="New background preview" className="w-full max-h-[300px] object-contain pixel-art" />
              </div>
              <Button size="sm" variant="outline" onClick={clearFile}>Clear</Button>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button onClick={handleUpdate} disabled={loading || !newFile}>
              {loading ? "Uploading…" : "Update Background"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminMainMenuConfig;
