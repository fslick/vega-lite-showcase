import * as fs from "async-file";
import moment from "moment";
import parse from "csv-parser";

export type UnwrapArray<T> = T extends Array<infer U> ? U : T;

export function log(text: string) {
    const timestamp = moment().format("HH:mm:ss.SSS");
    console.log(timestamp + " >> " + text);
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

export async function parseCsvFile<T>(csvPath: string, separator = ","): Promise<T[]> {
    const results: T[] = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
            .pipe(parse({separator}))
            .on("data", (row) => {
                results.push(row);
            })
            .on("end", () => {
                resolve(results);
            });
    });
}
