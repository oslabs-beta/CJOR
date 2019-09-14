// import * as vscode from 'vscode';
import { ExtensionContext, commands, window, ViewColumn, Uri } from 'vscode';
import {URI} from 'vscode-uri';
// const path = require('path');
//this is the new code we copied from aliens


function loadScript(context: ExtensionContext, path: string) {
    return `<script src="${Uri.file(context.asAbsolutePath(path)).with({ scheme: 'vscode-resource'}).toString()}"></script>`;
}

export function activate(context: ExtensionContext) {
	console.log('Congratulations, your extension "nimble" is now active!');
	let startCommand = commands.registerCommand('extension.startNimble', () => {
		
		const panel = window.createWebviewPanel('nimble', 'Nimble', ViewColumn.Beside, 
		{
			enableScripts: true,
			retainContextWhenHidden: true,
            localResourceRoots: [ Uri.file(path.join(context.extensionPath, 'out')) ]
		});
	panel.webview.html = getWebviewContent(context);
	});
	context.subscriptions.push(startCommand);
}

function getWebviewContent(context: ExtensionContext) {
	const nonce = getNonce();
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';">
		<title>Nimble</title>
	</head>
	<body>
		<div id="root"></div>
		<p>Hello Jackie</p>
		${loadScript(context, 'out/vendor.js')}
		<script nonce="${nonce}">
		const vscode = acquireVsCodeApi();
		</script>
	</body>
	</html>`;
}

function getNonce() {
	let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export function deactivate() {}