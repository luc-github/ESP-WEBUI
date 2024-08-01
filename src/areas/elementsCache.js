/*
 elementsCache.js - ESP3D WebUI MainPage file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.
  Original code inspiration : 2021 Alexandre Aussourd

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.

 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public
 License along with This code; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/
import { h, render } from "preact"
import { useState, useEffect, useMemo } from "preact/hooks"
import { ExtraContentItem } from "../components/ExtraContent"
import { useUiContext, useSettingsContext } from "../contexts"
import {  eventBus } from "../hooks/eventBus"

const ElementsCache = () => {
    const { ui } = useUiContext()
    const { interfaceSettings } = useSettingsContext()
    const [content, setContent] = useState([])

    const extractValues = (entry) => {
        const result = { id: "extra_content_" + entry.id };
        entry.value.forEach(param => {
            result[param.name] = param.value;
        });
        return result;
    };

    useEffect(() => {
        if (ui.ready && interfaceSettings.current?.settings?.extracontents) {
            //console.log("ElementsCache can now be created")
            
            const extraContentSettings = interfaceSettings.current.settings.extracontents;
            const extraContentsEntry = extraContentSettings.find(entry => entry.id === 'extracontents');
            
            if (extraContentsEntry?.value?.length > 0) {
                const newContent = extraContentsEntry.value.map(entry => {
                    const item = extractValues(entry)
                   // console.log(item)
                    return <ExtraContentItem key={item.id} {...item} />
                });
                setContent(newContent);
            }
        }
    }, [ui.ready, interfaceSettings]);

    const memoizedContent = useMemo(() => content, [content]);

    return (
        <div style="position: fixed; top: 0; left: 0; width: 0; height: 0; overflow: visible;" id="elementsCache">
            {memoizedContent}
        </div>
    )
}

export default ElementsCache;

const elementsCache = {

    has: (id) => {
        const cacheHost = document.getElementById("elementsCache")
        if (!cacheHost) return false
        return cacheHost.querySelector('#' + id) !== null
    },

    create: (id, props) => {
        //console.log("Got request of Creating element " + id)
        if (!elementsCache.has(id)) {
           console.log("Element doesn't exist: " + id)
           return false
        } else {
            //console.log("Element already exists: " + id)
            elementsCache.updateState(id, {"isVisible": true})
            return true
        }
    },

    get: (id) => {
        const cacheHost = document.getElementById("elementsCache")
        if (!cacheHost) return null
        return cacheHost.querySelector('#' + id)
    },

    updateState: (id, newState) => {
        const element = document.getElementById(id);
        //console.log("Updating state for element " + id)
        //console.log(newState)
        if (element) {
            if ('isVisible' in newState) {
                element.style.display = newState.isVisible ? 'block' : 'none';
                //if (newState.isVisible) {console.log("Element " + id + " is now visible")} else {console.log("Element " + id + " is now hidden")}
                //TODO: add notification to extension (status: visible/hidden)
            }
            //Note: isFullScreen is not handled here, it is handled by the FullScreenButton itself
            /*if ('isFullScreen' in newState) {
                eventBus.emit('updateState', {id, isFullScreen: newState.isFullScreen})
            }*/
            if ('forceRefresh' in newState &&  newState.forceRefresh) {
                eventBus.emit('updateState', {id, forceRefresh: newState.forceRefresh})
            }
            return true;
        }
        return false;
    },

    updatePosition: (id, position) => {
        const cacheItem = elementsCache.get(id)
        ////console.log("Updating position for element " + id + ", exists: " + elementsCache.has(id))
        if (cacheItem) {
            try {
                ////console.log("Updating positions to", position)
                cacheItem.style.top = `${position.top}px`;
                cacheItem.style.left = `${position.left}px`;
                cacheItem.style.width = `${position.width}px`;
                cacheItem.style.height = `${position.height}px`;
                return true
            } catch (error) {
                console.error(`Error updating position for element ${id}:`, error)
                return false
            }
        } else {
            ////console.log("Element " + id + " doesn't exist")
        }
        return false
    }
}

export { ElementsCache, elementsCache }