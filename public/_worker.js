export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve static assets
    try {
      return await env.ASSETS.fetch(request);
    } catch {
      // SPA fallback — toutes les routes → index.html
      return await env.ASSETS.fetch(new URL("/index.html", url.origin));
    }
  },
};
