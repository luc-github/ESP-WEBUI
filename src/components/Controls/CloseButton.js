/*
 CloseButton.js - ESP3D WebUI component file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.

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
import { h } from "preact"
import { useState, useEffect } from "preact/hooks"

import { useUiContext, useUiContextFn } from "../../contexts"

const isFullScreen = (element) => {
    return document.fullscreenElement === element
}

const CloseButton = ({panelId, hideOnFullScreen, onclick }) => {
    return null
    const { panels } = useUiContext()
    const [isFullScreenMode, setIsFullScreenMode] = useState(false)

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullScreenMode(isFullScreen(panelRef.current))
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            )
        }
    }, [panelRef])

    if (hideOnFullScreen && isFullScreenMode) {
        return null
    }

    return (
        <span
            class="btn btn-clear btn-close m-1"
            aria-label="Close"
            onclick={(e) => {
                useUiContextFn.haptic()
                panels.hide(panelId)
                if (onclick) {
                    onclick()
                }
            }}
        />
    )
}

export default CloseButton
