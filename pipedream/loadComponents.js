// Replace the whole loadComponents() function in the fetch_demo_config workflow.
// Components now load from this repo instead of Confluence.
// COMPONENT_REF picks the branch to read from. Use "main" once the branch is merged.
const COMPONENT_REF = "demo-components";
const COMPONENT_NAMES = ["home", "chat"];
const RAW_BASE = `https://raw.githubusercontent.com/richardcollins-pixel/thoughtful-prototypes/${COMPONENT_REF}/components`;

async function loadComponents() {
  const fetchText = (url) =>
    axios.get(url, { responseType: "text", transformResponse: [(d) => d] }).then((r) => r.data);

  const results = await Promise.allSettled(
    COMPONENT_NAMES.map(async (name) => {
      const [css, js] = await Promise.all([
        fetchText(`${RAW_BASE}/${name}.css`),
        fetchText(`${RAW_BASE}/${name}.js`),
      ]);
      components[name] = { css, js };
    })
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.warn(
        `Component "${COMPONENT_NAMES[index]}" failed to load:`,
        result.reason?.message || result.reason
      );
    }
  });

  console.log(`Loaded components: ${Object.keys(components).sort().join(", ")}`);
}
