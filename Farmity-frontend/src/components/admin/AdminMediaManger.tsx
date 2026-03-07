import { useEffect, useState, FormEvent } from "react";
import Swal from "sweetalert2";
import mediaApi from "../../api/mediaApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface MediaItem {
  _id?: string;
  id?: string;
  file_url?: string;
  description?: string;
  upload_date?: string;
}

function AdminMediaManager() {
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [uploadDate, setUploadDate] = useState("");

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const resetForm = () => {
    setDescription("");
    setFileUrl("");
    setPreview("");
    setUploadDate("");
    setEditingId(null);
  };

  const fetchMedia = async () => {
    try {
      const res = await mediaApi.getAllMedia();
      setMedia(res.data || []);
    } catch (err) {
      console.error("Failed to load media:", err);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!fileUrl) {
      Swal.fire("Error", "Please upload image", "error");
      return;
    }

    const payload = {
      file_url: fileUrl,
      description,
      upload_date: uploadDate || undefined,
    };

    try {
      if (editingId) {
        await mediaApi.updateMedia(editingId, payload);

        Swal.fire({
          toast: true,
          icon: "success",
          title: "Media updated successfully",
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        await mediaApi.createMedia(payload);

        Swal.fire({
          toast: true,
          icon: "success",
          title: "Media created successfully",
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchMedia();
    } catch (err) {
      console.error("Failed to save media:", err);
    }
  };

  const handleEdit = (item: MediaItem) => {
    setDescription(item.description || "");
    setFileUrl(item.file_url || "");
    setPreview(item.file_url || "");
    setUploadDate(item.upload_date ? item.upload_date.slice(0, 10) : "");

    setEditingId(item._id || item.id || null);
    setIsModalOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      const { data } = await mediaApi.uploadSignature({
        folder: "media",
      });

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

      setFileUrl(result.secure_url);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete this media?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    await mediaApi.deleteMedia(id);

    setMedia((prev) => prev.filter((m) => (m._id || m.id) !== id));
  };

  const filteredMedia = media.filter((m) => {
    const term = search.toLowerCase();
    const desc = (m.description || "").toLowerCase();
    return desc.includes(term);
  });

  const totalPages = Math.max(1, Math.ceil(filteredMedia.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const visibleMedia = filteredMedia.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Media manager</h1>

        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          +
        </Button>
      </header>

      <Card>
        <CardHeader>
          <Input
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardHeader>

        <CardContent>
          {visibleMedia.map((item) => {
            const id = item._id || item.id;
            if (!id) return null;

            return (
              <div
                key={id}
                className="flex justify-between items-center p-3 bg-slate-900 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {item.file_url && (
                    <img
                      src={item.file_url}
                      className="w-14 h-14 object-cover rounded"
                    />
                  )}

                  <div>
                    <p className="text-white text-sm">
                      {item.description || "No description"}
                    </p>

                    <p className="text-xs text-slate-400">
                      {item.upload_date?.slice(0, 10)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(item)}>
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* MODAL */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <Card className="w-full max-w-2xl bg-slate-950 border border-slate-800 flex flex-col max-h-[90vh]">
            <CardHeader className="border-b border-slate-800">
              <CardTitle>{editingId ? "Edit media" : "Create media"}</CardTitle>
            </CardHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="flex items-center justify-center w-full h-28 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-slate-500 bg-slate-900">
                  <span className="text-sm text-slate-400">
                    Click to upload image
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                  />
                </label>

                {(preview || fileUrl) && (
                  <img
                    src={preview || fileUrl}
                    className="w-full max-w-xs h-36 object-cover rounded-lg"
                  />
                )}

                <Input
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <Input
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                />
              </form>
            </div>

            <div className="border-t border-slate-800 p-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>

              <Button onClick={handleSubmit}>
                {editingId ? "Save changes" : "Create media"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AdminMediaManager;
