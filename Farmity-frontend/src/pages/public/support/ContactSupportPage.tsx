import { useState, FormEvent } from "react";

function ContactSupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    alert("Message sent! (demo)");

    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="blog-page-bg min-h-screen py-4">
      <div className="max-w-[900px] mx-auto px-4">

        <article className="blog-article-frame">

          <div className="px-4 py-4">

            <h1 className="text-xl font-bold text-[#5a3b19] mb-4">
              Contact & Support
            </h1>

            <p className="text-[#5a3b19] mb-6 text-sm">
              If you have questions, bug reports, or need help with the game,
              feel free to contact us using the form below.
            </p>

            {/* EMAIL */}
            <div className="mb-6">
              <p className="font-semibold text-[#5a3b19]">
                Support Email
              </p>

              <p className="text-blue-700 underline">
                support@yourgame.com
              </p>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 max-w-[500px]"
            >

              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-[#8b4a14] px-3 py-2 bg-[#fff6d5]"
                required
              />

              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-[#8b4a14] px-3 py-2 bg-[#fff6d5]"
                required
              />

              <textarea
                rows={5}
                placeholder="Your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border border-[#8b4a14] px-3 py-2 bg-[#fff6d5]"
                required
              />

              <button
                type="submit"
                className="bg-[#d48a2a] text-white font-semibold py-2 hover:bg-[#b86e19] w-[180px]"
              >
                Send Message
              </button>

            </form>

            {/* EXTRA */}

            <div className="mt-8 text-sm text-[#5a3b19]">
              <p className="font-semibold mb-2">
                Need technical help?
              </p>

              <a
                href="/troubleshooting"
                className="text-blue-700 underline"
              >
                View Troubleshooting Guide
              </a>
            </div>

          </div>

        </article>

      </div>
    </div>
  );
}

export default ContactSupportPage;