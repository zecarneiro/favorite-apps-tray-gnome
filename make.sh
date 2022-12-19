#!/bin/bash
# Author: José M. C. Noronha
declare JS_SOURCES_DIR="dist/"
declare EXT_NAME="favorites-apps-indicator"
declare UUID="$EXT_NAME@zecarneiro.pt"
declare PACKAGE_FILE="${UUID}.shell-extension.zip"
declare GNOME_SHELL_TOOL="vendor/gnome-shell-extension-tool/gnome-shell-extension-tool.sh"
declare TRANSPILER="vendor/transpile-javascript-gjs/transpile-gjs.sh"
declare CURRENT_DIR="$(echo $PWD)"

function executeCommand() {
    echo ">> $1"
    eval "$1"
}

function processFiles() {
    executeCommand "cp -rf README.md metadata.json icons LICENSE ${JS_SOURCES_DIR}"
    executeCommand "rm -rf ${JS_SOURCES_DIR}/interface ${JS_SOURCES_DIR}/tsconfig.tsbuildinfo"
}

function compile() {
    echo "Compile..."
    if [ ! "$(command -v typescript)" ]; then
        echo "Please install node and typescript"
        echo "typescript install command: npm install -g typescript"
    fi
    executeCommand "rm -rf dist"
    executeCommand "mkdir -p dist/"
    executeCommand "tsc"
    processFiles
    executeCommand "./${TRANSPILER} \"Me\""
}

function pack() {
    echo "Create package..."
   executeCommand "./${GNOME_SHELL_TOOL} pack \"${UUID}\" \"${JS_SOURCES_DIR}\""
}


function install() {
    uninstall
    compile
    echo "Install..."
    pack
    executeCommand "./${GNOME_SHELL_TOOL} install \"${PACKAGE_FILE}\""
    executeCommand "./${GNOME_SHELL_TOOL} restart-gnome-shell"
    executeCommand "./${GNOME_SHELL_TOOL} enable \"${UUID}\""
}

function uninstall() {
    echo "Uninstall..."
    executeCommand "./${GNOME_SHELL_TOOL} uninstall \"${UUID}\""
}

function setPermissions() {
    executeCommand "chmod +x ${GNOME_SHELL_TOOL}"
    executeCommand "chmod +x ${TRANSPILER}"
}

function clean() {
    echo "Clean..."
    executeCommand "rm -rf \"${JS_SOURCES_DIR}\""
    executeCommand "rm -rf \"${PACKAGE_FILE}\""
}



# Main
function main() {
    setPermissions
    case "$1" in
    "build-types")
        executeCommand "sudo npm install @ts-for-gir/cli -g"
        executeCommand "sudo apt install libappindicator3-dev libgda-5.0-dev libgirepository1.0-dev libgtk-3-dev libgtk-4-dev libgtksourceview-3.0-dev -y"
        executeCommand "sudo apt install libnotify-dev libsoup2.4-dev libsoup-3.0-dev libwebkit2gtk-4.0-dev libadwaita-1-dev -y"
        executeCommand "ts-for-gir generate '*' -g '/usr/share/gir-1.0' '/usr/share/gnome-shell' -e gjs"
        executeCommand "ts-for-gir generate '*' -g /usr/share/gnome-shell -e gjs -o @types/gnome"
    ;;
    "compile") compile ;;
    "install") install ;;
    "uninstall") uninstall ;;
    "pack") pack ;;
    "clean") clean ;;
    *) echo "$0 compile|install|uninstall|clean" ;;
    esac
}
main "$@"
