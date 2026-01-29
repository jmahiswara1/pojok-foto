import app from '../src/index';

console.log("-> Starting Backend Function...");

export default async function handler(req: any, res: any) {
    try {
        console.log(`-> Received Request: ${req.method} ${req.url}`);
        return await app(req, res);
    } catch (error) {
        console.error("-> CRITICAL SERVER ERROR:", error);
        res.status(500).json({ error: "Internal Server Error", details: error });
    }
}
