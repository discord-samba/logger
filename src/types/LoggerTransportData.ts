/**
 * Represents the data object a logger transport's transport
 * function will receive when it is called
 */
export interface LoggerTransportData
{
	timestamp: Date;
	type: string;
	tag: string;
	text: string;
}
