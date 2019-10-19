import { LogLevel } from './types/LogLevel';
import { LoggerCache } from './LoggerCache';
import { LoggerCacheKeys } from './types/LoggerCacheKeys';
import { LoggerTransportData } from './types/LoggerTransportData';

export abstract class LoggerTransport
{
	private _level?: LogLevel;

	public constructor(level?: LogLevel)
	{
		this._level = level;
	}

	public get level(): LogLevel
	{
		return typeof this._level !== 'undefined'
			? this._level
			: LoggerCache.get(LoggerCacheKeys.LogLevel);
	}

	public abstract transport(data: LoggerTransportData): void | Promise<void>;
}
