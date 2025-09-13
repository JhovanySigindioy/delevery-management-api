import { config } from "dotenv";
import { execSync } from "child_process";

config();

const token = process.env.TOKEN_NAME_SERVER || "";
const urlServerPos01 = process.env.URL_POS01_CREDENTIALS || "";
const urlServerSuministros = process.env.URL_SUMINISTROS_CREDENTIALS || "";

let cachedHostPos01: string | null = null;
let cachedHostSuministros: string | null = null;

function fetchHostSync(token: string, urlServerName: string): string {
    try {
        const output = execSync(
            `curl -s -H "Authorization: Bearer ${token}" ${urlServerName}`,
            { encoding: "utf8" }
        );

        const data = JSON.parse(output);
        return data.host;
    } catch (err) {
        const e = err as Error;
        console.error("❌ Error obteniendo host:", e);
        process.exit(1);
    }
}

export function getNameServerPos01(): string {
    if (!cachedHostPos01) {
        cachedHostPos01 = fetchHostSync(token, urlServerPos01);
    }
    return cachedHostPos01;
}

export function getNameServerSuminstros(): string {
    if (!cachedHostSuministros) {
        cachedHostSuministros = fetchHostSync(token, urlServerSuministros);
    }
    return cachedHostSuministros;
}
