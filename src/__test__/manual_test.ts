import * as Path from 'path';
import { FileLoggingTransport } from '../transports/FileLoggingTransport';
import { LogLevel } from '../types/LogLevel';
import { Logger } from '../Logger';
import { logger } from '../LoggerDecorator';

Logger.addDefaultTransport();
Logger.addTransport('fileLogger', new FileLoggingTransport(Path.join(__dirname, '../..', 'logs'), 7, LogLevel.LOG));

const taggedLogger: typeof Logger = Logger.tag('foo');
Logger.setShard(1);

Logger.debug('VeryLongTagName', 'foo bar baz');
Logger.log('Short', 'foo bar baz');

taggedLogger.error('Foo Bar Baz');

class TestClass
{
	@logger
	private _logger!: typeof Logger;

	public constructor()
	{
		this._logger.log('I\'m being constructed');
	}
}

const test: TestClass = new TestClass();
taggedLogger.log('bar', test as any);
