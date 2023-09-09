import fs from "fs";

fs.readFile("./dist/lib/Moon.d.ts", "utf8", (err, data) => {
  if (err) throw err;
  const code = data.replace(`import { Theme, Color } from "./Types";`, `import { Theme, Color } from "../../../../Moon.Types";`);
  // write the new file
  fs.writeFile("./dist/lib/Moon.d.ts", code, function (err) {
    if (err) throw err;
    console.log("Moon.d.ts updated");
  });
});
