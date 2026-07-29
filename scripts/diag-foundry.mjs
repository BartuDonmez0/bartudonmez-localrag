import { FoundryLocalManager } from "foundry-local-sdk";

const timeoutMs = 60000;
const timer = setTimeout(() => {
  console.error("TIMEOUT after 60s waiting for catalog.getModel");
  process.exit(2);
}, timeoutMs);

try {
  console.log("Creating manager...");
  const manager = FoundryLocalManager.create({ appName: "bartudonmez-localrag-diag" });
  console.log("Catalog name:", manager.catalog.name);
  console.log("Fetching model list (may download catalog)...");
  const model = await manager.catalog.getModel("phi-3.5-mini");
  clearTimeout(timer);
  console.log("OK alias=", model.alias, "cached=", model.isCached);
  process.exit(0);
} catch (err) {
  clearTimeout(timer);
  console.error("FAIL:", err);
  process.exit(1);
}
