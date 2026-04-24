import { TextEncoder, TextDecoder } from "text-encoding";

declare global {
  interface IGlobal {
    TextEncoder: typeof TextEncoder;
    TextDecoder: typeof TextDecoder;
  }
}

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
