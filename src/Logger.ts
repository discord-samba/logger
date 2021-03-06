import { DefaultTransport } from '#transport/DefaultTransport';
import { LogLevel } from '#type/LogLevel';
import { LoggerCache } from '#root/LoggerCache';
import { LoggerCacheKeys } from '#type/LoggerCacheKeys';
import { LoggerProxy } from '#type/LoggerProxy';
import { LoggerTransport } from '#root/LoggerTransport';

export class Logger
{
	private constructor()
	{
		throw new Error('Cannot instantiate Logger. Use the static logging methods');
	}

	/**
	 * Add a logger transport to the cache. Will be used whenever a logging
	 * method is called. Key must be a string to identify the given transport
	 * so that it may be removed if desired
	 */
	public static addTransport(key: string, transport: LoggerTransport): void
	{
		LoggerCache.addTransport(key, transport);
	}

	/**
	 * Removes the transport with the given key from the cache
	 */
	public static removeTransport(key: string): void
	{
		LoggerCache.removeTransport(key);
	}

	/**
	 * Adds the default transport to the cache. This must be called if you want
	 * to use the logger without providing your own transports, otherwise nothing
	 * will happen when you call the logger methods.
	 *
	 * You could call this conditionally to turn Logging on or off, but the preferred
	 * method for turning off logging would be `Logger.setLogLevel(LogLevel.NONE)`
	 *
	 * You can optionally provide a log level which will cause the default transport
	 * to override the globally configured log level
	 */
	public static addDefaultTransport(level?: LogLevel): void
	{
		LoggerCache.addTransport(LoggerCacheKeys.DefaultTransport, new DefaultTransport(level));
	}

	/**
	 * Removes the default Logger transport from the logger cache
	 */
	public static removeDefaultTransport(): void
	{
		LoggerCache.removeDefaultTransport();
	}

	/**
	 * Sets the log level for logging
	 */
	public static setLogLevel(level: LogLevel): void
	{
		LoggerCache.set(LoggerCacheKeys.LogLevel, level);
	}

	/**
	 * Sets the shard number for this session
	 */
	public static setShard(shard: number): void
	{
		LoggerCache.set(LoggerCacheKeys.Shard, shard);
	}

	/**
	 * Returns a tagged Logger proxy. All logging methods on the proxy
	 * will use the given tag
	 */
	public static tag(tag: string): LoggerProxy
	{
		return new Proxy(Logger, {
			get: (target: any, key: PropertyKey) =>
			{
				switch (key)
				{
					case 'info':
					case 'warn':
					case 'error':
					case 'debug':
						return (...text: string[]) => target[key](tag, ...text);

					default:
						return target[key];
				}
			}
		});
	}

	/**
	 * Log to all cached transports if the log level is >= LogLevel.INFO
	 */
	public static info(tag: string, data: any, ...rest: any[]): void
	{
		Logger._write(LogLevel.INFO, tag, [data, ...rest]);
	}

	/**
	 * Log to all cached transports if the log level is >= LogLevel.WARN
	 */
	public static warn(tag: string, data: any, ...rest: any[]): void
	{
		Logger._write(LogLevel.WARN, tag, [data, ...rest]);
	}

	/**
	 * Log to all cached transports if the log level is >= LogLevel.ERROR
	 */
	public static error(tag: string, data: any, ...rest: any[]): void
	{
		Logger._write(LogLevel.ERROR, tag, [data, ...rest]);
	}

	/**
	 * Log to all cached transports if the log level is >= LogLevel.DEBUG
	 */
	public static debug(tag: string, data: any, ...rest: any[]): void
	{
		Logger._write(LogLevel.DEBUG, tag, [data, ...rest]);
	}

	/**
	 * Write to all the cached transports
	 */
	private static _write(level: LogLevel, tag: string, data: any[]): void
	{
		const timestamp: Date = new Date();
		const type: string = LogLevel[level];
		for (const transport of LoggerCache.transports())
			if (level <= transport.level)
				transport.transport({ timestamp, type, tag, text: data.join(' ') });
	}
}
