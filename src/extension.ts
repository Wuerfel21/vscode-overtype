import * as vscode from "vscode";

import { alignBeforeType, alignDelete, overtypeBeforePaste, overtypeBeforeType } from "./behavior";
import { configuration, reloadConfiguration } from "./configuration";
import { getMode, resetModes, toggleMode, EditorMode, modeName } from "./mode";
import { createStatusBarItem, destroyStatusBarItem, updateStatusBarItem } from "./statusBarItem";

// initialization //////////////////////////////////////////////////////////////

export function activate(context: vscode.ExtensionContext) {
    const statusBarItem = createStatusBarItem();
    activeTextEditorChanged();

    context.subscriptions.push(
        vscode.commands.registerCommand("overtype.toggle", toggleCommand),

        vscode.commands.registerCommand("type", typeCommand),
        vscode.commands.registerCommand("paste", pasteCommand),

        vscode.commands.registerCommand("overtype.deleteLeft", deleteLeftCommand),
        vscode.commands.registerCommand("overtype.deleteRight", deleteRightCommand),

        vscode.window.onDidChangeActiveTextEditor(activeTextEditorChanged),

        vscode.workspace.onDidChangeConfiguration(onDidChangeConfiguration),

        statusBarItem,
    );
}

export function deactivate() {
    destroyStatusBarItem();
}

// command handlers ////////////////////////////////////////////////////////////

function activeTextEditorChanged(textEditor?: vscode.TextEditor) {
    if (textEditor === undefined) {
        textEditor = vscode.window.activeTextEditor;
    }

    if (textEditor == null) {
        updateStatusBarItem(null);
    } else {
        const mode = getMode(textEditor);
        updateStatusBarItem(mode);
        vscode.commands.executeCommand('setContext','overtype.mode',modeName(mode));


        // if in overtype mode, set the cursor to secondary style; otherwise, reset to default
        let cursorStyle;
        switch(mode) {
        default:
            cursorStyle = configuration.defaultCursorStyle;
            break;
        case EditorMode.OVERTYPE:
            cursorStyle = configuration.secondaryCursorStyle;
            break;
        case EditorMode.ALIGN:
            cursorStyle = configuration.ternaryCursorStyle;
            break;
        }
        textEditor.options.cursorStyle = cursorStyle;
    }
}

function toggleCommand() {
    const textEditor = vscode.window.activeTextEditor;
    if (textEditor == null) {
        return;
    }

    toggleMode(textEditor);
    activeTextEditorChanged(textEditor);
}

function getShowInStatusBar(): boolean {
    if (configuration.labelInsertMode === ""
     && configuration.labelOvertypeMode === "") {
        return true;
     }
     return false;
}

function onDidChangeConfiguration() {
    const previousPerEditor = configuration.perEditor;
    const previousShowInStatusBar = getShowInStatusBar();

    const updated = reloadConfiguration();
    if (!updated) { return; }

    const showInStatusBar = getShowInStatusBar();

    // post create / destroy when changed
    if (showInStatusBar !== previousShowInStatusBar) {
        if (showInStatusBar) {
            createStatusBarItem();
        } else {
            destroyStatusBarItem();
        }
    }

    // update state if the per-editor/global configuration option changes
    if (configuration.perEditor !== previousPerEditor) {

        const textEditor = vscode.window.activeTextEditor;
        const mode = textEditor != null ? getMode(textEditor) : null;
        resetModes(mode, configuration.perEditor);
    }

    activeTextEditorChanged();
}

function typeCommand(args: { text: string }) {
    const editor = vscode.window.activeTextEditor;
    if (editor && getMode(editor) == EditorMode.OVERTYPE) {
        overtypeBeforeType(editor, args.text, false);
    } else if (editor && getMode(editor) == EditorMode.ALIGN) {
        alignBeforeType(editor, args.text, false);
    } else vscode.commands.executeCommand('default:type',args);
}


function deleteLeftCommand() {
    const editor = vscode.window.activeTextEditor;
    if (editor && getMode(editor) == EditorMode.ALIGN) {
        alignDelete(editor,false);
        return null;
    } else return vscode.commands.executeCommand("deleteLeft");
}

function deleteRightCommand() {
    const editor = vscode.window.activeTextEditor;
    if (editor && getMode(editor) == EditorMode.ALIGN) {
        alignDelete(editor,true);
        return null;
    } else return vscode.commands.executeCommand("deleteRight");
}

function pasteCommand(args: { text: string, pasteOnNewLine: boolean }) {
    if (configuration.paste) {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            if (getMode(editor) == EditorMode.OVERTYPE) {
                // TODO: Make paste work with align
                overtypeBeforePaste(editor, args.text, args.pasteOnNewLine);
                return vscode.commands.executeCommand("default:paste", args);
            }
        }
    } else return vscode.commands.executeCommand("default:paste", args);
    return null;
}
