import * as Path from 'path';
import { LogFileTransport } from '../transports/LogFileTransport';
import { LogLevel } from '../types/LogLevel';
import { Logger } from '../Logger';
import { logger } from '../LoggerDecorator';

Logger.addDefaultTransport();
Logger.addTransport('fileLogger', new LogFileTransport(Path.join(__dirname, '../..', 'logs'), 7, LogLevel.INFO));

const taggedLogger: typeof Logger = Logger.tag('foo');
Logger.setShard(1);

Logger.debug('VeryLongTagName', 'foo bar baz');
Logger.info('Short', 'foo bar baz');

taggedLogger.warn('Foo Bar Baz');
taggedLogger.error('Foo Bar Baz');

class TestClass
{
	@logger
	private _logger!: typeof Logger;

	public constructor()
	{
		this._logger.info('I\'m being constructed');
	}
}

const test: TestClass = new TestClass();
taggedLogger.info('bar', test as any);
