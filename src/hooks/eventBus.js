/*
 eventBus.js - ESP3D WebUI hooks file

 Copyright (c) 2024 Luc LEBOSSE. All rights reserved.

 
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

/*
 * Basic EventBus to share data between components without using context
 *
 */

class EventBus {
    //Constructor init listeners list
    constructor() {
      this.listeners = {};
    }
   
    //Listener
    on(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    }
    // Remove listener from memory
    off(event, callback) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  // Emitter
    emit(event, data) {
      if (!this.listeners[event]) return;
      this.listeners[event].forEach(callback => callback(data));
    }
  }
  
  export const eventBus = new EventBus();
