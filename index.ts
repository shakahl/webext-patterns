// Copied from https://github.com/mozilla/gecko-dev/blob/073cc24f53d0cf31403121d768812146e597cc9d/toolkit/components/extensions/schemas/manifest.json#L487-L491
export const patternValidationRegex = /^(https?|wss?|file|ftp|\*):\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^file:\/\/\/.*$|^resource:\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^about:/;

const isFirefox = typeof navigator === 'object' && navigator.userAgent.includes('Firefox/');

function getRawRegex(matchPattern: string): string {
	if (!patternValidationRegex.test(matchPattern)) {
		throw new Error(matchPattern + ' is an invalid pattern, it must match ' + String(patternValidationRegex));
	}

	let [, protocol, host, pathname] = matchPattern.split(/(^[^:]+:[/][/])([^/]+)?/);

	protocol = protocol
		.replace('*', isFirefox ? '(https?|wss?)' : 'https?') // Protocol wildcard
		.replace(/[/]/g, '[/]'); // Escape slashes

	host = (host ?? '') // Undefined for file:///
		.replace(/^[*][.]/, '([^/]+.)*') // Initial wildcard
		.replace(/^[*]$/, '[^/]+') // Only wildcard
		.replace(/[.]/g, '[.]') // Escape dots
		.replace(/[*]$/g, '[^.]+'); // Last wildcard

	pathname = pathname
		.replace(/[/]/g, '[/]') // Escape slashes
		.replace(/[.]/g, '[.]') // Escape dots
		.replace(/[*]/g, '.*'); // Any wildcard

	return '^' + protocol + host + '(' + pathname + ')?$';
}

export function patternToRegex(...matchPatterns: readonly string[]): RegExp {
	if (matchPatterns.includes('<all_urls>')) {
		return /^(https?|file|ftp):[/]+/;
	}

	return new RegExp(matchPatterns.map(getRawRegex).join('|'));
}
