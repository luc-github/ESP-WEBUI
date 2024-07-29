/*
ContainerHelper.js - ESP3D WebUI component file

 Copyright (c) 2021 Alexandre Aussourd. All rights reserved.
 Modified by Luc LEBOSSE 2021

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
import { getFullscreenElement } from "../Helpers"
import { ModalContainer } from "../Modal"
import { ToastsContainer } from "../Toast"
import { useState, useEffect,  } from "preact/hooks"

const ContainerHelper = (props) => {
    const { id } = props
    console.log("ContainerHelper id", id)
    const fullScreenElement = getFullscreenElement()
    if (!fullScreenElement) {
        console.log("No fullscreen element")
        return null
    } else {
        console.log("Fullscreen element", fullScreenElement.id)
    }
    console.log("ContainerHelper id ", id, " vs fullscreen element id ", fullScreenElement.id)
    if (fullScreenElement.id != id) {
        return null
    }

    return (
        <Fragment>
            <ModalContainer id={"modal_" + id} />
            <ToastsContainer id={"toast_" + id} />
        </Fragment>
    )
}
export default ContainerHelper
