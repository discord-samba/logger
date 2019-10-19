import { LogType } from '../types/LogType';
import { LoggerCache } from '../LoggerCache';
import { LoggerCacheKeys } from '../types/LoggerCacheKeys';
import { LoggerTransport } from '../LoggerTransport';
import { LoggerTransportData } from '../types/LoggerTransportData';

type Color = [number, number];
type Colors = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'grey';
type ColorWrapper = (...text: string[]) => string;

export class DefaultTransport extends LoggerTransport
{
	private static _colors: { [key in Colors]: Color } = {
		red: [31, 39],
		green: [32, 39],
		yellow: [33, 39],
		blue: [34, 39],
		magenta: [35, 39],
		cyan: [36, 39],
		grey: [90, 39]
	};

	private static _typeColorWrappers: { [type: string]: ColorWrapper } = {
		[LogType.LOG]: DefaultTransport._createWrapper(DefaultTransport._colors.green),
		[LogType.INFO]: DefaultTransport._createWrapper(DefaultTransport._colors.blue),
		[LogType.WARN]: DefaultTransport._createWrapper(DefaultTransport._colors.yellow),
		[LogType.ERROR]: DefaultTransport._createWrapper(DefaultTransport._colors.red),
		[LogType.DEBUG]: DefaultTransport._createWrapper(DefaultTransport._colors.magenta)
	};

	private static _wrapColor(c: Color, ...text: string[]): string
	{
		return `\u001B[${c[0]}m${text.join(' ')}\u001B[${c[1]}m`;
	}

	private static _createWrapper(color: Color): ColorWrapper
	{
		return (...text) => DefaultTransport._wrapColor(color, ...text);
	}

	private static _zeroPad(n: number | string): string
	{
		return `0${n}`.slice(-2);
	}

	private static _shard(): string
	{
		const isSharded: boolean = LoggerCache.has(LoggerCacheKeys.Shard);
		const shardVal: number = LoggerCache.get(LoggerCacheKeys.Shard) || 0;
		const shardStr: string = shardVal < 10 ? DefaultTransport._zeroPad(shardVal) : shardVal.toString();
		const shardTag: string = `[${DefaultTransport._wrapColor(DefaultTransport._colors.cyan, `SHARD_${shardStr}`)}]`;
		return isSharded ? shardTag : '';
	}

	public async transport(data: LoggerTransportData): Promise<void>
	{
		let { type, tag } = data;
		const { text } = data;
		const d: Date = data.timestamp;
		const h: string = DefaultTransport._zeroPad(d.getHours());
		const m: string = DefaultTransport._zeroPad(d.getMinutes());
		const s: string = DefaultTransport._zeroPad(d.getSeconds());
		const t: string = DefaultTransport._wrapColor(DefaultTransport._colors.grey, `${h}:${m}:${s}`);

		// Set the highest type width we've encountered so far
		if (type.length > (LoggerCache.get(LoggerCacheKeys.DefaultTransportTypeWidth) || 0))
			LoggerCache.set(LoggerCacheKeys.DefaultTransportTypeWidth, type.length);

		// Set the highest tag width we've encountered so far
		if (tag.length > (LoggerCache.get(LoggerCacheKeys.DefaultTransportTagWidth) || 0))
			LoggerCache.set(LoggerCacheKeys.DefaultTransportTagWidth, tag.length);

		type = DefaultTransport._typeColorWrappers[type](
			type.padStart(LoggerCache.get(LoggerCacheKeys.DefaultTransportTypeWidth))
		) as LogType;

		tag = DefaultTransport._wrapColor(
			DefaultTransport._colors.cyan,
			tag.padStart(LoggerCache.get(LoggerCacheKeys.DefaultTransportTagWidth))
		);

		process.stdout.write(`[${t}]${DefaultTransport._shard()}[${type}][${tag}]: ${text}\n`);
	}
}
