/** @type {import('@chestnut/plugin-sdk').PluginExports} */
let pet;
let unsubStats = () => {};
let cssLink;

export async function onLoad(api) {
  cssLink = document.createElement("link");
  cssLink.rel = "stylesheet";
  cssLink.href = await api.getResourceUrl("widget.css");
  cssLink.dataset.chestnutCat = "css";
  document.head.appendChild(cssLink);

  const widgetHref = await api.getResourceUrl("widget.js");
  const mod = await import(/* @vite-ignore */ widgetHref);
  const assetMap = { "widget.js": widgetHref, "widget.css": cssLink.href };
  const files = mod.PET_ASSET_FILES || [];
  await Promise.all(
    files.map(async (rel) => {
      assetMap[rel] = await api.getResourceUrl(rel);
    }),
  );

  pet = mod.mountChestnutPet({
    host: document.body,
    assetMap,
    stats: api.stats.getSnapshot(),
  });
  unsubStats = api.events.on("writing-stats", (data) => {
    pet?.setStats?.(data);
  });
  api.log("Chestnut Cat loaded");
}

export async function onUnload() {
  unsubStats();
  pet?.destroy?.();
  pet = undefined;
  cssLink?.remove();
}
