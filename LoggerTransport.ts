import { LogLevel } from '#type/LogLevel';
import { LoggerCache } from '#root/LoggerCache';
import { LoggerCacheKeys } from '#type/LoggerCacheKeys';
import { LoggerTransportData } from '#type/LoggerTransportData';

/**
 * The base abstract logger transport class that should be extended
 * for creating custom logger transports
 */
export abstract class LoggerTransport
{
	private _level?: LogLevel;

	public constructor(level?: LogLevel)
	{
		this._level = level;
	}

	public get level(): LogLevel
	{
		return this._level ?? LoggerCache.get(LoggerCacheKeys.LogLevel);
	}

	/**
	 * The transport method must be implemented in your custom transport
	 * classes. This method is expected to receive a LoggerTransportData
	 * object when called, and should not return a value. Can be async
	 * if desired and is recommended to not block execution when logging
	 */
	public abstract transport(data: LoggerTransportData): void | Promise<void>;
}
