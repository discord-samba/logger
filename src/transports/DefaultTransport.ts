import { LogType } from '../types/LogType';
import { LoggerCache } from '../LoggerCache';
import { LoggerCacheKeys } from '../types/LoggerCacheKeys';
import { LoggerTransport } from '../LoggerTransport';
import { LoggerTransportData } from '../types/LoggerTransportData';

/** @internal */
type Color = [number, number];

/** @internal */
type Colors = 'red' | 'green' | 'yellow' | 'magenta' | 'cyan' | 'grey';

/** @internal */
type ColorWrapper = (text: string) => string;

/** @internal */
export class DefaultTransport extends LoggerTransport
{
	private static readonly _colors: { [key in Colors]: Color } = {
		red: [31, 39],
		green: [32, 39],
		yellow: [33, 39],
		magenta: [35, 39],
		cyan: [36, 39],
		grey: [90, 39]
	};

	private static readonly _typeColorWrappers: { [type: string]: ColorWrapper } = {
		[LogType.INFO]: DefaultTransport._createWrapper(DefaultTransport._colors.green),
		[LogType.WARN]: DefaultTransport._createWrapper(DefaultTransport._colors.yellow),
		[LogType.ERROR]: DefaultTransport._createWrapper(DefaultTransport._colors.red),
		[LogType.DEBUG]: DefaultTransport._createWrapper(DefaultTransport._colors.magenta)
	};

	/**
	 * Returns the given text wrapped in the given color
	 */
	private static _wrapColor(c: Color, text: string): string
	{
		return `\u001B[${c[0]}m${text}\u001B[${c[1]}m`;
	}

	/**
	 * Returns a ColorWrapper function for the given color
	 */
	private static _createWrapper(color: Color): ColorWrapper
	{
		return text => DefaultTransport._wrapColor(color, text);
	}

	/**
	 * Pads the given number/string to 2 spaces with 0s and returns it
	 */
	private static _zeroPad(n: number | string): string
	{
		return `0${n}`.slice(-2);
	}

	/**
	 * Returns the currently cached shard if any
	 */
	private static _shard(): string
	{
		if (!LoggerCache.has(LoggerCacheKeys.Shard))
			return '';

		const shardVal: number = LoggerCache.get(LoggerCacheKeys.Shard);
		const shardStr: string = shardVal < 10 ? DefaultTransport._zeroPad(shardVal) : shardVal.toString();
		const shardTag: string = `[${DefaultTransport._wrapColor(DefaultTransport._colors.cyan, `SHARD_${shardStr}`)}]`;
		return shardTag;
	}

	public async transport(data: LoggerTransportData): Promise<void>
	{
		let { tag } = data;
		const { type, text } = data;
		const d: Date = data.timestamp;
		const h: string = DefaultTransport._zeroPad(d.getHours());
		const m: string = DefaultTransport._zeroPad(d.getMinutes());
		const s: string = DefaultTransport._zeroPad(d.getSeconds());
		const t: string = DefaultTransport._wrapColor(DefaultTransport._colors.grey, `${h}:${m}:${s}`);

		// Set the highest type width we've encountered so far
		if (type.length > LoggerCache.get(LoggerCacheKeys.DefaultTransportTypeWidth, 0))
			LoggerCache.set(LoggerCacheKeys.DefaultTransportTypeWidth, type.length);

		// Set the highest tag width we've encountered so far
		if (tag.length > LoggerCache.get(LoggerCacheKeys.DefaultTransportTagWidth, 0))
			LoggerCache.set(LoggerCacheKeys.DefaultTransportTagWidth, tag.length);

		const wrappedType: string = DefaultTransport._typeColorWrappers[type](
			type.padEnd(LoggerCache.get(LoggerCacheKeys.DefaultTransportTypeWidth))
		);

		tag = DefaultTransport._wrapColor(
			DefaultTransport._colors.cyan,
			tag.padEnd(LoggerCache.get(LoggerCacheKeys.DefaultTransportTagWidth))
		);

		process.stdout.write(`[${t}]${DefaultTransport._shard()}[${wrappedType}][${tag}]: ${text}\n`);
	}
}
