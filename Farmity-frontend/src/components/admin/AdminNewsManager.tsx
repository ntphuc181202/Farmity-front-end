import { useEffect, useState, FormEvent } from "react";
import { Editor } from "@tinymce/tinymce-react";
import Swal from "sweetalert2";
import newsApi from "../../api/newsApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface NewsItem {
  _id?: string;
  id?: string;
  title?: string;
  content?: string;
  thumbnailUrl?: string;
  publishDate?: string;
}

function AdminNewsManager() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const pageSize = 8;

  const resetForm = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    setTitle("");
    setContent("");
    setThumbnailUrl("");
    setThumbnailPreview("");
    setPublishDate("");
    setEditingId(null);
    setMessage("");
  };

  const fetchNews = async () => {
    try {
      const res = await newsApi.getAllNews();
      setNews(res.data || []);
    } catch (err) {
      console.error("Failed to load news:", err);
      setMessage("Failed to load news list.");
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (uploading) {
      Swal.fire("Uploading", "Please wait until upload finishes", "info");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setMessage("Please fill in the title and content.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: title.trim(),
        content,
        thumbnailUrl,
        publishDate: publishDate || undefined,
      };

      if (editingId) {
        await newsApi.updateNews(editingId, payload);

        Swal.fire({
          toast: true,
          icon: "success",
          title: "News updated successfully",
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        await newsApi.createNews(payload);

        Swal.fire({
          toast: true,
          icon: "success",
          title: "News created successfully",
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
        });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchNews();
    } catch (error) {
      console.error("Failed to publish news:", error);
      Swal.fire("Error", "Failed to publish news", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: NewsItem) => {
    setTitle(item.title || "");
    setContent(item.content || "");

    setThumbnailUrl(item.thumbnailUrl || "");
    setThumbnailPreview(item.thumbnailUrl || ""); // 👈 thêm dòng này

    setPublishDate(item.publishDate ? item.publishDate.slice(0, 10) : "");

    setEditingId(item._id || item.id || null);
    setIsModalOpen(true);
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const preview = URL.createObjectURL(file);
    setThumbnailPreview(preview);

    try {
      const { data } = await newsApi.uploadSignature({
        folder: "news-thumbnail",
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
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await uploadRes.json();

      setThumbnailUrl(result.secure_url); // ảnh mới
    } catch (err) {
      console.error("Upload thumbnail failed", err);
      Swal.fire("Error", "Upload thumbnail failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete this news?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await newsApi.deleteNews(id);

      setNews((prev) => prev.filter((n) => (n._id || n.id) !== id));

      Swal.fire({
        toast: true,
        icon: "success",
        title: "News deleted",
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to delete news.", "error");
    }
  };

  const filteredNews = news.filter((n) => {
    const term = search.toLowerCase();
    const title = (n.title || "").toLowerCase();
    const text = (n.content || "").replace(/<[^>]+>/g, "").toLowerCase();
    return title.includes(term) || text.includes(term);
  });

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleNews = filteredNews.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">News manager</h1>

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
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardHeader>

        <CardContent>
          {visibleNews.map((item) => {
            const id = item._id || item.id;
            if (!id) return null;

            const plain = (item.content || "").replace(/<[^>]+>/g, "");
            const short = plain.slice(0, 160);

            return (
              <div
                key={id}
                className="flex justify-between items-center p-3 bg-slate-900 rounded-lg"
              >
                <div>
                  <h3 className="text-white font-semibold">{item.title}</h3>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <Card className="w-full max-w-4xl bg-slate-950 border border-slate-800 flex flex-col max-h-[90vh]">
            <CardHeader className="border-b border-slate-800">
              <CardTitle>{editingId ? "Edit news" : "Create news"}</CardTitle>
            </CardHeader>

            {/* BODY SCROLL */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="News title"
                />

                {/* Upload */}
                <label className="flex items-center justify-center w-full h-28 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-slate-500 transition bg-slate-900">
                  <span className="text-sm text-slate-400">
                    Click to upload thumbnail
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                </label>

                {(thumbnailPreview || thumbnailUrl) && (
                  <div className="flex items-center gap-4">
                    <img
                      src={thumbnailPreview || thumbnailUrl}
                      className="w-full max-w-xs h-36 object-cover rounded-lg"
                    />

                    {uploading && (
                      <span className="text-xs text-slate-400">
                        Uploading...
                      </span>
                    )}
                  </div>
                )}

                <Input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                />

                {/* Editor */}
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <Editor
                    tinymceScriptSrc="/tinymce/js/tinymce/tinymce.min.js"
                    value={content}
                    onEditorChange={(v) => setContent(v)}
                    init={{
                      license_key: "gpl",
                      height: 400,
                      menubar: true,
                      branding: false,
                      promotion: false,
                      skin: "oxide-dark",
                      content_css: "dark",

                      plugins: [
                        "advlist",
                        "autolink",
                        "lists",
                        "link",
                        "image",
                        "charmap",
                        "preview",
                        "anchor",
                        "searchreplace",
                        "visualblocks",
                        "code",
                        "fullscreen",
                        "insertdatetime",
                        "media",
                        "table",
                        "help",
                        "wordcount",
                      ],

                      toolbar:
                        "undo redo | blocks fontsize | bold italic underline | " +
                        "alignleft aligncenter alignright alignjustify | " +
                        "bullist numlist | link image media table | code preview fullscreen",

                      file_picker_types: "image",

                      images_upload_handler: async (blobInfo) => {
                        const signRes = await newsApi.uploadSignature({
                          folder: "news",
                        });

                        const {
                          cloudName,
                          apiKey,
                          timestamp,
                          signature,
                          folder,
                        } = signRes.data;

                        const formData = new FormData();
                        formData.append("file", blobInfo.blob());
                        formData.append("api_key", apiKey);
                        formData.append("timestamp", timestamp);
                        formData.append("signature", signature);
                        formData.append("folder", folder);

                        const res = await fetch(
                          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                          {
                            method: "POST",
                            body: formData,
                          },
                        );

                        const data = await res.json();

                        return data.secure_url;
                      },
                    }}
                  />
                </div>
                {/* STICKY FOOTER */}
                <div className="border-t border-slate-800 p-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={loading || uploading}>
                    {uploading
                      ? "Uploading..."
                      : editingId
                        ? "Save changes"
                        : "Create news"}
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

export default AdminNewsManager;
