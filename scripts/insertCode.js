import fs from "fs";

fs.readFile("./dist/index.d.ts", "utf8", (err, data) => {
  if (err) throw err;
  const code = data.replace(`import { Theme, Color } from "../Moon.Types";`, `import { Theme, Color } from "../../../Moon.Types";`);
  // write the new file
  fs.writeFile("./dist/index.d.ts", code, function (err) {
    if (err) throw err;
    console.log("index.d.ts updated");
  });
});
