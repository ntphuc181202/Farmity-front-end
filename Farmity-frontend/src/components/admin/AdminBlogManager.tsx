import { useEffect, useState, FormEvent } from "react";
import { Editor } from "@tinymce/tinymce-react";
import Swal from "sweetalert2";
import blogApi from "../../api/blogApi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface BlogItem {
  _id?: string;
  id?: string;
  title?: string;
  content?: string;
}

function AdminBlogManager() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const resetForm = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
    setIsDetailMode(false);
    setMessage("");
  };

  const fetchBlogs = async () => {
    try {
      const res = await blogApi.getAllBlogs();
      setBlogs(res.data || []);
    } catch (err) {
      console.error("Failed to load blogs:", err);
      setMessage("Failed to load blog list.");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setMessage("Please fill in the title and content.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: title.trim(),
        content,
      };

      if (editingId) {
        await blogApi.updateBlog(editingId, payload);
        setMessage("Post updated successfully.");
        Swal.fire({
          toast: true,
          icon: "success",
          title: "Post updated successfully",
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#020617",
          color: "#e5e7eb",
        });
      } else {
        await blogApi.createBlog(payload);
        setMessage("Post created successfully.");
        Swal.fire({
          toast: true,
          icon: "success",
          title: "Post created successfully",
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: "#020617",
          color: "#e5e7eb",
        });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchBlogs();
    } catch (error) {
      console.error("Failed to publish blog:", error);
      setMessage("Failed to publish post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (blog: BlogItem) => {
    setTitle(blog.title || "");
    setContent(blog.content || "");
    setEditingId(blog._id || blog.id || null);
    setIsDetailMode(true);
    setMessage("");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete this post?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await blogApi.deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => (b._id || b.id) !== id));
      setMessage("Post deleted successfully.");
      await Swal.fire({
        toast: true,
        icon: "success",
        title: "Post deleted successfully",
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#020617",
        color: "#e5e7eb",
      });
    } catch (err) {
      console.error("Failed to delete blog:", err);
      setMessage("Failed to delete post. Please try again.");
      await Swal.fire("Error", "Failed to delete post.", "error");
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    const term = search.toLowerCase().trim();
    if (!term) return true;
    const titleText = (blog.title || "").toLowerCase();
    const plainContent = (blog.content || "").replace(/<[^>]+>/g, "").toLowerCase();
    return titleText.includes(term) || plainContent.includes(term);
  });

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleBlogs = filteredBlogs.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Blog manager
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            className="h-9 rounded-full px-4 text-sm font-medium shadow-sm"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            +
          </Button>
        </div>
      </header>

      {/* Main list section */}
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div className="w-full md:w-64">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to filter posts..."
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {blogs.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No posts yet. Click <span className="font-semibold">New post</span>{" "}
              to create one.
            </p>
          ) : filteredBlogs.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No posts match your search.
            </p>
          ) : (
            <div className="space-y-2">
              {visibleBlogs.map((blog) => {
                const id = blog._id || blog.id;
                const plainContent = (blog.content || "").replace(/<[^>]+>/g, "");
                const shortContent =
                  plainContent.length > 160
                    ? `${plainContent.slice(0, 160)}...`
                    : plainContent;

                if (!id) return null;

                return (
                  <div
                    key={id}
                    className="flex items-center gap-3 rounded-lg dark:border-slate-800/80 bg-[#1E293B]/60 dark:bg-slate-900/60 px-3 py-2.5 hover:[#1E293B]/80 dark:hover:bg-slate-900 transition-colors text-white"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white line-clamp-1">
                        {blog.title || "Untitled"}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {shortContent || "No preview content available."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleEdit(blog)}
                      >
                        Detail
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-7 px-3 text-[11px] rounded-full"
                        onClick={() => handleDelete(id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredBlogs.length > 0 && (
            <div className="mt-4 flex items-center justify-end gap-3 text-xs text-white">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px] text-white hover:bg-slate-800"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-[11px] text-white hover:bg-slate-800"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-4xl">
            <Card className="bg-slate-950/90 border-slate-800 shadow-2xl">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-50">
                      {editingId ? (isDetailMode ? "Post detail" : "Edit post") : "Create new post"}
                    </CardTitle>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-slate-700 text-white hover:bg-slate-800"
                    onClick={() => {
                      resetForm();
                      setIsModalOpen(false);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <fieldset disabled={!!editingId && isDetailMode} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-200">
                      Title
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. 10 tips for early game in Stardew Valley"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-200">
                      Content
                    </label>

                    <div className="rounded-md border border-slate-800 overflow-hidden bg-slate-900">
                      <Editor
                        tinymceScriptSrc="/tinymce/js/tinymce/tinymce.min.js"
                        value={content}
                        onEditorChange={(newValue) => {
                          if (!editingId || !isDetailMode) {
                            setContent(newValue);
                          }
                        }}
                        disabled={!!editingId && isDetailMode}
                        init={{
                          license_key: "gpl",
                          height: 500,
                          menubar: true,
                          branding: false,
                          promotion: false,
                          file_picker_types: "image",

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
                            "emoticons",
                          ],

                          toolbar:
                            "undo redo | blocks fontfamily fontsize | " +
                            "bold italic underline strikethrough | forecolor backcolor | " +
                            "alignleft aligncenter alignright alignjustify | " +
                            "bullist numlist outdent indent | " +
                            "link image media table | code preview fullscreen | removeformat",

                          image_title: true,
                          image_description: true,
                          image_dimensions: true,
                          image_class_list: [
                            { title: "Responsive", value: "img-responsive" },
                            { title: "Rounded", value: "img-rounded" },
                          ],

                          paste_data_images: false,

                          media_live_embeds: true,
                          extended_valid_elements:
                            "iframe[src|frameborder|allowfullscreen|width|height|name|title|allow|referrerpolicy]",
                          valid_elements: "*[*]",

                          table_default_attributes: {
                            border: "1",
                          },

                          skin: "oxide-dark",
                          content_css: "dark",
                          readonly: !!editingId && isDetailMode,
                        }}
                      />
                    </div>
                  </div>
                  </fieldset>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {message && (
                      <p className="text-sm text-emerald-400">{message}</p>
                    )}
                    <div className="flex gap-2 justify-end w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-slate-700 text-white hover:bg-slate-800"
                        onClick={() => {
                          resetForm();
                          setIsModalOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      {editingId && isDetailMode && (
                        <Button type="button" className="border-slate-700 text-white hover:bg-slate-800" onClick={() => setIsDetailMode(false)}>
                          Edit
                        </Button>
                      )}
                      <Button type="submit" disabled={loading || (!!editingId && isDetailMode)}>
                        {loading
                          ? editingId
                            ? "Updating..."
                            : "Saving..."
                          : editingId
                            ? "Save changes"
                            : "Create post"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBlogManager;

