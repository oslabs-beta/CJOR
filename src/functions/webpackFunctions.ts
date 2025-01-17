import { window, workspace, WebviewPanel } from "vscode";
import { URI } from 'vscode-uri';
import util = require('util');
import path = require('path');
const { exec } = require('child_process');

interface ModuleState {
  entry: string | undefined;
  css?: boolean;
  jsx?: boolean;
  less?: boolean;
  sass?: boolean;
  tsx?: boolean;
}
type Test = RegExp;

interface Rules {
  test?: Test;
  use?: any;
  exclude?: string;
}

interface WebpackConfig {
  entry?: {
    main: string;
  };
  mode?: string;
  output?: {
    filename: string;
    path: string;
  };
  resolve?: {
    extensions: string[];
  };
  module?: any;
}

//function creates a webpack config obj based on user inputs and bundles their app;
export const runWriteWebpackBundle = (moduleStateObj: ModuleState, panel: WebviewPanel ) => {
          //moduleObj is the rules obj returned from reateModule and used in createWebpackConfig
          const moduleObj = createModule(moduleStateObj);
          const webpackConfigObject: WebpackConfig = createWebpackConfig(`${(workspace.workspaceFolders? workspace.workspaceFolders[0].uri.path : '/') + moduleStateObj.entry}`, moduleObj);
          //writing a new file called 'webpack.config.js':
          const writeUri = path.join(__dirname, '..', 'webpack.config.js');
          //writing inside the file:
          workspace.fs.writeFile(URI.file(writeUri), new Uint8Array(Buffer.from(
            `const path = require('path');
              module.exports =${util.inspect(webpackConfigObject, { depth: null })}`, 'utf-8',
          )))
            .then(res => {
              window.showInformationMessage('Bundling...');
              //run child process to execute script:
              return exec('npx webpack --profile --json > compilation-stats.json', {cwd:  path.join(__dirname, '..')}, (err : Error, stdout: string)=>{
                //read the file and when complete, send message to frontend
                workspace.fs.readFile(URI.file(path.join(__dirname, '..', 'compilation-stats.json')))
                  .then(res => {
                  return  panel.webview.postMessage({command: 'initial', field: res.toString()});
                  });
              });
            });
          };

const createWebpackConfig = (entry: string, mod: Rules) => {
    const moduleExports: WebpackConfig = {};
    moduleExports.entry = {
      main: entry,
    };
    moduleExports.mode = 'development';
    moduleExports.output = {
      filename: 'bundle.js',
      path: `${(workspace.workspaceFolders? workspace.workspaceFolders[0].uri.path : '/') + '/dist'}`,
    };

    moduleExports.resolve = {
      extensions: ['.jsx', '.js', '.ts', '.tsx', '.json'],
    };
    moduleExports.module = mod;
    return moduleExports;
  };
  
const createModule = (modules: ModuleState) => {
    const module: any = {};
    module.rules = [];
    if (modules.css) {
      module.rules.push({
        // keeping regex in string form so that we can pass it to another file
        // we are thinking to convert the string back to a regexpression right before injecting this code into another file
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      });
    }
    if (modules.jsx) {
      module.rules.push({
        test: /\.(js|jsx)$/,
        use: [{
          loader: 'babel-loader',
          options: { 
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-proposal-class-properties']
          },
        }],
        exclude: '/node_modules/',
      });
    }

    if (modules.tsx) {
      module.rules.push({
        test: /\.tsx?$/,
        use: ['ts-loader'],
        exclude: '/node_modules/',
            });
    }
    if (modules.less) {
      module.rules.push({
        test: /\.less$/,
        loader: 'less-loader', // compiles Less to CSS
            });
    }
    if (modules.sass) {
      module.rules.push({
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
            });
    }
    return module;
  };