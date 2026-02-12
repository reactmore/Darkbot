import { TelegramClient } from "telegram";

export interface ModuleConfig {
    pattern: string;
    fromMe: boolean;
    desc: string;
    use: string;
}

export interface BaseMessage {
    client: TelegramClient;
}

export type ModuleCallback = (
    message: any,
    match: string[]
) => Promise<void>;

export type Module = (
    config: ModuleConfig,
    callback: ModuleCallback
) => void;
