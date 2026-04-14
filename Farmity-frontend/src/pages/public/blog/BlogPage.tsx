import { useEffect, useState } from "react";
import blogApi from "../../../api/blogApi";
import he from "he";

interface BlogPost {
  _id?: string;
  id?: string;
  title?: string;
  content?: string;
  createdAt?: string;
}

function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let mounted = true;

    const fetchPosts = async () => {
      try {
        const res = await blogApi.getAllBlogs();
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : [];
        setPosts(data);
      } catch (err) {
        console.error("Failed to load public blogs:", err);
        if (mounted) setError("Failed to load blog posts.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPosts();

    return () => {
      mounted = false;
    };
  }, []);

  const base = import.meta.env.BASE_URL || "/";

  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visiblePosts = posts.slice(startIndex, startIndex + pageSize);

  return (
    <div className="blog-page-bg min-h-screen py-4">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6">
        <header className="mb-32 flex flex-col items-center justify-center gap-2">
          <img
            src={`${base}img/herologo.png`}
            alt="Farmity logo"
            className="h-24 sm:h-32 md:h-[260px] drop-shadow-[0_4px_0_rgba(0,0,0,0.6)] mb-8"
          />
          <img
            src={`${base}img/dev.png`}
            alt="Developer avatar"
            className="w-full max-w-[320px] h-auto rounded-md border border-[#d58b2a] shadow-[0_2px_0_#a7611c] bg-[#fdf1b4]"
          />
        </header>

        {loading && (
          <p className="text-center text-[#fdf6b3] text-sm">Loading posts...</p>
        )}

        {error && !loading && (
          <p className="text-center text-red-100 text-sm">{error}</p>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-8">
            {visiblePosts.map((post) => {
              const id = post._id || post.id;
              const createdAt = post.createdAt
                ? new Date(post.createdAt)
                : new Date();

              return (
                <article
                  key={id}
                  className="blog-article-frame cursor-pointer"
                  onClick={() => (window.location.href = `/blog/${id}`)}
                >
                  <div className="px-4 sm:px-6 py-4">
                    <header className="mb-3">
                      <p className="text-[11px] text-[#5a3b19] mb-1">
                        {createdAt.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                        })}
                      </p>
                      <h2 className="text-lg font-bold text-[#5a3b19] leading-snug">
                        {post.title}
                      </h2>
                    </header>

                    {post.content && (
                      <div
                        className="blog-article-content prose prose-sm max-w-none text-[#5a3b19]"
                        dangerouslySetInnerHTML={{
                          __html: he.decode(post.content),
                        }}
                      />
                    )}
                  </div>
                </article>
              );
            })}

            {posts.length === 0 && (
              <p className="text-center text-[#fdf6b3] text-sm">
                No posts yet. Please check back later.
              </p>
            )}
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-3 text-[#fdf6b3] text-sm">
            <button
              type="button"
              className="px-3 py-1 rounded border border-[#fdf6b3]/60 bg-black/30 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/50 transition-colors"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              « Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              className="px-3 py-1 rounded border border-[#fdf6b3]/60 bg-black/30 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/50 transition-colors"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next »
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogPage;

