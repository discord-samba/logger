import * as FS from 'fs';
import * as Path from 'path';
import { LogLevel } from '../types/LogLevel';
import { LoggerCache } from '../LoggerCache';
import { LoggerCacheKeys } from '../types/LoggerCacheKeys';
import { LoggerTransport } from '../LoggerTransport';
import { LoggerTransportData } from '../types/LoggerTransportData';

/**
 * Optional logger transport that logs to files in the given directory.
 * Can be given a number of days of logs to keep, defaults to 7.
 * Can be given a log level which will override the globally configured
 * log level
 */
export class LogFileTransport extends LoggerTransport
{
	private readonly _logDir: string;
	private readonly _keepDays: number;
	private _fileDescriptor!: number;
	private _currentDate!: number;

	private static readonly _logFileDateRegex: RegExp = /(\d{4})-(\d{2})-(\d{2})/;
	private static readonly _logFileRegex: RegExp = /\d{4}-\d{2}-\d{2}\.log/;
	private static readonly _oneDay: number = 6e4 * 60 * 24;

	public constructor(dir: string, keepDays?: number, level?: LogLevel)
	{
		super(level);
		this._logDir = dir;

		this._keepDays = Math.max(1, keepDays ?? 7) - 1;

		if (!FS.existsSync(this._logDir))
			FS.mkdirSync(this._logDir);

		this._newLog();
	}

	/**
	 * Create a `YYYY-MM-DD` date string from the given time in milliseconds
	 * @internal
	 */
	private static _createDateStr(time: number): string
	{
		const date: Date = new Date(time);
		const y: string = date.getFullYear().toString();
		const d: string = LogFileTransport._zeroPad(date.getDate());

		// Add 1 because month is 0-indexed
		const m: string = LogFileTransport._zeroPad(date.getMonth() + 1);

		return `${y}-${m}-${d}`;
	}

	/**
	 * Parses the date from the given `YYYY-MM-DD` string. We parse manually
	 * here because Date 0-indexes the month but we store it with a 1-index
	 * @internal
	 */
	private static _parseDateStr(date: string): number
	{
		if (!LogFileTransport._logFileDateRegex.test(date))
			throw new TypeError('Invalid date string');

		const match: RegExpMatchArray = date.match(LogFileTransport._logFileDateRegex)!;
		const y: number = parseInt(match[1]);
		const d: number = parseInt(match[3]);

		// Subtract 1 because month is 0-indexed
		const m: number = parseInt(match[2]) - 1;

		return new Date(y, m, d, 0, 0, 0, 0).getTime();
	}

	/**
	 * Returns the given time (in milliseconds), rounded down to midnight
	 * of the same day
	 * @internal
	 */
	private static _roundTime(time: number): number
	{
		const date: Date = new Date(time);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		return date.getTime();
	}

	/**
	 * Pads the given number/string to `n` spaces with `0` and returns it
	 * @internal
	 */
	private static _zeroPad(value: number | string, n: number = 2): string
	{
		return (typeof value === 'number' ? value.toString() : value).padStart(n, '0');
	}

	/**
	 * Opens a log file for the current day (creating it if it doesn't exist)
	 * and runs cleanup to remove any logs that fall outside the configured
	 * number of days to keep
	 * @internal
	 */
	private _newLog(): void
	{
		if (typeof this._fileDescriptor !== 'undefined')
			FS.closeSync(this._fileDescriptor);

		this._currentDate = LogFileTransport._roundTime(Date.now());

		const fileName: string = `${LogFileTransport._createDateStr(this._currentDate)}.log`;
		this._fileDescriptor = FS.openSync(Path.join(this._logDir, fileName), 'a+');

		this._cleanup();
	}

	/**
	 * Iterates over log files in the logs directory and clean up any that
	 * are older than the configured number of days to keep
	 * @internal
	 */
	private async _cleanup(): Promise<void>
	{
		const files: string[] = FS.readdirSync(this._logDir);
		for (const file of files)
		{
			if (!LogFileTransport._logFileRegex.test(file))
				continue;

			const fileTime: number = LogFileTransport._parseDateStr(file);
			const keepDuration: number = LogFileTransport._oneDay * this._keepDays;
			const cutoff: number = LogFileTransport._roundTime(Date.now()) - keepDuration;

			if (fileTime < cutoff)
			{
				try { FS.unlinkSync(Path.join(this._logDir, file)); }
				catch {}
			}
		}
	}

	/**
	 * Returns the currently cached shard if any
	 * @internal
	 */
	private static _shard(): string
	{
		if (!LoggerCache.has(LoggerCacheKeys.Shard))
			return '';

		const shardVal: number = LoggerCache.get(LoggerCacheKeys.Shard);
		const shardStr: string = LogFileTransport._zeroPad(shardVal);
		const shardTag: string = `[SHARD_${shardStr}]`;
		return shardTag;
	}

	public async transport(data: LoggerTransportData): Promise<void>
	{
		if (this._currentDate < LogFileTransport._roundTime(Date.now()))
			this._newLog();

		let { tag } = data;
		const { type, text } = data;
		const d: Date = data.timestamp;
		const h: string = LogFileTransport._zeroPad(d.getHours());
		const m: string = LogFileTransport._zeroPad(d.getMinutes());
		const s: string = LogFileTransport._zeroPad(d.getSeconds());
		const t: string = `${h}:${m}:${s}`;

		// Set the highest type width we've encountered so far
		if (type.length > LoggerCache.get(LoggerCacheKeys.LogFileTransportTypeWidth, 0))
			LoggerCache.set(LoggerCacheKeys.LogFileTransportTypeWidth, type.length);

		// Set the highest tag width we've encountered so far
		if (tag.length > LoggerCache.get(LoggerCacheKeys.LogFileTransportTagWidth, 0))
			LoggerCache.set(LoggerCacheKeys.LogFileTransportTagWidth, tag.length);

		const wrappedType: string =
			type.padEnd(LoggerCache.get(LoggerCacheKeys.LogFileTransportTypeWidth));

		tag = tag.padEnd(LoggerCache.get(LoggerCacheKeys.LogFileTransportTagWidth));

		FS.appendFileSync(
			this._fileDescriptor,
			`[${t}]${LogFileTransport._shard()}[${wrappedType}][${tag}]: ${text}\n`
		);
	}
}
