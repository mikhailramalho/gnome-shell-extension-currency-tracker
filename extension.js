/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'my-indicator-extension';

const { GObject, St, Clutter } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const Data = Me.imports.data;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const GLib = imports.gi.GLib;

const _ = ExtensionUtils.gettext;

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, `${Me.metadata.name} Indicator`, false);
            this.mainRate = 0;
            this.toCurrency = "BRL";
            this.fromCurrency = "EUR";

            let mainLabel = new St.Label({
                text: this.buildHeader(),
                y_expand: true,
                y_align: Clutter.ActorAlign.CENTER,
                style_class: 'menu-item-text'
            });

            this.add_child(mainLabel);

            this._startTimer(mainLabel);
        }

        buildHeader() {
            return "1 " + this.fromCurrency + " : " + this.mainRate + " " + this.toCurrency;
        }

        _startTimer(menuItem) {
            this._refreshPrice(menuItem);

            // randomDelay = Math.floor(Math.random() * (30000 - 6000 + 1) + 6000);
            this.timeOutTag = GLib.timeout_add(1, 6000 * 10, async () => {
                this._refreshPrice(menuItem);
                return true;
            });
        }

        async _refreshPrice(menuItem) {
            try {
                let page = Data.fetchPage(this.fromCurrency, this.toCurrency, 1);
                this.mainRate = Data.getPriceFromPage(page);
                log(Date.now() + ": " + this.mainRate)
                menuItem.text = this.buildHeader();
            } catch (e) {
                log(e)
            }
        }

        removeTimer() {
            if (this.timeOutTag) GLib.Source.remove(this.timeOutTag);
        }

        destroy() {
            this.removeTimer();
            super.destroy();
        }
    }
);

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.timeOutTag.destroy();
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
