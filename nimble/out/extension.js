"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as vscode from 'vscode';
const vscode_1 = require("vscode");
//node docs;
const { exec } = require('child_process');
const fs = require('fs');
function loadScript(context, path) {
    return `<script src="${vscode_1.Uri.file(context.asAbsolutePath(path)).with({ scheme: 'vscode-resource' }).toString()}"></script>`;
}
function activate(context) {
    console.log('Congratulations, your extension "nimble" is now active!');
    // exec('npx webpack --profile --json > compilation-stats.json', {cwd: __dirname});
    let startCommand = vscode_1.commands.registerCommand('extension.startNimble', () => {
        const panel = vscode_1.window.createWebviewPanel('nimble', 'Nimble', vscode_1.ViewColumn.Beside, { enableScripts: true, });
        panel.webview.html = getWebviewContent(context);
        panel.webview.onDidReceiveMessage((message) => {
            console.log('message obj from front end is: ', message);
            let moduleState;
            switch (message.command) {
                case 'config':
                    // console.log('getting input and configuring webpack');
                    console.log('message module is:', message.module);
                    moduleState = Object.assign({}, message.module);
                    console.log('module State is: ', moduleState);
                    let moduleObj = createModule(moduleState);
                    let webpackConfigObject = createWebpackConfig(message.entry, moduleObj);
                    console.log("this is webpackConfigObject :", JSON.stringify(webpackConfigObject));
                // let writeUri =`${__dirname}/webpack.config.js`
                // workspace.fs.writeFile(URI.file(writeUri), webpackConfigObject);
                // write webpackConfigObject to path: __dirname (refers to where the extension is installed)
                // .then(res => exec('npx webpack --profile --json > compilation-stats.json', {cwd: __dirname});
                case 'stats':
                    console.log('getting stats');
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
// webpack config functions: 
// entry - message.entry:
function createWebpackConfig(entry, mod) {
    const moduleExports = {};
    moduleExports.entry = {
        main: entry,
    };
    moduleExports.output = {
        filename: 'bundle.js',
        path: 'path'
    };
    moduleExports.resolve = {
        extensions: ['.js', '.ts', '.tsx', '.json']
    };
    moduleExports.module = mod;
    return moduleExports;
}
// mod: moduleState.mod
function createModule(modules) {
    const module = {};
    module.rules = [];
    if (modules.css) {
        module.rules.push({
            //keeping regex in string form so that we can pass it to another file
            //we are thinking to convert the string back to a regexpression right before injecting this code into another file
            test: /\.css$/i,
            use: ['style-loader', 'css-loader']
        });
        console.log("test key value from module.css obj is", module.rules[0].test);
    }
    if (modules.jsx) {
        module.rules.push({
            test: /\.(js|jsx)$/,
            use: [{
                    loader: 'babel-loader',
                    options: { presets: ['@babel/preset-env', '@babel/preset-react'] }
                }],
            exclude: '/node_modules/'
        });
    }
    //if statement for modules.tsx
    if (modules.tsx) {
        module.rules.push({
            test: /\.tsx?$/,
            use: ['ts-loader'],
            exclude: '/node_modules/'
        });
    }
    if (modules.less) {
        module.rules.push({
            test: /\.less$/,
            loader: 'less-loader',
        });
    }
    if (modules.sass) {
        module.rules.push({
            test: /\.s[ac]ss$/i,
            use: ['style-loader', 'css-loader', 'sass-loader'],
        });
    }
    return module;
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map