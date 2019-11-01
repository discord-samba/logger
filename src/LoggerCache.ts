import { LogLevel } from './types/LogLevel';
import { LoggerCacheKeys } from './types/LoggerCacheKeys';
import { LoggerTransport } from './LoggerTransport';

/**
 * Cache singleton that can be used for caching logging related metadata
 * from within your custom logger transports. Avoid using keys beginning
 * with `__` (That's two (2) underscores) as any base transports use those
 * keys for their metadata and you wouldn't want to overwrite those.
 *
 * All methods are static and will automatically use/create the singleton
 * instance. You do not ever need to instantiate this class.
 */
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

		LoggerCache._staticInstance = this;
	}

	/**
	 * The LoggerCache instance
	 */
	private static get _instance(): LoggerCache
	{
		return LoggerCache._staticInstance ?? new LoggerCache();
	}

	/**
	 * Adds a transport to the cache for the given key
	 */
	public static addTransport(key: string, transport: LoggerTransport): void
	{
		LoggerCache._instance._transports.set(key, transport);
	}

	/**
	 * Removes the given transport from the cache
	 */
	public static removeTransport(key: string): void
	{
		LoggerCache._instance._transports.delete(key);
	}

	/**
	 * Removes the default transport from the cache
	 */
	public static removeDefaultTransport(): void
	{
		LoggerCache._instance._transports.delete(LoggerCacheKeys.DefaultTransport);
	}

	/**
	 * Returns an iterator of all cached Transports
	 */
	public static transports(): Iterable<LoggerTransport>
	{
		return LoggerCache._instance._transports.values();
	}

	/**
	 * Returns whether or not the cache has a value for the given key
	 */
	public static has(key: string): boolean
	{
		return typeof LoggerCache._instance._cache.get(key) !== 'undefined';
	}

	/**
	 * Gets a value from the LoggerCache, or default to the given fallback value
	 * if there is no value cached for the given key
	 */
	public static get(key: string, fallback?: any): any
	{
		return LoggerCache._instance._cache.get(key) ?? fallback;
	}

	/**
	 * Sets a value in the LoggerCache
	 */
	public static set(key: string, value: any): void
	{
		LoggerCache._instance._cache.set(key, value);
	}

	/**
	 * Removes a value from the LoggerCache
	 */
	public static remove(key: string): void
	{
		LoggerCache._instance._cache.delete(key);
	}
}
