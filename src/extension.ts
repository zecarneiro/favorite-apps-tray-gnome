// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import { FavoritesApp } from './lib/favoritesApps';

const GETTEXT_DOMAIN = 'favorites-apps-indicator';
// @ts-ignore
const ExtensionUtils = imports.misc.extensionUtils;
// @ts-ignore
const Main = imports.ui.main;
export class Extension {
    _uuid: any;
    _favoritesApps: any | null;

    constructor(uuid: any) {
        this._uuid = uuid;
        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        if (!this._favoritesApps) {
            this._favoritesApps = new FavoritesApp(ExtensionUtils);
            Main.panel.addToStatusArea(this._uuid, this._favoritesApps);
        }
    }

    disable() {
        if (this._favoritesApps) {
            this._favoritesApps.destroy();
            this._favoritesApps = null;
        }
    }
}

// @ts-ignore
function init(meta) {
    return new Extension(meta.uuid);
}
