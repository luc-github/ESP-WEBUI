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
import { ExtraContentItem } from "../components/ExtraContent"

const ElementsCache = () => {
    return (<div style="position: fixed; top: 0; left: 0; width: 0; height: 0; overflow: visible;" id="elementsCache"></div>)
}

const elementsCache = {

    has: (id) => {
        const cacheHost = document.getElementById("elementsCache")
        if (!cacheHost) return false
        return cacheHost.querySelector('#' + id) !== null
    },

    create: (id, props) => {
        if (!elementsCache.has(id)) {
            const cacheHost = document.getElementById("elementsCache")
            console.log("Creating element, because it doesn't exist: " + id)
            console.log("Current host size is " + cacheHost.children.length)
            try {
                const container = document.getElementById("elementsCache")
                const vnode = container.appendChild(document.createElement('div'))
                vnode.id = "new_element" + id
                const new_vnode = render(<ExtraContentItem {...props} id={id} />, container, vnode)
                console.log("Element created: " + id + ", exists in cache: " + elementsCache.has(id))
                console.log("Now Current host size is " + cacheHost.children.length)
                console.log(cacheHost.innerHTML)
                return true
            } catch (error) {
                console.error(`Error creating element ${id}:`, error)
                return false
            }
        } else {
            //console.log("Element already exists: " + id)
            return true
        }
    },

    get: (id) => {
        const cacheHost = document.getElementById("elementsCache")
        if (!cacheHost) return null
        return cacheHost.querySelector('#' + id)
    },

    remove: (id) => {
        const cacheItem = elementsCache.get(id)
        if (cacheItem) {
            try {
                const cacheHost = document.getElementById("elementsCache")
                if (!cacheHost) return false
                removeCache = removeChild(cacheHost, cacheItem)
                if (removeCache) {
                    removeCache.remove()
                    return true
                } else {
                    return false
                }
            } catch (error) {
                console.error(`Error removing element ${id}:`, error)
                return false
            }
        }
        return false
    },

    updateState: (id, newState) => {
        const element = document.getElementById(id);
        console.log("Updating state for element " + id)
        console.log(newState)
        if (element) {
            if ('isVisible' in newState) {
                element.style.display = newState.isVisible ? 'block' : 'none';
            }
            if ('isFullScreen' in newState) {
                if (newState.isFullScreen) {
                    element.style.position = 'fixed';
                    element.style.top = '0';
                    element.style.left = '0';
                    element.style.width = '100%';
                    element.style.height = '100%';
                    element.style.zIndex = '9999';
                } else {
                    // Rétablir les styles normaux
                    element.style.position = 'absolute';
                    element.style.top = '';
                    element.style.left = '';
                    element.style.width = '';
                    element.style.height = '';
                    element.style.zIndex = '';
                }
            }
            return true;
        }
        return false;
    },

    updatePosition: (id, position) => {
        const cacheItem = elementsCache.get(id)
        //console.log("Updating position for element " + id + ", exists: " + elementsCache.has(id))
        if (cacheItem) {
            try {
                //console.log("Updating positions to", position)
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
            //console.log("Element " + id + " doesn't exist")
        }
        return false
    }
}

export { ElementsCache, elementsCache }