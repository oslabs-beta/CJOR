"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as vscode from 'vscode';
const vscode_1 = require("vscode");
//node docs;
const { exec } = require('child_process');
function loadScript(context, path) {
    return `<script src="${vscode_1.Uri.file(context.asAbsolutePath(path)).with({ scheme: 'vscode-resource' }).toString()}"></script>`;
}
function activate(context) {
    console.log('Congratulations, your extension "nimble" is now active!');
    let startCommand = vscode_1.commands.registerCommand('extension.startNimble', () => {
        const panel = vscode_1.window.createWebviewPanel('nimble', 'Nimble', vscode_1.ViewColumn.Beside, { enableScripts: true, });
        panel.webview.html = getWebviewContent(context);
        panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'stats':
                    console.log('analyzing bundle at:', __dirname);
                    /*this is how you would access the current user's uri/workspace.
                        note: the developer's workspace would have to be open in the same vscode window (next to our ext), otherwise it'd be undefined - refer to vscode api>workspace
                        it returns an array with it's first element being an object: {
                            uri: {
                                fsPath:
                                external: this includes the scheme;
                                path: we would use this**
                                scheme:
                            },
                            name:,
                            index:
                        }
                    */
                    console.log(vscode_1.workspace.workspaceFolders);
                    /*this runs a script automatically when you run this file.
                        node module (look at docs) - you pass in: command/script, current working directory
                    */
                    exec('npx webpack --profile --json > compilation-stats.json', { cwd: __dirname });
            }
        });
    });
    context.subscriptions.push(startCommand);
}
exports.activate = activate;
function getWebviewContent(context) {
    return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="Content-Security-Policy">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Nimble</title>
	</head>

	<body>
	<div id="root"></div>
		<script>
		const vscode = acquireVsCodeApi();
		</script>
		${loadScript(context, 'out/nimble.js')}
	</body>
	</html>`;
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map