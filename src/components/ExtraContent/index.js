/*
 extracontent.js - ESP3D WebUI navigation page file

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
import { h, Fragment } from "preact"
import { useRef, useEffect, useCallback, useState } from "preact/hooks"
import { elementsCache } from "../../areas/elementsCache"
import { ExtraContentItem } from "./extraContentItem"
import {
    ButtonImg,
    FullScreenButton,
    CloseButton,
    ContainerHelper,
} from "../Controls"
import { T } from "../Translations"
import { RefreshCcw } from "preact-feather"
import { iconsFeather } from "../Images"
import { iconsTarget } from "../../targets"
import { useUiContextFn } from "../../contexts"

const ExtraContent = ({ id, source, refreshtime, label, type, target, icon }) => {
    const containerRef = useRef(null)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const extra_content_id = `extra_content_${id}`
    const target_id = `target_${id}`
    const iconsList = { ...iconsTarget, ...iconsFeather }
   console.log(id)
    const updateContentPosition = () => {
        if (containerRef.current) {
            const { top, left, width, height } = containerRef.current.getBoundingClientRect()
            //console.log("New Position for element " + extra_content_id + ":", top, left, width, height)
            elementsCache.updatePosition(extra_content_id, { top, left, width, height })
        } else {
            //console.log("Element " + extra_content_id + " doesn't exist")
        }
    }
    
    updateContentPosition()
    useEffect(() => {
        if (!elementsCache.has(extra_content_id)) {
            //console.log("Creating element " + extra_content_id," because it doesn't exist")
            elementsCache.create(extra_content_id, { 
                id, 
                source, 
                type, 
                label, 
                target, 
                refreshtime, 
                icon,
                isVisible: true
            })
        } else {
            //console.log("Updating element " + extra_content_id + " because it already exists")
            elementsCache.updateState(extra_content_id, { isVisible: true})
            updateContentPosition()
        }

        updateContentPosition()

        const handleScrollAndResize = () => requestAnimationFrame(updateContentPosition)
     
       const main = document.getElementById("main")
       if (main) {
            main.addEventListener('scroll', handleScrollAndResize)
            main.addEventListener('resize', handleScrollAndResize)
       }
       window.addEventListener('resize', handleScrollAndResize)
   

        return () => {
            const main = document.getElementById("main")
            if (main) {
                main.removeEventListener('scroll', handleScrollAndResize)
                main.removeEventListener('resize', handleScrollAndResize)
           }
            window.removeEventListener('resize', handleScrollAndResize)
            //console.log("Hiding element " + extra_content_id)
            elementsCache.updateState(extra_content_id, { isVisible: false })
        }
    }, [])


    const handleRefresh = () => {
        useUiContextFn.haptic()
        console.log("Refreshing element " + extra_content_id)
        elementsCache.updateState(extra_content_id, { forceRefresh: true })
    }

    const handleFullScreen = () => {
       /* setIsFullScreen(true)
        console.log("Toggling fullscreen for element " + extra_content_id)
        elementsCache.updateState(extra_content_id, { isFullScreen: true })*/
    }

    const PanelRenderControls = () => (
        <div class="m-2 image-button-bar">
            <ButtonImg
                xs
                m1
                nomin="yes"
                icon={<RefreshCcw size="0.8rem" />}
                onclick={handleRefresh}
            />
            <span class="full-height">
                <FullScreenButton
                    elementId={extra_content_id}
                    onclick={handleFullScreen}
                />
                <CloseButton
                    elementId={id}
                    hideOnFullScreen={true}
                />
            </span>
        </div>
    )

    const PageRenderControls = () => (
        <div class="m-2 image-button-bar">
            <ButtonImg
                m1
                nomin="yes"
                icon={<RefreshCcw size="0.8rem" />}
                onclick={handleRefresh}
            />
           
                <FullScreenButton
                    elementId={extra_content_id}
                    onclick={handleFullScreen}
                    asButton={true}
                />
     
        </div>
    )

    if (target === "page") {
        console.log("Rendering page element " + extra_content_id)
        return (
            <div class = "page-container">
            <div id={target_id} ref={containerRef} class="page-target-container">
              {/* content should fit this container */}
            </div>
            <PageRenderControls/>
            </div>
        )
    }

    if (target === "panel") {
       // console.log("Rendering panel element " + extra_content_id)
        const displayIcon = iconsList[icon] || ""
        return (
            <Fragment>
                <div class="panel panel-dashboard" id={id}>
                    <ContainerHelper id={id} />
                    <div class="navbar">
                        <span class="navbar-section feather-icon-container">
                            {displayIcon}
                            <strong class="text-ellipsis">{T(label)}</strong>
                        </span>
                        <span class="navbar-section">
                            {PanelRenderControls()}
                        </span>
                    </div>
                    <div class="panel-body panel-body-dashboard no-margin-no-padding panel-target-container"  ref={containerRef} id={target_id}>
                        {/* content should fit this container */}
                    </div>
                </div>
              
            </Fragment>
        )
    }
}

export { ExtraContent, ExtraContentItem }