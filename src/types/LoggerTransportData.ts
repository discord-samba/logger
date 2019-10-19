import { LogType } from './LogType';

export interface LoggerTransportData
{
	timestamp: Date;
	type: LogType;
	tag: string;
	text: string;
}
