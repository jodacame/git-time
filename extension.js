// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
let myStatusBarItem = vscode.StatusBarItem;
async function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  let hours = false;
  console.log('Congratulations, your extension "git-time" is now active!');

  const terminalName = `Github Time`;

  context.subscriptions.push(
    vscode.commands.registerCommand("gitTime.createAndSend", () => {
      const terminals = vscode.window.terminals;
      const exists = terminals.find(
        (terminal) => terminal.name === terminalName
      );

      const terminal = exists
        ? exists
        : vscode.window.createTerminal(terminalName);
      terminal.sendText("git-hours");
      terminal.show();
    })
  );

  if (vscode.workspace.workspaceFolders !== undefined) {
    let wf = vscode.workspace.workspaceFolders[0].uri.path;

    const { stdout, stderr } = await exec("git-hours", { cwd: wf });
    if (!stderr) {
      console.log(`git-hours -p ${wf}`);
      console.log("stdout:", stdout);
      try {
        hours = JSON.parse(`${stdout}`);
      } catch (error) {}
    } else {
      console.error("stderr:", stderr);
    }
  }
  if (!hours) return;
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "git-time.gitTime",
    function () {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showInformationMessage("Github Time Ready!");
    }
  );

  context.subscriptions.push(disposable);

  // create a new status bar item that we can now manage
  myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  context.subscriptions.push(myStatusBarItem);
  myStatusBarItem.text = `$(clock) ${new Intl.NumberFormat().format(
    hours.total.hours
  )} $(cloud-upload) ${new Intl.NumberFormat().format(hours.total.commits)}`;

  const stats = Object.keys(hours).map((key) => {
    return `<b>${key === "total" ? "<hr><br>Total" : hours[key].name}:</b> ${
      hours[key].hours
    } hours $(cloud-upload) ${hours[key].commits} `;
  });
  let tooltip = new vscode.MarkdownString(
    `<b>Hours Worked / Total Commits</b><br><hr><br>
	${stats.join(`<br>`)}`
  );
  tooltip.isTrusted = true;
  tooltip.supportHtml = true;
  tooltip.supportThemeIcons = true;
  console.log(tooltip);
  myStatusBarItem.tooltip = tooltip;
  myStatusBarItem.command = `gitTime.createAndSend`;
  myStatusBarItem.color = `#2196F3`;
  myStatusBarItem.show();
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
