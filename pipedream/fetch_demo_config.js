import axios from "axios";

// Workflow: fetch_demo_config. Step: fetch_demo_config.
// Components are returned as URLs (demo.html loads them in parallel). Prompt bodies come from one search.
export default defineComponent({
  async run({ steps, $ }) {
    const BASE = "https://springhealth.atlassian.net/wiki";

    const auth = Buffer.from(
      `${process.env.CONFLUENCE_USER_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`
    ).toString("base64");

    const headers = {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
    };

    const DEMO_PROMPTS_PAGE_ID = "4318920833";

    // Components load from the GitHub repo. Set COMPONENT_REF to the branch to read.
    // The list of components is components/index.json in that branch.
    const COMPONENT_REF = "demo-components";
    const RAW_BASE = `https://raw.githubusercontent.com/richardcollins-pixel/thoughtful-prototypes/${COMPONENT_REF}/components`;

    // One search returns each page's body, so there are no per-page requests.
    async function fetchAllPromptPages() {
      const pages = [];
      const limit = 100;
      let start = 0;

      while (true) {
        const url = new URL(`${BASE}/rest/api/content/search`);
        url.searchParams.set(
          "cql",
          `ancestor = ${DEMO_PROMPTS_PAGE_ID} AND type = page`
        );
        url.searchParams.set("limit", String(limit));
        url.searchParams.set("start", String(start));
        url.searchParams.set("expand", "body.atlas_doc_format,body.storage");

        const res = await axios.get(url.toString(), { headers });
        const batch = res.data.results || [];

        pages.push(...batch);

        if (batch.length < limit) break;
        start += batch.length;
      }

      return pages;
    }

    function decodeHtml(value = "") {
      return value
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&#039;/g, "'")
        .replace(/&amp;/g, "&");
    }

    function nodeText(node) {
      if (!node) return "";

      const ownText = typeof node.text === "string" ? node.text : "";
      const childText = (node.content || []).map(nodeText).join("");

      return ownText + childText;
    }

    function extractAdfCodeBlocks(adf) {
      const blocks = [];

      function visit(node) {
        if (!node || typeof node !== "object") return;

        if (node.type === "codeBlock") {
          const text = nodeText(node).trim();
          if (text) blocks.push(text);
          return;
        }

        (node.content || []).forEach(visit);
      }

      visit(adf);
      return blocks;
    }

    function extractAdfMetadata(adf) {
      const metadata = {};

      function visit(node) {
        if (!node || typeof node !== "object") return;

        if (node.type === "tableRow") {
          const cells = (node.content || [])
            .filter(
              (child) =>
                child.type === "tableCell" || child.type === "tableHeader"
            )
            .map((cell) => nodeText(cell).trim());

          if (cells.length >= 2) {
            const key = cells[0].toLowerCase();
            const value = cells[1].trim();

            if (key === "prompt_key") metadata.prompt_key = value;
            if (key === "shared_prompt_key") {
              metadata.shared_prompt_key = value;
            }
          }
        }

        (node.content || []).forEach(visit);
      }

      visit(adf);
      return metadata;
    }

    function extractStorageCodeBlocks(storage = "") {
      const cdataBlocks = [
        ...storage.matchAll(/<!\[CDATA\[([\s\S]*?)\]\]>/g),
      ].map((match) => match[1].trim());

      const htmlCodeBlocks = [
        ...storage.matchAll(
          /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi
        ),
      ].map((match) => decodeHtml(match[1]).trim());

      return [...cdataBlocks, ...htmlCodeBlocks].filter(Boolean);
    }

    function extractStorageMetadata(storage = "") {
      const promptKeyMatch = storage.match(
        /<td[^>]*>\s*<p[^>]*>prompt_key<\/p>\s*<\/td>\s*<td[^>]*>\s*<p[^>]*>([\w_]+)<\/p>/i
      );

      const sharedKeyMatch = storage.match(
        /<td[^>]*>\s*<p[^>]*>shared_prompt_key<\/p>\s*<\/td>\s*<td[^>]*>\s*<p[^>]*>([\w_]+)<\/p>/i
      );

      return {
        prompt_key: promptKeyMatch?.[1] || null,
        shared_prompt_key: sharedKeyMatch?.[1] || null,
      };
    }

    const prompts = {};
    const openers = {};
    const shared_prompts = {};

    async function loadPrompts() {
      const pages = await fetchAllPromptPages();

      pages.forEach((page) => {
        try {
          const storage = page.body?.storage?.value || "";
          const rawAdf = page.body?.atlas_doc_format?.value;
          const adf = rawAdf
            ? typeof rawAdf === "string"
              ? JSON.parse(rawAdf)
              : rawAdf
            : null;

          const metadata = {
            ...extractStorageMetadata(storage),
            ...extractAdfMetadata(adf),
          };

          // ADF is the primary source. Storage is only a compatibility fallback.
          let codeBlocks = extractAdfCodeBlocks(adf);
          if (!codeBlocks.length) codeBlocks = extractStorageCodeBlocks(storage);

          if (!codeBlocks.length) {
            throw new Error("No code block found");
          }

          if (metadata.shared_prompt_key) {
            shared_prompts[metadata.shared_prompt_key] = codeBlocks[0];
            return;
          }

          if (!metadata.prompt_key) {
            throw new Error("No prompt_key found");
          }

          const key = metadata.prompt_key;
          prompts[key] = codeBlocks[0];

          const openerBlock = codeBlocks
            .slice(1)
            .find((block) => /\[DEMO_OPENERS\]/i.test(block));

          if (openerBlock) {
            openers[key] = openerBlock
              .replace(/\[DEMO_OPENERS\]\s*/i, "")
              .replace(/\s*\[\/DEMO_OPENERS\]/i, "")
              .trim();
          }
        } catch (err) {
          console.warn(
            `Prompt "${page.title}" failed to load:`,
            err.message
          );
        }
      });

      console.log(
        `Loaded ${Object.keys(prompts).length} prompts: ${Object.keys(prompts)
          .sort()
          .join(", ")}`
      );
    }

    // The component list comes from components/index.json; each entry is a css and a js URL.
    async function loadComponentUrls() {
      const index = await axios
        .get(`${RAW_BASE}/index.json`, {
          responseType: "text",
          transformResponse: [(d) => d],
        })
        .then((r) => JSON.parse(r.data));

      const componentUrls = {};
      index.forEach((name) => {
        componentUrls[name] = {
          css: `${RAW_BASE}/${name}.css`,
          js: `${RAW_BASE}/${name}.js`,
        };
      });
      return componentUrls;
    }

    let componentUrls = {};
    try {
      componentUrls = await loadComponentUrls();
    } catch (err) {
      console.warn("Component list failed to load:", err.message);
    }

    try {
      await loadPrompts();
    } catch (err) {
      console.warn("Prompt fetch failed:", err.message);
    }

    return {
      config_vars: {
        chat_endpoint: process.env.CHAT_ENDPOINT || "",
        llm_model:
          process.env.LLM_MODEL ||
          "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
      },

      tokens: {
        "t-bg": "#1F0E41",
        "t-text-primary": "rgba(255,255,255,1.0)",
        "t-text-secondary": "rgba(255,255,255,0.80)",
        "t-text-tertiary": "rgba(255,255,255,0.40)",
        "t-blur": "blur(44px)",
        "t-glass-bg": "rgba(255,255,255,0.70)",
        "t-text-inverse": "#1F0E41",
      },

      components: {},
      componentUrls,

      steps: {
        home: {
          id: "home",
          component: "home",
          step_number: 1,
          content: {},
        },
        chat: {
          id: "chat",
          component: "chat",
          step_number: 2,
          content: {},
        },
      },

      prompts,
      openers,
      shared_prompts,
    };
  },
});
