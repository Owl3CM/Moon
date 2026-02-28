#!/usr/bin/env node

import { Watcher } from "./workflow.js";
import { handleIconsCommand } from "./icons.js";

const args = process.argv.slice(2);

if (args[0] && args[0].startsWith("icons:")) {
  handleIconsCommand(args);
} else {
  Watcher();
}
