# Favorites

![image](./images/favorites-example.png)

## Configuration

This extension read json configuration file from home directory.

**Name of json file configuration:** `~/favorites-apps-indicator.json`

```json
{
	"SORT": true, // If true, will sort favorites by name
	"Base": [
		{ "desktop": "gufw.desktop" },
        ...
	],
	"Favorites": [
		{ "desktop": "usb-creator-gtk.desktop" },
        ...
	],
	"Professional": [
		{ "desktop": "org.kde.kdiff3.desktop" },
        ...
		
	],
	"SEPARATOR_0": true, // Insert separator before favorites with no expanded menu. The separator key must be inserted like this: "SEPARATOR_0", "SEPARATOR_2", ....
    "NO_MENU": [ // favorites with no expanded menu
		{ "desktop": "gnome-system-monitor.desktop" },
		{ "desktop": "org.gnome.Calculator.desktop" },
		{ "desktop": "gnome-session-properties.desktop" },
		{ "desktop": "org.gnome.DiskUtility.desktop" }
    ]
}
```

Each entry in the expanded menu must contain:

```json
{
    "desktop": "name_of_desktop_file.desktop",
    "name": "name_of_favorites_to_show",
    "icon": "icon_file",
	"command": "command_to_execute_favorite"
}
```

**IMPORTANT**:

- If entry have, desktop file, the name and others will be ignored
- If you changed json file, click on `Update` menu item

**NOTE**:
- To get the name of desktop files, go to one of those directories:

```json
{
	system: '/usr/share/applications',
	user: `~/.local/share/applications`,
	snaps: '/var/lib/snapd/desktop/applications',
	flatpak: '/var/lib/flatpak/exports/share/applications',
	flatpakUser: `~/.local/share/flatpak/exports/share/applications`,
}
```

