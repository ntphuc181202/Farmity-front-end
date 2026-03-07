import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import blogApi from "../../../api/blogApi";
import he from "he";

interface BlogDetail {
  _id?: string;
  id?: string;
  title?: string;
  content?: string;
  createdAt?: string;
}

function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchPost = async () => {
      try {
        if (!id) {
          setError("Post not found.");
          return;
        }
        const res = await blogApi.getBlogById(id);
        if (!mounted) return;
        setPost(res.data || null);
        if (!res.data) {
          setError("Post not found.");
        }
      } catch (err) {
        console.error("Failed to load blog detail:", err);
        if (mounted) setError("Failed to load blog post.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPost();

    return () => {
      mounted = false;
    };
  }, [id]);

  const base = import.meta.env.BASE_URL || "/";

  const createdAt = post?.createdAt ? new Date(post.createdAt) : null;

  return (
    <div className="blog-page-bg min-h-screen py-4">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6">
        <header className="mb-10 flex flex-col items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/blog')}
            className="self-start mb-2 inline-flex items-center gap-1 rounded border border-[#fdf6b3]/70 bg-black/30 px-3 py-1 text-xs font-semibold text-[#fdf6b3] hover:bg-black/50 transition-colors"
          >
            ← Back
          </button>

          <img
            src={`${base}img/logo.png`}
            alt="Stardewvalley logo"
            className="h-20 sm:h-28 md:h-40 drop-shadow-[0_4px_0_rgba(0,0,0,0.6)]"
          />
        </header>

        {loading && (
          <p className="text-center text-[#fdf6b3] text-sm">Loading post...</p>
        )}

        {error && !loading && (
          <p className="text-center text-red-100 text-sm">{error}</p>
        )}

        {!loading && !error && post && (
          <article className="blog-article-frame">
            <div className="px-4 sm:px-6 py-4">
              <header className="mb-3">
                {createdAt && (
                  <p className="text-[11px] text-[#5a3b19] mb-1">
                    {createdAt.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                    })}
                  </p>
                )}
                <h1 className="text-xl sm:text-2xl font-bold text-[#5a3b19] leading-snug">
                  {post.title}
                </h1>
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
        )}
      </div>
    </div>
  );
}

export default BlogDetailPage;

