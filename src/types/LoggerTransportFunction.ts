import { LoggerTransportData } from './LoggerTransportData';

export type LoggerTransportFunction = (data: LoggerTransportData) => Promise<void>;
