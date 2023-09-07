import pak from "../package.json" assert { type: "json" };
import { exec } from "child_process";

async function run() {
  const versions = pak.version.split(".");
  const version = `${versions[0]}.${versions[1]}.${+versions[2] + 1}`;
  const removeDist = "rm -rf dist ";
  const buildDist = "yarn build";
  const copyConfig = "cp ./moonconfig.json ./dist/moonconfig.json";
  const addComent = "git add .";
  const publish = `yarn publish --new-version ${version} --access public`;
  const gitStage = `git commit -m "v ${version}"`;
  const gitPush = "git push";
  try {
    await exec("clear");
    // await exec(removeDist);
    // await exec(buildDist);
    // await exec(copyConfig);
    await exec(addComent);
    await exec(gitStage);
    await exec(publish);
    await exec(gitPush);
    console.log("published!");
  } catch (error) {
    console.error(`Error executing commands: ${error}`);
  }
}
run();
