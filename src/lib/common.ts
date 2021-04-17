import * as fs from "fs";
import * as fsAsync from "async-file";
import parse from "csv-parser";

export function log(text: string) {
    console.log(text);
}

export function overwriteFileSync(filepath: string, text: string) {
    if (fs.existsSync(filepath)) {
        fs.rmSync(filepath);
    }
    fs.writeFileSync(filepath, text);
}

export function createFolderSync(folderpath: string) {
    if (!fs.existsSync(folderpath)) {
        fs.mkdirSync(folderpath);
    }
}

export async function parseCsvFile<T>(csvPath: string): Promise<T[]> {
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