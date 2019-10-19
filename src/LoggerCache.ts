import { DefaultTransport } from './transports/DefaultTransport';
import { LogLevel } from './types/LogLevel';
import { LoggerCacheKeys } from './types/LoggerCacheKeys';
import { LoggerTransport } from './LoggerTransport';

export class LoggerCache
{
	private static _staticInstance: LoggerCache;
	private _cache: Map<string, any>;

	private _transports: Map<string, LoggerTransport>;

	public constructor()
	{
		if (typeof LoggerCache._staticInstance !== 'undefined')
			throw new Error('Cannot create multiple instances of LoggerCache');

		this._cache = new Map();
		this._transports = new Map();

		// Set the default log level
		this._cache.set(LoggerCacheKeys.LogLevel, LogLevel.DEBUG);

		// Set the default transport
		this._transports.set(LoggerCacheKeys.DefaultTransport, new DefaultTransport());

		LoggerCache._staticInstance = this;
	}

	/**
	 * The LoggerCache instance
	 */
	public static get instance(): LoggerCache
	{
		// // return LoggerCache._staticInstance ?? new LoggerCache();
		return typeof LoggerCache._staticInstance !== 'undefined'
			? LoggerCache._staticInstance
			: new LoggerCache();
	}

	/**
	 * Adds a transport to the cache for the given key
	 */
	public static addTransport(key: string, transport: LoggerTransport): void
	{
		LoggerCache.instance._transports.set(key, transport);
	}

	/**
	 * Removes the given transport from the cache
	 */
	public static removeTransport(key: string): void
	{
		LoggerCache.instance._transports.delete(key);
	}

	/**
	 * Removes the default transport from the cache
	 */
	public static removeDefaultTransport(): void
	{
		LoggerCache.instance._transports.delete(LoggerCacheKeys.DefaultTransport);
	}

	/**
	 * Returns an array of all cached Transports
	 */
	public static getTransports(): LoggerTransport[]
	{
		return Array.from(LoggerCache.instance._transports.keys())
			.map(k => LoggerCache.instance._transports.get(k)!);
	}

	/**
	 * Returns whether or not the cache has a value for the given key
	 */
	public static has(key: string): boolean
	{
		return typeof LoggerCache.instance._cache.get(key) !== 'undefined';
	}

	/**
	 * Gets a value from the LoggerCache
	 */
	public static get(key: string): any
	{
		return LoggerCache.instance._cache.get(key);
	}

	/**
	 * Sets a value in the LoggerCache
	 */
	public static set(key: string, value: any): void
	{
		LoggerCache.instance._cache.set(key, value);
	}

	/**
	 * Removes a value from the LoggerCache
	 */
	public static remove(key: string): void
	{
		LoggerCache.instance._cache.delete(key);
	}
}
