import * as vscode from "vscode";

import { configuration } from "./configuration";
import { EditorMode, modeName, nextMode } from "./mode";

let statusBarItem: vscode.StatusBarItem | null;

export function createStatusBarItem() {
    if (statusBarItem != null) { return statusBarItem; }

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    statusBarItem.command = "overtype.toggle";
    statusBarItem.show();

    updateStatusBarItem(null);

    return statusBarItem;
}

export function destroyStatusBarItem() {
    if (statusBarItem == null) { return; }

    statusBarItem.hide();
    statusBarItem = null;
}

export function updateStatusBarItem(overtype: EditorMode | null) {
    if (statusBarItem == null) { return; }

    if (overtype === null) {
        statusBarItem.text = "";
        statusBarItem.tooltip = "";

        statusBarItem.hide();
        return;
    }
    
    let sbiText;

    statusBarItem.tooltip =  `${modeName(overtype)} Mode, click to change to ${modeName(nextMode(overtype))} Mode`;

    switch(overtype) {
    case EditorMode.INSERT:
        sbiText = configuration.labelInsertMode;
        break;
    case EditorMode.OVERTYPE:
        sbiText = configuration.labelOvertypeMode;
        break;
    case EditorMode.ALIGN:
        sbiText = configuration.labelAlignMode;
        break;
    }
    if (sbiText === undefined || sbiText == null) sbiText = "";

    // preparation for https://github.com/DrMerfy/vscode-overtype/issues/2
    // if (configuration.showCapsLockState && capsLockOn) {
    //     statusBarItem.text = sbiText.toUpperCase();
    // } else {
        statusBarItem.text = sbiText.toString();
    // }

    statusBarItem.show();
}
