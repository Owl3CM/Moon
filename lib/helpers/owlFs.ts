import fs from "fs";
import path from "path";
// Zero-dep ANSI color helpers (replaces chalk)
const ansi = (code: number) => (s: string) => `\x1b[${code}m${s}\x1b[0m`;
const chalk = {
  greenBright: { bold: (s: string) => ansi(1)(`\x1b[92m${s}`) },
  redBright: { bold: (s: string) => ansi(1)(`\x1b[91m${s}`) },
};

export const fileExists = async (dir: string): Promise<boolean> => fs.existsSync(dir);
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
    await fs.promises.rm(dir, { recursive: true });
    console.log(chalk.redBright.bold(`Directory '${dir}' deleted successfully.`));
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to delete directory '${dir}'.`);
  }
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
