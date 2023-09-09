export declare const fileExists: (dir: string) => Promise<boolean>;
export declare function createFolder(dir: string, files?: Record<string, any>): Promise<string>;
export declare function createFile({ dir, name, content }: {
    dir: string;
    name: string;
    content: string;
}): Promise<string>;
export declare function deleteFolder(dir: string): Promise<void>;
export declare function runCommand(command: string): Promise<void>;
export declare function formateScript(dir: string): Promise<void>;
export declare function readFile(dir: string): Promise<string>;
