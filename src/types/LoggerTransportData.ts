import { LogType } from './LogType';

/**
 * Represents the data object a logger transport's transport
 * function will receive when it is called
 */
export interface LoggerTransportData
{
	timestamp: Date;
	type: LogType;
	tag: string;
	text: string;
}
