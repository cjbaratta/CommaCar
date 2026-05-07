import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "pilotcompatible",
  title: "PilotCompatible",

  // Replace with your actual project ID and dataset from sanity.io/manage
  projectId: "xtqeaab6",
  dataset: "production",

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
});
