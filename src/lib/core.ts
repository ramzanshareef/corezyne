export function cleanDynamic(obj: any): any {
    return obj.__dynamic;
}


export function ensureMongoUpdateSyntax(data: any) {
    if (!data) return data;
    if (typeof data === "string") {
        try {
            data = JSON.parse(data);
        } catch {
            throw new Error("Invalid stringified JSON in 'data'");
        }
    }
    if (typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Update 'data' must be a valid object");
    }

    const keys = Object.keys(data);
    const hasModifier = keys.some(k => k.startsWith("$"));
    if (!hasModifier) return { $set: data };
    for (const key of keys) {
        if (typeof data[key] === "string") {
            try {
                data[key] = JSON.parse(data[key]);
            } catch {
                throw new Error(`Invalid stringified JSON in 'data.${key}'`);
            }
        }
    }
    return data;
}
