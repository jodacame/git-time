const vscode = require("vscode");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

let myStatusBarItem = vscode.StatusBarItem;
let hours = false;
async function activate(context) {
  const terminalName = `Github Time`;

  context.subscriptions.push(
    vscode.commands.registerCommand("gitTime.createAndSend", () => {
      getStats();
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

  myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  context.subscriptions.push(myStatusBarItem);

  myStatusBarItem.command = `gitTime.createAndSend`;
  myStatusBarItem.color = `#2196F3`;
  myStatusBarItem.show();

  let disposable = vscode.commands.registerCommand(
    "git-time.gitTime",
    async function () {
      vscode.window.showInformationMessage("Github Time Ready!");

      getStats();
    }
  );

  context.subscriptions.push(disposable);
}

async function getStats() {
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

  myStatusBarItem.tooltip = tooltip;
}
// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
