import fs from "fs";
import path from "path";
import chalk from "chalk";

let counter = 0;

export const fileExists = async (dir: string): Promise<boolean> => fs.existsSync(dir);
export const logger = async (message: any, name = `log${counter++}`, clear = false) => {
  if (typeof message === "object") message = JSON.stringify(message);
  else if (typeof message === "string") message = `"${message}"`;
  else if (typeof message === "function") message = message.toString();
  else if (typeof message === "number") message = message.toString();
  else if (typeof message === "boolean") message = message.toString();
  else if (typeof message === "undefined") message = "undefined";
  else if (typeof message === "bigint") message = message.toString();
  else if (typeof message === "symbol") message = message.toString();
  const date = new Date();
  const time = date.toLocaleTimeString() + " - " + date.getMilliseconds() + " ms";
  const log = `const ${name}__${counter++} = ${message};// ${time}`;
  if (clear) fs.writeFileSync("./logger.js", "");
  if (!fileExists("./logger.js")) {
    fs.mkdirSync("./logger.js");
  }
  fs.appendFileSync("./logger.js", log + "\n");
};
logger("logger started", "logger", true);
export async function createFolder(dir: string, files: Record<string, any> = {}): Promise<string> {
  try {
    if (!(await fileExists(dir))) {
      await fs.promises.mkdir(dir, { recursive: true });
      console.log(chalk.greenBright.bold(`Directory '${dir}' created successfully.`));
    }
    files = Object.fromEntries(Object.entries(files).filter(([, value]) => value !== undefined));
    for (const { name, content } of Object.values(files)) {
      await createFile({ dir, name, content });
    }
    return dir;
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to create directory '${dir}'.`);
  }
}

export async function createFile({ dir, name, content }: { dir: string; name: string; content: string }): Promise<string> {
  const filePath = path.join(dir, name);
  try {
    await fs.promises.writeFile(filePath, content);
    console.log(chalk.greenBright.bold(`File '${filePath}' created successfully.`));
    return filePath;
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to create file '${filePath}'.`);
  }
}

export async function deleteFolder(dir: string): Promise<void> {
  try {
    await fs.promises.rmdir(dir, { recursive: true });
    console.log(chalk.redBright.bold(`Directory '${dir}' deleted successfully.`));
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to delete directory '${dir}'.`);
  }
}

// export async function createFolder(dir) {
//     try {
//         await fs.promises.mkdir(dir, { recursive: true });
//         console.log(`Directory '${dir}' created successfully.`);
//         return dir;
//     } catch (err) {
//         console.error(err);
//     }
// }

export async function runCommand(command: string): Promise<void> {
  const { exec } = await import("child_process");
  return new Promise((resolve, reject) => {
    console.log({ command });

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.redBright.bold(`Error: while running '${command}'`));
        reject(error);
      }
      if (stdout) console.log(`stdout: ${stdout}`);
      if (stderr) console.error(`stderr: ${stderr}`);
      resolve();
    });
  });
}

export async function formateScript(dir: string): Promise<void> {
  await runCommand(`npx prettier --write ${dir}/**/* `);
}

export async function readFile(dir: string): Promise<string> {
  try {
    const data = await fs.promises.readFile(dir, "utf8");
    return data;
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to read file '${dir}'.`);
  }
}
