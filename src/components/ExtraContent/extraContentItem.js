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
import { ButtonImg, ContainerHelper } from "../Controls"
import { T } from "../Translations"
import { Play, Pause, Aperture, RefreshCcw } from "preact-feather"
import { elementsCache } from "../../areas/elementsCache"

const ExtraContentItem = ({
    id,
    source,
    type,
    label,
    target,
    refreshtime,
    isVisible = true,
    isFullScreen = false,
    refreshPaused = false,
}) => {
    const [contentUrl, setContentUrl] = useState("")
    const { createNewRequest } = useHttpFn
    console.log(id)
    const element_id = id.replace("extra_content_", type)
    let error_loading = false
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

    useEffect(() => {
     loadContent()
    }, [loadContent()])
*/
    useEffect(() => {
        if (error_loading) {
            const fallback = document.getElementById("fallback_" + element_id)
            const element = document.getElementById(element_id)
            if (fallback) {
                fallback.style.display = "block"
                if (element) {
                    element.style.display = "none"
                }
            }
        }
    }, [])
    const handleRefresh = () => loadContent(true)
    const toggleFullScreen = () =>
        elementsCache.updateState(id, { isFullScreen: !isFullScreen })
    const toggleRefreshPause = () =>
        elementsCache.updateState(id, { refreshPaused: !refreshPaused })
    console.log("type", type)
    const RenderControls = () => (
        <div class="m-2 image-button-bar luc-controls">
            {type == "image" && (
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

            {parseInt(refreshtime) > 0 && type !== "extension" && (
                <ButtonImg
                    m1
                    tooltip
                    data-tooltip={refreshPaused ? T("S185") : T("S184")}
                    icon={refreshPaused ? <Play /> : <Pause />}
                    onclick={toggleRefreshPause}
                />
            )}
        </div>
    )

    let content = []
    const onErrorLoading = () => {
        console.log("Error loading content for " + id)
        error_loading = true
    }

    if (type === "camera" || type === "image") {
        content.push(
            <img
                src={contentUrl}
                alt={label ? label : "image jpeg"}
                class={
                    type === "camera"
                        ? "extensionContainer"
                        : "content-container"
                }
                id={element_id}
                onerror={onErrorLoading()}
            />
        )
    } else {
        content.push(
            <iframe
                src={contentUrl}
                class={
                    type === "extension"
                        ? "extensionContainer"
                        : "content-container"
                }
                id={element_id}
                onerror={onErrorLoading()}
            />
        )
    }

    content.push(
        <div id={"fallback_" + element_id} class="fallback-content">
            <p>Error loading {type}</p>
            <p>Please check the URL</p>
        </div>
    )

    return (
        <div id={id} class="extra-content-container">
            {content}
            <RenderControls />
            {target === "panel" && <ContainerHelper id={id} />}
        </div>
    )
}

export { ExtraContentItem }
