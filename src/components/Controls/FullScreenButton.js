/*
 FullScreenButton.js - ESP3D WebUI component file

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
import { Maximize, Minimize } from "preact-feather"
import { useUiContextFn } from "../../contexts"
import { ButtonImg } from "."

const isFullScreen = (element) => {
    return document.fullscreenElement === element
}

const FullScreenButton = ({ panelRef,panelId, hideOnFullScreen, asButton, onclick }) => {
    const [isFullScreenMode, setIsFullScreenMode] = useState(false)
    const getPanelRef = () => {
        if(panelRef) return panelRef.current
        if (panelId)return document.getElementById(panelId)
            return null
    }
    useEffect(() => {
        const handleFullscreenChange = () => {
             if(getPanelRef)   
            setIsFullScreenMode(isFullScreen(getPanelRef))
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            )
        }
    }, [])

    const toggleFullScreen = () => {
        if (!isFullScreenMode) {//
            if (onclick) {
                onclick()
            }
            if (getPanelRef()){
                getPanelRef().requestFullscreen()
            }
           
            console.log("Fullscreen activated pour " + panelId)
        } else {
            if (document.fullscreenElement) {
                document.exitFullscreen()
            }
        }
    }

    if (hideOnFullScreen && isFullScreenMode) {
        return null
    }

    if (asButton) {
        return (
            <ButtonImg
                id="btn-screen"
                m1
                icon={
                    isFullScreenMode ? (
                        <Minimize size="0.8rem" />
                    ) : (
                        <Maximize size="0.8rem" />
                    )
                }
                onclick={(e) => {
                    useUiContextFn.haptic()
                    toggleFullScreen()
                    e.target.blur()
                }}
            />
        )
    } else {
        return (
            <ButtonImg
                xs
                m1
                class="btn btn-screen"
                nomin="yes"
                icon={
                    isFullScreenMode ? (
                        <Minimize size="0.8rem" />
                    ) : (
                        <Maximize size="0.8rem" />
                    )
                }
                onclick={(e) => {
                    useUiContextFn.haptic()
                    toggleFullScreen()
                    e.target.blur()
                }}
            />
        )
    }
}

export default FullScreenButton
