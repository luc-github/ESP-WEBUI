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
import { useState, useEffect, useCallback, useRef } from "preact/hooks"
import { espHttpURL } from "../Helpers"
import { useHttpFn } from "../../hooks"
import { ButtonImg, ContainerHelper } from "../Controls"
import { T } from "../Translations"
import { Play, Pause, Aperture } from "preact-feather"
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
    const [hasError, setHasError] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const { createNewRequest } = useHttpFn
    const element_id = id.replace("extra_content_", type)
    const iframeRef = useRef(null)

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
        setHasError(false)
        setIsLoading(false)
    }, [type])

    const handleContentError = useCallback((error) => {
        console.error(`Error loading content for ${id}:`, error)
        setHasError(true)
        setIsLoading(false)
    }, [id])

    const loadContent = useCallback((forceReload = false) => {
        console.log("Loading content for " + id)
        setIsLoading(true)
        if (source.startsWith("http") || forceReload) {
            console.log("Loading URL " + source)
            setContentUrl(source)
            setHasError(false)
            setIsLoading(false)
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
    }, [id, source, type, createNewRequest, handleContentSuccess, handleContentError])

    useEffect(() => {
        loadContent()
    }, [loadContent])

    const handleError = () => {
        console.log("Error loading content for " + id)
        setHasError(true)
        setIsLoading(false)
    }

    const handleLoad = () => {
        console.log("Load done for " + id)
        setHasError(false)
        setIsLoading(false)

        if (type === "extension" && iframeRef.current) {
            const iframe = iframeRef.current
            const doc = iframe.contentWindow.document
            const body = doc.querySelector("body")
            body.classList.add("body-extension")
            const css = document.querySelectorAll("style")
            css.forEach((csstag) => {
                doc.head.appendChild(csstag.cloneNode(true))
            })
        }
    }

    const toggleFullScreen = () =>
        elementsCache.updateState(id, { isFullScreen: !isFullScreen })
    const toggleRefreshPause = () =>
        elementsCache.updateState(id, { refreshPaused: !refreshPaused })

    const RenderControls = () => (
        <div class="m-2 image-button-bar">
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

    const renderContent = () => {
        if (isLoading) {
            return <div>Loading...</div>
        }

        if (hasError) {
            return (
                <div id={"fallback_" + element_id} class="fallback-content">
                    <p>Error loading {type}</p>
                    <p>Please check the URL</p>
                </div>
            )
        }

        if (type === "camera" || type === "image") {
            return (
                <img
                    src={contentUrl}
                    alt={label ? label : "image jpeg"}
                    class={type === "camera" ? "cameraContainer" : "imageContainer"}
                    id={element_id}
                    onError={handleError}
                    onLoad={handleLoad}
                />
            )
        } else {
            return (
                <iframe
                    ref={iframeRef}
                    src={contentUrl}
                    class={type === "extension" ? "extensionContainer" : "contentContainer"}
                    id={element_id}
                    onError={handleError}
                    onLoad={handleLoad}
                />
            )
        }
    }

    return (
        <div id={id} class="extra-contentContainer">
            {renderContent()}
            <RenderControls />
            {target === "panel" && <ContainerHelper id={id} />}
        </div>
    )
}

export { ExtraContentItem }