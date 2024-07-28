/*
 extraContentItem.js - ESP3D WebUI navigation page file

 Copyright (c) 2020 Luc Lebosse. All rights reserved.

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
import { Fragment, h } from "preact"
import { useState, useEffect, useCallback } from "preact/hooks"
import { espHttpURL } from "../Helpers"
import { useHttpFn } from "../../hooks"
import {
    ButtonImg,
    FullScreenButton,
    CloseButton,
    ContainerHelper,
} from "../Controls"
import { T } from "../Translations"
import { Play, Pause, Aperture, RefreshCcw } from "preact-feather"
import { elementsCache } from "../../areas/elementsCache"

const ExtraContentItem = ({ id, source, type, label, target, refreshtime, isVisible = true, isFullScreen = false, refreshPaused = false }) => {
    const [contentUrl, setContentUrl] = useState("")
    const { createNewRequest } = useHttpFn
    console.log( id)
    //console.log("ExtraContentItem rendering for " + id, "is in cache: " + elementsCache.has(id))
    /*const loadContent = useCallback((forceReload = false) => {
        if ( elementsCache.has(id) && !forceReload) {
            console.log("Content already loaded for " + id)
            return
        }
        if (source.startsWith("http") || forceReload) {
            setContentUrl(source)
        } else {
            const idquery = type === "content" ? type + id : "download" + id
            createNewRequest(
                espHttpURL(source),
                { method: "GET", id: idquery, max: 2 },
                {
                    onSuccess: handleContentSuccess,
                    onFail: handleContentError,
                }
            )
        }
    }, [id, source, type, createNewRequest])

    const handleContentSuccess = useCallback((result) => {
        let blob
        switch (type) {
            case "camera":
            case "image":
                blob = new Blob([result], { type: "image/jpeg" })
                break
            case "extension":
            case "content":
                blob = new Blob([result], { type: "text/html" })
                break
            default:
                blob = new Blob([result], { type: "text/plain" })
        }
        const url = URL.createObjectURL(blob)
        setContentUrl(url)
    }, [type])

    const handleContentError = useCallback((error) => {
        console.error(`Error loading content for ${id}:`, error)
        const errorContent = `<html><body><div style='display: flex; justify-content: center; align-items: center; height: 100%; font-family: Arial, sans-serif;'><p>Error loading content</p></div></body></html>`
        const errorBlob = new Blob([errorContent], { type: "text/html" })
        setContentUrl(URL.createObjectURL(errorBlob))
    }, [id])
*/
    useEffect(() => {
        console.log("ExtraContentItem rendering for " + id, "is in cache: " + elementsCache.has(id))
    }, [])
/*
    const handleRefresh = () => loadContent(true)
    const toggleFullScreen = () => elementsCache.updateState(id, { isFullScreen: !isFullScreen })
    const toggleRefreshPause = () => elementsCache.updateState(id, { refreshPaused: !refreshPaused })

    const renderControls = () => (
        <div class="m-2 image-button-bar">
            {parseInt(refreshtime) === 0 && target === "page" && (
                <ButtonImg
                    m1
                    icon={<RefreshCcw size="0.8rem" />}
                    onclick={handleRefresh}
                />
            )}
            {parseInt(refreshtime) > 0 && type !== "extension" && (
                <>
                    <ButtonImg
                        m1
                        tooltip
                        data-tooltip={refreshPaused ? T("S185") : T("S184")}
                        icon={refreshPaused ? <Play /> : <Pause />}
                        onclick={toggleRefreshPause}
                    />
                    {type !== "content" && (
                        <ButtonImg
                            m1
                            tooltip
                            data-tooltip={T("S186")}
                            icon={<Aperture />}
                            onclick={() => {
                                // Handle screenshot functionality here
                            }}
                        />
                    )}
                </>
            )}
           
            {target === "panel" && (
                <Fragment>
                <CloseButton
                    panelRef={{ current: document.getElementById(`extra_content_${id}`) }}
                    panelId={id}
                    hideOnFullScreen={true}
                    callbackfn={() => elementsCache.updateState(id, { isVisible: false })}
                /> 
                <FullScreenButton
                panelRef={{ current: document.getElementById(`extra_content_${id}`) }}
                hideOnFullScreen={true}
                asButton={true}
                onclick={toggleFullScreen}
            />
            </Fragment>
            )}
        </div>
    )
*/
    const contentStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: isFullScreen ? '9999' : 'auto',
        display: isVisible ? 'block' : 'none',
    }

    let content
    if (type === "camera" || type === "image") {
        content = <img src={contentUrl} alt={label} style="width: 100%; height: 100%; object-fit: contain;" />
    } else {
        content = (
            <iframe
                src={contentUrl}
                style={{
                    border: 'none',
                    width: '100%',
                    height: '100%',
                    visibility: contentUrl ? 'visible' : 'hidden'
                }}
                class={type === "extension" ? "extensionContainer" : "content-container"}
            />
        )
    }
    console.log("ExtraContentItem rendering for " + id, "is in cache: " + elementsCache.has(id))
    return (
        <div id={id} class="extra-content-container" >
            My {type} content is here
         </div>
    )
  /*  return (
        <div id={id} style={contentStyle}>
            {content}
            {renderControls()}
            {target === "panel" && <ContainerHelper id={id} />}
        </div>
    )*/
}

export { ExtraContentItem }