import * as fs from "async-file";
import parse from "csv-parser";

export type UnwrapArray<T> = T extends Array<infer U> ? U : T;

export function log(text: string) {
    console.log(text);
}

export async function overwriteFile(filepath: string, text: string) {
    const fileExists = await fs.exists(filepath);
    if (!fileExists) {
        await fs.delete(filepath);
    }
    await fs.writeFile(filepath, text);
}

export async function createFolder(folderpath: string) {
    const folderExists = await fs.exists(folderpath);
    if (!folderExists) {
        await fs.createDirectory(folderpath);
    }
}

export async function parseCsvFile<T>(csvPath: string): Promise<T[]> {
    console.log("Parsing: ", csvPath);
    const results: T[] = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
            .pipe(parse())
            .on("data", (row) => {
                results.push(row);
            })
            .on("end", () => {
                resolve(results);
            });
    });
}