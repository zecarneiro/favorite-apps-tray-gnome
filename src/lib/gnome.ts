// @ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension();

import { EJsonConfigKeys } from "../enum/EJsonConfigKeys";
import { ENames } from "../enum/ENames";
import { IAppInfo } from "../interface/IAppInfo";
import { IIcon } from "../interface/IIcon";
import { IItem } from "../interface/IItem";
import { IJson } from "../interface/IJson";
import { GFileSystem } from '../../../vendor/utils/typescript/src/lib/gnome/gfile-system';
import { GConsole } from '../../../vendor/utils/typescript/src/lib/gnome/gconsole';

const { GObject, Gio, GLib, St } = imports.gi;
// @ts-ignore
const PanelMenu = imports.ui.panelMenu;
// @ts-ignore
const PopupMenu = imports.ui.popupMenu;
// @ts-ignore
const Main = imports.ui.main;

var _this: any;

export class Gnome extends PanelMenu.Button {
    private setText: any;
    private readonly jsonFileName = `${GLib.get_home_dir()}/${ENames.baseFileName}.json`;
    private allApplications: IAppInfo[];
    private readonly iconSize = 16;
    private fileSystemUtils: GFileSystem;
    private consoleUtils: GConsole;

    static {
        GObject.registerClass(this);
    }

    constructor(extensionUtils: any) {
        super(0.0, ENames.indicatorName);
        this.setText = extensionUtils.gettext;
        this.fileSystemUtils = new GFileSystem();
        this.consoleUtils = new GConsole();
        _this = this;
        this.configExtension();
        this.allApplications = this.getAllApplications();
        this.createMenu();
    }

    configExtension() {
        // @ts-ignore
        this.add_child(new St.Icon(this.getIcon(`${Me.path}/icons/${ENames.baseFileName}.png`)));
    }

    getAllApplications(): IAppInfo[] {
        let applications: IAppInfo[] = [];
        let applicationsAll: any[] = Gio.AppInfo.get_all();
        for (const key in applicationsAll) {
            let command: string = applicationsAll[key].get_commandline();
            applications.push({
                desktopFile: applicationsAll[key].get_id(),
                name: applicationsAll[key].get_name(),
                icon: applicationsAll[key].get_icon(),
                command: command ? command.replace(/%\w/g, '')?.trim() : '',
                displayName: applicationsAll[key].get_display_name()
            });
        }
        return applications;
    }

    getIcon(icon: string, style?: string): IIcon | undefined {
        let iconData: IIcon | undefined = undefined;
        if (icon) {
            if (this.fileSystemUtils.fileExist(icon)) {
                iconData = {
                    gicon: Gio.icon_new_for_string(icon),
                };
            } else {
                iconData = {
                    icon_name: icon,
                };
            }
            if (style) {
                iconData.style_class = style;
            }
            iconData.icon_size = this.iconSize;
        }
        return iconData;
    }

    insertSubmenu(name: string, values: IItem[] = []) {
        //Add a submenu as the 3rd item, and submenu item with no action
        const mySubMenu = new PopupMenu.PopupSubMenuMenuItem(this.setText(name));
        // @ts-ignore
        this.menu.addMenuItem(mySubMenu);
        values.forEach(value => {
            this.insertItem(value, mySubMenu);
        });
    }

    insertItem(data: IItem, menuItem?: any) {
        if (data.name) {
            let item: any;
            if (data.icon) {
                item = new PopupMenu.PopupImageMenuItem(data.name, data.icon);
            } else {
                item = new PopupMenu.PopupMenuItem(this.setText(data.name));
            }
            item.connect('activate', data.callback);
            if (menuItem) {
                menuItem.menu.addMenuItem(item);
            } else {
                // @ts-ignore
                this.menu.addMenuItem(item);
            }
        }
    }

    insertSeperator() {
        // @ts-ignore
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    }

    createMenu() {
        this.updateMenuDataJson();
        this.insertSeperator();
        this.insertItem({ name: 'Update', callback: this.refresh });
    }

    refresh() {
        _this.menu.removeAll();
        _this.createMenu();
    }

    updateMenuDataJson() {
        const json = this.fileSystemUtils.readJsonFile<any>(this.jsonFileName);
        if (json) {
            const canSort: boolean = !json[EJsonConfigKeys.sort] ? false : json[EJsonConfigKeys.sort];
            Object.keys(json).forEach(key => {
                if (key.startsWith(EJsonConfigKeys.separator)) {
                    this.insertSeperator();
                } else if (key === EJsonConfigKeys.noMenu && typeof json[key] === 'object') {
                    this.processApps(json[key], canSort).forEach((element: any) => {
                        this.insertItem(element);
                    });
                } else if (typeof json[key] === 'object') {
                    this.insertSubmenu(key, this.processApps(json[key], canSort));
                }
            });
        }
        Main.notify(this.setText(`All data updated from ${this.jsonFileName}`));
    }

    processDesktopFile(desktopFile: string): IItem {
        let item: IItem = { name: '', callback: null, icon: '' };
        const app = this.allApplications.find(val => val.desktopFile.trim() === desktopFile.trim());
        if (app) {
            item.name = app.name.trim();
            item.icon = app.icon;
            item.callback = () => { Shell.terminalAsync(app.command); };
        }
        return item;
    };

    processApps(data: IJson[], canSort: boolean = true): IItem[] {
        let items: IItem[] = [];
        data.forEach(element => {
            let item: IItem = { name: '', callback: null };
            if (element.desktop) {
                item = this.processDesktopFile(element.desktop);
            } else {
                if (element.name) {
                    item.name = element.name;
                }
                if (element.icon) {
                    item.icon = element.icon;
                }
                if (element.command) {
                    item.callback = () => { Shell.terminalAsync(`${element.command} &`); }
                }
            }
            if (item.name && item.callback) {
                items.push(item);
            }
        });
        if (canSort) {
            items = items.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : ((b.name.toLowerCase() > a.name.toLowerCase()) ? -1 : 0));
        }
        return items;
    }
}
