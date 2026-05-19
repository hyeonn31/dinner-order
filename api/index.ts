import "dotenv/config";
import { createApp } from "../server/_core/app";

/** Vercel: all traffic is rewritten to this Express app */
export default await createApp("production");
