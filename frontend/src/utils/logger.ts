import api from './api';
import { Device } from '@capacitor/device';

export const LogLevel = {
    DEBUG: 'DEBUG' as const,
    INFO: 'INFO' as const,
    WARN: 'WARN' as const,
    ERROR: 'ERROR' as const,
} as const;

type LogLevel = typeof LogLevel[keyof typeof LogLevel];

interface DeviceInfo {
    platform?: string;
    model?: string;
    operatingSystem?: string;
    osVersion?: string;
}

let cachedDeviceInfo: DeviceInfo | null = null;

const getDeviceInfo = async (): Promise<DeviceInfo> => {
    if (cachedDeviceInfo) return cachedDeviceInfo;
    
    try {
        const info = await Device.getInfo();
        cachedDeviceInfo = {
            platform: info.platform,
            model: info.model,
            operatingSystem: info.operatingSystem,
            osVersion: info.osVersion
        };
        return cachedDeviceInfo;
    } catch (error) {
        return {};
    }
};

export const log = async (
    message: string, 
    level: LogLevel = LogLevel.INFO,
    tag: string = 'App'
) => {
    try {
        const deviceInfo = await getDeviceInfo();
        await api.post('/api/logs/', {
            level,
            tag,
            message,
            device_info: deviceInfo
        });
    } catch (error) {
        // Fallback to console in case logging fails
        console.error('Logging failed:', error);
    }
};
