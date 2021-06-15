import * as vscode from "vscode";

export const configuration = loadConfiguration();

function stringToCursorStyle(config: vscode.WorkspaceConfiguration, style: string, def: vscode.TextEditorCursorStyle) {
    switch (config.get<string>(style)) {
        case "line": return vscode.TextEditorCursorStyle.Line;
        case "line-thin": return vscode.TextEditorCursorStyle.LineThin;
        case "block": return vscode.TextEditorCursorStyle.Block;
        case "block-outline": return vscode.TextEditorCursorStyle.BlockOutline;
        case "underline": return vscode.TextEditorCursorStyle.Underline;
        case "underline-thin": return vscode.TextEditorCursorStyle.UnderlineThin;
        default: return def;
    }
}

function loadConfiguration() {
    const overtypeConfiguration = vscode.workspace.getConfiguration("overtype");
    const editorConfiguration = vscode.workspace.getConfiguration("editor");

    return {
        paste: overtypeConfiguration.get<boolean>("paste"),
        perEditor: overtypeConfiguration.get<boolean>("perEditor") ? true : false,

        enableAlign: overtypeConfiguration.get<boolean>("enableAlign"),

        labelInsertMode: overtypeConfiguration.get<String>("labelInsertMode"),
        labelOvertypeMode: overtypeConfiguration.get<String>("labelOvertypeMode"),
        labelAlignMode: overtypeConfiguration.get<String>("labelAlignMode"),

        // tslint:disable-next-line:object-literal-sort-keys
        defaultCursorStyle: (() => {
            return stringToCursorStyle(editorConfiguration, "cursorStyle",
            vscode.TextEditorCursorStyle.Block);
        })(),

        // Get the user defined cursor style for overtype mode
        secondaryCursorStyle: (() => {
            return stringToCursorStyle(overtypeConfiguration, "secondaryCursorStyle",
             vscode.TextEditorCursorStyle.Line);
        })(),

        // Get the user defined cursor style for align mode
        ternaryCursorStyle: (() => {
            return stringToCursorStyle(overtypeConfiguration, "ternaryCursorStyle",
             vscode.TextEditorCursorStyle.Line);
        })(),
    };
}

export function reloadConfiguration() {
    const newConfiguration = loadConfiguration();

    // bail out if nothing changed
    if (configuration.labelInsertMode === newConfiguration.labelInsertMode &&
        configuration.labelOvertypeMode === newConfiguration.labelOvertypeMode &&
        configuration.paste === newConfiguration.paste &&
        configuration.perEditor === newConfiguration.perEditor &&
        configuration.defaultCursorStyle === newConfiguration.defaultCursorStyle &&
        configuration.secondaryCursorStyle === newConfiguration.secondaryCursorStyle) {
        return false;
    }

    configuration.labelInsertMode = newConfiguration.labelInsertMode;
    configuration.labelOvertypeMode = newConfiguration.labelOvertypeMode;
    configuration.paste = newConfiguration.paste;
    configuration.perEditor = newConfiguration.perEditor;
    configuration.defaultCursorStyle = newConfiguration.defaultCursorStyle;
    configuration.secondaryCursorStyle = newConfiguration.secondaryCursorStyle;

    return true;
}
