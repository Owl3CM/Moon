import pak from "../package.json" assert { type: "json" };
import { exec } from "child_process";
import { packagePath } from "../dist/builder/controller.js";
import chalk from "chalk";

async function run() {
  let version = "";
  if (pak.version.includes("beta")) {
    const versions = pak.version.split(".");
    version = `${versions[0]}.${versions[1]}.${versions[2]}.${+versions[3] + 1}`;
  } else {
    const versions = pak.version.split(".");
    version = `${versions[0]}.${versions[1]}.${+versions[2] + 1}`;
  }
  console.log(packagePath);
  if (packagePath === "./dist") {
    console.log(chalk.red("fuck you return this"));
    return;
  }
  // const removeDist = "rm -rf dist ";
  // const buildDist = "yarn build";
  // const copyConfig = "cp ./moonconfig.json ./dist/moonconfig.json";
  const addComent = "git add .";
  const publish = `yarn publish --new-version ${version} --access public`;
  // const gitStage = `git commit -m "v ${version}"`;
  try {
    await exec("clear");
    // await exec(removeDist);
    // await exec(buildDist);
    // await exec(copyConfig);
    await exec(addComent);
    // await exec(gitStage);
    await exec(publish);
    // await exec(gitPush);
    console.log("\n" + chalk.cyanBright("published! version:" + version) + "\n");
  } catch (error) {
    console.error(`Error executing commands: ${error}`);
  }
}
run();
