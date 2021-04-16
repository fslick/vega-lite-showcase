import * as fs from 'fs';

export function log(text: string) {
    console.log(text);
}

export function overwriteFile(filepath: string, text: string) {
    if (fs.existsSync(filepath)) {
        fs.rmSync(filepath);
    }
    fs.writeFileSync(filepath, text);
}

export function createFolder(folderpath: string) {
    if (!fs.existsSync(folderpath)) {
        fs.mkdirSync(folderpath);
    }
}