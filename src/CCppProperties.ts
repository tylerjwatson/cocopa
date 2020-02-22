/* CoCoPa - Compiler Command Parser, a Parser to extract include directories,
 * defines, arguments and more from compiler command line invocations.
 *
 * Copyright (C) 2020 Uli Franke - Elektronik Workshop
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import * as fs from "fs";
import * as path from "path";

import {
    CCppPropertiesContent,
    CCppPropertiesMergeMode,
} from "./CCppPropertiesContent";

export class CCppProperties {
    private _content: CCppPropertiesContent | undefined = undefined;
    private _changed: boolean = false;

    public get content(): CCppPropertiesContent | undefined {
        return this._content;
    }

    public get changed() {
        return this._changed;
    }

    public read(pPath: string) {
        if (!fs.existsSync(pPath)) {
            return false;
        }
        const propFileContentPlain = fs.readFileSync(pPath, "utf8");
        // NOTE: in JSON backslashes are escaped to \\\\
        const loadedProps = JSON.parse(
            propFileContentPlain,
        ) as CCppPropertiesContent;

        // make sure everything is defined

        if (!loadedProps) {
            return false;
        }

        this._content = new CCppPropertiesContent();
        this._content.copyInto(loadedProps);
        this._changed = false;

        return true;
    }

    public merge(
        properties: CCppPropertiesContent,
        mode: CCppPropertiesMergeMode,
    ) {
        // if no previous properties have been loaded, merging
        // is trivial for all merge modes
        if (!this._content) {
            this._content = properties;
            this._changed = true;
            return true;
        }

        // empty names will be dropped
        this._changed = this._content.merge(properties, mode);

        return this._changed;
    }

    public write(pPath: string) {
        // NOTE: in JSON backslashes are escaped to \\\\

        if (this._content && this._changed) {
            // create properties folder in case it does not exist
            const propFolder = path.dirname(pPath);

            if (!fs.existsSync(propFolder)) {
                fs.mkdirSync(propFolder, {recursive: true});
            }

            fs.writeFileSync(pPath, this.stringyfy());

            this._changed = false;
            return true;
        }
        return false;
    }
    public stringyfy() {
        return JSON.stringify(this._content, null, 4);
    }
}
