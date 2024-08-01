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
import { useState, useEffect, useCallback, useRef, useMemo } from "preact/hooks"
import { espHttpURL } from "../Helpers"
import { useHttpFn } from "../../hooks"
import { ButtonImg, ContainerHelper } from "../Controls"
import { T } from "../Translations"
import { Play, Pause, Aperture } from "preact-feather"
import { eventBus } from "../../hooks/eventBus"

const ExtraContentItem = ({
    id,
    source,
    type,
    name,
    target,
    refreshtime,
}) => {
    const [contentUrl, setContentUrl] = useState("")
    const [hasError, setHasError] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isPaused, setIsPaused] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const { createNewRequest } = useHttpFn
    const element_id = id.replace("extra_content_", type)
    const iframeRef = useRef(null)
    const refreshIntervalRef = useRef(null)

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

    const loadContent = useCallback(() => {
        if (isPaused || !isVisible) return

        setIsLoading(true)
        if (source.startsWith("http")) {
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
    }, [id, source, type, createNewRequest, handleContentSuccess, handleContentError, isPaused, isVisible])

    useEffect(() => {
        loadContent()
    }, [loadContent])

    useEffect(() => {
        const handleUpdateState = (msg) => {
            if (msg.id === id) {
                if (msg.forceRefresh) {
                    loadContent()
                }
                if ('isVisible' in msg) {
                    setIsVisible(msg.isVisible)
                }
            }
        }
        eventBus.on("updateState", handleUpdateState)
        return () => {
            eventBus.off("updateState", handleUpdateState)
        }
    }, [id, loadContent])

    useEffect(() => {
        if (refreshtime > 0 && (type === "camera" || type === "image") && isVisible && !isPaused) {
            refreshIntervalRef.current = setInterval(loadContent, refreshtime)
        }
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current)
            }
        }
    }, [refreshtime, type, isVisible, isPaused, loadContent])

    const handleError = () => {
        setHasError(true)
        setIsLoading(false)
    }

    const handleLoad = () => {
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

    const captureImage = useCallback(() => {
        if (type === "camera" || type === "image") {
            const image = document.getElementById(element_id);
            if (image && image.complete) {
                const canvas = document.createElement('canvas');
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0);
                
                canvas.toBlob((blob) => {
                    const typeImage = type === "camera" ? "image/jpeg" : blob.type;
                    const filename = `snap.${typeImage.split("/")[1]}`;
                    
                    if (window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob, filename);
                    } else {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.style.display = "none";
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        
                        setTimeout(() => {
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }, 100);
                    }
                }, type === "camera" ? "image/jpeg" : "image/png");
            } else {
                console.error("Image not loaded or not found");
            }
        }
    }, [type, element_id]);

    const togglePause = useCallback(() => {
        setIsPaused(prevPaused => {
            const newPausedState = !prevPaused;
            if (newPausedState) {
                if (refreshIntervalRef.current) {
                    clearInterval(refreshIntervalRef.current);
                }
            } else {
                if (refreshtime > 0 && (type === "camera" || type === "image") && isVisible) {
                    refreshIntervalRef.current = setInterval(loadContent, refreshtime);
                }
            }
            return newPausedState;
        });
    }, [refreshtime, type, isVisible, loadContent]);

    const renderContent = useMemo(() => {
        if (isLoading && type !== "image" && type !== "camera") {
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
                <div class="picture-container">
                <img
                    src={contentUrl}
                    alt={name ? name : "image jpeg"}
                    class={type === "camera" ? "cameraContainer" : "imageContainer"}
                    id={element_id}
                    onError={handleError}
                    onLoad={handleLoad}
                />
                </div>
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
    }, [isLoading, hasError, type, contentUrl, name, element_id, handleError, handleLoad]);

    const RenderControls = useMemo(() => (
        <div class="m-2 image-button-bar">
            {(type === "camera" || type === "image") && (
                <ButtonImg
                    m1
                    tooltip
                    data-tooltip={T("S186")}
                    icon={<Aperture />}
                    onclick={captureImage}
                />
            )}
            {parseInt(refreshtime) > 0 && (type === "camera" || type === "image") && (
                <ButtonImg
                    m1
                    tooltip
                    data-tooltip={isPaused ? T("S185") : T("S184")}
                    icon={isPaused ? <Play /> : <Pause />}
                    onclick={togglePause}
                />
            )}
        </div>
    ), [type, refreshtime, isPaused, captureImage, togglePause]);

    return (
        <div id={id} class="extra-content-container">
            <ContainerHelper id={id} />
            {renderContent}
            {RenderControls}
        </div>
    )
}

export { ExtraContentItem }
